'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('../ledger-api/statelist.js');

const Track = require('./track.js');

class TrackList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.example.tracklist');
        this.use(Track);
    }

    async addTrack(track) {
        return this.addState(track);
    }

    async getTrack(trackKey) {
        return this.getState(trackKey);
    }

    async updateTrack(track) {
        return this.updateState(track);
    }
}


module.exports = TrackList;