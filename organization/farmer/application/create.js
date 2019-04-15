/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access TrackNet network
 * 4. Construct request to create a track
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const Track = require('../contract/lib/track.js');

// A wallet stores a collection of identities for use
//const wallet = new FileSystemWallet('../user/isabella/wallet');
const wallet = new FileSystemWallet('../identity/user/isabella/wallet');

// Main program function
async function main() {

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        // const userName = 'isabella.issuer@magnetocorp.com';
        const userName = 'User1@org1.example.com';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:false, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access TrackNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to track contract
        console.log('Use org.example.track smart contract.');

        const contract = await network.getContract('trackcontract', 'org.example.track');

        // create track
        console.log('Submit track create transaction.');

        const issueResponse = await contract.submitTransaction('create', 'Farmer', '00001', '2020-05-31', '2020-11-30', '5000000');

        // process response
        console.log('Process create transaction response.');

        let track = Track.fromBuffer(issueResponse);

        console.log(`${track.farmer} track : ${track.trackId} successfully created for value ${track.value}`);
        console.log('Transaction complete.');

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.')
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('Create program complete.');

}).catch((e) => {

    console.log('Create program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});