/** @module controllers/entity */

const models = require('../models');
const subscriptionController = require('./subscription.controller');
const userController = require('./user.controller');
const syllabusController = require('./syllabus.controller');
const { validationHandler } = require('./error.controller');
const { literal, Op } = require('sequelize');

/**
 * Create a new entity.
 * An entity is the umbrella "org" over all users of the account
 * @param {object} data - The data used to save a new entity
 * @param {string} [data.orgName] - The flight school's name. If a CFI is signing up, the umbrella account will default to the CFI's name.
 * @param {string} [data.orgPhone] - The phone number of the organization
 * @param {number} data.subscription - The subscription the entity will be signing up for
 * @param {string} data.firstName - The admin's first name
 * @param {string} data.lastName - The admin's last name
 * @param {string} data.email - The admin's contact email
 * @param {string} data.password - The admin's password
 */
exports.createNewEntity = async (data) => {
  try {
    const { orgName, orgPhone, subscription } = data;
    const { firstName, lastName, email, password } = data;

    const entityObj = {
      name: orgName || `${firstName} ${lastName}`,
      phone: orgPhone,
      subscriptionId: subscription,
    };

    const entityOptions = {};

    // create the admin user if email is available
    if (email) {
      entityObj.users = [{
        firstName,
        lastName,
        email,
        privilegeId: 2, // admin
        passwrd: password,
      }];

      entityOptions.include = [{ model: models.user }];
    }

    // create the entity
    await models.entity.create(entityObj, entityOptions);

  } catch (err) {
    const error = new Error('Failed to create new entity: ' + err.message);
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Get an entity by ID
 * @param {number} entityId - The ID of the entity we want to get
 * @returns {object} - Entity information, including the subscription details
 */
exports.getEntity = async (entityId) => {
  const entity = await models.entity.findOne({
    where: { id: entityId },
    include: [{
      model: models.subscription,
      attribute: ['id', 'key', 'label'],
      required: false
    }],
  });

  if (!entity) {
    const error = new Error('Entity not found');
    error.statusCode = 404;
    throw error;
  }

  return entity;
}


/**
 * Get all entities. Will also search entity names. Includes the CFI and Student counts and subscription information.
 * @param {object} [searchCriteria] - An object containing any search criteria
 * @param {string} [searchCriteria.name] - An optionals string to search the entity name
 * @param {number} [searchCriteria.entityId] - The specific entity ID
 * @returns {Promise<object>} All entities
 */
exports.getAllEntities = async (searchCriteria = {}) => {
  let whereClause = {};

  // search an entity by name
  if (searchCriteria.name) {
    whereClause['name'] = {
      [Op.like]: `%${searchCriteria.name}%`
    }
  }

  // Get a specific entity by ID
  if (searchCriteria.entityId) {
    whereClause['id'] = searchCriteria.entityId;
  }

  // Get the entities and their CFI and Student Counts
  return await models.entity.findAll({
    attributes: [
      'id',
      'name',
      [
        literal(`(
          SELECT COUNT(*) AS cfiCount
          FROM users u
          WHERE u.entityId = entity.id
            AND u.privilegeId IN (2,3)
            AND (u.inactiveDate IS NULL)
        )`),
        'cfiCount',
      ],
      [
        literal(`(
          SELECT COUNT(*) AS studentCount
          FROM users u
          WHERE u.entityId = entity.id
            AND u.privilegeId IN (4)
            AND (u.inactiveDate IS NULL)
        )`),
        'studentCount',
      ]
    ],
    include: [
      {
        model: models.subscription,
        attributes: ['id', 'key', 'label'],
        required: false,
      },
    ],
    where: whereClause,
    order: ['name'],
    raw: true,
    nest: true
  });
};


/** Render the entity / org's dashboard */
exports.getEntityDashboard = async (req, res, next) => {
  try {
    // Get all of the data needed to render the dashboard
    const [
      currentEntity,
      subscriptions,
      cfis,
      students,
      syllabi
    ] = await Promise.all([
      this.getEntity(req.params.entityId),
      subscriptionController.getSubscriptions(),
      userController.getUsers({ entityId: req.params.entityId, privilege: 'cfi', searchStr: req.query.cfi }),
      userController.getUsers({ entityId: req.params.entityId, privilege: 'student', searchStr: req.query.student, includeCfi: true, includeSyllabus: true }),
      syllabusController.getSyllabi({ entityId: req.params.entityId }),
    ]);

    // Get the student's average progress
    let overallProgress = 0;
    for (const student of students) {
      const studentProgress = await userController.getAvgStudentProgress(student.id);
      student.progress = studentProgress;
      overallProgress += studentProgress;
    }
    overallProgress /= students.length;

    // Render the view
    res.render('dashboard/admin', {
      currentEntity,
      subscriptions,
      cfis,
      students,
      overallProgress,
      syllabi,
      path: req.originalUrl,
      canEnrollStudent: true,
      canEditUser: ['global', 'admin'].includes(req.session.user.privilege),
    });
  } catch (err) {
    next(err);
  }
}

/** Update the entity's subscription */
exports.updateSubscription = async (req, res, next) => {
  try {
    validationHandler(req, res);
    const { subscriptionId } = req.body;
    const { entityId } = req.params;

    await models.entity.update(
      { subscriptionId },
      { where: { id: entityId }
    });

    res.redirect(`/entity/${entityId}`);
  } catch (err) {
    next(err);
  }
};
