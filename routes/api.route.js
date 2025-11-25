
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

router.post('/auth', apiController.postToken);

router.use(verifyToken);
router.get('/me', apiController.getMyUser);
router.get('/my-lessons', apiController.getMyLessons);


module.exports = router;
