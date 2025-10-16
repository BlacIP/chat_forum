const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');

function usersCollection() {
  return getCollection('users');
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

const ALLOWED_ROLES = ['member', 'moderator', 'super'];

async function createUser({ username, passwordHash, role = 'member' }) {
  const now = new Date();
  const normalizedRole = ALLOWED_ROLES.includes(role) ? role : 'member';
  const doc = {
    username,
    passwordHash,
    role: normalizedRole,
    createdAt: now,
    updatedAt: now,
  };
  const result = await usersCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function findByUsername(username) {
  return usersCollection().findOne({ username });
}

async function findById(id) {
  return usersCollection().findOne({ _id: new ObjectId(id) });
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

async function countUsers() {
  return usersCollection().countDocuments();
}

async function listUsers() {
  const users = await usersCollection()
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: 1 })
    .toArray();
  return users.map((user) => ({
    ...user,
    _id: user._id.toString(),
  }));
}

async function updateUserRole(userId, role) {
  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error('Invalid role selection.');
  }

  const result = await usersCollection().updateOne(
    { _id: new ObjectId(userId) },
    { $set: { role, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

module.exports = {
  hashPassword,
  createUser,
  findByUsername,
  findById,
  verifyPassword,
  countUsers,
  listUsers,
  updateUserRole,
  ALLOWED_ROLES,
};
