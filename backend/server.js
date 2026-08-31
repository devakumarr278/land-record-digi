const app = require('./src/app');
const env = require('./src/config/environment');
const connectDB = require('./src/config/database');

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas / Local MongoDB
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 BHOOMI AI Backend Orchestrator is Running!`);
      console.log(`📡 Port: ${env.PORT}`);
      console.log(`🌐 Base URL: http://localhost:${env.PORT}`);
      console.log(`🩺 Health: http://localhost:${env.PORT}/api/v1/health`);
      console.log(`🤖 AI Service Target: ${env.AI_SERVICE_URL}`);
      console.log(`💾 MongoDB Target: ${env.MONGODB_URI}`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error(`[Server] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
