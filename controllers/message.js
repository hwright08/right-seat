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

exports.getAllMessages = async () => {
  return await models.message.findAll({
    where: {
      resolved: false,
    }
  });
}

exports.getMessagePage = async (req, res) => {
  const message = await models.message.findOne({
    where: {
      id: req.params.messageId
    }
  });
  res.render('message', { message });
}

exports.deleteMessage = async (req, res) => {
  await models.message.destroy({
    where: {
      id: req.params.messageId
    }
  });

  res.redirect('/dashboard');
}

exports.resolveMessage = async (req, res) => {
  await models.message.update(
    { resolved: true },
    {
      where: {
      id: req.params.messageId
    }
  });
  res.redirect('/dashboard');
}
