import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/database';

const PORT = parseInt(process.env.PORT || '5000', 10);

/**
 * Application entry point.
 * Initializes the database connection and starts the HTTP server.
 */
const startServer = (): void => {
  try {
    // Initialize database (creates tables if they don't exist)
    connectDB();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Car Dealership API running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 JWT Authentication: Enabled`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
