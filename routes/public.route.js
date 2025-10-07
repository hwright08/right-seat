/** @module routes/public */

const express = require('express');
const { body } = require('express-validator');

const { emptyStringToNull } = require('../middleware/validate');
const publicController = require('../controllers/public');

const router = express.Router();

// GET => /
router.get('/', publicController.getIndexPage);

// GET => /contact
router.get('/contact', publicController.getContactPage);

// GET => /login
router.get('/login', publicController.getLoginPage);

// GET => /sign-up
router.get('/sign-up', publicController.getSignUpPage);

// POST => /login
router.post('/login',
  [
    body('email').trim().isEmail().withMessage('Email is invalid'),
    body('password').trim().isString(),
  ],
  publicController.postLogin
);

// POST => /message
router.post('/message',
  [
    body('type').trim().isIn(['sales', 'general']).withMessage('Invalid message type'),
    body('orgName').customSanitizer(emptyStringToNull).optional({ nullable: true }).isString(),
    body('contactName').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Email is invalid'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  publicController.postContactMessage
);

// POST => /sign-up
router.post('/sign-up',
  [
    body('orgName').customSanitizer(emptyStringToNull).optional({ nullable: true }).isString(),
    body('orgPhone').customSanitizer(emptyStringToNull).optional({ nullable: true }).isString(),
    body('subscription').isInt().toInt(),
    body('firstName').trim().notEmpty().withMessage('First Name is required').isString(),
    body('lastName').trim().notEmpty().withMessage('Last Name is required').isString(),
    body('email').trim().isEmail(),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  publicController.postSignUp
);


module.exports = router;
