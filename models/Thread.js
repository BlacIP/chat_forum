const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');

function threadsCollection() {
  return getCollection('threads');
}

async function createThread({ title, body, category, authorId, tags = [] }) {
  const now = new Date();
  const doc = {
    title,
    body,
    category,
    authorId: new ObjectId(authorId),
    tags,
    isLocked: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await threadsCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function listThreadsWithAuthorAndMeta() {
  return threadsCollection()
    .aggregate([
      { $sort: { updatedAt: -1 } },
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
          from: 'posts',
          localField: '_id',
          foreignField: 'threadId',
          as: 'posts',
        },
      },
      {
        $addFields: {
          postCount: { $size: '$posts' },
          latestPostAt: {
            $cond: [
              { $gt: [{ $size: '$posts' }, 0] },
              { $max: '$posts.createdAt' },
              '$updatedAt',
            ],
          },
        },
      },
      { $unset: 'posts' },
      {
        $project: {
          _id: 1,
          author: {
            _id: '$author._id',
            username: '$author.username',
            role: '$author.role',
          },
          title: 1,
          body: 1,
          category: 1,
          tags: 1,
          isLocked: 1,
          createdAt: 1,
          updatedAt: 1,
          postCount: 1,
          latestPostAt: 1,
        },
      },
    ])
    .toArray();
}

async function findThreadById(id) {
  const results = await threadsCollection()
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
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
          author: {
            _id: '$author._id',
            username: '$author.username',
            role: '$author.role',
          },
          title: 1,
          body: 1,
          category: 1,
          tags: 1,
          isLocked: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ])
    .toArray();
  return results[0] || null;
}

async function setThreadLock(id, locked) {
  const result = await threadsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { isLocked: locked, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

async function updateThreadTimestamp(id) {
  await threadsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { updatedAt: new Date() } }
  );
}

module.exports = {
  createThread,
  listThreadsWithAuthorAndMeta,
  findThreadById,
  setThreadLock,
  updateThreadTimestamp,
};
