# foodchain

Example Blockchain to track from farm to store.

Building on top of the [Hyperledger Fabric](https://www.hyperledger.org/) project.

There are two kinds of blockchains out there:

1. Public Blockchains (e.g. Bitcoin, Ethereum)
2. Private/Permissioned Blockchains (e.g. Hyperledger)

### Issues with public blockchains

* The blocks in Bitcoin and Ethereum have a storage issue. Bitcoin has a little over 1MB of space per block 
  which is simply not enough to run the kind of transactions and store the kind of data that enterprises require.
* Bitcoin can barely manage 7-8 transactions per second (tps). The block confirmation time is 10 mins which just
  adds to the latency. Enterprise use cases need to deal with millions of transactions per day with near 0 latency.
* Public blockchains, especially the ones that follow the proof-of-work protocol like Bitcoin require an immense 
  amount of computational power to solve hard puzzles.
  
### Private/Permissioned Blockchains

In order to reach those levels of tps, blockchains need to adopt an architectural approach which:

* Efficiently compartmentalises different tasks.
* Uses asynchronous flows.
* Uses faster consensus protocols.
* Utilises parallelisation
* Executes itself in optimised environments.

#### Other challenges

1. **Storing data**
   
   Most blockchains use a transaction-based data model: Sender, Value, Receiver.

   * Some blockchains offer the possibility to append data to a transaction within their protocols,
     while others do not.
   * Encode the data into the receiving address.
	 * Tiny (Kbs) address size
	 * Cost. (When storing data on the blockchain, most often we do pay a base price for the transaction 
	   itself plus an amount per byte we want to store. If smart contracts are involved, we also pay for 
	   the execution time of the smart contract.)
	 * Every member can see the data unless hashed or encrypted.
	 * General Data Protection Regulation (GDPR) - data is immutable.
	 * No query facility.
   * Split data up - Cost!
   * Store a hash (tamper proof) to a record on another database.
     * Trade-offs for decentralisation and transparency
   * Store hash and subset of data - hybrid approach
   * Use a distributed database for off-chain storage

2. **Performance**

   Alternatives to proof-of-work:
   
   * Proof-of-stake
     * Byzantine Fault Tolerance
     * [Delegated Proof of Stake](https://medium.com/loom-network/understanding-blockchain-fundamentals-part-3-delegated-proof-of-stake-b385a6b92ef)
     
#### Economic Sets

The purpose of a consensus algorithm, in general, is to allow for the secure updating of a state 
according to some specific state transition rules, where the right to perform the state transitions 
is distributed among some economic set. An economic set is a set of users which can be given the 
right to collectively perform transitions via some algorithm, and the important property that the 
economic set used for consensus needs to have is that it must be securely decentralized - meaning 
that no single actor, or colluding set of actors, can take up the majority of the set, even if the 
actor has a fairly large amount of capital and financial incentive. So far, we know of three securely 
decentralized economic sets, and each economic set corresponds to a set of consensus algorithms:

* Owners of **computing power**: standard proof of work, or TaPoW (Transaction as Proof of Work). 
  Note that this comes in specialized hardware, and (hopefully) general-purpose hardware variants.
* **Stakeholders**: all of the many variants of proof of stake
* A user's **social network**: Ripple/Stellar-style consensus

See [Proof of State, Ethereum Blog](https://blog.ethereum.org/2014/11/25/proof-stake-learned-love-weak-subjectivity/).

## Running the example

(The following commands are all assumed to run from the root directory each time.)

1. Create Network.

       cd network
       ./start.sh
       
   The following docker services will start:
   
   * hyperledger/fabric-peer
   * hyperledger/fabric-orderer
   * hyperledger/fabric-couchdb
   * hyperledger/fabric-ca
   
   These containers all form a docker network called net_basic. You can view the network with 
   the docker network command:
   
       docker network inspect net_basic
       
2. Pretend we're the Farmer.

   * Open a new terminal window to monitor the system
   
         cd organization/farmer/configuration/cli
         ./monitordocker.sh net_basic
       
   * A Farmer administrator interacts with the network via a docker container. Let’s start 
     a MagnetoCorp-specific docker container for the administrator using the docker-compose 
     command:
     
         cd organization/farmer/configuration/cli
         docker-compose -f docker-compose.yml up -d cliFarmer
         
   * The Farmer administrator will use the command line in the cliFarmer container to 
     interact with the system.

3. Install Smart Contract.

   * Before `trackcontract` can be invoked by applications, it must be installed onto the 
     appropriate peer nodes.
     
         docker exec cliFarmer peer chaincode install -n trackcontract -v 0 -p /opt/gopath/src/github.com/contract -l node
         
4. Instantiate Contract.

       docker exec cliFarmer peer chaincode instantiate -n trackcontract -v 0 -l node -c '{"Args":["org.example.track:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')"
       
   One of the most important parameters on instantiate is -P. It specifies the endorsement policy 
   for `trackcontract`, describing the set of organizations that must endorse (execute and sign) 
   a transaction before it can be determined as valid. All transactions, whether valid or invalid, 
   will be recorded on the ledger blockchain, but only valid transactions will update the world state.
   
   Notice that the resulting container is named `dev-peer0.org1.example.com-trackcontract-0-...` to 
   indicate which peer started it, and the fact that it’s running `trackcontract` version 0.
   
5. Create a Track.

       cd organization/farmer/application/
       npm install
       
   First, we must add identity information to Farmer's admin user's wallet.
   
       node addToWallet.js
       ls ../identity/user/isabella/wallet/User1@org1.example.com
       
   Notice:
   
   * a private key `c75bd6911a...-priv` used to sign transactions on the admin user’s behalf, but not 
     distributed outside of her immediate control.
   * a public key `c75bd6911a...-pub` which is cryptographically linked to the admin user’s private key.
     This is wholly contained within Isabella’s X.509 certificate.
   * a certificate `User1@org.example.com` which contains the admin user’s public key and other X.509 
     attributes added by the Certificate Authority at certificate creation. This certificate is 
     distributed to the network so that different actors at different times can cryptographically verify 
     information created by the admin user’s private key.
     
   Finally, create the track.
   
       node create.js

6. Now, pretend we're the Supplier.

       cd organization/supplier/configuration/cli/
       docker-compose -f docker-compose.yml up -d cliSupplier
       
7. Receive the goods.

       cd organization/supplier/application/
       npm install
       
   Add identity information to Supplier's admin user's wallet.
   
       node addToWallet.js
       
   Finally, receive the goods and take ownership of the Track.
   
       node receive.js
       
## Shutdown and cleanup example

1. Switch to terminal running `monitordocker.sh` and Ctrl-C.

2. Switch back and stop the logspout container and peer containers.

       docker stop logspout
       docker stop cliSupplier
       docker stop cliFarmer
       
3. Stop and teardown network.

       cd network
       ./stop.sh
       ./teardown.sh
