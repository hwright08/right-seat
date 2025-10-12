/** @module routes/syllabus */

const express = require('express');

const syllabusController = require('../controllers/syllabus');

const router = express.Router({ mergeParams: true });


// GET => /entity/:entityId/syllabus
router.get('/', syllabusController.getCreateSyllabusPage);

// POST => /entity/:entityId/syllabus
router.post('/', syllabusController.createSyllabus);

module.exports = router;
