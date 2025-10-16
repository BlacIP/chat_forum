function attachCurrentUser(req, res, next) {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.formData = req.flash('formData')[0] || {};
  req.user = req.session.user || null;
  res.locals.user = req.user;
  next();
}

const MODERATOR_ROLES = ['moderator', 'super'];
const SUPER_ROLE = 'super';

function ensureAuth(req, res, next) {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to continue.');
  req.session.returnTo = req.originalUrl;
  return res.redirect('/auth/login');
}

function ensureGuest(req, res, next) {
  if (!req.session.user) {
    return next();
  }
  req.flash('error', 'You are already signed in.');
  return res.redirect('/');
}

function ensureModerator(req, res, next) {
  const user = req.session.user;
  if (user && MODERATOR_ROLES.includes(user.role)) {
    return next();
  }
  req.flash('error', 'Moderator access required.');
  return res.redirect('/');
}

function ensureSuper(req, res, next) {
  const user = req.session.user;
  if (user && user.role === SUPER_ROLE) {
    return next();
  }
  req.flash('error', 'Super moderator access required.');
  return res.redirect('/');
}

module.exports = {
  attachCurrentUser,
  ensureAuth,
  ensureGuest,
  ensureModerator,
  ensureSuper,
  MODERATOR_ROLES,
  SUPER_ROLE,
};
