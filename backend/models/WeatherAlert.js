const mongoose = require('mongoose');

const weatherAlertSchema = new mongoose.Schema(
  {
    alertTitle: {
      type: String,
      required: true
    },
    alertType: {
      type: String,
      enum: [
        'Heavy Rainfall',
        'High Temperature',
        'Low Temperature / Frost',
        'Strong Winds',
        'Low Rainfall / Drought',
        'High Humidity'
      ],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    recommendedPrecaution: {
      type: String,
      default: ''
    },
    severity: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    location: {
      city: { type: String, default: 'Warangal' },
      state: { type: String, default: 'Telangana' },
      district: { type: String, default: 'Warangal' },
      village: { type: String, default: 'All Villages' }
    },
    thresholdTriggered: {
      metric: String,
      value: Number,
      threshold: Number
    },
    isOfficial: {
      type: Boolean,
      default: false // false: application-generated rule, true: official IMD/Government alert
    },
    isReadBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

weatherAlertSchema.index({ 'location.district': 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('WeatherAlert', weatherAlertSchema);
