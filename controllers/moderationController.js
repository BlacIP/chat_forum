const { ObjectId } = require('mongodb');
const Thread = require('../models/Thread');
const Post = require('../models/Post');
const User = require('../models/User');
const { SUPER_ROLE } = require('../middleware/auth');

exports.dashboard = async (req, res, next) => {
  try {
    const flaggedPosts = await Post.findFlaggedPosts();

    res.render('moderation/dashboard', {
      title: 'Moderation Queue',
      flaggedPosts,
    });
  } catch (error) {
    next(error);
  }
};

exports.resolvePost = async (req, res, next) => {
  const { postId } = req.params;
  const { action, note } = req.body;

  if (!ObjectId.isValid(postId)) {
    req.flash('error', 'Invalid post.');
    return res.redirect('/moderation');
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      req.flash('error', 'Post not found.');
      return res.redirect('/moderation');
    }

    if (action === 'remove') {
      await Post.removePost(postId);
      req.flash('success', 'Post removed.');
    } else {
      await Post.approvePost(postId, note);
      req.flash('success', 'Post approved.');
    }

    res.redirect('/moderation');
  } catch (error) {
    next(error);
  }
};

exports.toggleThreadLock = async (req, res, next) => {
  const { threadId } = req.params;

  if (!ObjectId.isValid(threadId)) {
    req.flash('error', 'Invalid thread.');
    return res.redirect('/moderation');
  }

  try {
    const thread = await Thread.findThreadById(threadId);
    if (!thread) {
      req.flash('error', 'Thread not found.');
      return res.redirect('/moderation');
    }

    const newStatus = !thread.isLocked;
    await Thread.setThreadLock(threadId, newStatus);

    req.flash('success', `Thread ${newStatus ? 'locked' : 'unlocked'} successfully.`);
    res.redirect('/moderation');
  } catch (error) {
    next(error);
  }
};

exports.manageUsers = async (req, res, next) => {
  try {
    const users = await User.listUsers();
    const roles = [
      { value: 'member', label: 'Member' },
      { value: 'moderator', label: 'Moderator' },
      { value: 'super', label: 'Super Moderator' },
    ];

    res.render('moderation/users', {
      title: 'Manage User Roles',
      users,
      roles,
      currentUserId: req.user.id,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!ObjectId.isValid(userId)) {
    req.flash('error', 'Invalid user selection.');
    return res.redirect('/moderation/users');
  }

  try {
    const target = await User.findById(userId);
    if (!target) {
      req.flash('error', 'User not found.');
      return res.redirect('/moderation/users');
    }

    if (!role) {
      req.flash('error', 'Select a role.');
      return res.redirect('/moderation/users');
    }

    if (req.user.id === userId && role !== SUPER_ROLE) {
      req.flash('error', 'You cannot remove your own super moderator access.');
      return res.redirect('/moderation/users');
    }

    if (target.role === role) {
      req.flash('success', `${target.username} is already a ${role}.`);
      return res.redirect('/moderation/users');
    }

    await User.updateUserRole(userId, role);

    if (req.user.id === userId) {
      req.session.user.role = role;
      req.user.role = role;
    }

    req.flash('success', `Updated ${target.username} to ${role}.`);
    res.redirect('/moderation/users');
  } catch (error) {
    next(error);
  }
};
