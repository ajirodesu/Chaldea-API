# Shin API UI V2

> Interactive REST API documentation + sandbox UI for file-based API endpoints.
> **Live demo:** [https://shin-apis.onrender.com/](https://shin-apis.onrender.com/)

---

# Table of contents

* About
* Features
* Quick start
* `settings.js` — configuration (example + field reference)
* Endpoint file format / template
* Example: `example.js` (simple functional example)
* How to call / test an endpoint (live example)
* Response format conventions & best practices
* Deploying
* Contributing & credits
* License

---

# About

Shin API UI is a lightweight UI and tiny Node server for documenting and exposing REST endpoints created as individual `.js` files under an `api/` folder. Each endpoint exports a `meta` object (used by the UI) and an `onStart` function that handles the incoming request.

---

# Features

* Drop-in API files (each file is a self-contained endpoint).
* `meta` object used by the UI to describe each endpoint.
* Standard JSON response patterns (200, 400, 404, 500) by convention.
* Customizable `settings.js` for branding, links, and notifications.
* Ready to deploy on Vercel / Render / any Node host.
* Live demo: [https://shin-apis.onrender.com/](https://shin-apis.onrender.com/)

---

# Quick start

1. Clone the repo:

```bash
git clone https://github.com/ajirodesu/Shin-API-UI-V2.git
cd Shin-API-UI-V2 
````

2. Install dependencies:

```bash
npm install
```

3. Edit `settings.js` to configure the UI (see the settings section below).

4. Add your API files into the `api/` folder (see templates below).

5. Start the server locally:

```bash
npm start
# or
node index.js
```

Open the UI in your browser (default: `http://localhost:<PORT>`).

---

# `settings.js` — configuration

Example `settings.js`:

```js
module.exports = {
  name: 'Shin APIs',
  description: 'This interactive interface allows you to explore and test our comprehensive collection of API endpoints in real-time.',
  icon: '/docs/image/icon.png',
  author: 'ShinDesu',
  telegram: 'https://t.me/+AQO22J2q6KBlNWM1',
  notification: [
    { title: 'New API Added', message: 'Blue Achieve and Loli API have been added to the documentation.' },
    { title: 'System Update', message: 'The API documentation system has been updated to version 0.0.2' }
  ]
};
```

**Field reference**

* `name` — Display name for the UI.
* `description` — Short description shown in header/home.
* `icon` — Path or URL to an icon used in the UI.
* `author` — Project owner / maintainer.
* `telegram` — Contact / support link (optional).
* `notification` — Array of `{ title, message }` shown in UI (optional).

---

# Endpoint file format / template

Shin expects each endpoint file in the `api/` folder to export at least two things:

* `meta` — metadata used by the UI and by the server to expose the endpoint.
* `onStart` — an async function that receives the Node/Express `req` and `res` objects and handles the request.

Routes are automatically derived from `meta.category` (slugified) and `meta.name` (e.g., `/example/example`).

**Recommended `meta` fields**

* `name` — short identifier for this endpoint (string).
* `desc` — short description shown in the UI.
* `method` — HTTP method(s) this endpoint supports (string or array, e.g., ['get', 'post']).
* `category` — grouping for the UI (string).
* `params` — array of parameter objects: `{ name: string, description: string, example: string, required: boolean }`.

**Minimal template**

```js
// api/template.js
const meta = {
  name: '',
  desc: '',
  method: 'get',
  category: 'general',
  params: [
    {
      name: '',
      desc: '',
      example: '',
      required: false,
      options: []
    }
  ]
};

async function onStart({ req, res }) {
  let param1, param2;
  if (req.method === 'POST') {
    ({ param1, param2 } = req.body);
  } else {
    ({ param1, param2 } = req.query);
  }
  if (!param1) {
    return res.status(400).json({
      error: 'Missing required parameter: param1'
    });
  }
  try {
    // Your code here
    return res.json({
      result: ''
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}
module.exports = { meta, onStart };
```

---

# Example: `example.js` (simple functional example)

This example demonstrates a basic endpoint that echoes back input with a greeting.

```js
// api/example.js
const meta = {
  name: 'example',
  desc: 'A simple example API that echoes back the input text with a greeting',
  method: [ 'get', 'post' ],
  category: 'Example',
  params: [
    {
      name: 'text',
      desc: 'Input your text here',
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
```

---

# How to call / test an endpoint

**Local pattern**

```
GET http://localhost:<PORT>/<category-slug>/<name>?param1=value1&param2=value2
```

**Live example (public)**

```
GET https://shin-apis.onrender.com/example/example?text=Hello
```

**curl example (live):**

```bash
curl "https://shin-apis.onrender.com/example/example?text=Hello"
```

**Example responses:**

* **Success (200)**

```json
{ "message": "Hello, Hello! This is an example response." }
```

* **Bad request (400)**

```json
{ "error": "Missing required parameter: text" }
```

* **Server error (500)**

```json
{ "error": "Internal server error" }
```

---

# Response format conventions & best practices

* Use proper HTTP status codes (200, 400, 404, 500).
* Keep JSON payloads concise and consistent — avoid including timestamps or internal attribution unless explicitly desired.
* Clearly document required/optional params in `meta.params`.
* If an endpoint queries slow external services, consider caching and/or rate-limiting.

---

# Deploying

* The repo is compatible with Vercel, Render, and other Node hosts.
* For the public demo, see: [https://shin-apis.onrender.com/](https://shin-apis.onrender.com/)
* On hosts like Render or Vercel, connect the GitHub repo and follow their deployment flow. Ensure `index.js` and `package.json` `start` script are correct.

---

# Contributing & credits

This project is based on Rynn’s UI design — special thanks to [https://github.com/rynn-k](https://github.com/rynn-k) for the original project. The repository `Shin-API-UI-V2` is an adaptation and extension by `ajirodesu`.

Contributing guidelines:

1. Fork the repo.
2. Add your API file(s) to `/api`.
3. Open a pull request with a short description of the endpoint(s) you added.

---

# License

This project is MIT licensed (see the `LICENSE` file in the repo).

---