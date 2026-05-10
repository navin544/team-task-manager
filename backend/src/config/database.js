const mongoose = require('mongoose');

const env = require('./env');

let connectionPromise;
const LOCAL_DEVELOPMENT_URI = 'mongodb://127.0.0.1:27017/team_task_manager';

async function connect(uri) {
  return mongoose.connect(uri, {
    dbName: env.MONGODB_DB_NAME
  });
}

function shouldFallbackToLocalMongo(error) {
  if (env.NODE_ENV === 'production') {
    return false;
  }
  if (env.NODE_ENV !== 'development' || env.MONGODB_URI === LOCAL_DEVELOPMENT_URI) {
    return false;
  }

  return ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEOUT'].includes(error?.code);
}

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (env.MONGODB_URI === 'MISSING_MONGODB_URI_IN_RAILWAY_DASHBOARD') {
    console.error('CRITICAL ERROR: MONGODB_URI is not set in your Railway Variables!');
    console.error('Please go to Railway Dashboard -> Backend Service -> Variables and add MONGODB_URI.');
    throw new Error('Database connection string is missing.');
  }

  const maskedUri = env.MONGODB_URI.replace(/\/\/.*@/, '//****:****@');
  console.info(`Attempting to connect to MongoDB: ${maskedUri}`);

  if (!connectionPromise) {
    connectionPromise = connect(env.MONGODB_URI)
      .catch(async (error) => {
        if (!shouldFallbackToLocalMongo(error)) {
          throw error;
        }

        console.warn(
          `Primary MongoDB connection failed (${error.code || 'unknown error'}). Falling back to local MongoDB.`
        );
        await mongoose.disconnect().catch(() => {});
        return connect(LOCAL_DEVELOPMENT_URI);
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
  return mongoose.connection;
}

async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  mongoose
};
