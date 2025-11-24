const express = require('express');
const userController = require('../controllers/user.controller');
const syllabusController = require('../controllers/syllabus.controller');
const { isAuth, isStudent, isAdmin, isCfi } = require('../middleware/auth');
const { query, body, param } = require('express-validator');

const router = express.Router();

// Must be logged in
router.use(isAuth);

// GET => /dashboard
router.get('/dashboard', isStudent, userController.getDashboard);

// GET => /user/create
router.get(
  '/user/create',
  isAdmin,
  [
    query('entityId').isInt().toInt().withMessage('Entity ID is required'),
    query('type').trim().isLength({ min: 3 }).withMessage('User type is required'),
  ],
  userController.getCreateUserPage
);

// GET /cfi/:userId
router.get(
  '/cfi/:userId',
  isCfi,
  [param('userId').isInt().toInt()],
  userController.getCfiDashboard
);

// GET => /student/:userId
router.get(
  '/student/:userId',
  isStudent,
  [param('userId').isInt().toInt()],
  userController.getStudentDashboard
);

// GET => /user/:userId
router.get(
  '/user/:userId',
  isAdmin,
  [param('userId').isInt().toInt()],
  userController.getEditUserPage
);

// GET => /student/:userId/lesson/:lessonId
router.get(
  '/student/:userId/lesson/:lessonId',
  isStudent,
  [
    param('userId').isInt().toInt(),
    param('lessonId').isInt().toInt()
  ],
  userController.getLessonPage
);

// POST => /student/:userId/lesson/:lessonId
router.post(
  '/student/:userId/lesson/:lessonId',
  isCfi,
  [
    param('userId').isInt().toInt(),
    param('lessonId').isInt().toInt(),
    body('notes').optional().trim(),
    body('status').isIn(['not-started', 'in-progress', 'completed']),
  ],
  syllabusController.saveLessonInfo
);

// POST => /user/create
router.post(
  '/user/create',
  isAdmin,
  [
    body('type').trim().isLength({ min: 3 }).withMessage('User type is required'),
    body('firstName').trim().isLength({ min: 3 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 3 }).withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('hasGoldSeal').toBoolean(),
    body('entityId').isInt().toInt().withMessage('Entity is required. User not associated to a flight school or account'),
    body('cfiId').optional({ nullable: true }).isInt().toInt(),
    body('syllabusId').optional({ nullable: true }).isInt().toInt(),
  ],
  userController.createUser
);

// POST => /user/:userId/update
router.post(
  '/user/:userId/update',
  isAdmin,
  [
    body('type').trim().isLength({ min: 3 }).withMessage('User type is required'),
    body('firstName').trim().isLength({ min: 3 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 3 }).withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('hasGoldSeal').toBoolean(),
    body('entityId').isInt().toInt().withMessage('Entity is required. User not associated to a flight school or account'),
    body('cfiId').optional({ nullable: true }).isInt().toInt(),
    body('syllabusId').optional({ nullable: true }).isInt().toInt(),
  ],
  userController.updateUser
);

// POST => /user/:userId/deactivate
router.post('/user/:userId/deactivate', isAdmin, userController.deactivateUser);

// POST => /user/:userId/reactivate
router.post('/user/:userId/reactivate', isAdmin, userController.reactivateUser);

module.exports = router;
