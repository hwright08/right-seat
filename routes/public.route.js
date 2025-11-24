const express = require('express');
const publicController = require('../controllers/public.controller');
const messageController = require('../controllers/message.controller');
const { body } = require('express-validator');

const router = express.Router();

// GET => /
router.get('/', publicController.getLandingPage);

// GET => /privacy
router.get('/privacy', publicController.getPrivacyPage);

// GET => /terms
router.get('/terms', publicController.getTermsPage);

// GET => /contact-us
router.get('/contact', messageController.getContactPage);

// POST => /message
router.post(
  '/message',
  [
    body('type').trim().isIn(['sales', 'general']).withMessage('Incorrect message type'),
    body('orgName')
      .optional()
      .custom((val, { req }) => {
        if (req.body.type === 'sales' && !val) {
          throw new Error('orgName is required for sales inquiries');
        }
        return true;
      }),
    body('contactName').trim().isLength({ min: 1 }).withMessage('Contact Name is required'),
    body('email').isEmail().withMessage('Email is required'),
    body('message').trim().isLength({ min: 5 }).withMessage('Content of at least 5 characters is required'),
  ],
  messageController.createMessage
);

module.exports = router;
