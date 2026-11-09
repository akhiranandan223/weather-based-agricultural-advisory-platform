const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Agricultural Advisory Engine APIs', () => {
  let farmerToken;
  let cropId;

  beforeEach(async () => {
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Kishan Reddy',
        email: 'kishan@agroadvisory.in',
        password: 'Password@123',
        role: 'farmer'
      });
    farmerToken = userRes.body.token;

    const cropRes = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName: 'Rice',
        farmArea: 2.0,
        sowingDate: '2026-06-01',
        growthStage: 'Tillering'
      });
    cropId = cropRes.body.crop._id;
  });

  test('POST /api/advisories/generate - Should generate weather-based advisory', async () => {
    const res = await request(app)
      .post('/api/advisories/generate')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ cropId });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.advisories).toBeInstanceOf(Array);
    expect(res.body.advisories.length).toBeGreaterThan(0);
    expect(res.body.advisories[0].recommendedAction).toBeDefined();
    expect(res.body.advisories[0].priority).toBeDefined();
  });

  test('GET /api/advisories - Should fetch advisories list for farmer', async () => {
    await request(app)
      .post('/api/advisories/generate')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ cropId });

    const res = await request(app)
      .get('/api/advisories')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.advisories.length).toBeGreaterThan(0);
  });
});
