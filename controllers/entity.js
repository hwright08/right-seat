/** @module controllers/entity */

const { literal, Op } = require('sequelize');
const dayjs = require('dayjs');

const models = require('../models');

const { getSubscriptions } = require('../controllers/subscription');
const { getAllSyllabuses } = require('../controllers/syllabus');


// ----------------------------------
// LOGIC
// ----------------------------------

/**
 * Create an entity and the associated admin account
 * @param {object} data - Contains the data to save to entity and admin user
 * @param {string} data.orgName - The entity name
 * @param {string} [data.orgPhone] - The entity phone number
 * @param {number} data.subscription - The entity subscription level
 * @param {string} data.firstName - The Admin's first name
 * @param {string} data.lastName - The Admin's last name
 * @param {string} data.email - The Admin's email
 * @param {string} data.password - The Admin's password
 * @returns {Promise<object>}
 */
exports.createNewEntity = async (data) => {
  // Get the org data
  const { orgName, orgPhone, subscription } = data;

  // Get the new admin data
  const { firstName, lastName, email, password } = data;

  // Create the entity
  return await models.entity
    .create({
      name: !!orgName ? orgName : `${firstName} ${lastName}`,
      phone: orgPhone,
      subscriptionId: subscription,
      // Create the admin user
      users: [{
        firstName,
        lastName,
        email,
        privilegeId: 2,
        passwrd: password,
      }],
    }, {
      include: [{ model: models.user }],
    });
}

/**
 * Get all entities. Will also search entity names
 * @param {object} [searchCriteria] - An object containing any search criteria
 * @param {string} [searchCriteria.name] - An optionals string to search the entity name
 * @param {number} [searchCriteria.entityId] - The specific entity ID
 * @returns {Promise<object>} All entities
 */
exports.getAllEntities = async (searchCriteria) => {
  let whereClause = {};
  if (searchCriteria.name) {
    whereClause['name'] = {
      [Op.like]: `%${searchCriteria.name}%`
    }
  }

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
            AND (u.inactiveDate IS NULL OR CURRENT_DATE <= u.inactiveDate)
        )`),
        'cfiCount',
      ],
      [
        literal(`(
          SELECT COUNT(*) AS studentCount
          FROM users u
          WHERE u.entityId = entity.id
            AND u.privilegeId IN (4)
            AND (u.inactiveDate IS NULL OR CURRENT_DATE <= u.inactiveDate)
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


/**
 * Get all CFIs for a specified entity and search string.
 * @param {number} entityId - The entity Id we want to get information for
 * @param {object} criteria - The search criteria
 * @param {string} [criteria.searchStr] - An optional search string to search for specific CFIs
 * @returns {Promise<object>} All CFIs for an entity
 */
exports.getAllCFIs = async (entityId, { searchStr }) => {
  // Build the where clause for CFIs
  const cfiWhere = {
    entityId,
    privilegeId: {
      [Op.or]: [2, 3]
    }
  };

  // If querying CFI's, also check the name fields
  if (searchStr) {
    cfiWhere[Op.or] = [
      { firstName: { [Op.like]: `%${searchStr.toLowerCase()}%` } },
      { lastName: { [Op.like]: `%${searchStr.toLowerCase()}%` } },
    ];
  }

  return await models.user.findAll({ where: cfiWhere })
}

/**
 * Get all students given optional search criteria
 * @param {number} entityId - The specific entity we're looking at
 * @param {object} [searchCriteria] - The search criteria to use
 * @param {string} [searchCriteria.searchStr] - A string to search a student name
 * @param {number} [searchCriteria.cfiId] - The specific CFI ID
 * @returns {Promise<object[]>} The students for the specified criteria
 */
exports.getAllStudents = async (entityId, {searchStr, cfiId}) => {
  // Build the where clause for CFIs
  const studentWhere = {
    entityId,
    privilegeId: 4
  };

  // If querying CFI's, also check the name fields
  if (searchStr) {
    studentWhere[Op.or] = [
      { firstName: { [Op.like]: `%${searchStr.toLowerCase()}%` } },
      { lastName: { [Op.like]: `%${searchStr.toLowerCase()}%` } },
    ];
  }

  if (cfiId) {
    studentWhere['cfiId'] = cfiId;
  }

  return await models.user.findAll({ where: studentWhere });
}


// ----------------------------------
// RENDER VIEWS
// ----------------------------------


/** Determine which dashboard to render */
exports.getDashboardPage = async (req, res) => {
  const entityId = req.params.entityId ?? req.user.entityId;
  const priv = req.user.privilege.name;

  let entities = [];
  let cfis = [];
  let students = [];
  let syllabuses = [];
  let subscriptions = [];

  // Get Global Privilege specific info
  if (['global'].includes(priv)) {
    subscriptions = await getSubscriptions();
    entities = await this.getAllEntities({
      searchStr: req.query.entity
    });
  }

  // Get CFIs
  if (['global', 'admin'].includes(priv)) {
    cfis = await this.getAllCFIs(entityId, { searchStr: req.query.cfi });
    syllabuses = await getAllSyllabuses(entityId);
  }

  // Get Students
  if (['global', 'admin', 'cfi'].includes(priv)) {
    students = await this.getAllStudents(entityId, {
      searchStr: req.query.student
    });
  }

  // Get current entity
  const currentEntity = (await this.getAllEntities({ entityId }))[0];
  const userEntity = (await this.getAllEntities({ entityId: req.user.entityId }))[0];

  // Get the total counts for all entities
  const counts = entities.reduce((sums, val) => {
    sums.studentCount += val.studentCount;
    sums.cfiCount += val.cfiCount;
    return sums;
  }, { studentCount: 0, cfiCount: 0 });

  res.render('dashboard', {
    userEntity,
    currentEntity,
    entities,
    cfis,
    students,
    syllabuses,
    subscriptions,
    priv,
    ...counts
  });
}
