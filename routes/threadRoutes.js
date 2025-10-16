const express = require('express');
const threadController = require('../controllers/threadController');
const { ensureAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', threadController.listThreads);
router.get('/threads/new', ensureAuth, threadController.showCreateThread);
router.post('/threads', ensureAuth, threadController.createThread);
router.get('/threads/:id', threadController.showThread);
router.post(
  '/threads/:id/posts',
  ensureAuth,
  threadController.createPost
);
router.post(
  '/threads/:threadId/posts/:postId/flag',
  ensureAuth,
  threadController.flagPost
);

module.exports = router;
