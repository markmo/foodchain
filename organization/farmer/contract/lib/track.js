'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate track state values
const trackState = {
    HARVESTED: 1,
    AT_SUPPLIER: 2,
    AT_DISTRIBUTOR: 3,
    IN_STORE: 4
};

/**
 * Track class extends State class
 * Class will be used by application and smart contract to define a track
 */
class Track extends State {

    constructor(obj) {
        super(Track.getClass(), [obj.farmer, obj.trackId]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
     */
    getFarmer() {
        return this.farmer;
    }

    setFarmer(newFarmer) {
        this.farmer = newFarmer;
    }

    getOwner() {
        return this.owner;
    }

    setOwner(newOwner) {
        this.owner = newOwner;
    }

    /**
     * Useful methods to encapsulate track states
     */
    setHarvested() {
        this.currentState = trackState.HARVESTED;
    }

    setAtSupplier() {
        this.currentState = trackState.AT_SUPPLIER;
    }

    setAtDistributor() {
        this.currentState = trackState.AT_DISTRIBUTOR;
    }

    setInStore() {
        this.currentState = trackState.IN_STORE;
    }

    isHarvested() {
        return this.currentState === trackState.HARVESTED;
    }

    isAtSupplier() {
        return this.currentState === trackState.AT_SUPPLIER;
    }

    isAtDistributor() {
        return this.currentState === trackState.AT_DISTRIBUTOR;
    }

    static fromBuffer(buffer) {
        return Track.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to a Track
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Track);
    }

    /**
     * Factory method to create a Track object
     */
    static createInstance(farmer, trackId, harvestedDateTime, expiryDateTime, value) {
        return new Track({ farmer, trackId, harvestedDateTime, expiryDateTime, value });
    }

    static getClass() {
        return 'org.example.track';
    }
}

module.exports = Track;
