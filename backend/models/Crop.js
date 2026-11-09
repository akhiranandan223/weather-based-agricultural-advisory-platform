const mongoose = require('mongoose');
const {
  growthStageValues,
  isValidGrowthStageForCrop
} = require('../utils/cropGrowthStages');

const cropSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Crop must belong to a farmer']
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      enum: [
        'Rice',
        'Cotton',
        'Maize',
        'Wheat',
        'Groundnut',
        'Chilli',
        'Tomato',
        'Soybean',
        'Pulses / Gram',
        'Sugarcane',
        'Other'
      ]
    },
    cropCategory: {
      type: String,
      enum: ['Cereals', 'Fiber Crop', 'Oilseeds', 'Vegetables', 'Cash Crops', 'Spices', 'Pulses'],
      default: 'Cereals'
    },
    variety: {
      type: String,
      trim: true,
      default: 'Standard Hybrid'
    },
    farmArea: {
      type: Number,
      required: [true, 'Farm area is required'],
      min: [0.1, 'Farm area must be greater than zero']
    },
    areaUnit: {
      type: String,
      enum: ['acres', 'hectares', 'guntas'],
      default: 'acres'
    },
    sowingDate: {
      type: Date,
      required: [true, 'Sowing date is required']
    },
    expectedHarvestDate: {
      type: Date
    },
    growthStage: {
      type: String,
      enum: growthStageValues,
      validate: {
        validator(growthStage) {
          return isValidGrowthStageForCrop(growthStage, this.cropName);
        },
        message: '{VALUE} is not a valid growth stage for this crop'
      },
      default: 'Seedling'
    },
    soilType: {
      type: String,
      default: 'Red Sandy Loam'
    },
    irrigationMethod: {
      type: String,
      default: 'Drip Irrigation'
    },
    location: {
      state: { type: String, default: 'Telangana' },
      district: { type: String, default: 'Warangal' },
      village: { type: String, default: 'Ananthasagar' }
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Harvested', 'Archived'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast lookup
cropSchema.index({ userId: 1, status: 1 });
cropSchema.index({ cropName: 1 });

module.exports = mongoose.model('Crop', cropSchema);
