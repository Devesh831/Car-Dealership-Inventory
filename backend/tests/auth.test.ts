/**
 * TDD Test Suite: Authentication API
 * Tests written FIRST - Red-Green-Refactor TDD methodology.
 */

import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { connectDB, closeDB, getDB } from '../src/config/database';
import app from '../src/app';

const TEST_DB_PATH = path.resolve(__dirname, '../data/auth_test.sqlite');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_2024';
  process.env.ADMIN_REGISTRATION_CODE = 'TEST_ADMIN_CODE';
  await connectDB(TEST_DB_PATH);
});

afterEach(async () => {
  const db = getDB();
  await db.exec('DELETE FROM users');
  await db.exec('DELETE FROM vehicles');
});

afterAll(async () => {
  await closeDB();
  // Small delay to let SQLite release file locks on Windows
  await new Promise((resolve) => setTimeout(resolve, 200));
  try {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    const walPath = TEST_DB_PATH + '-wal';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    const shmPath = TEST_DB_PATH + '-shm';
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  } catch {
    // Ignore cleanup errors on Windows
  }
});

// ─── Registration Tests ────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const validUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  it('should register a new user and return 201 with user data and token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.username).toBe(validUser.username);
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should return 409 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, username: 'different_username' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email/i);
  });

  it('should return 409 when username is already taken', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'different@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/username/i);
  });

  it('should return 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 when password is too short (< 6 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when username is too short (< 3 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, username: 'ab' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should assign admin role when valid admin code is provided', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      role: 'admin',
      adminCode: 'TEST_ADMIN_CODE',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('admin');
  });

  it('should reject admin registration when the admin code is invalid', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      role: 'admin',
      adminCode: 'WRONG_CODE',
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── Login Tests ──────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  const user = {
    username: 'loginuser',
    email: 'login@example.com',
    password: 'securepassword',
  };

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(user);
  });

  it('should login successfully with valid credentials and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.split('.').length).toBe(3);
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should return 401 with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: user.password });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: user.password });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Protected Route Tests ─────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  let token: string;
  const user = {
    username: 'profileuser',
    email: 'profile@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const regRes = await request(app).post('/api/auth/register').send(user);
    token = regRes.body.data.token;
  });

  it('should return user profile with valid JWT token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 403 when an invalid token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.invalid');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when token format is wrong (no Bearer prefix)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', token);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
