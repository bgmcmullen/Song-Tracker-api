'use strict';

const mongoose = require('mongoose');

// Create Schema
const SongSchema = new mongoose.Schema({
  songObject: {
    type: Object,
    required: true
  },

});

const SongModel = mongoose.model('songs', SongSchema);

module.exports = SongModel;