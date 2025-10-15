/** @module routes/dashboard */

const express = require('express');

const entityController = require('../controllers/entity');
const userController = require('../controllers/user');

const router = express.Router();

// GET => /dashboard/:entityId
// Get the dashboard for a specific entity (admin view)
router.get(['/', '/:entityId'], entityController.getDashboardPage);

// GET => /dashboard/:entityId/cfi/:userId
// Get a CFI Dashboard
router.get('/:entityId/user/:userId', (req, res) => {
  res.render('cfi/profile', {});
});

module.exports = router;
