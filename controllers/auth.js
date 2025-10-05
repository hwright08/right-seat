const jwt = require('jsonwebtoken');
const models = require('../models');

// Other middleware functions
exports.auth = async (req, res, next) => {
  try {
    const token = req.cookies?.SessionId;
    if (!token) return res.redirect('/login'); // If there isn't a cookie, the user is unauthorized

    const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
    const user = await models.user.findByPk(decoded.userId);
    if (!user) return res.redirect('/login'); // If there isn't a user with defined Id, then unauthorized

    const parsedUser = { ...user.get({ plain: true }) };
    delete parsedUser.passwrd;

    req.user = parsedUser;
    next();

  } catch (err) {
    console.error(err);
    res.status(500).send('Could not authenticate: ' + err);
  }
}
