const gisService = require('../src/services/gisValidation.service');

async function runGISTests() {
  console.log('====================================================');
  console.log('🗺️  BHOOMI AI - GIS Spatial Validation Test Suite');
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
    // TEST 1: Parcel Found Successfully
    // ----------------------------------------------------
    console.log('1️⃣  Testing Parcel Lookup (Found)...');
    const parcel = await gisService.findParcel({
      surveyNumber: '145/2',
      village: 'Kovilpalayam',
      taluk: 'Coimbatore North',
      district: 'Coimbatore',
    });
    assert(
      parcel && parcel.properties.surveyNumber === '145/2',
      'Parcel found successfully in GeoJSON dataset (145/2 Kovilpalayam)',
      JSON.stringify(parcel?.properties)
    );

    // ----------------------------------------------------
    // TEST 2: Parcel Not Found
    // ----------------------------------------------------
    console.log('\n2️⃣  Testing Parcel Lookup (Not Found)...');
    const missingParcel = await gisService.findParcel({
      surveyNumber: '9999/99',
      village: 'NonExistentVillage',
      district: 'Nowhere',
    });
    assert(missingParcel === null, 'Non-existent parcel returns null gracefully');

    // ----------------------------------------------------
    // TEST 3: Turf.js Geodesic Polygon Area Calculation
    // ----------------------------------------------------
    console.log('\n3️⃣  Testing Turf.js Polygon Area Calculation...');
    const calculatedArea = gisService.calculatePolygonArea(parcel);
    assert(
      calculatedArea.sqm > 8000 && calculatedArea.acres >= 2.0,
      `Turf.js calculated area: ${calculatedArea.sqm} sqm (${calculatedArea.acres} Acres)`,
      JSON.stringify(calculatedArea)
    );

    // ----------------------------------------------------
    // TEST 4: Exact Area Match (0.0% variance)
    // ----------------------------------------------------
    console.log('\n4️⃣  Testing Exact Area Match (2.12 Acres)...');
    const exactAreaResult = gisService.validateArea(2.12, 'Acres', 8579.34);
    assert(
      exactAreaResult.status === 'MATCH' && exactAreaResult.variancePercentage <= 0.5,
      `Exact area match: variance ${exactAreaResult.variancePercentage}%, status ${exactAreaResult.status}`
    );

    // ----------------------------------------------------
    // TEST 5: Area Within Threshold (1.4% variance -> MATCH / WARNING)
    // ----------------------------------------------------
    console.log('\n5️⃣  Testing Area Within Permissible Threshold (2.15 Acres)...');
    const withinThresholdResult = gisService.validateArea(2.15, 'Acres', 8579.34);
    assert(
      withinThresholdResult.variancePercentage < 5.0 && (withinThresholdResult.status === 'MATCH' || withinThresholdResult.status === 'WARNING'),
      `Area within threshold: variance ${withinThresholdResult.variancePercentage}%, status ${withinThresholdResult.status}`
    );

    // ----------------------------------------------------
    // TEST 6: Area Mismatch > 5% (2.45 Acres -> 15.5% variance)
    // ----------------------------------------------------
    console.log('\n6️⃣  Testing Area Mismatch > 5% (2.45 Acres vs 2.12 Acres)...');
    const mismatchResult = gisService.validateArea(2.45, 'Acres', 8579.34);
    assert(
      mismatchResult.status === 'MISMATCH' && mismatchResult.variancePercentage > 5.0 && mismatchResult.severity === 'HIGH',
      `Area mismatch detected: variance ${mismatchResult.variancePercentage}%, status ${mismatchResult.status}, severity ${mismatchResult.severity}`
    );

    // ----------------------------------------------------
    // TEST 7: Boundary Matching (High Similarity)
    // ----------------------------------------------------
    console.log('\n7️⃣  Testing Boundary Matching (High Similarity)...');
    const goodBoundaries = {
      north: 'Survey No. 145/1 and Cart Track',
      south: 'Survey No 145/3 Senthil Land',
      east: 'Kovilpalayam Water Channel',
      west: 'Survey No 144 Odai Poramboke',
    };
    const boundaryResult = gisService.validateBoundaries(goodBoundaries, parcel.properties);
    assert(
      boundaryResult.overallBoundaryMatch >= 85 && boundaryResult.status === 'MATCH',
      `Boundary match passed with score: ${boundaryResult.overallBoundaryMatch}%, status ${boundaryResult.status}`
    );

    // ----------------------------------------------------
    // TEST 8: Boundary Mismatch (< 60% Similarity)
    // ----------------------------------------------------
    console.log('\n8️⃣  Testing Boundary Mismatch (< 60% Similarity)...');
    const badBoundaries = {
      north: 'National Highway 47',
      south: 'Railway Line Junction',
      east: 'Commercial Complex',
      west: 'Private Factory',
    };
    const badBoundaryResult = gisService.validateBoundaries(badBoundaries, parcel.properties);
    assert(
      badBoundaryResult.overallBoundaryMatch < 60 || badBoundaryResult.status === 'MISMATCH',
      `Boundary mismatch correctly flagged: score ${badBoundaryResult.overallBoundaryMatch}%, status ${badBoundaryResult.status}`
    );

    // ----------------------------------------------------
    // TEST 9: Full Document Spatial Validation Record
    // ----------------------------------------------------
    console.log('\n9️⃣  Testing Full Document Spatial Validation Execution...');
    const fullReport = await gisService.validateSpatialRecord({
      document: {
        metadata: { surveyNumber: '145/2', village: 'Kovilpalayam', district: 'Coimbatore' },
      },
      extractedData: {
        surveyNumber: '145/2',
        subDivision: '2',
        village: 'Kovilpalayam',
        taluk: 'Coimbatore North',
        district: 'Coimbatore',
        landArea: 2.12,
        areaUnit: 'Acres',
        boundaries: goodBoundaries,
      },
    });

    assert(
      fullReport.success === true && fullReport.parcelFound === true && fullReport.overallSpatialStatus === 'VALID',
      `Full spatial report: status ${fullReport.overallSpatialStatus}, parcel ${fullReport.parcelId}`
    );

    console.log('\n====================================================');
    console.log(`📊 GIS TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL GIS SPATIAL VALIDATION TESTS PASSED!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal GIS test error:', error);
    process.exit(1);
  }
}

runGISTests();
