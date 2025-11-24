const express = require('express');
const { isGlobalUser } = require('../middleware/auth');
const messageController = require('../controllers/message.controller');
const entityController = require('../controllers/entity.controller');
const { param } = require('express-validator');

const router = express.Router();

router.use(isGlobalUser);

router.get(
  '/message/:messageId',
  [param('messageId').isInt().toInt().withMessage('Message ID is required')],
  messageController.getMessagePage
);

// POST => /message/:messageId/resolve
router.post(
  '/message/:messageId/resolve',
  [param('messageId').isInt().toInt().withMessage('Message ID is required')],
  messageController.resolveMessage
);

// POST => /message/:messageId/delete
router.post(
  '/message/:messageId/delete',
  [param('messageId').isInt().toInt().withMessage('Message ID is required')],
  messageController.deleteMessage
);

module.exports = router;
