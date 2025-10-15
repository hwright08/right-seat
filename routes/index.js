// Get routes dynamically

const fs = require('node:fs');
const path = require('node:path');
const { capitalizeFirstLetter } = require('../utils/stringUtils');

// Get the folder where the routes live
const modelPath = path.join(__dirname, '.');
const routes = {};

// Read all routes in the route folder - specifically with filenames ending in .route.js
fs.readdirSync(modelPath).forEach(file => {
  if (file.endsWith('.route.js')) {
    const modelName = path
      .basename(file, '.route.js')
      .split('-')
      .map((val, i) => i == 0 ? val : capitalizeFirstLetter(val))
      .join('');

    routes[modelName] = require(path.join(modelPath, file));
  }
});

// routes are exported in camelcase

module.exports = routes;
