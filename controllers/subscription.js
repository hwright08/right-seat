/** @module controllers/subscription */

const models = require("../models");

/**
 * Get subscriptions
 * @param {object} query - Data used to query the subscriptions.
 * @param {boolean} [query.includeFeatures] - Determines if the query will get all features associated to a subscription
 * @returns {Promise<object>}
 */
exports.getSubscriptions = async (query = { includeFeatures: false }) => {
  const queryOptions = { include: [] };
  if (query.includeFeatures) {
    queryOptions.include.push({
      model: models.subscriptionFeature,
      as: 'features',
      attributes: ['id', 'feature'],
    });
  }

  return await models.subscription.findAll(queryOptions);
}
