
const express = require('express');
const publicController = require('../controllers/public');

const router = express.Router();

router.get('/', publicController.getIndexPage);

// router.get('/sign-up', publicController.getSignUpPage);
// router.post('/sign-up', publicController.postSignUp);

// router.get('/login', publicController.getLoginPage);

// router.get('/contact', publicController.getContactPage);


module.exports = router;
