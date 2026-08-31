const auditService = require('../services/audit.service');
const Document = require('../models/Document');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class AuditController {
  /**
   * Get all audit logs with pagination and filters
   * GET /api/v1/audit
   */
  async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 50, documentId, caseId, action, actorRole } = req.query;
      const result = await auditService.getLogs(
        { documentId, caseId, action, actorRole },
        { page, limit }
      );

      return successResponse(res, 'Audit logs retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get chronological audit history for a single document
   * GET /api/v1/audit/document/:documentId
   */
  async getDocumentAuditLogs(req, res, next) {
    try {
      const { documentId } = req.params;
      const isCustomId = documentId.startsWith('DOC-');

      let docDbId = documentId;
      if (isCustomId) {
        const doc = await Document.findOne({ documentId });
        if (!doc) {
          return errorResponse(res, 'Document not found', { code: 'NOT_FOUND' }, 404);
        }
        docDbId = doc._id;
      }

      const logs = await auditService.getLogsForDocument(docDbId);
      return successResponse(res, 'Document audit trail retrieved successfully', { logs }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cryptographically verify SHA-256 hash chain
   * GET /api/v1/audit/verify-chain
   */
  async verifyChain(req, res, next) {
    try {
      const verificationResult = await auditService.verifyChain();
      return successResponse(res, 'Cryptographic chain verification completed', verificationResult, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditController();
