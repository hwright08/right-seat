/** @module controllers/user */

const models = require('../models');
const entityController = require('../controllers/entity');
const ratingController = require('../controllers/rating');

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
  let privilegeId = 4;
  if (req.body.type.toLowerCase() == 'admin') privilegeId = 2;
  if (req.body.type.toLowerCase() == 'cfi') privilegeId = 3;

  const { entityId } = req.params;
  const { firstName, lastName, email, passwrd, inactiveDate, hasGoldSeal, ratings } = req.body;
  const data = {
    firstName,
    lastName,
    email,
    passwrd,
    inactiveDate,
    hasGoldSeal,
    privilegeId,
    entityId
  };

  const user = await models.user.create(data);

  if (ratings && ratings.length) user.setRatings(ratings);

  return user;
}


// ----------------------------------
// VIEWS
// ----------------------------------

exports.getCreateUserPage = async (req, res) => {
  const currentEntity = (await entityController.getAllEntities({ entityId: req.params.entityId }))[0];
  const ratings = await ratingController.getRatings();
  res.render('add-user', {
    currentEntity,
    ratings,
    type: req.query.type?.toUpperCase(),
  });
}

exports.postCreateUser = async (req, res) => {
  try {
    const user = await this.createUser(req, res);
    return res.redirect(`/dashboard/${req.params.entityId}`)
  } catch (err) {
    console.error(err);
    res.locals.errors = err.errors;
    res.locals.message = 'Could not create user';
    res.locals.data = req.body;
    return await this.getCreateUserPage(req, res);
  }
}
