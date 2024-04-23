const axios = require('axios');

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3001;

const app = express();

const options = {
  method: 'GET',
  url: 'https://theaudiodb.p.rapidapi.com/track-top10.php',
  params: {s: 'taylor swift'},
  headers: {
    'X-RapidAPI-Key': '395e7984a7msh7825449fd397da4p1a937bjsn0206e27ed8e7',
    'X-RapidAPI-Host': 'theaudiodb.p.rapidapi.com'
  }
};

app.get('/test', (request, response) => {
  response.send('test request received');

})

app.get('/artist/:artistName', async (req, res) => {
  options.params = {s: req.params.artistName};
  try {
    const songData = await axios.request(options);
    res.json(songData.data.track);
    //console.log(res.data.track.length);
  } catch (error) {
    console.error(error);
  }


})

async function getSearchResults(){

}

getSearchResults()

app.listen(PORT, () => console.log(`listening on ${PORT}`));
