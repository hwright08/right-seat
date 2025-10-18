/** @module routes/syllabus */

const express = require('express');

const syllabusController = require('../controllers/syllabus');

const router = express.Router({ mergeParams: true });


// GET => /entity/:entityId/syllabus
router.get('/', syllabusController.getCreateSyllabusPage);

// GET => /entity/:entityId/syllabus/:syllabusId
router.get('/:syllabusId', syllabusController.getUpdateSyllabusPage);

// POST => /entity/:entityId/syllabus
router.post('/', syllabusController.createSyllabus);

// POST => /entity/:entityId/syllabus/:syllabusId
router.post('/:syllabusId', syllabusController.updateSyllabus);


module.exports = router;
