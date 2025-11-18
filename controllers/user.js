/** @module controllers/user */

const models = require('../models');
const entityController = require('../controllers/entity');
const ratingController = require('../controllers/rating');
const dayjs = require('dayjs');

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
  const incl = [];

  incl.push(
    options.id
    ? {
      model: models.privilege,
      attributes: ['name'],
    }
    : {
      model: models.privilege,
      attributes: [['name', 'priv']],
      separate: false,
    }
  );

  if (options.includeRatings) {
    delete options.includeRatings;
    incl.push({ model: models.rating, attributes: ['id', 'label'] })
  }

  return options.id
    ? await models.user.findByPk(options.id, { include: incl })
    : await models.user.findOne({ where: options, include: incl });
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

exports.updateUser = async (req, res) => {
  const { userId, entityId } = req.params;
  const { firstName, lastName, email, hasGoldSeal, ratings } = req.body;
  const data = {
    firstName,
    lastName,
    email,
    hasGoldSeal: hasGoldSeal === 'true',
  }

  try {
    const user = await models.user.findByPk(userId);
    await user.update(
      data,
      { where: { id: userId }}
    );

    if (Array.isArray(ratings)) {
      await user.setRatings(ratings);
    } else {
      await user.setRatings([]);
    }

    return res.redirect(`/dashboard/${entityId}/user/${userId}`);
  } catch (err) {
    console.error(err);
    res.locals.errors = err.errors;
    res.locals.message = 'Could not update user';
    res.locals.data = req.body;
    return await this.getUserUpdatePage(req, res);
  }
}

exports.deactivateUser = async (req, res) => {
  const { userId, entityId } = req.params;
  try {
    const user = await models.user.findByPk(userId);
    user.update({
      inactiveDate: dayjs().format('YYYY-MM-DD'),
    });
    res.redirect(`/dashboard/${entityId}`);
  } catch (err) {
    console.error(err);
    res.locals.errors = err.errors;
    res.locals.message = 'Could not deactivate user';
    res.locals.data = req.body;
    return await this.getUserProfile(req, res);
  }
}

exports.reactivateUser = async (req, res) => {
  const { userId, entityId } = req.params;
  try {
    const user = await models.user.findByPk(userId);
    user.update({
      inactiveDate: null,
    });
    res.redirect(`/dashboard/${entityId}/user/${userId}`);
  } catch (err) {
    console.error(err);
    res.locals.errors = err.errors;
    res.locals.message = 'Could not deactivate user';
    res.locals.data = req.body;
    return await this.getUserProfile(req, res);
  }
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
    await this.createUser(req, res);
    return res.redirect(`/dashboard/${req.params.entityId}`)
  } catch (err) {
    console.error(err);
    res.locals.errors = err.errors;
    res.locals.message = 'Could not create user';
    res.locals.data = req.body;
    return await this.getCreateUserPage(req, res);
  }
}

exports.getUserProfile = async (req, res) => {
  const currentEntity = (await entityController.getAllEntities({ entityId: req.params.entityId }))[0];
  const profile = await this.getUser({ id: req.params.userId, includeRatings: true });

  let students;
  if (profile.privilege.name == 'student') {
    students = await entityController.getAllStudents(currentEntity, {});
    const me = students.find(st => st.id == profile.id);
    profile.syllabus = me.syllabus;
  } else {
    students = await entityController.getAllStudents(currentEntity.id, { cfiId: req.params.userId });
  }

  res.render('student-dashboard', {});
  // res.render('profile', {
  //   currentEntity,
  //   profile,
  //   students
  // });
}

exports.getUserUpdatePage = async (req, res) => {
  const currentEntity = (await entityController.getAllEntities({ entityId: req.params.entityId }))[0];
  const ratings = await ratingController.getRatings();
  const user = await this.getUser({ id: req.params.userId, includeRatings: true });
  user.ratings = user.ratings.map(r => `${r.id}`);
  res.render('add-user', {
    currentEntity,
    ratings,
    type: req.query.type?.toUpperCase(),
    data: user,
    errors: []
  });
}
