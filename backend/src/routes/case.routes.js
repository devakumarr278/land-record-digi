const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../utils/constants');

// Allowed officer roles for case management
const OFFICER_ROLES = [
  ROLES.VERIFYING_OFFICER,
  ROLES.DISTRICT_EXPERT,
  ROLES.DISTRICT_ADMIN,
  ROLES.SYSTEM_ADMIN,
];

// List cases
router.get('/', authenticate, authorize(...OFFICER_ROLES), (req, res, next) =>
  caseController.getCases(req, res, next)
);

// Get single case
router.get('/:id', authenticate, authorize(...OFFICER_ROLES), (req, res, next) =>
  caseController.getCaseById(req, res, next)
);

// Assign case
router.post('/:id/assign', authenticate, authorize(...OFFICER_ROLES), (req, res, next) =>
  caseController.assignCase(req, res, next)
);

// Approve case
router.post('/:id/approve', authenticate, authorize(...OFFICER_ROLES), (req, res, next) =>
  caseController.approveCase(req, res, next)
);

// Reject case
router.post('/:id/reject', authenticate, authorize(...OFFICER_ROLES), (req, res, next) =>
  caseController.rejectCase(req, res, next)
);

// Escalate case
router.post('/:id/escalate', authenticate, authorize(...OFFICER_ROLES), (req, res, next) =>
  caseController.escalateCase(req, res, next)
);

module.exports = router;
