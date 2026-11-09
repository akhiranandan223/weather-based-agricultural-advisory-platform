const mongoose = require('mongoose');

const weatherHistorySchema = new mongoose.Schema(
  {
    location: {
      city: { type: String, required: true },
      state: { type: String, default: 'Telangana' },
      country: { type: String, default: 'IN' },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    temperature: {
      type: Number,
      required: true
    },
    feelsLike: {
      type: Number
    },
    tempMin: {
      type: Number
    },
    tempMax: {
      type: Number
    },
    humidity: {
      type: Number,
      required: true
    },
    pressure: {
      type: Number
    },
    windSpeed: {
      type: Number,
      required: true
    },
    windDirection: {
      type: Number
    },
    rainfall: {
      type: Number,
      default: 0.0
    },
    cloudCover: {
      type: Number,
      default: 0
    },
    visibility: {
      type: Number,
      default: 10000
    },
    condition: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: '01d'
    },
    dataSource: {
      type: String,
      enum: ['LIVE_API', 'DEMO_FALLBACK'],
      default: 'LIVE_API'
    }
  },
  {
    timestamps: true
  }
);

weatherHistorySchema.index({ 'location.city': 1, recordedAt: -1 });

module.exports = mongoose.model('WeatherHistory', weatherHistorySchema);
