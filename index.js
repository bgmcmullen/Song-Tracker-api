// Import necessary modules
const axios = require('axios');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const SongModel = require('./SongModel');
const bodyParser = require('body-parser');
const verifyUser = require('./auth/authorize');

// Set up environment variables
const PORT = process.env.PORT || 3001;
const API_Key = process.env.API_Key;
const API_Host = process.env.API_Host;
const DATABASE_URI = process.env.DATABASE_URI;

// Connect to MongoDB database
mongoose.connect(DATABASE_URI);

// Initialize Express application
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(verifyUser); // Authorization middleware

// Test endpoint
app.get('/test', (request, response) => {
  response.send('test request received');
});

// Endpoint to get top 10 tracks by artist name
app.get('/artist/:artistName', async (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://theaudiodb.p.rapidapi.com/track-top10.php',
    params: { s: req.params.artistName },
    headers: {
      'X-RapidAPI-Key': API_Key,
      'X-RapidAPI-Host': API_Host
    }
  };
  try {
    const songData = await axios.request(options);
    res.json(songData.data.track);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to get user's favorite songs
app.get('/favorites', async (req, res) => {
  let queryObject = { email: req.user.email };
  try {
    let documents = await SongModel.find(queryObject);
    res.json(documents);
  } catch (error) {
    console.error('Failed to find songs:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to delete a favorite song by ID
app.delete('/favorites/:songId', async (req, res) => {
  try {
    if (!req.params.songId) {
      return res.status(400).send('Please provide a valid song ID');
    }
    const result = await SongModel.findByIdAndDelete(req.params.songId);
    if (!result) {
      return res.status(404).send('Song not found');
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to add a favorite song
app.post('/artist', async (req, res) => {
  let songObject = req.body;
  let email = req.user.email;
  try {
    let song = new SongModel({ email, songObject });
    await song.save();
    res.status(201).send('Song added successfully');
  } catch (error) {
    console.error('Error adding song:', error);
    res.status(400).send('Bad Request');
  }
});

// Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
