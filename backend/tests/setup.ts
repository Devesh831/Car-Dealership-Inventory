import path from 'path';
import fs from 'fs';
import { connectDB, closeDB } from '../src/config/database';

/**
 * Global test setup - runs before all test suites.
 * Initializes an isolated test database.
 */

const TEST_DB_PATH = path.join(__dirname, '../data/test_car_dealership.sqlite');

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_2024';
  process.env.ADMIN_REGISTRATION_CODE = 'TEST_ADMIN_CODE';

  // Initialize database with test path
  connectDB(TEST_DB_PATH);
});

afterAll(() => {
  // Close database connection
  closeDB();

  // Remove test database file after all tests complete
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});
