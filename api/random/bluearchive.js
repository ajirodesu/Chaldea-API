// blue-archive.js
const axios = require('axios');

const meta = {
    name: 'blue archive',
    desc: 'blue archive random image',
    method: 'get',
    category: 'random',
};

async function onStart({ req, res }) {
    try {
        const { data } = await axios.get(
            'https://raw.githubusercontent.com/rynxzyy/blue-archive-r-img/refs/heads/main/links.json'
        );
        // pick a random URL from the array
        const imageUrl = data[Math.floor(Math.random() * data.length)];
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imgBuffer = Buffer.from(response.data);
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imgBuffer.length,
        });
        res.end(imgBuffer);
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
}

module.exports = { meta, onStart };
