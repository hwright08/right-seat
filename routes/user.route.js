/** @module routes/syllabus */

const express = require('express');
const userController = require('../controllers/user');

const router = express.Router({ mergeParams: true });

router.get('/create', userController.getCreateUserPage);
router.get('/:userId/update', userController.getUserUpdatePage)

router.post('/create', userController.postCreateUser);
router.post('/:userId/update', userController.updateUser);
router.post('/:userId/deactivate', userController.deactivateUser);
router.post('/:userId/reactivate', userController.reactivateUser);


module.exports = router;
