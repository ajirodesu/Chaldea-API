# Chaldea API

## Overview
An open-source REST API with a web-based documentation interface. This Express.js application serves various endpoints organized by categories (random, search, etc.) and includes a built-in documentation site.

## Project Structure
- `index.js` - Main Express server entry point
- `api/` - API endpoint modules organized by category
- `docs/` - Static HTML documentation files
- `setup/` - Configuration files (settings.js, notif.json)

## Running the Application
- **Development**: `npm run dev` (uses nodemon for hot reload)
- **Production**: `npm start`

The server runs on port 5000 and binds to 0.0.0.0.

## API Endpoints
Endpoints are auto-loaded from the `api/` directory. Each module exports:
- `meta` - Endpoint metadata (category, params, method)
- `onStart` - Request handler function

## Configuration
Settings are defined in `setup/settings.js`.
