/** @module controllers/public */

const { validationResult } = require('express-validator');

const tx = require('../utils/tx');
const models = require('../models');
const { hashPassword, verifyPassword, generateAccessJWT } = require('../utils/authUtil');
const subscriptionController = require('./subscription');
const entityController = require('./entity');
const userController = require('./user');

const LAYOUT = '_layouts/public';

// ----------------------------------
// RENDER VIEWS
// ----------------------------------

/** Render the Index Page */
exports.getIndexPage = async (req, res) => {
  try {
    // Get the available subscriptions
    const subscriptions = await subscriptionController.getSubscriptions({
      includeFeatures: true,
    });

    // Render the view
    res.render('public/index', {
      layout: LAYOUT,
      pageTitle: 'Flight Training Management',
      path: '/',
      subscriptions,
      errors: res.locals.errors ?? [],
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading subscriptions: ' + err);
  }
}

/** Render the Sign up page */
exports.getSignUpPage = async (req, res) => {
  try {
    // Get the available subscriptions
    const subscriptions = await subscriptionController.getSubscriptions();

    // render the view
    res.render('public/sign-up', {
      layout: LAYOUT,
      pageTitle: 'Sign Up',
      path: '/sign-up',
      subscriptions: subscriptions.filter(sub => sub.key != 'enterprise'),
      errors: res.locals.errors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading subscriptions: ' + err);
  }
}

/** Render the Login Page */
exports.getLoginPage = (req, res) => {
  res.render('public/login', {
    layout: LAYOUT,
    pageTitle: 'Login',
    path: '/login',
    errors: res.locals.errors ?? [],
  });
}

/** Render the Contact Page */
exports.getContactPage = (req, res) => {
  res.render('public/contact', {
    layout: LAYOUT,
    pageTitle: 'Contact Us',
    path: '/contact',
    errors: res.locals.errors ?? [],
  });
}


// ----------------------------------
// CREATE/UPDATES
// ----------------------------------

/** Sign up a user */
exports.postSignUp = async (req, res) => {
  // Handle validation errors
  if (res.locals.errors.length) {
    return await this.getSignUpPage(req, res);
  }

  try {
    // Create the entity and associated user
    await entityController.createNewEntity({ ...req.body, privilegeId });

  } catch (err) {
    console.error(err);
    return res.status(500).send('Error signing up: ' + err);
  }

  // Redirect to the working application
  res.redirect('/dashboard');
}

/** Login a user */
exports.postLogin = async (req, res) => {
  // Handle validation errors
  if (res.locals.errors.length) {
    return await this.getLoginPage(req, res);
  }

  try {
    // Find a user with the provided email
    const user = await userController.getUser({ email: req.body.email });

    // If no user, send an error message back
    if (!user) {
      res.locals.errors = [{ msg: 'Invalid email or password' }];
      return this.getLoginPage(req, res);
    }

    // Check that the password matches
    const passwordMatched = await verifyPassword(user.passwrd, req.body.password);
    console.log(passwordMatched);

    // If password doesn't match, return an error
    if (!passwordMatched) {
      res.locals.errors = [{ msg: 'Invalid email or password' }];
      return this.getLoginPage(req, res);
    }

    // Create a cookie for the logged in session
    const options = {
      maxAge: process.env.TOKEN_EXPIRE_TIME,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    };
    const token = generateAccessJWT(user.id);
    res.cookie('SessionId', token, options);

    // Navigate to the user's dashboard
    return res.redirect('/dashboard');

  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in: ' + err);
  }
}

/** Save a "Contact Us" message */
exports.postContactMessage = async (req, res) => {
  // Handle validation errors
  if (res.locals.errors.length) {
    return await this.getContactPage(req, res);
  }

  // Create the message
  try {
    await models.message.create(req.body);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending message: ' + err);
  }

  res.redirect('/');
}
