const { validationResult } = require('express-validator');
const { Op, fn, literal, col, where } = require('sequelize');
const db = require('../utils/db');

const models = require('../models');

exports.getDashboard = (req, res) => {
  const { privilegeId } = req.user;

  // If global admin, go to the global admin dashboard
  if (privilegeId === 1) return this.getGlobalAdminDashboard(req, res);
  if (privilegeId === 2) return res.render('local-admin', {});
  if (privilegeId === 3) return res.render('cfi/dashboard', {});
  if (privilegeId === 4) return res.render('student-dashboard', {});

  res.redirect('/');
}

exports.getGlobalAdminDashboard = async (req, res) => {
  const search = req.query.search?.toLowerCase();
  let whereClause = {};
  if (search) {
    whereClause = { name: search };
  }

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

  const counts = entities.reduce((sums, val) => {
    sums.student += val.studentCount;
    sums.cfi += val.cfiCount;
    return sums;
  }, { student: 0, cfi: 0 });

  const subscriptions = await models.subscription.findAll();

  // TODO: check which permission type to render the correct dashboard
  res.render('global-admin', {
    errors: [],
    entities,
    cfiCount: counts.cfiCount,
    studentCount: counts.studentCount,
    subscriptions
  });
}

exports.postAddNewEntity = async(req, res) => {
  // Handle validation errors
  const { errors } = validationResult(req);
  if (!errors || errors.length) {
    res.locals.errors = errors;
    return await this.getSignUpPage(req, res);
  }
  console.log(req.body);

  // Create the entity
  try {
    const entity = await models.entity.create(req.body);
    // res.redirect(`/dashboard/${entity.id}`);
    res.redirect('/dashboard');

  } catch (err) {
    console.error(err);
    res.status(500).send('Could not create new entity: ' + err);
  }
}
