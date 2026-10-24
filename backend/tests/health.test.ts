/**
 * TDD Test Suite: Health Check and API Metadata
 * Tests written FIRST - Red-Green-Refactor TDD methodology.
 */

import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { connectDB, closeDB } from '../src/config/database';
import app from '../src/app';

const TEST_DB_PATH = path.resolve(__dirname, '../data/health_test.sqlite');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_2024';
  await connectDB(TEST_DB_PATH);
});

afterAll(async () => {
  await closeDB();
  await new Promise((resolve) => setTimeout(resolve, 200));
  try {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    const walPath = TEST_DB_PATH + '-wal';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    const shmPath = TEST_DB_PATH + '-shm';
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  } catch {
    // ignore cleanup errors on windows
  }
});

describe('GET /api/health', () => {
  it('should return 200 with health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/running/i);
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version');
  });

  it('should return valid ISO timestamp', async () => {
    const res = await request(app).get('/api/health');
    const ts = new Date(res.body.timestamp);
    expect(ts).toBeInstanceOf(Date);
    expect(isNaN(ts.getTime())).toBe(false);
  });
});

describe('404 Not Found handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent-route-12345');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });
});
