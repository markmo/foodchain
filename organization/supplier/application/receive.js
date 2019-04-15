/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access TrackNet network
 * 4. Construct request to receive goods
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
const wallet = new FileSystemWallet('../identity/user/balaji/wallet');

// Main program function
async function main() {

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        // const userName = 'isabella.issuer@magnetocorp.com';
        const userName = 'Admin@org1.example.com';

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

        // receive track
        console.log('Submit track receive transaction.');

        const buyResponse = await contract.submitTransaction('receive', 'Farmer', '00001', 'Farmer', 'Supplier', '4900000', '2020-05-31');

        // process response
        console.log('Process receive transaction response.');

        let track = Track.fromBuffer(buyResponse);

        console.log(`${track.farmer} track : ${track.trackId} successfully received by ${track.owner}`);
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

    console.log('Receive program complete.');

}).catch((e) => {

    console.log('Receive program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});