const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String,
      default: 'System / Anonymous'
    },
    userRole: {
      type: String,
      default: 'system'
    },
    action: {
      type: String,
      required: true
    },
    module: {
      type: String,
      enum: ['AUTH', 'CROPS', 'WEATHER', 'ADVISORY', 'ALERTS', 'QUERIES', 'REPORTS', 'ADMIN', 'SYSTEM'],
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS'
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ module: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
