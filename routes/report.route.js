const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { param } = require('express-validator');
const { isAuth, isStudent } = require('../middleware/auth');

// Authenticated and students or "higher" can use these routes
router.use(isAuth);
router.use(isStudent);

// GET => /report/progress/:userId
router.get(
  '/progress/:userId',
  [param('userId').isInt().toInt().withMessage('User ID is required')],
  reportController.printLessons
);

module.exports = router;
