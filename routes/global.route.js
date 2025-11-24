const express = require('express');
const { isGlobalUser } = require('../middleware/auth');
const messageController = require('../controllers/message.controller');
const { param } = require('express-validator');

const router = express.Router();

// Only the global user can access these routes
router.use(isGlobalUser);

// GET => /global/message/:messageId
router.get(
  '/message/:messageId',
  [param('messageId').isInt().toInt().withMessage('Message ID is required')],
  messageController.getMessagePage
);

// POST => /global/message/:messageId/resolve
router.post(
  '/message/:messageId/resolve',
  [param('messageId').isInt().toInt().withMessage('Message ID is required')],
  messageController.resolveMessage
);

// POST => /global/message/:messageId/delete
router.post(
  '/message/:messageId/delete',
  [param('messageId').isInt().toInt().withMessage('Message ID is required')],
  messageController.deleteMessage
);

module.exports = router;
