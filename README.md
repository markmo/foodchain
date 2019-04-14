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
