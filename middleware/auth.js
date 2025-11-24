exports.auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

exports.isGlobalUser = (req, res, next) => {
  if (!['global'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

exports.isAdmin = (req, res, next) => {
  if (!['global', 'admin'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

exports.isCfi = (req, res, next) => {
  if (!['global', 'admin', 'cfi'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}

exports.isStudent = (req, res, next) => {
  if (!['global', 'admin', 'cfi', 'student'].includes(req.session.user.privilege)) {
    const error = new Error('Unauthorized');
    error.statusCode = 403;
    next(error);
  }
  next();
}
