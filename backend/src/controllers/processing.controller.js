const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');
const processingService = require('../services/processing.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class ProcessingController {
  /**
   * Start processing document
   * POST /api/v1/documents/:id/process
   */
  async processDocument(req, res, next) {
    try {
      const { id } = req.params;
      const isCustomId = id.startsWith('DOC-');
      const query = isCustomId ? { documentId: id } : { _id: id };

      const document = await Document.findOne(query);
      if (!document) {
        return errorResponse(res, 'Document not found', { code: 'NOT_FOUND' }, 404);
      }

      const demoScenario = req.body.demoScenario || req.query.scenario || null;

      // Start asynchronous pipeline
      const result = await processingService.startProcessing(document._id, req.user, demoScenario);

      return successResponse(
        res,
        'Processing pipeline initiated asynchronously',
        result,
        202
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get live 10-stage processing status
   * GET /api/v1/documents/:id/processing
   */
  async getDocumentProcessingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const isCustomId = id.startsWith('DOC-');
      const query = isCustomId ? { documentId: id } : { _id: id };

      const document = await Document.findOne(query);
      if (!document) {
        return errorResponse(res, 'Document not found', { code: 'NOT_FOUND' }, 404);
      }

      const status = await processingService.getProcessingStatus(document._id);
      return successResponse(res, 'Processing status retrieved', status, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get job by ID
   * GET /api/v1/processing/jobs/:jobId
   */
  async getJobById(req, res, next) {
    try {
      const { jobId } = req.params;
      const isCustomId = jobId.startsWith('JOB-');
      const query = isCustomId ? { jobId } : { _id: jobId };

      const job = await ProcessingJob.findOne(query).populate('document');
      if (!job) {
        return errorResponse(res, 'Processing job not found', { code: 'NOT_FOUND' }, 404);
      }

      return successResponse(res, 'Processing job retrieved', { job }, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProcessingController();
