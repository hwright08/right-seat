const fs = require('node:fs/promises');
const path = require('node:path');

exports.getFileData = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Could not read from file: ${filePath}`, err);
    return [];
  }
}


exports.writeToFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data));
  } catch (err) {
    console.error(`Could not save to file: ${filePath}`, err);
  }
}


exports.getDataFilePath = (fileName) => path.join(
  path.dirname(require.main.filename),
  'data',
  fileName,
);
