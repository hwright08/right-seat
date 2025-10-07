const models = require('../models');

/**
 * Get all available ratings
 * @returns {Promise<object>}
 */
exports.getRatings = async () => await models.rating.findAll();
