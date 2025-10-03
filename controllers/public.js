const { validationResult } = require('express-validator');

const tx = require('../utils/tx');
const models = require('../models');
const { hashPassword, verifyPassword } = require('../utils/passUtil');

const LAYOUT = '_layouts/public';

exports.getIndexPage = async (req, res) => {
  try {
    const subscriptions = await models.subscription.findAll({
      include: [{
        model: models.subscriptionFeature,
        as: 'features',
        attributes: ['id', 'feature'],
      }],
    });

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


exports.getSignUpPage = async (req, res) => {
  try {
    const subscriptions = await models.subscription.findAll({
      include: [{
        model: models.subscriptionFeature,
        as: 'features',
        attributes: ['id', 'feature']
      }],
    });

    res.render('public/sign-up', {
      layout: LAYOUT,
      pageTitle: 'Sign Up',
      path: '/sign-up',
      subscriptions: subscriptions.filter(sub => sub.key != 'enterprise'),
      errors: res.locals.errors ?? [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading subscriptions: ' + err);
  }
}


exports.getLoginPage = (req, res) => {
  res.render('public/login', {
    layout: LAYOUT,
    pageTitle: 'Login',
    path: '/login',
    errors: res.locals.errors ?? [],
  });
}


exports.getContactPage = (req, res) => {
  res.render('public/contact', {
    layout: LAYOUT,
    pageTitle: 'Contact Us',
    path: '/contact',
    errors: res.locals.errors ?? [],
  });
}


exports.postSignUp = async (req, res) => {
  // Handle validation errors
  const { errors } = validationResult(req);
  if (!errors || errors.length) {
    res.locals.errors = errors;
    return await this.getSignUpPage(req, res);
  }

  // Grab data from the body
  const { orgName, orgPhone, subscription, firstName, lastName, email, password } = req.body;

  // Create the entity and associated user
  try {
    await tx(async t => {
      // Get the admin privilege
      const { id: privilegeId } = (await models.privilege.findAll({
        where: {
          name: 'admin',
        },
        transaction: t,
      }))[0];

      // Create the entity and users
      await models.entity.create(
        {
          name: !!orgName ? orgName : `${firstName} ${lastName}`,
          phone: orgPhone,
          subscriptionId: parseInt(subscription),
          users: [{
            firstName,
            lastName,
            email,
            passwrd: await hashPassword(password),
            privilegeId,
          }]
        },
        {
          transaction: t,
          include: [{ model: models.user }],
        },
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error signing up: ' + err);
  }

  // TODO: redirect to dashboard
  res.redirect('/');
}


exports.postContactMessage = async (req, res) => {
  // Handle validation errors
  const { errors } = validationResult(req);
  if (!errors || errors.length) {
    res.locals.errors = errors;
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


exports.postLogin = async (req, res) => {
  // Handle validation errors
  const { errors } = validationResult(req);
  if (!errors || errors.length) {
    res.locals.errors = errors;
    return await this.getLoginPage(req, res);
  }

  // Login
  try {
    const users = await models.user.findAll({ where: {
      email: req.body.email
    }});

    if (users.length) {
      const user = users[0];
      const passwordMatched = await verifyPassword(user.passwrd, req.body.password);
      if (passwordMatched) {
        // TODO: redirect to dashboard
        return res.redirect('/');
      }
    }

    res.locals.errors = [{ msg: 'Invalid email or password' }];
    return this.getLoginPage(req, res);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in: ' + err);
  }
}
