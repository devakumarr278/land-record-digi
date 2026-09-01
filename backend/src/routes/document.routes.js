const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const processingController = require('../controllers/processing.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { ROLES } = require('../utils/constants');

// Upload document
router.post(
  '/upload',
  authenticate,
  authorize(ROLES.FIELD_OPERATOR, ROLES.SYSTEM_ADMIN, ROLES.CITIZEN),
  upload.single('file'),
  (req, res, next) => documentController.uploadDocument(req, res, next)
);

// List documents
router.get('/', authenticate, (req, res, next) => documentController.getDocuments(req, res, next));

// Get document by ID
router.get('/:id', authenticate, (req, res, next) => documentController.getDocumentById(req, res, next));

// Download original document
router.get('/:id/download', authenticate, (req, res, next) => documentController.downloadDocument(req, res, next));

// Reprocess document
router.post(
  '/:id/reprocess',
  authenticate,
  authorize(ROLES.FIELD_OPERATOR, ROLES.SYSTEM_ADMIN, ROLES.VERIFYING_OFFICER),
  (req, res, next) => documentController.reprocessDocument(req, res, next)
);

// Start processing document
router.post(
  '/:id/process',
  authenticate,
  authorize(ROLES.FIELD_OPERATOR, ROLES.SYSTEM_ADMIN, ROLES.VERIFYING_OFFICER),
  (req, res, next) => processingController.processDocument(req, res, next)
);

// Resolve review document
router.post(
  '/:id/resolve',
  authenticate,
  authorize(ROLES.FIELD_OPERATOR, ROLES.SYSTEM_ADMIN, ROLES.VERIFYING_OFFICER),
  (req, res, next) => documentController.resolveReview(req, res, next)
);

// Live processing status polling endpoint
router.get('/:id/processing', authenticate, (req, res, next) =>
  processingController.getDocumentProcessingStatus(req, res, next)
);

// Delete document
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.SYSTEM_ADMIN, ROLES.DISTRICT_ADMIN),
  (req, res, next) => documentController.deleteDocument(req, res, next)
);

module.exports = router;
