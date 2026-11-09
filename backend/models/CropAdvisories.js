const mongoose = require('mongoose');
const { growthStageValues } = require('../utils/cropGrowthStages');

const cropAdvisoriesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    },
    cropName: {
      type: String,
      required: true
    },
    growthStage: {
      type: String,
      enum: growthStageValues,
      default: 'Vegetative'
    },
    advisoryTitle: {
      type: String,
      required: true
    },
    weatherCondition: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    recommendedAction: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    category: {
      type: String,
      enum: [
        'Irrigation Management',
        'Pest & Fungal Risk Prevention',
        'Spraying & Chemical Application',
        'Field Drainage & Soil Care',
        'Harvesting & Post-Harvest',
        'Temperature Stress Protection',
        'General Care'
      ],
      default: 'Irrigation Management'
    },
    triggeringWeather: {
      temperature: Number,
      humidity: Number,
      rainfall: Number,
      windSpeed: Number,
      forecastSummary: String
    },
    status: {
      type: String,
      enum: ['Active', 'Acknowledged', 'Archived'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

cropAdvisoriesSchema.index({ userId: 1, createdAt: -1 });
cropAdvisoriesSchema.index({ cropName: 1 });

module.exports = mongoose.model('CropAdvisories', cropAdvisoriesSchema);
