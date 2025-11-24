
const express = require('express');
const authController = require('../controllers/auth.controller');
const { body } = require('express-validator');

const router = express.Router();

// GET => /auth/sign-up
router.get('/sign-up', authController.getSignUpPage);

// GET => /auth/login
router.get('/login', authController.getLoginPage);

// GET => /auth/logout
router.get('/logout', authController.logout);

// POST => /auth/sign-up
router.post(
  '/sign-up',
  [
    body('subscription').isInt().withMessage('Subscription is required'),
    body('orgName')
      .optional()
      .trim()
      .custom((val, { req }) => {
        if (req.body.subscription == 3 && !val) {
          throw new Error('Organization name is required');
        }
        return true;
      }),
    body('orgPhone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
    body('firstName').trim().isLength({min: 1}).withMessage('Admin first name is required'),
    body('lastName').trim().isLength({ min: 1}).withMessage('Admin last name is required'),
    body('email').isEmail().withMessage('Admin email is required'),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  authController.postSignUp
);

// POST => /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 8 }).withMessage('Invalid password'),
  ],
  authController.postLogin
);


module.exports = router;
