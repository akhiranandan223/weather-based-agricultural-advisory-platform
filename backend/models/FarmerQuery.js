const mongoose = require('mongoose');
const { growthStageValues } = require('../utils/cropGrowthStages');

const expertResponseSubSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expertName: {
      type: String,
      required: true
    },
    expertQualification: {
      type: String,
      default: 'Agricultural Scientist / Extension Specialist'
    },
    message: {
      type: String,
      required: [true, 'Response message is required']
    },
    recommendedAction: {
      type: String,
      default: ''
    },
    weatherConsiderations: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const farmerQuerySchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    farmerName: {
      type: String,
      required: true
    },
    farmerPhone: {
      type: String,
      default: ''
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required']
    },
    growthStage: {
      type: String,
      enum: growthStageValues,
      default: 'Vegetative'
    },
    title: {
      type: String,
      required: [true, 'Query title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    problemDescription: {
      type: String,
      required: [true, 'Problem description is required'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    farmingLocation: {
      state: { type: String, default: 'Telangana' },
      district: { type: String, default: 'Warangal' },
      village: { type: String, default: 'Ananthasagar' }
    },
    weatherContext: {
      temperature: Number,
      condition: String,
      humidity: Number,
      recordedAt: Date
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Answered', 'Closed'],
      default: 'Pending',
      index: true
    },
    responses: [expertResponseSubSchema]
  },
  {
    timestamps: true
  }
);

farmerQuerySchema.index({ farmerId: 1, createdAt: -1 });
farmerQuerySchema.index({ cropName: 1 });

module.exports = mongoose.model('FarmerQuery', farmerQuerySchema);
