// Modified lyrics.js
const axios = require('axios');
const meta = {
  name: 'lyrics',
  desc: 'retrieves lyrics for a specified song and artist',
  method: [ 'get', 'post' ],
  category: 'search',
  params: [
    {
      name: 'artist',
      description: 'The artist of the song',
      example: 'Taylor Swift',
      required: true
    }, 
    { 
      name: 'song',
      description: 'The title of the song',
      example: 'Enchanted',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let artist, song;
  if (req.method === 'POST') {
    ({ artist, song } = req.body);
  } else {
    ({ artist, song } = req.query);
  }
  if (!artist || !song) {
    return res.status(400).json({
      error: 'Missing required parameters: artist and song'
    });
  }

  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
    const { data } = await axios.get(url);

    if (data.lyrics) {
      return res.json({
        answer: data.lyrics
      });
    } else {
      return res.status(404).json({
        error: 'Lyrics not found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };