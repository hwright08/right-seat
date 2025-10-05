
const express = require('express');
const { body, query, param } = require('express-validator');

const { emptyStringToNull } = require('../utils/validate');
const entityController = require('../controllers/entity');

const router = express.Router();

router.get('/:entityId',
  param('entityId').isInt().toInt(),
  entityController.getLocalAdminDashboard,
);

router.get('/', entityController.getDashboard);

module.exports = router;
