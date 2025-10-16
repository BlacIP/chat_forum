const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');
const Thread = require('./Thread');

function postsCollection() {
  return getCollection('posts');
}

async function createPost({ threadId, authorId, body }) {
  const now = new Date();
  const doc = {
    threadId: new ObjectId(threadId),
    authorId: new ObjectId(authorId),
    body,
    isFlagged: false,
    moderationNote: '',
    createdAt: now,
    updatedAt: now,
  };
  const result = await postsCollection().insertOne(doc);

  await Thread.updateThreadTimestamp(threadId);

  return { ...doc, _id: result.insertedId };
}

async function findPostsByThread(threadId) {
  const posts = await postsCollection()
    .aggregate([
      { $match: { threadId: new ObjectId(threadId) } },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $project: {
          _id: 1,
          threadId: 1,
          body: 1,
          createdAt: 1,
          updatedAt: 1,
          isFlagged: 1,
          moderationNote: 1,
          author: {
            _id: '$author._id',
            username: '$author.username',
            role: '$author.role',
          },
        },
      },
    ])
    .toArray();

  return posts.map((post) => ({
    ...post,
    _id: post._id.toString(),
    threadId: post.threadId.toString(),
    author: {
      ...post.author,
      _id: post.author._id.toString(),
    },
  }));
}

async function flagPost(postId) {
  const result = await postsCollection().updateOne(
    { _id: new ObjectId(postId) },
    { $set: { isFlagged: true, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

async function findFlaggedPosts() {
  const posts = await postsCollection()
    .aggregate([
      { $match: { isFlagged: true } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $lookup: {
          from: 'threads',
          localField: 'threadId',
          foreignField: '_id',
          as: 'thread',
        },
      },
      { $unwind: '$thread' },
      {
        $project: {
          body: 1,
          createdAt: 1,
          updatedAt: 1,
          moderationNote: 1,
          isFlagged: 1,
          author: {
            _id: '$author._id',
            username: '$author.username',
            role: '$author.role',
          },
          thread: {
            _id: '$thread._id',
            title: '$thread.title',
            isLocked: '$thread.isLocked',
          },
        },
      },
    ])
    .toArray();

  return posts.map((post) => ({
    ...post,
    _id: post._id.toString(),
    threadId: post.thread._id.toString(),
    author: {
      ...post.author,
      _id: post.author._id.toString(),
    },
    thread: {
      ...post.thread,
      _id: post.thread._id.toString(),
    },
  }));
}

async function findById(postId) {
  return postsCollection().findOne({ _id: new ObjectId(postId) });
}

async function approvePost(postId, note = '') {
  const result = await postsCollection().updateOne(
    { _id: new ObjectId(postId) },
    {
      $set: {
        isFlagged: false,
        moderationNote: note,
        updatedAt: new Date(),
      },
    }
  );
  return result.modifiedCount > 0;
}

async function removePost(postId) {
  const result = await postsCollection().deleteOne({ _id: new ObjectId(postId) });
  return result.deletedCount > 0;
}

module.exports = {
  createPost,
  findPostsByThread,
  flagPost,
  findFlaggedPosts,
  findById,
  approvePost,
  removePost,
};
