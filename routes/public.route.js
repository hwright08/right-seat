/** @module routes/public */

const express = require('express');

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

// GET => /privacy
router.get('/privacy', publicController.getPrivacyPage);

// GET => /terms
router.get('/terms', publicController.getTermsPage);

// POST => /login
router.post('/login', publicController.postLogin);

// POST => /sign-up
router.post('/sign-up', publicController.postSignUp);

// POST => /logout
router.post('/logout', publicController.logout);

module.exports = router;
