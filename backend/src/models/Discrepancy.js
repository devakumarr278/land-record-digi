const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { DISCREPANCY_TYPES, SEVERITY_LEVELS, DISCREPANCY_STATUS } = require('../utils/constants');

const discrepancySchema = new mongoose.Schema(
  {
    discrepancyId: {
      type: String,
      default: () => `DISC-${uuidv4().substring(0, 8).toUpperCase()}`,
      unique: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    parcel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parcel',
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(DISCREPANCY_TYPES),
      required: true,
      index: true,
    },
    field: {
      type: String,
      required: true,
    },
    documentValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    officialValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    difference: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    variancePercentage: {
      type: Number,
      default: null,
    },
    confidence: {
      type: Number,
      default: 0.9,
    },
    severity: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      default: SEVERITY_LEVELS.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(DISCREPANCY_STATUS),
      default: DISCREPANCY_STATUS.OPEN,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Discrepancy', discrepancySchema);
