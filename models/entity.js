const { v4 } = require('uuid');

const { getFileData, writeToFile, getDataFilePath } = require('../utils/fileUtils');

const filePath = getDataFilePath('entity.json');

module.exports = class Entity {
  // constructor(id, name, subscription)
}
