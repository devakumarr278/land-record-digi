const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { STAGE_STATUS, PIPELINE_STAGES } = require('../utils/constants');

const stageSchema = new mongoose.Schema(
  {
    stageNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(STAGE_STATUS),
      default: STAGE_STATUS.PENDING,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const processingJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      default: () => `JOB-${uuidv4().substring(0, 8).toUpperCase()}`,
      unique: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(STAGE_STATUS),
      default: STAGE_STATUS.PENDING,
      index: true,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentStage: {
      type: String,
      default: 'Document Ingestion',
    },
    attempt: {
      type: Number,
      default: 1,
    },
    stages: {
      type: [stageSchema],
      default: () =>
        PIPELINE_STAGES.map((s) => ({
          stageNumber: s.stageNumber,
          name: s.name,
          status: STAGE_STATUS.PENDING,
          progress: 0,
          startedAt: null,
          completedAt: null,
          result: null,
          error: null,
        })),
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to update stage progress
processingJobSchema.methods.updateStage = function (stageNum, updates) {
  const stage = this.stages.find((s) => s.stageNumber === stageNum);
  if (stage) {
    Object.assign(stage, updates);
    if (updates.status === STAGE_STATUS.PROCESSING && !stage.startedAt) {
      stage.startedAt = new Date();
    }
    if (updates.status === STAGE_STATUS.COMPLETED && !stage.completedAt) {
      stage.completedAt = new Date();
      stage.progress = 100;
    }
  }

  // Recalculate overall progress (both COMPLETED and FLAGGED count as finished stage milestones)
  const finishedStages = this.stages.filter(
    (s) => s.status === STAGE_STATUS.COMPLETED || s.status === STAGE_STATUS.FLAGGED
  ).length;
  const inProgressStages = this.stages.filter((s) => s.status === STAGE_STATUS.PROCESSING);
  let partial = 0;
  if (inProgressStages.length > 0) {
    partial = (inProgressStages[0].progress || 50) / 100;
  }
  this.overallProgress = Math.min(100, Math.round(((finishedStages + partial) / this.stages.length) * 100));

  const currentActive = this.stages.find((s) => s.status === STAGE_STATUS.PROCESSING) ||
                        this.stages.find((s) => s.status === STAGE_STATUS.PENDING);
  if (currentActive) {
    this.currentStage = currentActive.name;
  }
};

module.exports = mongoose.model('ProcessingJob', processingJobSchema);
