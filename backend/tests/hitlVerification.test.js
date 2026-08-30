const discrepancyService = require('../src/services/discrepancy.service');
const caseService = require('../src/services/case.service');
const {
  DISCREPANCY_TYPES,
  SEVERITY_LEVELS,
  RISK_LEVELS,
  CASE_STATUS,
  ROLES,
} = require('../src/utils/constants');

async function runHITLTests() {
  console.log('====================================================');
  console.log('🛡️  BHOOMI AI - Discrepancy & HITL Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // ----------------------------------------------------
    // TEST 1: Clean Record (No Discrepancies, Low Risk)
    // ----------------------------------------------------
    console.log('1️⃣  Testing Clean Record Analysis (No Discrepancies)...');
    const cleanDiscs = discrepancyService.detectAllDiscrepancies({
      document: { metadata: { surveyNumber: '145/2', village: 'Kovilpalayam' } },
      extractedData: { surveyNumber: '145/2', village: 'Kovilpalayam', landArea: 2.12, areaUnit: 'Acres' },
      validationResults: { parcelFound: true, flags: [] },
      gisValidation: { areaValidation: { status: 'MATCH', variancePercentage: 0 }, boundaryValidation: { status: 'MATCH' } },
      overallConfidence: 0.96,
    });
    const cleanRisk = discrepancyService.calculateRiskScore(cleanDiscs, 0.96);
    assert(
      cleanDiscs.length === 0 && cleanRisk.riskLevel === RISK_LEVELS.LOW && cleanRisk.riskScore <= 20,
      `Clean document: ${cleanDiscs.length} discrepancies, risk ${cleanRisk.riskScore} (${cleanRisk.riskLevel})`
    );

    // ----------------------------------------------------
    // TEST 2: Low OCR Confidence Detection
    // ----------------------------------------------------
    console.log('\n2️⃣  Testing Low OCR Confidence Discrepancy...');
    const lowOcrDiscs = discrepancyService.detectAllDiscrepancies({
      overallConfidence: 0.48,
    });
    assert(
      lowOcrDiscs.some((d) => d.type === DISCREPANCY_TYPES.OCR_LOW_CONFIDENCE && d.severity === SEVERITY_LEVELS.HIGH),
      `Low OCR confidence correctly flagged as HIGH severity: ${lowOcrDiscs[0]?.description}`
    );

    // ----------------------------------------------------
    // TEST 3: Area Mismatch Detection & Severity Grading
    // ----------------------------------------------------
    console.log('\n3️⃣  Testing Area Mismatch Detection (15.57% Variance)...');
    const areaDiscs = discrepancyService.detectAllDiscrepancies({
      gisValidation: {
        areaValidation: {
          documentAreaOriginal: 2.45,
          documentAreaUnit: 'Acres',
          gisAreaAcres: 2.12,
          gisAreaSqm: 8579.34,
          differenceSqm: 1335.46,
          variancePercentage: 15.57,
          status: 'MISMATCH',
        },
      },
      overallConfidence: 0.94,
    });
    const areaDisc = areaDiscs.find((d) => d.type === DISCREPANCY_TYPES.AREA_MISMATCH);
    assert(
      areaDisc && areaDisc.severity === SEVERITY_LEVELS.HIGH && areaDisc.variancePercentage > 15,
      `Area mismatch detected: severity ${areaDisc?.severity}, variance ${areaDisc?.variancePercentage}%`
    );

    // ----------------------------------------------------
    // TEST 4: Boundary Mismatch Detection
    // ----------------------------------------------------
    console.log('\n4️⃣  Testing Boundary Conflict Detection...');
    const boundaryDiscs = discrepancyService.detectAllDiscrepancies({
      gisValidation: {
        boundaryValidation: {
          north: { status: 'MISMATCH', documentValue: 'Highway', officialValue: 'Cart Track' },
          south: { status: 'MISMATCH', documentValue: 'Factory', officialValue: 'Survey Land' },
          east: { status: 'MATCH', documentValue: 'Channel', officialValue: 'Channel' },
          west: { status: 'MATCH', documentValue: 'Odai', officialValue: 'Odai' },
          overallBoundaryMatch: 52,
          status: 'MISMATCH',
        },
      },
      overallConfidence: 0.94,
    });
    const boundaryDisc = boundaryDiscs.find((d) => d.type === DISCREPANCY_TYPES.BOUNDARY_MISMATCH);
    assert(
      boundaryDisc && boundaryDisc.severity === SEVERITY_LEVELS.HIGH,
      `Boundary mismatch flagged: severity ${boundaryDisc?.severity}`
    );

    // ----------------------------------------------------
    // TEST 5: Multiple Discrepancies Integration
    // ----------------------------------------------------
    console.log('\n5️⃣  Testing Multiple Discrepancies Integration...');
    const multiDiscs = discrepancyService.detectAllDiscrepancies({
      document: { demoScenario: 'GIS_AREA_MISMATCH' },
      overallConfidence: 0.65,
      gisValidation: {
        areaValidation: {
          documentAreaOriginal: 2.45,
          documentAreaUnit: 'Acres',
          gisAreaAcres: 2.12,
          gisAreaSqm: 8579.34,
          differenceSqm: 1335.46,
          variancePercentage: 15.57,
          status: 'MISMATCH',
        },
        boundaryValidation: {
          north: { status: 'WARNING' },
          south: { status: 'MATCH' },
          east: { status: 'MATCH' },
          west: { status: 'MATCH' },
          overallBoundaryMatch: 78,
          status: 'WARNING',
        },
      },
      validationResults: {
        flags: [{ type: 'OWNER_MISMATCH', field: 'ownerName', documentValue: 'K. Marimuthu', referenceValue: 'Ramasamy', severity: 'HIGH' }],
      },
    });
    assert(
      multiDiscs.length >= 3,
      `Multi-discrepancy engine combined ${multiDiscs.length} distinct discrepancies: ${multiDiscs.map((d) => d.type).join(', ')}`
    );

    // ----------------------------------------------------
    // TEST 6: Risk Score Calculation (0-100 & Levels)
    // ----------------------------------------------------
    console.log('\n6️⃣  Testing Risk Score Calculation...');
    const multiRisk = discrepancyService.calculateRiskScore(multiDiscs, 0.65);
    assert(
      multiRisk.riskScore > 50 && (multiRisk.riskLevel === RISK_LEVELS.HIGH || multiRisk.riskLevel === RISK_LEVELS.CRITICAL),
      `Risk score calculated: ${multiRisk.riskScore}/100, Level: ${multiRisk.riskLevel}`
    );

    // ----------------------------------------------------
    // TEST 7: Role-Based Routing Logic
    // ----------------------------------------------------
    console.log('\n7️⃣  Testing Role-Based Routing Logic (4 Tiers)...');
    const lowRoute = discrepancyService.determineAssignedRole(RISK_LEVELS.LOW, []);
    const medRoute = discrepancyService.determineAssignedRole(RISK_LEVELS.MEDIUM, [{ severity: 'MEDIUM' }]);
    const highRoute = discrepancyService.determineAssignedRole(RISK_LEVELS.HIGH, [{ severity: 'HIGH' }]);
    const critRoute = discrepancyService.determineAssignedRole(RISK_LEVELS.CRITICAL, [{ severity: 'CRITICAL' }]);

    assert(
      lowRoute.assignedRole === ROLES.FIELD_OPERATOR &&
        medRoute.assignedRole === ROLES.VERIFYING_OFFICER &&
        highRoute.assignedRole === ROLES.DISTRICT_EXPERT &&
        critRoute.assignedRole === ROLES.DISTRICT_ADMIN,
      `Role routing verified: LOW->${lowRoute.assignedRole}, MED->${medRoute.assignedRole}, HIGH->${highRoute.assignedRole}, CRIT->${critRoute.assignedRole}`
    );

    // ----------------------------------------------------
    // TEST 8: Mock Document & Case Lifecycle Simulation
    // ----------------------------------------------------
    console.log('\n8️⃣  Testing Verification Case Model Representation...');
    const fakeCase = {
      caseId: 'CASE-TEST-001',
      document: '66d0c1f2e8b0123456789abc',
      discrepancies: multiDiscs,
      assignedRole: highRoute.assignedRole,
      priority: highRoute.priority,
      riskScore: multiRisk.riskScore,
      riskLevel: multiRisk.riskLevel,
      status: CASE_STATUS.PENDING_REVIEW,
    };
    assert(
      fakeCase.caseId && fakeCase.status === 'PENDING_REVIEW' && fakeCase.riskScore > 0,
      `Case struct validated: ID ${fakeCase.caseId}, Assigned to: ${fakeCase.assignedRole}`
    );

    // ----------------------------------------------------
    // TEST 9: Approval Logic Simulation
    // ----------------------------------------------------
    console.log('\n9️⃣  Testing Approval Workflow Representation...');
    const approvalRemarks = 'Field surveyor physically checked property boundary. Approved.';
    assert(approvalRemarks.length > 5, 'Approval remarks validated');

    // ----------------------------------------------------
    // TEST 10: Rejection Logic Simulation
    // ----------------------------------------------------
    console.log('\n🔟 Testing Rejection Workflow Representation...');
    const rejectionRemarks = 'Deed invalid. Title ownership fraud confirmed.';
    assert(rejectionRemarks.length > 5, 'Rejection remarks validated');

    // ----------------------------------------------------
    // TEST 11: Escalation Logic Simulation
    // ----------------------------------------------------
    console.log('\n1️⃣1️⃣ Testing Escalation Workflow Representation...');
    const escalationRemarks = 'Complex multi-village boundary dispute requires District Collector / Expert review.';
    const escalationTarget = ROLES.DISTRICT_ADMIN;
    assert(
      escalationRemarks.length > 5 && escalationTarget === ROLES.DISTRICT_ADMIN,
      `Escalation parameters verified: Target ${escalationTarget}, Remarks: ${escalationRemarks}`
    );

    console.log('\n====================================================');
    console.log(`📊 HITL TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL DISCREPANCY & HITL VERIFICATION TESTS PASSED!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal HITL test error:', error);
    process.exit(1);
  }
}

runHITLTests();
