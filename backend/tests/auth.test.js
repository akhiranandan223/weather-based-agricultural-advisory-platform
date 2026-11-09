const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Authentication & User Management APIs', () => {
  const sampleFarmer = {
    name: 'Suresh Kumar',
    email: 'suresh@agroadvisory.in',
    password: 'Password@123',
    role: 'farmer',
    phone: '9876543210',
    state: 'Telangana',
    district: 'Warangal',
    village: 'Hanamkonda'
  };

  test('POST /api/auth/register - Should register a new farmer and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleFarmer);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(sampleFarmer.email);
    expect(res.body.user.role).toBe('farmer');
  });

  test('POST /api/auth/register - Should reject duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(sampleFarmer);

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send(sampleFarmer);

    expect(duplicateRes.statusCode).toBe(400);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toMatch(/already exists/i);
  });

  test('POST /api/auth/login - Should successfully authenticate with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(sampleFarmer);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: sampleFarmer.email,
        password: sampleFarmer.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe(sampleFarmer.name);
  });

  test('POST /api/auth/login - Should reject invalid password', async () => {
    await request(app).post('/api/auth/register').send(sampleFarmer);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: sampleFarmer.email,
        password: 'WrongPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Should return current user profile using Bearer JWT', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleFarmer);
    const token = regRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.email).toBe(sampleFarmer.email);
    expect(meRes.body.farmerProfile).toBeDefined();
  });
});
