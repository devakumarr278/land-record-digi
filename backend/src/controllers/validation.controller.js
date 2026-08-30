const Document = require('../models/Document');
const validationService = require('../services/validation.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class ValidationController {
  /**
   * Run validation on a document
   * POST /api/v1/validation/validate/:documentId
   */
  async validateDocument(req, res, next) {
    try {
      const { documentId } = req.params;
      const isCustomId = documentId.startsWith('DOC-');
      const query = isCustomId ? { documentId } : { _id: documentId };

      const document = await Document.findOne(query);
      if (!document) {
        return errorResponse(res, 'Document not found', { code: 'NOT_FOUND' }, 404);
      }

      const results = await validationService.validateExtractedData({
        document,
        extractedData: document.extractedData,
        fieldConfidence: document.fieldConfidence,
        overallConfidence: document.overallConfidence,
      });

      document.validationResults = results;
      await document.save();

      return successResponse(res, 'Cross-validation executed successfully', { results }, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ValidationController();
