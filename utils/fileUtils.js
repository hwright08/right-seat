/** @module utils/file */

const fs = require('node:fs/promises');
const path = require('node:path');


/**
 * Reads the content of JSON files
 * @param {string} filePath - The path to a specific file
 * @returns {Promise<object>}
 */
exports.getFileData = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Could not read from file: ${filePath}`, err);
    return [];
  }
}


/**
 * Write JSON to a file
 * @param {string} filePath - The path to a specific file
 * @param {*} data - The data to write to the file
 */
exports.writeToFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data));
  } catch (err) {
    console.error(`Could not save to file: ${filePath}`, err);
  }
}


/**
 * Get the file name of a specific file in the data folder
 * @param {string} fileName - The name of a data file
 * @returns {string}
 */
exports.getDataFilePath = (fileName) => path.join(
  path.dirname(require.main.filename),
  'data',
  fileName,
);
