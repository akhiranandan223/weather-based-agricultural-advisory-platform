const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    farmSize: {
      type: Number,
      default: 5.0,
      min: [0.1, 'Farm size must be greater than zero']
    },
    landUnit: {
      type: String,
      enum: ['acres', 'hectares', 'guntas'],
      default: 'acres'
    },
    soilType: {
      type: String,
      enum: [
        'Black Cotton',
        'Red Sandy Loam',
        'Alluvial',
        'Clay Loam',
        'Laterite',
        'Sandy'
      ],
      default: 'Red Sandy Loam'
    },
    irrigationMethod: {
      type: String,
      enum: [
        'Drip Irrigation',
        'Sprinkler',
        'Canal / Furrow',
        'Borewell / Tube Well',
        'Rainfed'
      ],
      default: 'Drip Irrigation'
    },
    experienceYears: {
      type: Number,
      default: 5
    },
    farmingLocation: {
      state: { type: String, default: 'Telangana' },
      district: { type: String, default: 'Warangal' },
      village: { type: String, default: 'Ananthasagar' },
      pincode: { type: String, default: '506371' },
      latitude: { type: Number, default: 17.9689 },
      longitude: { type: Number, default: 79.5941 }
    },
    primaryCrops: [
      {
        type: String,
        trim: true
      }
    ],
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
