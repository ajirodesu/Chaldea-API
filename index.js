// Modified app.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const set = require('./settings');
const chalk = require('chalk');

(async () => {
  const app = express();
  const PORT = process.env.PORT || 4000;

  const logger = {
    info: (message) => console.log(chalk.dim.blue('•') + chalk.dim(' info  - ') + message),
    ready: (message) => console.log(chalk.dim.green('•') + chalk.dim(' ready - ') + message),
    warn: (message) => console.log(chalk.dim.yellow('•') + chalk.dim(' warn  - ') + message),
    error: (message) => console.log(chalk.dim.red('•') + chalk.dim(' error - ') + message),
    event: (message) => console.log(chalk.dim.cyan('•') + chalk.dim(' event - ') + message),
  };

  app.set('trust proxy', true);
  app.set('json spaces', 2);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use('/', express.static(path.join(__dirname, 'docs')));

  // Middleware to record request start time
  app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
  });

  logger.info('Starting server initialization...');

  // Middleware to automatically attach creator info, timestamp, and responseTime to all JSON responses
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      const now = new Date();
      const timestamp = now.toISOString();
      const responseTime = (Date.now() - req.startTime) + 'ms';

      if (data && typeof data === 'object') {
        const responseData = {
          operator: set.author || '',
          timestamp: timestamp,
          responseTime: responseTime,
          ...data,
        };
        return originalJson.call(this, responseData);
      }
      return originalJson.call(this, data);
    };
    next();
  });

  String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  function loadEndpointsFromDirectory(directory, categoryPath = '') {
    let endpoints = [];
    const fullPath = path.join(__dirname, directory);

    if (!fs.existsSync(fullPath)) {
      logger.warn(`Directory not found: ${fullPath}`);
      return endpoints;
    }

    logger.info(`Scanning directory: ${directory}...`);
    for (const item of fs.readdirSync(fullPath)) {
      const itemPath = path.join(fullPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        const subCategory = categoryPath ? `${categoryPath}/${item}` : item;
        logger.info(`Found subdirectory: ${item}`);
        endpoints = endpoints.concat(
          loadEndpointsFromDirectory(path.join(directory, item), subCategory)
        );
      } else if (stats.isFile() && item.endsWith('.js')) {
        try {
          const mod = require(itemPath);
          if (mod && typeof mod.onStart === 'function') {
            const name = item.replace('.js', '');
            const cat = mod.meta.category || (categoryPath || 'other');
            const catSlug = cat.toLowerCase().replace(/[\ /]/g, '-');
            const route = `/${catSlug}/${name}`;

            app.all(route, async (req, res, next) => {
              try {
                await mod.onStart({ req, res });
              } catch (err) {
                next(err);
              }
            });

            let displayPath = route;
            if (mod.meta.params && Array.isArray(mod.meta.params)) {
              displayPath += '?' + mod.meta.params.map(p => `${p.name}=`).join('&');
            }

            let bucket = endpoints.find(e => e.name === cat);
            if (!bucket) {
              bucket = { name: cat, items: [] };
              endpoints.push(bucket);
            }

            const methods = Array.isArray(mod.meta.method)
              ? mod.meta.method.map(m => m.toUpperCase())
              : [mod.meta.method?.toUpperCase() || 'GET'];

            bucket.items.push({
              ...mod.meta,
              path: displayPath,
              methods: methods
            });

            logger.ready(
              `${chalk.green(route)} ${chalk.dim('(')}${chalk.cyan(cat)}${chalk.dim(')')}`
            );
          }
        } catch (error) {
          logger.error(`Failed to load module ${itemPath}: ${error.message}`);
        }
      }
    }
    return endpoints;
  }

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'intro.html'));
  });

  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'dashboard.html'));
  });

  logger.info('Loading API endpoints...');
  const allEndpoints = loadEndpointsFromDirectory('api');
  logger.ready(
    `Loaded ${allEndpoints.reduce((t, c) => t + c.items.length, 0)} endpoints`
  );

  app.get('/endpoints', (req, res) => {
    const total = allEndpoints.reduce((t, c) => t + c.items.length, 0);
    res.json({ status: true, count: total, endpoints: allEndpoints });
  });

  app.get('/category/:category', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'category.html'));
  });

  app.get('/set', (req, res) => {
    res.json({ status: true, ...set });
  });

  app.use((req, res) => {
    logger.info(`404: ${req.method} ${req.path}`);
    res.status(404).sendFile(path.join(__dirname, 'docs', 'err', '404.html'));
  });

  app.use((err, req, res, next) => {
    logger.error(`500: ${err.message}`);
    res.status(500).sendFile(path.join(__dirname, 'docs', 'err', '500.html'));
  });

  app.listen(PORT, () => {
    logger.ready(`Server started successfully`);
    logger.info(`Local:   ${chalk.cyan(`http://localhost:${PORT}`)}`);

    try {
      const { networkInterfaces } = require('os');
      const nets = networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            logger.info(
              `Network: ${chalk.cyan(`http://${net.address}:${PORT}`)}`
            );
          }
        }
      }
    } catch (error) {
      logger.warn(`Cannot detect network interfaces: ${error.message}`);
    }

    logger.info(`${chalk.dim('Ready for connections')}`);
  });

  module.exports = app;
})();