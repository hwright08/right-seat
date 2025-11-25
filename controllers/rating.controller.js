/** @module controllers/rating */


const models = require('../models');

/** Get all available ratings */
exports.getRatings = async () => await models.rating.findAll();
