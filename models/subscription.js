const { getFileData, getDataFilePath } = require('../utils/fileUtils');

const filePath = getDataFilePath('subscriptions.json');

module.exports = class Subscription {
  static async fetchAll() {
    return await getFileData(filePath);
  }
}
