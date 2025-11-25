/** @module middleware/auth */
const jwt = require('jsonwebtoken');
const models = require('../models');
const { errorHandler } = require('../controllers/api.controller');

/** Make sure the user is logged in */
exports.auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

/** Make sure the user is a global admin */
exports.isGlobalUser = (req, res, next) => {
  if (!['global'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

/** Make sure the user is an admin */
exports.isAdmin = (req, res, next) => {
  if (!['global', 'admin'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

/** Make sure the user is a CFI or "higher" */
exports.isCfi = (req, res, next) => {
  if (!['global', 'admin', 'cfi'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

/**  Make sure the user is a student or "higher" */
exports.isStudent = (req, res, next) => {
  if (!['global', 'admin', 'cfi', 'student'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

/** Verify if a token is valid or not */
exports.verifyToken = async (req, res, next) => {
  // check that the Authorization header is passed
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  // Get the token from the header
  const token = req.get('Authorization').split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  // Check that the token exists
  if (!decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  // Assign a user based on the token
  try {
    const { userId } = decodedToken;
    const user = await models.user.findByPk(userId);
    req.user = {
      fullName: user.fullName,
      id: user.id,
      entityId: user.entityId
    };
  } catch (err) {
    errorHandler(err, req, res, next);
  }
  next();
}
