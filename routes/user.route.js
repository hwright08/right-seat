/** @module routes/syllabus */

const express = require('express');
const userController = require('../controllers/user');

const router = express.Router({ mergeParams: true });

router.get('/create', userController.getCreateUserPage);
router.post('/create', userController.postCreateUser);


module.exports = router;
