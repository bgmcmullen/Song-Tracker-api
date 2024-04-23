const axios = require('axios');

require('dotenv').config();
const express = require('express');
const cors = require('cors');


const PORT = process.env.PORT || 3001;

const API_Key = process.env.API_Key;

const API_Host = process.env.API_Host;



const app = express();
app.use(cors());



const options = {
  method: 'GET',
  url: 'https://theaudiodb.p.rapidapi.com/track-top10.php',
  params: {s: 'Taylor Swift'},
  headers: {
    'X-RapidAPI-Key': API_Key,
    'X-RapidAPI-Host': API_Host
  }
};

app.get('/test', (request, response) => {
  response.send('test request received');

})

app.get('/artist', async (req, res) => {
  //options.params = {s: req.params.artistName};
  try {
    const songData = await axios.request(options);
    res.json(songData.data.track);
  } catch (error) {
    console.error(error);
  }


})

async function getSearchResults(){

}

getSearchResults()

app.listen(PORT, () => console.log(`listening on ${PORT}`));
