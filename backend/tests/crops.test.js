const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Crop Management CRUD APIs', () => {
  let farmerToken;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ramesh Patel',
        email: 'ramesh@agroadvisory.in',
        password: 'Password@123',
        role: 'farmer',
        state: 'Telangana',
        district: 'Warangal'
      });
    farmerToken = res.body.token;
  });

  test('POST /api/crops - Should create a new crop successfully', async () => {
    const res = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName: 'Cotton',
        cropCategory: 'Fiber Crop',
        farmArea: 2.5,
        areaUnit: 'acres',
        sowingDate: '2026-06-15',
        growthStage: 'Vegetative',
        soilType: 'Black Cotton',
        irrigationMethod: 'Drip Irrigation',
        notes: 'High yield hybrid test plot'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.crop.cropName).toBe('Cotton');
    expect(res.body.crop.farmArea).toBe(2.5);
  });

  test.each([
    ['Cotton', 'Boll Formation'],
    ['Maize', 'Silking'],
    ['Rice', 'Panicle Initiation']
  ])('POST /api/crops - accepts %s-specific stage %s', async (cropName, growthStage) => {
    const res = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName,
        farmArea: 1.5,
        sowingDate: '2026-07-01',
        growthStage
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.crop.growthStage).toBe(growthStage);
  });

  test('POST /api/crops - rejects a stage belonging to a different crop', async () => {
    const res = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName: 'Cotton',
        farmArea: 1.5,
        sowingDate: '2026-07-01',
        growthStage: 'Silking'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0]).toMatch(/not valid for Cotton/i);
  });

  test('GET /api/crops - Should return farmer registered crops', async () => {
    await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName: 'Rice',
        cropCategory: 'Cereals',
        farmArea: 3.0,
        sowingDate: '2026-07-01',
        growthStage: 'Tillering'
      });

    const res = await request(app)
      .get('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.crops.length).toBe(1);
    expect(res.body.crops[0].cropName).toBe('Rice');
  });

  test('PUT /api/crops/:id - Should update crop growth stage and notes', async () => {
    const createRes = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName: 'Maize',
        farmArea: 1.5,
        sowingDate: '2026-08-10',
        growthStage: 'Vegetative'
      });

    const cropId = createRes.body.crop._id;

    const updateRes = await request(app)
      .put(`/api/crops/${cropId}`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        growthStage: 'Flowering / Tillering',
        notes: 'Tassels visible, checked moisture'
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.crop.growthStage).toBe('Flowering / Tillering');
    expect(updateRes.body.crop.notes).toBe('Tassels visible, checked moisture');
  });

  test('DELETE /api/crops/:id - Should delete a crop', async () => {
    const createRes = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName: 'Chilli',
        farmArea: 1.0,
        sowingDate: '2026-09-01',
        growthStage: 'Germination / Seedling'
      });

    const cropId = createRes.body.crop._id;

    const delRes = await request(app)
      .delete(`/api/crops/${cropId}`)
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/api/crops/${cropId}`)
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(getRes.statusCode).toBe(404);
  });

  test('GET /api/crops/:id - Should return a crop owned by the farmer', async () => {
    const createRes = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        cropName: 'Rice',
        farmArea: 1.0,
        sowingDate: '2026-09-01',
        growthStage: 'Tillering'
      });

    const getRes = await request(app)
      .get(`/api/crops/${createRes.body.crop._id}`)
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.crop._id).toBe(createRes.body.crop._id);
  });
});
