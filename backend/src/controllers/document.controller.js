const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');
const auditService = require('../services/audit.service');
const processingService = require('../services/processing.service');
const { calculateFileHash } = require('../utils/hash');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { DOCUMENT_STATUS, AUDIT_ACTIONS, ROLES, DOCUMENT_TYPES } = require('../utils/constants');

class DocumentController {
  /**
   * Upload land record document
   * POST /api/v1/documents/upload
   */
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Please provide a land record document file (PDF or Image)', { code: 'FILE_REQUIRED' }, 400);
      }

      const filePath = req.file.path;
      const sha256 = await calculateFileHash(filePath);

      // Parse metadata from request body if present
      let metadata = {
        district: req.body.district || 'Coimbatore',
        taluk: req.body.taluk || 'Coimbatore North',
        village: req.body.village || 'Kovilpalayam',
        surveyNumber: req.body.surveyNumber || '145/2',
        subDivision: req.body.subDivision || '2',
        pattaNumber: req.body.pattaNumber || '1042',
      };

      if (typeof req.body.metadata === 'string') {
        try {
          metadata = { ...metadata, ...JSON.parse(req.body.metadata) };
        } catch (e) {
          // Keep defaults
        }
      }

      const documentType = req.body.documentType && Object.values(DOCUMENT_TYPES).includes(req.body.documentType)
        ? req.body.documentType
        : DOCUMENT_TYPES.PATTA;

      const demoScenario = req.body.demoScenario || req.query.scenario || null;

      // Create Document model
      const document = new Document({
        originalFileName: req.file.originalname,
        storedFileName: req.file.filename,
        filePath,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedBy: req.user._id,
        metadata,
        sha256,
        documentType,
        status: DOCUMENT_STATUS.QUEUED,
        demoScenario,
      });

      await document.save();

      // Create initial ProcessingJob
      const job = new ProcessingJob({
        document: document._id,
        status: 'PENDING',
      });
      await job.save();

      document.currentProcessingJob = job._id;
      await document.save();

      // Log audit trail event
      await auditService.logEvent({
        document: document._id,
        actor: req.user._id,
        actorRole: req.user.role,
        actorName: req.user.name,
        action: AUDIT_ACTIONS.DOCUMENT_UPLOADED,
        details: {
          documentId: document.documentId,
          originalFileName: document.originalFileName,
          storedFileName: document.storedFileName,
          fileSize: document.fileSize,
          sha256,
          metadata,
          demoScenario,
        },
      });

      // Automatically trigger the real AI processing pipeline
      let pipelineInfo = null;
      try {
        pipelineInfo = await processingService.startProcessing(document._id, req.user, demoScenario);
      } catch (pipeErr) {
        console.warn(`[DocumentController] Pipeline start warning: ${pipeErr.message}`);
      }

      return successResponse(
        res,
        'Document uploaded and AI processing initiated successfully',
        {
          documentId: document.documentId,
          id: document._id,
          jobId: job.jobId,
          originalFileName: document.originalFileName,
          storedFileName: document.storedFileName,
          sha256: document.sha256,
          status: document.status,
          metadata: document.metadata,
          pipeline: pipelineInfo,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all documents with pagination and filtering
   * GET /api/v1/documents
   */
  async getDocuments(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        district,
        taluk,
        village,
        surveyNumber,
        documentType,
      } = req.query;

      const filter = {};

      // If user is CITIZEN, only return own documents
      if (req.user.role === ROLES.CITIZEN) {
        filter.uploadedBy = req.user._id;
      }

      if (status) filter.status = status;
      if (documentType) filter.documentType = documentType;
      if (district) filter['metadata.district'] = new RegExp(district, 'i');
      if (taluk) filter['metadata.taluk'] = new RegExp(taluk, 'i');
      if (village) filter['metadata.village'] = new RegExp(village, 'i');
      if (surveyNumber) filter['metadata.surveyNumber'] = new RegExp(surveyNumber, 'i');

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const [documents, total] = await Promise.all([
        Document.find(filter)
          .populate('uploadedBy', 'name email role')
          .populate('currentProcessingJob', 'jobId overallProgress currentStage status')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit, 10)),
        Document.countDocuments(filter),
      ]);

      return successResponse(
        res,
        'Documents retrieved successfully',
        {
          documents,
          pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            pages: Math.ceil(total / limit),
          },
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single document by ID
   * GET /api/v1/documents/:id
   */
  async getDocumentById(req, res, next) {
    try {
      const { id } = req.params;
      const isCustomId = id.startsWith('DOC-') || id.startsWith('LR-') || !id.match(/^[0-9a-fA-F]{24}$/);
      const query = isCustomId ? { documentId: id } : { _id: id };

      const document = await Document.findOne(query)
        .populate('uploadedBy', 'name email role')
        .populate('currentProcessingJob');

      if (!document) {
        return errorResponse(res, 'Document not found', { code: 'NOT_FOUND' }, 404);
      }

      // Check CITIZEN access permissions
      if (req.user.role === ROLES.CITIZEN && String(document.uploadedBy?._id || document.uploadedBy) !== String(req.user._id)) {
        return errorResponse(res, 'You are not authorized to view this document', { code: 'FORBIDDEN' }, 403);
      }

      return successResponse(res, 'Document retrieved successfully', { document }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download original document
   * GET /api/v1/documents/:id/download
   */
  async downloadDocument(req, res, next) {
    try {
      const { id } = req.params;
      const isCustomId = id.startsWith('DOC-') || id.startsWith('LR-') || !id.match(/^[0-9a-fA-F]{24}$/);
      const query = isCustomId ? { documentId: id } : { _id: id };

      const document = await Document.findOne(query);
      if (!document) {
        return errorResponse(res, 'Document not found', { code: 'NOT_FOUND' }, 404);
      }

      if (req.user.role === ROLES.CITIZEN && String(document.uploadedBy) !== String(req.user._id)) {
        return errorResponse(res, 'Forbidden', { code: 'FORBIDDEN' }, 403);
      }

      if (!fs.existsSync(document.filePath)) {
        return errorResponse(res, 'Physical file not found on disk', { code: 'FILE_NOT_FOUND' }, 404);
      }

      return res.download(document.filePath, document.originalFileName);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit human-in-the-loop review resolution
   * POST /api/v1/documents/:id/resolve
   */
  async resolveReview(req, res, next) {
    try {
      const { id } = req.params;
      const isCustomId = id.startsWith('DOC-') || id.startsWith('LR-') || !id.match(/^[0-9a-fA-F]{24}$/);
      const query = isCustomId ? { documentId: id } : { _id: id };

      const document = await Document.findOne(query);
      if (!document) {
        return errorResponse(res, 'Document not found', { code: 'NOT_FOUND' }, 404);
      }

      const { fields, extractedData, decisions } = req.body;
      if (extractedData) {
        document.extractedData = { ...document.extractedData, ...extractedData };
      }
      if (fields && Array.isArray(fields)) {
        const byKey = {};
        fields.forEach(f => { byKey[f.key] = f.value; });
        if (byKey.owner || byKey.ownerName) document.extractedData.ownerName = byKey.owner || byKey.ownerName;
        if (byKey.survey || byKey.surveyNumber) document.extractedData.surveyNumber = byKey.survey || byKey.surveyNumber;
        if (byKey.area || byKey.landArea) document.extractedData.landArea = parseFloat(byKey.area || byKey.landArea) || document.extractedData.landArea;
        if (byKey.village) document.extractedData.village = byKey.village;
        if (byKey.classification) document.extractedData.classification = byKey.classification;
      }

      document.status = DOCUMENT_STATUS.VALIDATED;
      document.confidenceScore = 0.99;
      await document.save();

      // Resolve open discrepancies for this document
      const Discrepancy = require('../models/Discrepancy');
      await Discrepancy.updateMany(
        { document: document._id, status: 'OPEN' },
        { status: 'RESOLVED', resolutionNotes: 'Resolved by Field Operator via Human-in-the-loop review' }
      );

      // Audit log
      await auditService.logEvent({
        document: document._id,
        actor: req.user._id,
        actorRole: req.user.role,
        actorName: req.user.name,
        action: AUDIT_ACTIONS.RECORD_SEALED,
        details: {
          event: 'HUMAN_REVIEW_RESOLVED',
          documentId: document.documentId,
          decisions,
          updatedFields: document.extractedData,
        },
      });

      return successResponse(res, 'Document review resolved and sealed successfully', { document }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger document reprocessing
   * POST /api/v1/documents/:id/reprocess
   */
  async reprocessDocument(req, res, next) {
    try {
      const { id } = req.params;
      const isCustomId = id.startsWith('DOC-') || id.startsWith('LR-') || !id.match(/^[0-9a-fA-F]{24}$/);
      const query = isCustomId ? { documentId: id } : { _id: id };

      const document = await Document.findOne(query);
      if (!document) {
        return errorResponse(res, 'Document not found', { code: 'NOT_FOUND' }, 404);
      }

      const demoScenario = req.body.demoScenario || req.query.scenario || document.demoScenario;
      const result = await processingService.startProcessing(document._id, req.user, demoScenario);

      return successResponse(res, 'Reprocessing initiated successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete document
   * DELETE /api/v1/documents/:id
   */
  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      const isCustomId = id.startsWith('DOC-');
      const query = isCustomId ? { documentId: id } : { _id: id };

      const document = await Document.findOne(query);
      if (!document) {
        return errorResponse(res, 'Document not found', { code: 'NOT_FOUND' }, 404);
      }

      if (fs.existsSync(document.filePath)) {
        try {
          fs.unlinkSync(document.filePath);
        } catch (e) {
          console.warn('Could not remove file from disk:', e.message);
        }
      }

      await Document.deleteOne({ _id: document._id });

      return successResponse(res, 'Document deleted successfully', { documentId: document.documentId }, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
