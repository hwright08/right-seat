/** @module controllers/public */

const models = require('../models');
const { verifyPassword, generateAccessJWT } = require('../utils/authUtil');
const subscriptionController = require('./subscription');
const entityController = require('./entity');
const userController = require('./user');

const LAYOUT = '_layouts/public';

// ----------------------------------
// RENDER VIEWS
// ----------------------------------

/** Render the Index Page */
exports.getIndexPage = async (req, res) => {
  let subscriptions = [];
  try {
    // Get the available subscriptions
    subscriptions = await subscriptionController.getSubscriptions({
      includeFeatures: true,
    });

  } catch (err) {
    console.error(err);
    res.locals.errors = err.errors;
    res.locals.message = 'Failed to load subscriptions';
    subscriptions = [];
  }

  // Render the view
  res.render('public/index', {
    layout: LAYOUT,
    pageTitle: 'Flight Training Management',
    path: '/',
    subscriptions,
  });
}

/** Render the Sign up page */
exports.getSignUpPage = async (req, res) => {
  let subscriptions = [];
  try {
    // Get the available subscriptions
    subscriptions = await subscriptionController.getSubscriptions();

  } catch (err) {
    console.error(err);
    res.locals.errors = err.errors;
    res.locals.message = 'Failed to load subscriptions';
    subscriptions = [];
  }

  // render the view
  const subs = subscriptions.filter(sub => sub.key != 'enterprise');
  res.render('public/sign-up', {
    layout: LAYOUT,
    pageTitle: 'Sign Up',
    path: '/sign-up',
    subscriptions: subs
  });
}

/** Render the Login Page */
exports.getLoginPage = (req, res) => {
  res.render('public/login', {
    layout: LAYOUT,
    pageTitle: 'Login',
    path: '/login',
  });
}

/** Render the Contact Page */
exports.getContactPage = (req, res) => {
  res.render('public/contact', {
    layout: LAYOUT,
    pageTitle: 'Contact Us',
    path: '/contact',
  });
}


// ----------------------------------
// CREATE/UPDATES
// ----------------------------------

/** Sign up a user */
exports.postSignUp = async (req, res) => {
  try {
    // Create the entity and associated user
    // Will always be an admin through this path
    await entityController.createNewEntity({ ...req.body, privilegeId: 2 });

    // Sign the user in with the newly created account
    return await this.postSignUp(req, res);
  } catch (err) {
    console.error(err);
    res.locals.message = `Invalid fields. Navigate through the form to see errors.`
    res.locals.errors = err.errors;
    res.locals.data = req.body;
    return await this.getSignUpPage(req, res);
  }
}

/** Login a user */
exports.postLogin = async (req, res) => {
  try {
    // Find a user with the provided email
    const user = await userController.getUser({ email: req.body.email });

    // If no user, send an error message back
    if (!user) {
      throw new Error('User not found');
    }

    // Check that the password matches
    const passwordMatched = await verifyPassword(user.passwrd, req.body.password);

    // If password doesn't match, return an error
    if (!passwordMatched) {
      throw new Error('Incorrect Password');
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
    res.locals.message = 'Invalid Credentials';
    res.locals.errors = [err.message];
    console.error(err);
    return this.getLoginPage(req, res);
  }
}

/** Logout */
exports.logout = async (req, res) => {
  res.clearCookie('SessionId', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });
  res.redirect('/login');
}

/** Save a "Contact Us" message */
exports.postContactMessage = async (req, res) => {
  // Create the message
  let message = 'Message Sent!';
  try {
    await models.message.create(req.body);
  } catch ({ errors }) {
    console.error(errors);
    res.locals.errors = errors;
    res.locals.data = req.body;
    message = 'Failed to send message.';
  }

  res.render('public/contact', {
    layout: LAYOUT,
    message
  });
}

/** Render the Privacy Page */
exports.getPrivacyPage = async (req, res) => {
  res.render('public/privacy', {
    layout: LAYOUT
  });
}

/** Render the Terms Page */
exports.getTermsPage = async (req, res) => {
  res.render('public/terms', {
    layout: LAYOUT
  });
}
