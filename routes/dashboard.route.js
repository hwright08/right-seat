
const express = require('express');
const { body, query } = require('express-validator');

const { emptyStringToNull } = require('../utils/validate');
const entityController = require('../controllers/entity');

const router = express.Router();

router.get('/', entityController.getDashboard);
router.post('/new-entity',
  [
    body('name').trim().notEmpty().isString().withMessage('Invalid name'),
    body('subscriptionId').isInt().toInt().withMessage('Invalid subscription'),
    query('search').customSanitizer(emptyStringToNull).optional({ nullable: true }).isString(),
  ],
  entityController.postAddNewEntity
);

module.exports = router;
