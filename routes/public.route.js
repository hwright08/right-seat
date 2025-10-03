
const express = require('express');
const { body } = require('express-validator');

const { emptyStringToNull } = require('../utils/validate');
const publicController = require('../controllers/public');

const router = express.Router();

// Routes

router.get('/', publicController.getIndexPage);
router.get('/contact', publicController.getContactPage);
router.get('/login', publicController.getLoginPage);
router.get('/sign-up', publicController.getSignUpPage);

router.post('/login',
  [
    body('email').trim().isEmail().withMessage('Email is invalid'),
    body('password').trim().isString(),
  ],
  publicController.postLogin
);

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
