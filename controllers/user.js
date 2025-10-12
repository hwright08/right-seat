/** @module controllers/user */

const models = require('../models');

// ----------------------------------
// LOGIC
// ----------------------------------

/**
 * Get the basic information for a single user
 * @param {object} options - The values to search a user by
 * @param {number} [options.id] - The id of the user. Will override any other search criteria
 * @param {*} * - Can pass any Sequelize friendly search criteria
 * @returns {Promise<object>}
 */
exports.getUser = async (options = {}) => {
  return options.id
    ? await models.user.findByPk(options.id, {
      include: [{
        model: models.privilege,
        attributes: ['name'],
      }]
    })
    : await models.user.findOne({
      where: options,
      include: [{
        model: models.privilege,
        attributes: [['name', 'priv']],
        separate: false,
      }]
    });
}


/** Create a new user */
exports.createUser = async (req, res) => {
    const data = {
    ...req.body,
    ...req.params,
  };

  const user = await models.user.create(data);
  res.redirect(`/dashboard/${req.params.entityId}/user/${user.id}`);
}
