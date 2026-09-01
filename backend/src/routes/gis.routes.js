const express = require('express');
const router = express.Router();
const gisController = require('../controllers/gis.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../utils/constants');

// Validate spatial record for document (POST /api/v1/gis/validate-spatial)
router.post(
  '/validate-spatial',
  authenticate,
  (req, res, next) => gisController.validateSpatial(req, res, next)
);

// Backward compatible endpoint (POST /api/v1/gis/validate/:documentId)
router.post(
  '/validate/:documentId',
  authenticate,
  authorize(ROLES.FIELD_OPERATOR, ROLES.VERIFYING_OFFICER, ROLES.DISTRICT_EXPERT, ROLES.SYSTEM_ADMIN),
  (req, res, next) => gisController.validateSpatial(req, res, next)
);

// Get cadastral reference parcels (GET /api/v1/gis/parcels)
router.get('/parcels', authenticate, (req, res, next) => gisController.getParcels(req, res, next));

// Get single parcel by ID (GET /api/v1/gis/parcels/:id)
router.get('/parcels/:id', authenticate, (req, res, next) => gisController.getParcelById(req, res, next));

// Save and Get GCP points for a document
router.post('/gcps/:docId', authenticate, (req, res, next) => gisController.saveDocGcps(req, res, next));
router.get('/gcps/:docId', authenticate, (req, res, next) => gisController.getDocGcps(req, res, next));

module.exports = router;
