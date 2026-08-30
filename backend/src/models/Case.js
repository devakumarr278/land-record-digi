const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { CASE_STATUS, CASE_DECISIONS, CASE_PRIORITY, RISK_LEVELS, ROLES } = require('../utils/constants');

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      default: () => `CASE-${uuidv4().substring(0, 8).toUpperCase()}`,
      unique: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    discrepancies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discrepancy',
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedRole: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.VERIFYING_OFFICER,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED', 'RESOLVED', 'NEW', 'UNDER_VERIFICATION'],
      default: 'PENDING_REVIEW',
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(CASE_PRIORITY),
      default: CASE_PRIORITY.MEDIUM,
      index: true,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVELS),
      default: RISK_LEVELS.LOW,
      index: true,
    },
    decision: {
      type: String,
      enum: Object.values(CASE_DECISIONS),
      default: CASE_DECISIONS.PENDING,
      index: true,
    },
    decisionReason: {
      type: String,
      default: null,
    },
    remarks: {
      type: String,
      default: null,
    },
    decisionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    decisionAt: {
      type: Date,
      default: null,
    },
    escalationHistory: [
      {
        escalatedFrom: { type: String },
        escalatedTo: { type: String },
        reason: { type: String },
        remarks: { type: String },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    fieldCorrections: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Case', caseSchema);
