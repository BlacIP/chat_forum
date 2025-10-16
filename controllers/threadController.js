const { ObjectId } = require('mongodb');
const Thread = require('../models/Thread');
const Post = require('../models/Post');

function buildCategories(threads) {
  const categories = {};
  threads.forEach((thread) => {
    const key = thread.category || 'General';
    categories[key] = categories[key] || [];
    categories[key].push(thread);
  });
  return categories;
}

exports.listThreads = async (req, res, next) => {
  try {
    const threads = await Thread.listThreadsWithAuthorAndMeta();

    const decorated = threads.map((thread) => {
      const summary =
        thread.body && thread.body.length > 180
          ? `${thread.body.slice(0, 177)}...`
          : thread.body;
      return {
        ...thread,
        _id: thread._id.toString(),
        author: {
          ...thread.author,
          _id: thread.author._id.toString(),
        },
        summary,
        postCount: thread.postCount || 0,
        latestPostAt: thread.latestPostAt || thread.updatedAt,
      };
    });

    const categories = buildCategories(decorated);

    res.render('threads/index', {
      title: 'ForumHub',
      categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.showThread = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      req.flash('error', 'Thread not found.');
      return res.redirect('/');
    }

    const threadRecord = await Thread.findThreadById(id);
    if (!threadRecord) {
      req.flash('error', 'Thread not found.');
      return res.redirect('/');
    }

    const thread = {
      ...threadRecord,
      _id: threadRecord._id.toString(),
      author: {
        ...threadRecord.author,
        _id: threadRecord.author._id.toString(),
      },
    };

    const posts = await Post.findPostsByThread(id);

    res.render('threads/detail', {
      title: thread.title,
      thread,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

exports.showCreateThread = (req, res) => {
  res.render('threads/new', {
    title: 'Start a Thread',
  });
};

exports.createThread = async (req, res, next) => {
  const { title, body, category, tags } = req.body;
  const trimmedTitle = title ? title.trim() : '';
  const trimmedBody = body ? body.trim() : '';
  const trimmedCategory = category ? category.trim() : '';
  const tagList = tags
    ? tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  if (trimmedTitle.length < 5 || trimmedBody.length < 15) {
    req.flash('error', 'Provide a descriptive title and message.');
    req.flash('formData', [{ title, body, category, tags }]);
    return res.redirect('/threads/new');
  }

  try {
    const thread = await Thread.createThread({
      title: trimmedTitle,
      body: trimmedBody,
      category: trimmedCategory || 'General',
      authorId: req.user.id,
      tags: tagList,
    });

    const threadId = thread._id.toString();

    await Post.createPost({
      threadId,
      authorId: req.user.id,
      body: trimmedBody,
    });

    req.flash('success', 'Thread created successfully.');
    res.redirect(`/threads/${threadId}`);
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  const { body } = req.body;
  const trimmed = body ? body.trim() : '';
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    req.flash('error', 'Thread not found.');
    return res.redirect('/');
  }

  if (trimmed.length < 3) {
    req.flash('error', 'Reply must include at least 3 characters.');
    req.flash('formData', [{ body }]);
    return res.redirect(`/threads/${id}`);
  }

  try {
    const thread = await Thread.findThreadById(id);
    if (!thread) {
      req.flash('error', 'Thread not found.');
      return res.redirect('/');
    }

    if (thread.isLocked) {
      req.flash('error', 'Thread is locked. Only moderators can unlock it.');
      return res.redirect(`/threads/${id}`);
    }

    await Post.createPost({
      threadId: id,
      authorId: req.user.id,
      body: trimmed,
    });

    req.flash('success', 'Reply posted.');
    res.redirect(`/threads/${id}`);
  } catch (error) {
    next(error);
  }
};

exports.flagPost = async (req, res, next) => {
  const { threadId, postId } = req.params;

  if (!ObjectId.isValid(threadId) || !ObjectId.isValid(postId)) {
    req.flash('error', 'Invalid post.');
    return res.redirect('/');
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      req.flash('error', 'Post not found.');
      return res.redirect(`/threads/${threadId}`);
    }
    if (post.threadId.toString() !== threadId) {
      req.flash('error', 'Post does not belong to this thread.');
      return res.redirect(`/threads/${threadId}`);
    }

    await Post.flagPost(postId);

    req.flash('success', 'Post flagged for moderator review.');
    res.redirect(`/threads/${threadId}`);
  } catch (error) {
    next(error);
  }
};
