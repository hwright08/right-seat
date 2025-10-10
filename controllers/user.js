/** @module controllers/user */

const models = require('../models');
const { getDashboardPage } = require('./entity');

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
    ? await models.user.findByPk(options.id)
    : await models.user.findOne({ where: options })
}


/** Create a new user */
exports.createUser = async (req, res) => {
  // Handle validation errors
  if (res.locals.errors.length) {
    return await getDashboardPage(req, res);
  }
  console.log(req.body);

  const data = {
    ...req.body,
    ...req.params,
  };

  const user = await models.user.create(data);
  res.redirect(`/dashboard/${req.params.entityId}/cfi/${user.id}`);
}
