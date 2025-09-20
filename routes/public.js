const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    layout: '_layouts/public',
    pageTitle: 'Flight Training Management',
    path: '/',
  });
});
