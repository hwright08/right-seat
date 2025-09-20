const express = require('express');
const Subscription = require('../models/subscription');

const router = express.Router();

router.get('/', async (req, res) => {
  const subscriptions = await Subscription.fetchAll();
  res.render('public/index', {
    layout: '_layouts/public',
    pageTitle: 'Flight Training Management',
    path: '/',
    subscriptions,
  });
});

router.get('/sign-up', async (req, res) => {
  const subscriptions = await Subscription.fetchAll();
  res.render('public/sign-up', {
    layout: '_layouts/public',
    pageTitle: 'Sign Up',
    path: '/sign-up',
    subscriptions,
  });
});

module.exports = router;
