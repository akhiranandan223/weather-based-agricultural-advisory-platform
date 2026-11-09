const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Farmer Query and Expert Response APIs', () => {
  let farmerToken;
  let expertToken;

  beforeEach(async () => {
    const fRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Gopal Rao',
        email: 'gopal@agroadvisory.in',
        password: 'Password@123',
        role: 'farmer'
      });
    farmerToken = fRes.body.token;

    const eRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Expert Scientist',
        email: 'expert.scientist@agroadvisory.in',
        password: 'Password@123',
        role: 'expert'
      });
    expertToken = eRes.body.token;
  });

  test('POST /api/queries - Farmer submits query with crop and problem', async () => {
    const res = await request(app)
      .post('/api/queries')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName: 'Cotton',
        title: 'Yellowing of cotton leaves during vegetative stage',
        problemDescription: 'Lower leaves turning yellow between leaf veins. Suspecting magnesium deficiency or overwatering.',
        urgency: 'High'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.query.title).toMatch(/yellowing/i);
    expect(res.body.query.status).toBe('Pending');
  });

  test('POST /api/expert/responses - Expert provides agronomic reply and updates query status', async () => {
    const queryRes = await request(app)
      .post('/api/queries')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName: 'Tomato',
        title: 'Blossom end rot in tomato plants',
        problemDescription: 'Fruits developing dark sunken spots at the bottom end. Soil moisture has been irregular.',
        urgency: 'Medium'
      });

    const queryId = queryRes.body.query._id;

    const replyRes = await request(app)
      .post('/api/expert/responses')
      .set('Authorization', `Bearer ${expertToken}`)
      .send({
        queryId,
        message: 'This is characteristic of calcium deficiency aggravated by erratic irrigation cycles.',
        recommendedAction: 'Apply foliar spray of calcium nitrate @ 2g/L and ensure consistent soil moisture.',
        weatherConsiderations: 'Avoid heavy noon watering to prevent root scalding.',
        status: 'Answered'
      });

    expect(replyRes.statusCode).toBe(200);
    expect(replyRes.body.success).toBe(true);
    expect(replyRes.body.query.status).toBe('Answered');
    expect(replyRes.body.query.responses.length).toBe(1);
    expect(replyRes.body.query.responses[0].message).toMatch(/calcium deficiency/i);
  });
});
