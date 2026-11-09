const mongoose = require('mongoose');

const expertResponseSchema = new mongoose.Schema(
  {
    queryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerQuery',
      required: true,
      index: true
    },
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    expertName: {
      type: String,
      required: true
    },
    recommendation: {
      type: String,
      required: true
    },
    recommendedAction: {
      type: String,
      default: ''
    },
    weatherConsiderations: {
      type: String,
      default: ''
    },
    resolvedStatus: {
      type: String,
      enum: ['In Progress', 'Answered', 'Closed'],
      default: 'Answered'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ExpertResponse', expertResponseSchema);
