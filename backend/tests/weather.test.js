const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Weather Service & Forecasting APIs', () => {
  test('GET /api/weather/current - Should return weather metrics with data source indicator', async () => {
    const res = await request(app)
      .get('/api/weather/current?city=Warangal');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.weather.city).toBe('Warangal');
    expect(res.body.weather.temperature).toBeDefined();
    expect(res.body.weather.humidity).toBeDefined();
    expect(res.body.weather.windSpeed).toBeDefined();
    expect(res.body.weather.dataSource).toBeDefined();
  });

  test('GET /api/weather/forecast - Should return 5-day / 3-hour forecast data array', async () => {
    const res = await request(app)
      .get('/api/weather/forecast?city=Warangal');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.forecast.forecasts).toBeInstanceOf(Array);
    expect(res.body.forecast.forecasts.length).toBeGreaterThan(0);
    expect(res.body.forecast.forecasts[0].temperature).toBeDefined();
    expect(res.body.forecast.forecasts[0].rainProbability).toBeDefined();
  });

  test('GET /api/weather/locations - Should search known agricultural cities', async () => {
    const res = await request(app)
      .get('/api/weather/locations?q=war');

    expect(res.statusCode).toBe(200);
    expect(res.body.locations).toBeInstanceOf(Array);
    expect(res.body.locations.some(l => l.city === 'Warangal')).toBe(true);
  });
});
