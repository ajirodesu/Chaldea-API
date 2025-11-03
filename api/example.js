// Modified example.js
const meta = {
  name: 'example',
  desc: 'A simple example API that echoes back the input text with a greeting',
  method: [ 'get', 'post' ],
  category: 'Example',
  params: [
    {
      name: 'text',
      description: 'Input your text here',
      example: 'Hello, world!',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let text;
  if (req.method === 'POST') {
    ({ text } = req.body);
  } else {
    ({ text } = req.query);
  }
  if (!text) {
    return res.status(400).json({
      error: 'Missing required parameter: text'
    });
  }
  try {
    const greeting = `Hello, ${text}! This is an example response.`;
    return res.json({
      message: greeting
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}
module.exports = { meta, onStart };