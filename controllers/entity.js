/** @module controllers/entity */

const { validationResult } = require('express-validator');
const { literal, Op } = require('sequelize');

const models = require('../models');

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
      }],
    }, {
      include: [{ model: models.user }],
    });
}


// ----------------------------------
// RENDER VIEWS
// ----------------------------------

/** Determine which dashboard to render */
exports.getDashboardPage = async (req, res) => {
  // Handle validation errors
  if (res.locals.errors.length) {
    return res.status('403').send('Errors detected');
  }

  const { privilegeId, entityId } = req.user;

  // Determine which dashboard to render
  // Global Admin
  if (privilegeId === 1) return await this.getGlobalAdminDashboard(req, res);

  // Local Admin
  if (privilegeId === 2) return await this.redirect(`/dashboard/${entityId}`);

  // CFI
  if (privilegeId === 3) return res.render('cfi/dashboard', {});

  // Student
  if (privilegeId === 4) return res.render('student-dashboard', {});

  res.redirect('/');
}

/** Render the Global Admin Dashboard Page */
exports.getGlobalAdminDashboard = async (req, res) => {
  // Set up the where clause to search for a specific name
  const search = req.query.search?.toLowerCase();
  let whereClause = {};
  if (search) {
    whereClause = { name: {
      [Op.like]: `%${search}%`
    } };
  }

  // Get the entities and their CFI and Student Counts
  const entities = await models.entity.findAll({
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

  // Get the total counts for all entities
  const counts = entities.reduce((sums, val) => {
    sums.student += val.studentCount;
    sums.cfi += val.cfiCount;
    return sums;
  }, { student: 0, cfi: 0 });

  // Get available subscriptions
  const subscriptions = await models.subscription.findAll();

  // TODO: check which permission type to render the correct dashboard
  // Render the page
  res.render('global-admin', {
    errors: [],
    entities,
    cfiCount: counts.cfiCount,
    studentCount: counts.studentCount,
    subscriptions
  });
}

/** Render the Local Admin Dashboard */
exports.getLocalAdminDashboard = async (req, res) => {
  // Get the associated entity
  const { entityId } = req.params;

  // Build the where clause for CFIs
  const cfiWhere = {
    entityId,
    privilegeId: {
      [Op.or]: [2, 3]
    }
  };
  // If querying CFI's, also check the name fields
  if (req.query.cfi) {
    cfiWhere[Op.or] = [
      { firstName: { [Op.like]: `%${req.query.cfi.toLowerCase()}%` } },
      { lastName: { [Op.like]: `%${req.query.cfi.toLowerCase()}%` } },
    ];
  }

  // Build the where clause for students
  const studentWhere = {
    entityId,
    privilegeId: 4
  };
  // If querying student's, check all name fields
  if (req.query.student) {
    studentWhere[Op.or] = [
      { firstName: { [Op.like]: `%${req.query.student.toLowerCase()}%` } },
      { lastName: { [Op.like]: `%${req.query.student.toLowerCase()}%` } },
    ];
  }

  // Get necessary data to load the page
  const [
    entity,
    students,
    cfis
  ] = await Promise.all([
    // Get entities
    models.entity.findByPk(entityId, {
      include: [
        {
          model: models.subscription,
          attributes: ['id', 'key', 'label'],
          required: false,
        },
      ],
    }),
    // Get students
    models.user.findAll({ where: studentWhere }),
    // Get CFIs
    models.user.findAll({ where: cfiWhere }),
  ]);

  res.render('local-admin', {
    entity,
    students,
    cfis,
    entityId,
  });
}
