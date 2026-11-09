const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Mandatory Reports & CSV Exports', () => {
  let farmerToken;

  beforeEach(async () => {
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Report Test User',
        email: 'reportuser@agroadvisory.in',
        password: 'Password@123',
        role: 'farmer'
      });
    farmerToken = userRes.body.token;
  });

  test('1. GET /api/reports/weather-history - Should return JSON & CSV', async () => {
    const jsonRes = await request(app).get('/api/reports/weather-history');
    expect(jsonRes.statusCode).toBe(200);
    expect(jsonRes.body.success).toBe(true);

    const csvRes = await request(app).get('/api/reports/weather-history?format=csv');
    expect(csvRes.statusCode).toBe(200);
    expect(csvRes.headers['content-type']).toMatch(/text\/csv/);
    expect(csvRes.text).toMatch(/Temperature/);
  });

  test('2. GET /api/reports/forecast-summary - Should return JSON & CSV', async () => {
    const jsonRes = await request(app).get('/api/reports/forecast-summary?city=Warangal');
    expect(jsonRes.statusCode).toBe(200);
    expect(jsonRes.body.success).toBe(true);
    expect(jsonRes.body.summary).toBeInstanceOf(Array);

    const csvRes = await request(app).get('/api/reports/forecast-summary?city=Warangal&format=csv');
    expect(csvRes.statusCode).toBe(200);
    expect(csvRes.headers['content-type']).toMatch(/text\/csv/);
    expect(csvRes.text).toMatch(/Forecast Summary/);
  });

  test('3. GET /api/reports/crop-advisory - Should return JSON & CSV', async () => {
    const jsonRes = await request(app)
      .get('/api/reports/crop-advisory')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(jsonRes.statusCode).toBe(200);
    expect(jsonRes.body.success).toBe(true);

    const csvRes = await request(app)
      .get('/api/reports/crop-advisory?format=csv')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(csvRes.statusCode).toBe(200);
    expect(csvRes.headers['content-type']).toMatch(/text\/csv/);
    expect(csvRes.text).toMatch(/Advisory Title/);
  });

  test('4. GET /api/reports/farmer-queries - Should return JSON & CSV', async () => {
    const jsonRes = await request(app)
      .get('/api/reports/farmer-queries')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(jsonRes.statusCode).toBe(200);
    expect(jsonRes.body.success).toBe(true);

    const csvRes = await request(app)
      .get('/api/reports/farmer-queries?format=csv')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(csvRes.statusCode).toBe(200);
    expect(csvRes.headers['content-type']).toMatch(/text\/csv/);
    expect(csvRes.text).toMatch(/Problem Description/);
  });
});
