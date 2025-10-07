/** @module middleware/validate */

const { validationResult } = require("express-validator");

/**
 * Converts empty strings to null
 * @param {string } val - A string to validate
 * @returns {string|null}
 */
exports.emptyStringToNull = val => val.trim() === '' ? null : val.trim();


/** Middleware function that sets res.locals.errors if any errors are returned from express-validator */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    res.locals.errors = [];
    return next();
  }

  res.locals.errors = errors ?? [];
  next();
}
