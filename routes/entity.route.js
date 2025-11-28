
const express = require('express');
const entityController = require('../controllers/entity.controller');
const { query, param, body } = require('express-validator');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Only logged in admins can access these routes
router.use(auth);
router.use(isAdmin);

// GET => /entity/:entityId
router.get(
  '/:entityId',
  [
    param('entityId').isInt().toInt().withMessage('Entity ID is required'),
    query('entity').optional().trim()
  ],
  entityController.getEntityDashboard
);

// POST => /entity/:entityId/subscription
router.post(
  '/:entityId/subscription',
  [
    body('subscriptionId').isInt().toInt().withMessage('A subscription is required'),
    param('entityId').isInt().toInt().withMessage('Entity is required'),
  ],
  entityController.updateSubscription
);

module.exports = router;
