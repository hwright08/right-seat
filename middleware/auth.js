// Make sure the user is logged in
exports.auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

// Make sure the user is a global admin
exports.isGlobalUser = (req, res, next) => {
  if (!['global'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

// Make sure the user is an admin
exports.isAdmin = (req, res, next) => {
  if (!['global', 'admin'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

// make sure the user is a CFI or "higher"
exports.isCfi = (req, res, next) => {
  if (!['global', 'admin', 'cfi'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

// Make sure the user is a student or "higher"
exports.isStudent = (req, res, next) => {
  if (!['global', 'admin', 'cfi', 'student'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}
