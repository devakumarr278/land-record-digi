const express = require('express');
const router = express.Router();
const processingController = require('../controllers/processing.controller');
const authenticate = require('../middleware/authenticate');

router.get('/jobs/:jobId', authenticate, (req, res, next) =>
  processingController.getJobById(req, res, next)
);

router.get('/status/:id', authenticate, (req, res, next) =>
  processingController.getDocumentProcessingStatus(req, res, next)
);

module.exports = router;
