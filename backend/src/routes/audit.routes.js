const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../utils/constants');

// List audit logs
router.get(
  '/',
  authenticate,
  authorize(ROLES.CHIEF_AUDITOR, ROLES.SYSTEM_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.FIELD_OPERATOR, ROLES.VERIFYING_OFFICER),
  (req, res, next) => auditController.getAuditLogs(req, res, next)
);

// Cryptographic hash chain verification
router.get(
  '/verify-chain',
  authenticate,
  authorize(ROLES.CHIEF_AUDITOR, ROLES.SYSTEM_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.FIELD_OPERATOR, ROLES.VERIFYING_OFFICER),
  (req, res, next) => auditController.verifyChain(req, res, next)
);

// Document audit history
router.get(
  '/document/:documentId',
  authenticate,
  authorize(
    ROLES.CHIEF_AUDITOR,
    ROLES.SYSTEM_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.VERIFYING_OFFICER,
    ROLES.DISTRICT_EXPERT,
    ROLES.FIELD_OPERATOR
  ),
  (req, res, next) => auditController.getDocumentAuditLogs(req, res, next)
);

module.exports = router;
