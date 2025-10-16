const User = require('../models/User');

exports.showRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Create Account',
  });
};

exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  const trimmedUsername = username ? username.trim().toLowerCase() : '';
  try {
    if (trimmedUsername.length < 3 || !password || password.length < 6) {
      req.flash(
        'error',
        'Username must be at least 3 characters and password 6 characters.'
      );
      req.flash('formData', [{ username }]);
      return res.redirect('/auth/register');
    }
    const existingUser = await User.findByUsername(trimmedUsername);
    if (existingUser) {
      req.flash('error', 'Username already taken.');
      req.flash('formData', [{ username }]);
      return res.redirect('/auth/register');
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.createUser({
      username: trimmedUsername,
      passwordHash,
    });

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    req.flash('success', 'Welcome to ForumHub!');
    res.redirect('/');
  } catch (error) {
    next(error);
  }
};

exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Sign In',
  });
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  const trimmedUsername = username ? username.trim().toLowerCase() : '';
  try {
    const user = await User.findByUsername(trimmedUsername);
    if (!user) {
      req.flash('error', 'Invalid username or password.');
      req.flash('formData', [{ username }]);
      return res.redirect('/auth/login');
    }

    const valid = await User.verifyPassword(user, password);
    if (!valid) {
      req.flash('error', 'Invalid username or password.');
      req.flash('formData', [{ username }]);
      return res.redirect('/auth/login');
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const redirectTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    req.flash('success', 'Logged in successfully.');
    res.redirect(redirectTo);
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
