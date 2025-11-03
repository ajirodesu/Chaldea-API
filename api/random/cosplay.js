const axios = require('axios');

const meta = {
    name: 'cosplay',
    desc: 'get random cosplay video',
    method: 'get',
    category: 'random',
    params: []
};

async function onStart({ req, res }) {
    try {
        // Define the GitHub repository details
        const owner = 'ajirodesu';
        const repo = 'cosplay';
        const branch = 'main'; // Use the correct branch if it's different from 'main'

        // Construct the raw URL for the root of the repository
        const repoUrl = `https://github.com/${owner}/${repo}/tree/${branch}/`;

        // Scrape the directory to fetch file names
        const response = await axios.get(repoUrl);
        const html = response.data;

        // Use a regular expression to extract video filenames from the HTML
        const videoFileRegex = /href="\/ajirodesu\/cosplay\/blob\/main\/([^"]+\.mp4)"/g;
        const videoFiles = [];
        let match;

        while ((match = videoFileRegex.exec(html)) !== null) {
            videoFiles.push(match[1]);
        }

        if (videoFiles.length === 0) {
            return res.status(404).json({ error: "No videos found in the repository" });
        }

        // Select a random video from the list
        const randomVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)];

        // Construct the raw URL for the selected video
        const videoUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${randomVideo}`;

        // Respond with the raw video URL
        res.json({ videoUrl });
    } catch (error) {
        log.error("Error fetching random video:" + error);
        res.status(500).json({ error: "Failed to fetch random video" });
    }
}

module.exports = { meta, onStart };