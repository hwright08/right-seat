const { v4 } = require('uuid');

const { getFileData, writeToFile, getDataFilePath } = require('../utils/fileUtils');

const filePath = getDataFilePath('users.json');

module.exports = class User {
  /**
   * Create a User object
   * @param {string} id - The user's ID
   * @param {string} lastName - The user's last name
   * @param {string} firstName - The user's first name
   * @param {string} email - The user's email
   * @param {string} passwrd - The user's password
   * @param {number} entityId - The entity that the user is associated to
   * @param {number} privilegeId - The user's privilege
   */
  constructor(id, firstName, lastName, email, phone, passwrd, entityId, privilegeId) {
    this.userId = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.passwrd = passwrd;
    this.entityId = entityId;
    this.privilegeId = privilegeId;
    this.phone = phone;
  }

  /**
   * Save a User's information to a data file.
   * Handle's both create and update
   */
  async save() {
    const users = await getFileData(filePath);
    const usersToSave = [];
    if (this.userId) {
      const existingUserIndex = users.findIndex(u => u.userId === this.userId);
      usersToSave = [...users];
      usersToSave[existingUserIndex] = this;
    } else {
      this.userId = v4();
      usersToSave = [...users, this];
    }

    await writeToFile(filePath, usersToSave);
  }
}
