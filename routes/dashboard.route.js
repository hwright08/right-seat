/** @module routes/dashboard */

const express = require('express');

const entityController = require('../controllers/entity');
const userController = require('../controllers/user');

const router = express.Router();

// GET => /dashboard/:entityId
// Get the dashboard for a specific entity (admin view)
router.get('/:entityId', entityController.getLocalAdminDashboard);

// GET => /dashboard/:entityId/cfi/:userId
// Get a CFI Dashboard
router.get('/:entityId/cfi/:userId', (req, res) => {
  res.render('cfi/profile', {});
});

// GET => /dashboard
// Get the dashboard for the logged in user
router.get('/', entityController.getDashboardPage);

// POST => /dashboard/:entityId/cfi
// Create a new CFI
router.post('/:entityId/user', userController.createUser);

module.exports = router;
