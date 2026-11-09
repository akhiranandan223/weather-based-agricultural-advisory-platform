const mongoose = require('mongoose');
const config = require('./config');

let isInMemory = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Direct connection to '${config.mongoUri}' failed: ${error.message}`);
    console.log('[MongoDB] Attempting in-memory MongoDB fallback for testing & local development...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      isInMemory = true;
      console.log(`[MongoDB Memory Server] Connected successfully to in-memory instance: ${uri}`);
      return conn;
    } catch (memError) {
      console.error('[MongoDB Error] In-memory server could not be started:', memError.message);
      console.error('[MongoDB Alert] Please ensure MongoDB is running (e.g. via Docker: docker-compose up mongodb) or set MONGO_URI in .env');
      throw error;
    }
  }
};

const isDbInMemory = () => isInMemory;

module.exports = {
  connectDB,
  isDbInMemory
};
