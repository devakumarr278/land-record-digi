const express = require('express');
const router = express.Router();
const validationController = require('../controllers/validation.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../utils/constants');

router.post(
  '/validate/:documentId',
  authenticate,
  authorize(ROLES.FIELD_OPERATOR, ROLES.VERIFYING_OFFICER, ROLES.DISTRICT_EXPERT, ROLES.SYSTEM_ADMIN),
  (req, res, next) => validationController.validateDocument(req, res, next)
);

module.exports = router;
