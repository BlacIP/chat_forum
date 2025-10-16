const { MongoClient, ServerApiVersion } = require('mongodb');

let client;
let database;

async function connectDB(uri, dbName = process.env.DB_NAME || 'forumhub') {
  if (database) {
    return database;
  }

  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    await client.db('admin').command({ ping: 1 });
    database = client.db(dbName);

    console.log('Connected to MongoDB deployment.');
    return database;
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
}

function getDb() {
  if (!database) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return database;
}

function getCollection(name) {
  return getDb().collection(name);
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}

module.exports = {
  connectDB,
  getDb,
  getCollection,
  closeDB,
};
