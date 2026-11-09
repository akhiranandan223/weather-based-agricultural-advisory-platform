const app = require('./app');
const config = require('./config/config');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');

const startServer = async () => {
  try {
    // Connect to MongoDB (or memory server fallback)
    await connectDB();

    // Auto-seed demo & initial data if database is empty
    await seedDatabase();

    const server = app.listen(config.port, () => {
      console.log('================================================================');
      console.log(`🌾 Weather-Based Agricultural Advisory Platform API Backend`);
      console.log(`🚀 Server listening on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`📍 Endpoint: http://localhost:${config.port}/api`);
      console.log(`🏥 Health:   http://localhost:${config.port}/health`);
      console.log('================================================================');
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server Error] Failed to bootstrap backend server:', error.message);
    process.exit(1);
  }
};

startServer();
