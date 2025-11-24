/** @module controllers/subscription */

const { Op } = require('sequelize');
const models = require('../models');

/**
 * Get selectable subscriptions
 * @param {object} query - Data used to query the subscriptions.
 * @param {boolean} [query.includeFeatures] - Determines if the query will get all features associated to a subscription
 * @returns {Promise<object>}
 */
exports.getSubscriptions = async (query = { includeFeatures: false }) => {
  try {
    const queryOptions = { include: [] };
    if (query.includeFeatures) {
      queryOptions.include.push({
        model: models.subscriptionFeature,
        as: 'features',
        attributes: ['id', 'feature'],
      });
    }

    const subscriptions = await models.subscription.findAll(queryOptions);
    return subscriptions.filter(sub => sub.key != 'global');
  } catch (err) {
    const error = new Error('Could not fetch subscriptions. ' + err.message);
    error.statusCode = 500;
    throw error;
  }
}
