/** @module controllers/api */
const userController = require('./user.controller');

const models = require('../models');
const { verifyPassword } = require('../utils/authUtil');
const jwt = require('jsonwebtoken');

/** Send API JSON response */
exports.sendResponse = (req, res) => {
  res.status(200).json({
    message: "Success!",
    data: res.locals.data,
  });
};

/** Handle API Errors */
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: `Error! ${err.message}`,
    data: null,
  });
};


/** Generate a token */
exports.postToken = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await models.user.findOne({ where: {email} });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 403;
      throw error;
    }

    const matchingPassword = await verifyPassword(user.passwrd, password);
    if (!matchingPassword) {
      const error = new Error('Invalid credentials');
      error.statusCode = 403;
      throw error;
    }

    const token = jwt.sign(
      { userId: user.id, email },
      process.env.SECRET_ACCESS_TOKEN,
      { expiresIn: '1h' }
    );
    res.status(200).json(token);
  } catch (err) {
    this.errorHandler(err, req, res, next);
  }
}

/** Get My User */
exports.getMyUser = (req, res, next) => {
  try {
    res.locals.data = req.user;
    this.sendResponse(req, res);
  } catch (err) {
    this.errorHandler(err, req, res, next);
  }
}

/** Get the logged in user's lessons */
exports.getMyLessons = async (req, res, next) => {
  try {
    const lessons = await userController.getStudentLessons(req.user.id);
    res.locals.data = lessons;
    this.sendResponse(req, res);
  } catch (err) {
    this.errorHandler(err, req, res, next);
  }
}
