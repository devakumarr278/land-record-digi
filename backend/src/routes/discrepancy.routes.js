const express = require('express');
const router = express.Router();
const discrepancyController = require('../controllers/discrepancy.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../utils/constants');

// List discrepancies
router.get(
  '/',
  authenticate,
  authorize(
    ROLES.FIELD_OPERATOR,
    ROLES.VERIFYING_OFFICER,
    ROLES.DISTRICT_EXPERT,
    ROLES.DISTRICT_ADMIN,
    ROLES.CHIEF_AUDITOR,
    ROLES.SYSTEM_ADMIN
  ),
  (req, res, next) => discrepancyController.getDiscrepancies(req, res, next)
);

// Get single discrepancy
router.get(
  '/:id',
  authenticate,
  authorize(
    ROLES.FIELD_OPERATOR,
    ROLES.VERIFYING_OFFICER,
    ROLES.DISTRICT_EXPERT,
    ROLES.DISTRICT_ADMIN,
    ROLES.CHIEF_AUDITOR,
    ROLES.SYSTEM_ADMIN
  ),
  (req, res, next) => discrepancyController.getDiscrepancyById(req, res, next)
);

module.exports = router;
