const express = require('express');
const router = express.Router();
const { DEMO_SCENARIOS } = require('../utils/constants');
const { successResponse } = require('../utils/apiResponse');

const SCENARIO_DETAILS = {
  CLEAN_RECORD: {
    name: 'Clean Record (Auto-Approval)',
    description: 'Document has high OCR confidence (>90%) and perfectly matches reference parcel. Auto-seals without discrepancy.',
    expectedOutcome: 'Status: COMPLETED, Discrepancies: 0, Auto-Sealed',
  },
  LOW_CONFIDENCE: {
    name: 'Low OCR Confidence (<75%)',
    description: 'Degraded document triggers low OCR confidence warnings. Routes to Verifying Officer for field check.',
    expectedOutcome: 'Status: REVIEW_REQUIRED, Flag: LOW_CONFIDENCE, Assigned: VERIFYING_OFFICER',
  },
  OWNERSHIP_CONFLICT: {
    name: 'Ownership Conflict Mismatch',
    description: 'Extracted owner name differs from cadastral registry. Triggers ownership mismatch flag.',
    expectedOutcome: 'Status: REVIEW_REQUIRED, Flag: OWNER_MISMATCH (HIGH), Assigned: VERIFYING_OFFICER',
  },
  GIS_AREA_MISMATCH: {
    name: 'GIS Spatial Area Variance (>5%)',
    description: 'Document claims 2.45 Acres while GIS cadastral boundary measures 2.12 Acres (15.5% variance).',
    expectedOutcome: 'Status: REVIEW_REQUIRED, Stage 8 Flagged, Flag: AREA_MISMATCH (HIGH), Assigned: VERIFYING_OFFICER',
  },
  DUPLICATE_RECORD: {
    name: 'Duplicate Registration Detection',
    description: 'Detects previously registered document for the same survey number.',
    expectedOutcome: 'Status: REVIEW_REQUIRED, Flag: DUPLICATE_RECORD (HIGH), Assigned: DISTRICT_EXPERT',
  },
  BOUNDARY_CONFLICT: {
    name: 'Cadastral Boundary Conflict (FMB)',
    description: 'Cadastral GIS boundary overlap error with adjacent land. Routes to District Cadastral Expert.',
    expectedOutcome: 'Status: REVIEW_REQUIRED, Flag: BOUNDARY_MISMATCH (CRITICAL), Assigned: DISTRICT_EXPERT',
  },
};

router.get('/scenarios', (req, res) => {
  return successResponse(res, 'Available demo scenarios', {
    scenarios: Object.keys(DEMO_SCENARIOS),
    details: SCENARIO_DETAILS,
  });
});

module.exports = router;
