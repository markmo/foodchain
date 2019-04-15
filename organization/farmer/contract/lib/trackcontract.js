'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// PaperNet specific classes
const Track = require('./track.js');
const TrackList = require('./tracklist.js');

/**
 * A custom context provides easy access to list of all tracks
 */
class TrackContext extends Context {

    constructor() {
        super();
        // All papers are held in a list of papers
        this.trackList = new TrackList(this);
    }

}

/**
 * Define track smart contract by extending Fabric Contract class
 *
 */
class TrackContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.example.track');
    }

    /**
     * Define a custom context for tracks
     */
    createContext() {
        return new TrackContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Create a track
     *
     * @param {Context} ctx the transaction context
     * @param {String} farmer
     * @param {Integer} trackId
     * @param {String} harvestedDateTime harvest date
     * @param {String} expiryDateTime food expiry date
     * @param {Integer} value value of goods
     */
    async create(ctx, farmer, trackId, harvestedDateTime, expiryDateTime, value) {

        // create an instance of the rtack
        let track = Track.createInstance(farmer, trackId, harvestedDateTime, expiryDateTime, value);

        // Smart contract, rather than track, moves track into HARVESTED state
        track.setHarvested();

        // Newly created track is owned by the farmer
        track.setOwner(farmer);

        // Add the track to the list of all similar tracks in the ledger world state
        await ctx.trackList.addTrack(track);

        // Must return a serialized track to caller of smart contract
        return track.toBuffer();
    }

    /**
     * Receive track
     *
     * @param {Context} ctx the transaction context
     * @param {String} farmer
     * @param {Integer} trackId
     * @param {String} currentOwner current owner
     * @param {String} newOwner new owner
     * @param {Integer} price price paid
     * @param {String} purchaseDateTime time of purchase
     */
    async receive(ctx, farmer, trackId, currentOwner, newOwner, price, purchaseDateTime) {

        // Retrieve the current track using key fields provided
        let trackKey = Track.makeKey([farmer, trackId]);
        let track = await ctx.trackList.getTrack(trackKey);

        // Validate current owner
        if (track.getOwner() !== currentOwner) {
            throw new Error('Track ' + farmer + trackId + ' is not owned by ' + currentOwner);
        }

        // Received track is owned by the newOwner
        track.setOwner(newOwner);

        // First receipt moves state from HARVESTED to AT_SUPPLIER
        if (track.isHarvested()) {
            track.setAtSupplier();
        }

        // Update the track
        await ctx.trackList.updateTrack(track);
        return track.toBuffer();
    }
}

module.exports = TrackContract;
