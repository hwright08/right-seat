const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { param } = require('express-validator');

router.get(
  '/progress/:userId',
  [param('userId').isInt().toInt().withMessage('User ID is required')],
  reportController.printLessons
);

module.exports = router;
