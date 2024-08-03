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

const OpenAI = require("openai");

// Create an instance of the OpenAI class
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function aiTest() {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Tell me about this tracks's production: Love Story by Taylor Swift" }],
      stream: true,
    });

    let responseString = '';

    for await (const chunk of stream) {
      responseString += chunk.choices[0]?.delta?.content || "";
    }
    return responseString;
  } catch (error) {
    console.error("Error:", error);
  }

}




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
// app.use(verifyUser); // Authorization middleware

// Test endpoint
app.get('/test', (request, response) => {
  response.send('test request received');
});

app.get('/testChatgpt', async (req, res) => {
  response = await aiTest();
  res.json(response);
})

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
