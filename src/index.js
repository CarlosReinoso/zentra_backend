const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;

// Add connection event listeners for better debugging
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

// Log the connection attempt
logger.info('Attempting to connect to MongoDB...');
logger.info('MongoDB URL:', config.mongoose.url.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
logger.info('Environment:', config.env);
logger.info('Port:', config.port);

// Enhanced connection options for Vercel
const mongooseOptions = {
  ...config.mongoose.options,
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds timeout
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
};

mongoose
  .connect(config.mongoose.url, mongooseOptions)
  .then(() => {
    logger.info('Connected to MongoDB successfully');
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB:', error);
    logger.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
    });
    process.exit(1);
  });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
