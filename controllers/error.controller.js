/** @module controllers/error */

const { validationResult } = require('express-validator');

/** Render the 404 page */
exports.get404 = (req, res) => {
  res.status(404).render('errors/404', {});
}

/** Render the 500 - server error page */
exports.get500 = (error, req, res, next) => {
  console.error(error);
  res.status(500).render('errors/500', { error })
}

/** Automatically handle errors coming from express-validator */
exports.validationHandler = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.errors;
    res.locals.data = req.body;
    res.locals.errors = errors.errors;
    throw error;
  }
}
