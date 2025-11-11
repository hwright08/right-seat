/** @module routes/message */

const express = require('express');

const messageController = require('../controllers/message');

const router = express.Router({ mergeParams: true });

// GET => /message/:messageId
router.get('/:messageId', messageController.getMessagePage);

// POST => /message/:messageId/resolve
router.post('/:messageId/resolve', messageController.resolveMessage);

// POST => /message/:messageId/delete
router.post('/:messageId/delete', messageController.deleteMessage);

module.exports = router;
