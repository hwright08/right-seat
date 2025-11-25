
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const { verifyToken } = require('../middleware/auth');

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// POST => /api/auth
router.post('/auth', apiController.postToken);

// use token authentication for all of the next routes
router.use(verifyToken);

// GET => /api/me
router.get('/me', apiController.getMyUser);

// GET => /api/my-lessons
router.get('/my-lessons', apiController.getMyLessons);


module.exports = router;
