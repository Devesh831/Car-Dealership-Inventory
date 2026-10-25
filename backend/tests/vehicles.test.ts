/**
 * TDD Test Suite: Vehicles API
 * Tests written FIRST - Red-Green-Refactor TDD methodology.
 */

import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { connectDB, closeDB, getDB } from '../src/config/database';
import app from '../src/app';

const TEST_DB_PATH = path.resolve(__dirname, '../data/vehicles_test.sqlite');

let userToken: string;
let adminToken: string;

const validVehicle = {
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  category: 'Sedan',
  price: 28000,
  quantity: 10,
  description: 'A reliable mid-size sedan',
  image_url: '',
};

const validSUV = {
  make: 'Ford',
  model: 'Explorer',
  year: 2024,
  category: 'SUV',
  price: 45000,
  quantity: 5,
  description: 'Spacious family SUV',
  image_url: '',
};

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_2024';
  process.env.ADMIN_REGISTRATION_CODE = 'TEST_ADMIN_CODE';
  await connectDB(TEST_DB_PATH);

  const userRes = await request(app).post('/api/auth/register').send({
    username: 'regularuser',
    email: 'user@test.com',
    password: 'password123',
  });
  userToken = userRes.body.data.token;

  const adminRes = await request(app).post('/api/auth/register').send({
    username: 'adminuser',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    adminCode: 'TEST_ADMIN_CODE',
  });
  adminToken = adminRes.body.data.token;
});

afterEach(async () => {
  const db = getDB();
  await db.exec('DELETE FROM vehicles');
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
    // Ignore cleanup errors on Windows
  }
});

// ─── Create Vehicle Tests ──────────────────────────────────────────────────────

describe('POST /api/vehicles', () => {
  it('should create a vehicle successfully with valid JWT and data', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicle);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.make).toBe(validVehicle.make);
    expect(res.body.data.vehicle.model).toBe(validVehicle.model);
    expect(res.body.data.vehicle.price).toBe(validVehicle.price);
    expect(res.body.data.vehicle.quantity).toBe(validVehicle.quantity);
    expect(res.body.data.vehicle).toHaveProperty('id');
  });

  it('should return 403 when a regular user tries to create a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);

    expect(res.status).toBe(403);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).post('/api/vehicles').send(validVehicle);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Toyota' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 when price is negative', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicle, price: -5000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when quantity is negative', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicle, quantity: -1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when category is invalid', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validVehicle, category: 'InvalidCategory' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Get All Vehicles Tests ───────────────────────────────────────────────────

describe('GET /api/vehicles', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicle);
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validSUV);
  });

  it('should return a paginated list of all vehicles', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toBeInstanceOf(Array);
    expect(res.body.data.data.length).toBe(2);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('limit');
    expect(res.body.data).toHaveProperty('totalPages');
  });

  it('should support pagination via query params', async () => {
    const res = await request(app)
      .get('/api/vehicles?page=1&limit=1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(1);
    expect(res.body.data.totalPages).toBe(2);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });
});

// ─── Search Vehicles Tests ────────────────────────────────────────────────────

describe('GET /api/vehicles/search', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicle);
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validSUV);
  });

  it('should search vehicles by make', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(1);
    expect(res.body.data.data[0].make).toBe('Toyota');
  });

  it('should search vehicles by category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=SUV')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(1);
    expect(res.body.data.data[0].category).toBe('SUV');
  });

  it('should filter vehicles by price range', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=20000&maxPrice=35000')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(1);
    expect(res.body.data.data[0].price).toBe(28000);
  });

  it('should return empty array when no vehicles match filter', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=NonExistentBrand')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('should support partial make search (case-insensitive)', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=toy')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(1);
    expect(res.body.data.data[0].make).toBe('Toyota');
  });
});

// ─── Get Vehicle By ID Tests ──────────────────────────────────────────────────

describe('GET /api/vehicles/:id', () => {
  let vehicleId: number;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicle);
    vehicleId = res.body.data.vehicle.id;
  });

  it('should return a vehicle by ID', async () => {
    const res = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.id).toBe(vehicleId);
    expect(res.body.data.vehicle.make).toBe('Toyota');
  });

  it('should return 404 for non-existent vehicle ID', async () => {
    const res = await request(app)
      .get('/api/vehicles/99999')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── Update Vehicle Tests ─────────────────────────────────────────────────────

describe('PUT /api/vehicles/:id', () => {
  let vehicleId: number;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicle);
    vehicleId = res.body.data.vehicle.id;
  });

  it('should update vehicle details successfully', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 30000, description: 'Updated description' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.price).toBe(30000);
    expect(res.body.data.vehicle.description).toBe('Updated description');
    expect(res.body.data.vehicle.make).toBe('Toyota');
  });

  it('should return 404 for non-existent vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 30000 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .send({ price: 30000 });

    expect(res.status).toBe(401);
  });

  it('should return 403 when a regular user tries to update a vehicle', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 30000 });

    expect(res.status).toBe(403);
  });
});

// ─── Delete Vehicle Tests (Admin Only) ───────────────────────────────────────

describe('DELETE /api/vehicles/:id', () => {
  let vehicleId: number;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehicle);
    vehicleId = res.body.data.vehicle.id;
  });

  it('should allow admin to delete a vehicle', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('should return 403 when regular user tries to delete', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/admin/i);
  });

  it('should return 404 when deleting non-existent vehicle', async () => {
    const res = await request(app)
      .delete('/api/vehicles/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('should return 401 when no token provided', async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicleId}`);
    expect(res.status).toBe(401);
  });
});
