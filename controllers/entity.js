const { validationResult } = require('express-validator');
const { literal, Op } = require('sequelize');

const models = require('../models');

exports.getDashboard = async (req, res) => {
  // Handle validation errors
  const { errors } = validationResult(req);
  if (!errors || errors.length) {
    res.locals.errors = errors;
    return res.status('403').send('Errors detected');
  }

  const { privilegeId, entityId } = req.user;

  // If global admin, go to the global admin dashboard
  if (privilegeId === 1) return await this.getGlobalAdminDashboard(req, res);
  if (privilegeId === 2) return await this.redirect(`/dashboard/${entityId}`);
  if (privilegeId === 3) return res.render('cfi/dashboard', {});
  if (privilegeId === 4) return res.render('student-dashboard', {});

  res.redirect('/');
}

exports.getGlobalAdminDashboard = async (req, res) => {
  const search = req.query.search?.toLowerCase();
  let whereClause = {};
  if (search) {
    whereClause = { name: {
      [Op.like]: `%${search}%`
    } };
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

exports.getLocalAdminDashboard = async (req, res) => {
  const { entityId } = req.params;

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
    models.user.findAll({
      where: {
        entityId,
        privilegeId: 4
      }
    }),
    // Get CFIs
    models.user.findAll({
      where: {
        entityId,
        privilegeId: 3
      }
    })
  ]);

  res.render('local-admin', {
    entity,
    students,
    cfis
  });
}
