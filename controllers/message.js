/** @module controllers/message */

const models = require('../models');

// ----------------------------------
// LOGIC
// ----------------------------------

/**
 * Create a new message
 * @param {object} data - The data to create the message
 * @param {string} data.type - The type of message to create. Should be 'general' or 'sales'
 * @param {string} [data.orgName] - The name of the organization, if applicable
 * @param {string} data.contactName - The name of the contact
 * @param {string} data.email - The email to respond to
 * @param {string} data.message - The message from the contact
 * @returns {Promise<object>}
 */
exports.createMessage = async (data) => {
  return await models.message.create(data);
}
