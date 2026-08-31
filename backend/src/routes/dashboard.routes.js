const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../utils/constants');

// Field Operator Dashboard
router.get(
  '/operator',
  authenticate,
  authorize(ROLES.FIELD_OPERATOR, ROLES.SYSTEM_ADMIN),
  (req, res, next) => dashboardController.getOperatorDashboard(req, res, next)
);

// Verifying Officer Dashboard
router.get(
  '/verifier',
  authenticate,
  authorize(ROLES.VERIFYING_OFFICER, ROLES.SYSTEM_ADMIN),
  (req, res, next) => dashboardController.getVerifierDashboard(req, res, next)
);

// District Expert Dashboard
router.get(
  '/expert',
  authenticate,
  authorize(ROLES.DISTRICT_EXPERT, ROLES.SYSTEM_ADMIN),
  (req, res, next) => dashboardController.getExpertDashboard(req, res, next)
);

// District Admin Dashboard
router.get(
  '/admin',
  authenticate,
  authorize(ROLES.DISTRICT_ADMIN, ROLES.SYSTEM_ADMIN),
  (req, res, next) => dashboardController.getAdminDashboard(req, res, next)
);

// Chief Auditor Dashboard
router.get(
  '/auditor',
  authenticate,
  authorize(ROLES.CHIEF_AUDITOR, ROLES.SYSTEM_ADMIN),
  (req, res, next) => dashboardController.getAuditorDashboard(req, res, next)
);

// Citizen Dashboard
router.get(
  '/citizen',
  authenticate,
  authorize(ROLES.CITIZEN, ROLES.SYSTEM_ADMIN),
  (req, res, next) => dashboardController.getCitizenDashboard(req, res, next)
);

// System Admin Dashboard
router.get(
  '/admin-system',
  authenticate,
  authorize(ROLES.SYSTEM_ADMIN),
  (req, res, next) => dashboardController.getSystemAdminDashboard(req, res, next)
);

module.exports = router;
