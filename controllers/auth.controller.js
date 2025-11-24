const { validationHandler } = require('./error.controller');
const subscriptionController = require('./subscription.controller');
const entityController = require('./entity.controller');
const userController = require('./user.controller');
const { verifyPassword } = require('../utils/authUtil');

/** Get's the sign up page for a user / school */
exports.getSignUpPage = async (req, res, next) => {
  try {
    const subscriptions = await subscriptionController.getSubscriptions();
    res.render('auth/sign-up', { subscriptions });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
}

/** Save the user's info from the sign up page */
exports.postSignUp = async (req, res, next) => {
  try {
    validationHandler(req, res);

    // check that the admin is unique
    let user = await userController.findUser({ email: req.body.email });
    if (user) {
      return res.render('auth/sign-up', {
        errors: [{
          path: 'email',
          msg: 'Email already exists in another account',
        }]
      })
    }

    // create the new entity and associated admin
    await entityController.createNewEntity(req.body);

    // add user to session and route to admin dashboard
    user = await userController.findUser({ email: req.body.email });
    req.session.user = {
      fullName: user.fullName,
      id: user.id,
      privilege: user.privilege.name,
      entityId: user.entityId
    };
    req.session.save(err => {
      if (err) console.error('Error saving session:', err);
      req.flash('success', 'Account created!');
      res.redirect('/dashboard');
    })
  } catch (err) {
    console.error(err);
    if (err.statusCode == 422) {
      this.getSignUpPage(req, res);
    } else {
      next(err);
    }
  }
}

/** Sign out the user */
exports.logout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) console.error('Error destroying session:', err);
    res.redirect('/auth/login');
  });
}


/** Render the login page */
exports.getLoginPage = (req, res, next) => res.render('auth/login', {});

/** Sign in a user */
exports.postLogin = async (req, res, next) => {
  try {
    validationHandler(req, res);
    const { email, password } = req.body;

    // find user with email
    const user = await userController.findUser({ email });
    if (!user) {
      return res.status(403).render('auth/login', {
        errors: [{
          msg: 'Invalid credentials',
        }]
      })
    }

    // check password
    const passwordMatched = await verifyPassword(user.passwrd, password);
    if (!passwordMatched) {
      return res.status(403).render('auth/login', {
        errors: [{
          msg: 'Invalid credentials',
        }]
      });
    }

    req.session.user = {
      fullName: user.fullName,
      id: user.id,
      privilege: user.privilege.name,
      entityId: user.entityId
    };
    return req.session.save(err => {
      if (err) console.error(err);
      req.flash('success', 'Login successful!');
      return res.redirect('/dashboard');
    });
  } catch (err) {
    console.error(err);
    if (err.statusCode == 422) {
      this.getLoginPage(req, res);
    } else {
      next(err);
    }
  }
}
