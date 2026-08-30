const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const parcelSchema = new mongoose.Schema(
  {
    parcelId: {
      type: String,
      default: () => `PAR-${uuidv4().substring(0, 8).toUpperCase()}`,
      unique: true,
      index: true,
    },
    surveyNumber: {
      type: String,
      required: true,
      index: true,
    },
    subDivision: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    taluk: {
      type: String,
      required: true,
      index: true,
    },
    village: {
      type: String,
      required: true,
      index: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    ownerNameTamil: {
      type: String,
      default: '',
    },
    fatherName: {
      type: String,
      default: '',
    },
    area: {
      type: Number,
      required: true,
    },
    areaUnit: {
      type: String,
      default: 'Acres',
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        default: 'Polygon',
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        default: [
          [
            [76.9558, 11.0168],
            [76.9570, 11.0168],
            [76.9570, 11.0180],
            [76.9558, 11.0180],
            [76.9558, 11.0168],
          ],
        ],
      },
    },
    referenceData: {
      pattaNumber: { type: String, default: '' },
      landType: { type: String, default: 'Nanjai (Wet Land)' },
      marketValueEstimate: { type: Number, default: 0 },
      boundaries: {
        north: { type: String, default: 'Road' },
        south: { type: String, default: 'Survey No 145/3' },
        east: { type: String, default: 'Canal' },
        west: { type: String, default: 'Survey No 144' },
      },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISPUTED', 'LOCKED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

parcelSchema.index({ district: 1, village: 1, surveyNumber: 1 });

module.exports = mongoose.model('Parcel', parcelSchema);
