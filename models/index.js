const fs = require('node:fs');
const path = require('node:path');
const { capitalizeFirstLetter } = require('../utils/stringUtils');

// Get models dynamically
const modelPath = path.join(__dirname, '.');
const models = {};

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

module.exports = models;
