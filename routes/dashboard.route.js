/** @module routes/dashboard */

const express = require('express');
const { body, param, query } = require('express-validator');

const entityController = require('../controllers/entity');
const userController = require('../controllers/user');
const { emptyStringToNull } = require('../middleware/validate');

const router = express.Router();

// GET => /dashboard/:entityId
// Get the dashboard for a specific entity (admin view)
router.get('/:entityId',
  param('entityId').isInt().toInt(),
  query('cfi').customSanitizer(emptyStringToNull).optional({ nullable: true }).isString(),
  query('student').customSanitizer(emptyStringToNull).optional({ nullable: true }).isString(),
  entityController.getLocalAdminDashboard,
);

// GET => /dashboard/:entityId/cfi/:userId
// Get a CFI Dashboard
router.get('/:entityId/cfi/:userId', (req, res) => {
  res.render('cfi/profile', {});
});

// GET => /dashboard
// Get the dashboard for the logged in user
router.get('/',
  [query('search').customSanitizer(emptyStringToNull).optional({ nullable: true }).isString()],
  entityController.getDashboardPage
);

// POST => /dashboard/:entityId/cfi
// Create a new CFI
router.post('/:entityId/cfi',
  [
    param('entityId').isInt().toInt(),
    body('firstName').trim().isLength({ min: 1 }).isString(),
    body('lastName').trim().isLength({ min: 1}).isString(),
    body('hasGoldSeal').isBoolean().toBoolean(),
    body('email').trim().isEmail(),
    body('privilegeId').isInt().toInt(),
  ],
  userController.createUser
);

module.exports = router;
