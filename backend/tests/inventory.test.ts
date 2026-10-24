/**
 * TDD Test Suite: Inventory Management (Purchase & Restock)
 * Tests written FIRST - Red-Green-Refactor TDD methodology.
 */

import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { connectDB, closeDB, getDB } from '../src/config/database';
import app from '../src/app';

const TEST_DB_PATH = path.resolve(__dirname, '../data/inventory_test.sqlite');

let userToken: string;
let adminToken: string;
let vehicleId: number;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_2024';
  process.env.ADMIN_REGISTRATION_CODE = 'TEST_ADMIN_CODE';
  await connectDB(TEST_DB_PATH);

  const userRes = await request(app).post('/api/auth/register').send({
    username: 'inventoryuser',
    email: 'invuser@test.com',
    password: 'password123',
  });
  userToken = userRes.body.data.token;

  const adminRes = await request(app).post('/api/auth/register').send({
    username: 'inventoryadmin',
    email: 'invadmin@test.com',
    password: 'password123',
    role: 'admin',
    adminCode: 'TEST_ADMIN_CODE',
  });
  adminToken = adminRes.body.data.token;
});

beforeEach(async () => {
  const res = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      category: 'Sedan',
      price: 25000,
      quantity: 10,
      description: 'Test vehicle for inventory',
      image_url: '',
    });
  vehicleId = res.body.data.vehicle.id;
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

// ─── Purchase Tests ────────────────────────────────────────────────────────────

describe('POST /api/vehicles/:id/purchase', () => {
  it('should decrease vehicle quantity on purchase', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(7);
    expect(res.body.message).toMatch(/purchased/i);
  });

  it('should allow purchasing exactly the remaining quantity', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.quantity).toBe(0);
  });

  it('should return 400 when purchase quantity exceeds stock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 15 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/insufficient/i);
  });

  it('should return 400 when quantity is zero or negative', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when purchasing from out-of-stock vehicle', async () => {
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient/i);
  });

  it('should return 404 for non-existent vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles/99999/purchase')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(404);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .send({ quantity: 1 });

    expect(res.status).toBe(401);
  });
});

// ─── Restock Tests (Admin Only) ───────────────────────────────────────────────

describe('POST /api/vehicles/:id/restock', () => {
  it('should allow admin to restock a vehicle', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(15);
    expect(res.body.message).toMatch(/restocked/i);
  });

  it('should return 403 when regular user tries to restock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/admin/i);
  });

  it('should return 400 when restock quantity is negative', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: -5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 for non-existent vehicle restock', async () => {
    const res = await request(app)
      .post('/api/vehicles/99999/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
  });

  it('should return 401 when not authenticated for restock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .send({ quantity: 5 });

    expect(res.status).toBe(401);
  });

  it('should correctly handle purchase followed by restock', async () => {
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 5 });

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 20 });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.quantity).toBe(25);
  });
});
