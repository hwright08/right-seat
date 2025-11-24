/** @module controllers/public */

const subscriptionController = require('./subscription.controller');

const LAYOUT = '_layouts/public';

/**
 * Render the landing page
 */
exports.getLandingPage = async (req, res, next) => {
  try {
    const subscriptions = await subscriptionController.getSubscriptions({ includeFeatures: true });
    res.render('public/index', {
      layout: LAYOUT,
      subscriptions
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Render the Privacy Page
*/
exports.getPrivacyPage = async (req, res) => {
  res.render('public/privacy', {
    layout: LAYOUT
  });
}

/**
 * Render the Terms Page
*/
exports.getTermsPage = async (req, res) => {
  res.render('public/terms', {
    layout: LAYOUT
  });
}
