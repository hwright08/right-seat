// Get models dynamically

const fs = require('node:fs');
const path = require('node:path');
const { capitalizeFirstLetter } = require('../utils/stringUtils');

// Get the folder where the models live
const modelPath = path.join(__dirname, '.');
const models = {};

// Read all models in the models folder - specifically with filenames ending in .model.js
fs.readdirSync(modelPath).forEach(file => {
  if (file.endsWith('.model.js')) {
    const modelName = path
      .basename(file, '.model.js')
      .split('-')
      .map((val, i) => i == 0 ? val : capitalizeFirstLetter(val))
      .join('');

    models[modelName] = require(path.join(modelPath, file));
  }
});

// Models are exported in camelcase

module.exports = models;
