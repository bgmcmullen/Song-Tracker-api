const axios = require('axios');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const SongModel = require('./SongModel');
const bodyParser = require('body-parser');
const verifyUser = require('./auth/authorize');


const PORT = process.env.PORT || 3001;

const API_Key = process.env.API_Key;

const API_Host = process.env.API_Host;

const DATABASE_URI = process.env.DATABASE_URI;

mongoose.connect(DATABASE_URI);

const app = express();
app.use(cors());
app.use(bodyParser.json());


//app.use(verifyUser);


app.get('/test', (request, response) => {
  response.send('test request received');

})

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
    console.error(error);
  }


})

app.get('/favorites', async (req, res) => {
  try {
    let documents = await SongModel.find()
    res.json(documents);
  } catch (e) {
    console.log('failed to find songs');
    res.status(500).send(e);
  }
})

app.delete('/favorites/:songId', async (req, res) => {
  try {
    // Check if a valid song ID is provided
    if (!req.params.songId) {
      return res.status(400).send('Please provide a valid song ID');
    }

    // Attempt to delete the song by ID
    const result = await SongModel.findByIdAndDelete(req.params.songId);

    // Check if the song was found and deleted
    if (!result) {
      return res.status(404).send('Song not found');
    }

    // Send a success response
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/artist', async (req, res) => {
  console.log(req);

  try {

    let song = new SongModel(req.body);

    await song.save();

    // Send a response
    res.status(201).send('Song added successfully');

  } catch (e) {
    // Handle errors
    console.error('Error:', e.message);
    res.status(400).send(e.message);
  }


})


app.listen(PORT, () => console.log(`listening on ${PORT}`));
