'use strict';

const mongoose = require('mongoose');

// Create Schema
const SongSchema = new mongoose.Schema({
  email: {
    type: String,
  },

  songObject: {
    type: Object,
    required: true
  },

});

const SongModel = mongoose.model('songs', SongSchema);

module.exports = SongModel;