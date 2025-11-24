const express = require('express');
const router = express.Router();
const syllabusController = require('../controllers/syllabus.controller');
const { body } = require('express-validator');
const { isAuth, isAdmin } = require('../middleware/auth');

// Must be authenticated and an admin to access syllabi
router.use(isAuth);
router.use(isAdmin);

// GET => /syllabus/create
router.get('/create', syllabusController.getSyllabusCreatePage);

// GET => /syllabus/:syllabusId
router.get('/:syllabusId', syllabusController.getUpdateSyllabusPage);

// POST => /syllabus/create
router.post(
  '/create',
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Syllabus title is required'),
    body('version').isFloat().toFloat().withMessage('Syllabus version is required'),
    body('entityId').isInt().toInt().withMessage('Entity ID is required'),
    body('ratingId').isInt().toInt().withMessage('Rating is required'),
    body('lessons').isArray({ min: 1 }).withMessage('Must have at least 1 lesson'),
    body('lessons.*.title').trim().notEmpty().withMessage('Lesson title is required'),
    body('lessons.*.objective').trim().notEmpty().withMessage('Lesson content is required'),
    body('lessons.*.content').trim().notEmpty().withMessage('Lesson content is required'),
    body('lessons.*.completion').trim().notEmpty().withMessage('Lesson completion criteria required'),
  ],
  syllabusController.createSyllabus
)

// POST => /syllabus/update
router.post(
  '/update',
  [
    body('syllabusId').isInt().toInt().withMessage('Syllabus ID is required'),
    body('title').trim().isLength({ min: 1 }).withMessage('Syllabus title is required'),
    body('version').isFloat().toFloat().withMessage('Syllabus version is required'),
    body('entityId').isInt().toInt().withMessage('Entity ID is required'),
    body('ratingId').isInt().toInt().withMessage('Rating is required'),
    body('lessons').isArray({ min: 1 }).withMessage('Must have at least 1 lesson'),
    body('lessons.*.title').trim().notEmpty().withMessage('Lesson title is required'),
    body('lessons.*.objective').trim().notEmpty().withMessage('Lesson content is required'),
    body('lessons.*.content').trim().notEmpty().withMessage('Lesson content is required'),
    body('lessons.*.completion').trim().notEmpty().withMessage('Lesson completion criteria required'),
  ],
  syllabusController.updateSyllabus
);


module.exports = router;
