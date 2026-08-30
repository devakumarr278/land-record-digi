const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { DOCUMENT_STATUS, DOCUMENT_TYPES } = require('../utils/constants');

const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      default: () => `DOC-${uuidv4().substring(0, 8).toUpperCase()}`,
      unique: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    metadata: {
      district: { type: String, default: '' },
      taluk: { type: String, default: '' },
      village: { type: String, default: '' },
      surveyNumber: { type: String, default: '' },
      subDivision: { type: String, default: '' },
      pattaNumber: { type: String, default: '' },
    },
    sha256: {
      type: String,
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: Object.values(DOCUMENT_TYPES),
      default: DOCUMENT_TYPES.PATTA,
    },
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.STORED,
      index: true,
    },
    currentProcessingJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcessingJob',
    },
    classificationConfidence: {
      type: Number,
      default: 0,
    },
    pagesProcessed: {
      type: Number,
      default: 1,
    },
    language: {
      type: [String],
      default: ['Tamil', 'English'],
    },
    ocrResult: {
      type: String,
      default: null,
    },
    ocrPages: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    ocrModel: {
      type: String,
      default: null,
    },
    extractedData: {
      surveyNumber: { type: String, default: null },
      subDivision: { type: String, default: null },
      ownerName: { type: String, default: null },
      fatherName: { type: String, default: null },
      village: { type: String, default: null },
      taluk: { type: String, default: null },
      district: { type: String, default: null },
      landArea: { type: Number, default: null },
      areaUnit: { type: String, default: 'Acres' },
      classification: { type: String, default: null },
      boundaries: {
        north: { type: String, default: null },
        south: { type: String, default: null },
        east: { type: String, default: null },
        west: { type: String, default: null },
      },
    },
    fieldConfidence: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    overallConfidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    processingTime: {
      type: Number,
      default: 0,
    },
    usedFallback: {
      type: Boolean,
      default: false,
    },
    processingMode: {
      type: String,
      enum: ['AI', 'FALLBACK', 'DEMO_FALLBACK', 'FAILED'],
      default: 'AI',
    },
    fallbackReason: {
      type: String,
      default: null,
    },
    demoScenario: {
      type: String,
      default: null,
    },
    stages: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    validationResults: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    gisValidation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtuals & indexes
documentSchema.index({ 'metadata.district': 1, 'metadata.village': 1, 'metadata.surveyNumber': 1 });

module.exports = mongoose.model('Document', documentSchema);
