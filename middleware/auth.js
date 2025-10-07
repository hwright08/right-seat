/** @module middleware/auth */

const jwt = require('jsonwebtoken');
const models = require('../models');
const userController = require('../controllers/user');

/** Middleware to check the login cookie and get the associated user */
exports.auth = async (req, res, next) => {
  try {
    // Get the token from the cookie
    const token = req.cookies?.SessionId;

    // If there isn't a cookie, the user is unauthorized
    if (!token) return res.redirect('/login');

    // Decode the token and get the user data
    const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
    const user = await userController.getUser({ id: decoded.userId });

    // If there isn't a user with defined Id, then unauthorized
    if (!user) return res.redirect('/login');

    // remove the password from the user object
    const parsedUser = { ...user.get({ plain: true }) };
    delete parsedUser.passwrd;

    // Assign the user to the request
    req.user = parsedUser;
    next();

  } catch (err) {
    console.error(err);
    res.status(500).send('Could not authenticate: ' + err);
  }
}
