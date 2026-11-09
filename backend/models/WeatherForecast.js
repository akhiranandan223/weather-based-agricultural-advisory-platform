const mongoose = require('mongoose');

const forecastItemSchema = new mongoose.Schema(
  {
    dt: { type: Number, required: true },
    dateTime: { type: Date, required: true },
    temperature: { type: Number, required: true },
    tempMin: { type: Number },
    tempMax: { type: Number },
    humidity: { type: Number, required: true },
    pressure: { type: Number },
    windSpeed: { type: Number, required: true },
    rainProbability: { type: Number, default: 0 },
    rainAmount: { type: Number, default: 0 },
    condition: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '01d' }
  },
  { _id: false }
);

const weatherForecastSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      index: true
    },
    state: { type: String, default: 'Telangana' },
    country: { type: String, default: 'IN' },
    coordinates: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    },
    retrievedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    dataSource: {
      type: String,
      enum: ['LIVE_API', 'DEMO_FALLBACK'],
      default: 'LIVE_API'
    },
    forecasts: [forecastItemSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WeatherForecast', weatherForecastSchema);
