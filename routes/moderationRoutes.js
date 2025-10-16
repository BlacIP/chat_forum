const express = require('express');
const moderationController = require('../controllers/moderationController');
const { ensureModerator, ensureSuper } = require('../middleware/auth');

const router = express.Router();

router.get('/', ensureModerator, moderationController.dashboard);
router.post(
  '/posts/:postId',
  ensureModerator,
  moderationController.resolvePost
);
router.post(
  '/threads/:threadId/toggle-lock',
  ensureModerator,
  moderationController.toggleThreadLock
);
router.get(
  '/users',
  ensureSuper,
  moderationController.manageUsers
);
router.post(
  '/users/:userId/role',
  ensureSuper,
  moderationController.updateUserRole
);

module.exports = router;
