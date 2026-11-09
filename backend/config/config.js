const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/agroadvisory',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_agricultural_advisory_jwt_key_2026_sr_university',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  defaultLocation: {
    city: process.env.DEFAULT_LOCATION_CITY || 'Warangal',
    state: process.env.DEFAULT_LOCATION_STATE || 'Telangana',
    country: process.env.DEFAULT_LOCATION_COUNTRY || 'IN',
    lat: 17.9689,
    lon: 79.5941
  },
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '500', 10),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
};
