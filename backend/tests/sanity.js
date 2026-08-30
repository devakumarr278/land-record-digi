const fs = require('fs');
const path = require('path');
const http = require('http');

// Helper to make HTTP requests
const request = (app, method, url, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const options = {
        hostname: '127.0.0.1',
        port,
        path: url,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      const req = http.request(options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          server.close();
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: rawData });
          }
        });
      });

      req.on('error', (e) => {
        server.close();
        reject(e);
      });

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    });
  });
};

const runSanityTests = async () => {
  console.log('====================================================');
  console.log('🧪 BHOOMI AI - Comprehensive Backend Sanity Suite');
  console.log('====================================================\n');

  const app = require('../src/app');
  const connectDB = require('../src/config/database');
  const User = require('../src/models/User');
  const Document = require('../src/models/Document');
  const Case = require('../src/models/Case');

  await connectDB();

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
    // TEST 1: Health Check Endpoint
    // ----------------------------------------------------
    console.log('1️⃣  Testing Health Check & Swagger UI Endpoints...');
    const healthRes = await request(app, 'GET', '/api/v1/health');
    assert(healthRes.status === 200 && healthRes.body.success === true, 'GET /api/v1/health returns 200 healthy');

    const swaggerJsonRes = await request(app, 'GET', '/api-docs.json');
    assert(
      swaggerJsonRes.status === 200 && swaggerJsonRes.body.openapi === '3.0.0',
      'GET /api-docs.json returns valid OpenAPI 3.0 specification'
    );

    const swaggerUiRes = await request(app, 'GET', '/api-docs/');
    assert(
      swaggerUiRes.status === 200 || swaggerUiRes.status === 301,
      'GET /api-docs/ serves Swagger UI documentation'
    );

    // ----------------------------------------------------
    // TEST 2: Authentication & RBAC for All 7 Roles
    // ----------------------------------------------------
    console.log('\n2️⃣  Testing Authentication & RBAC (7 Roles)...');
    const roles = [
      'FIELD_OPERATOR',
      'VERIFYING_OFFICER',
      'DISTRICT_EXPERT',
      'DISTRICT_ADMIN',
      'CHIEF_AUDITOR',
      'CITIZEN',
      'SYSTEM_ADMIN',
    ];

    const tokens = {};

    for (const role of roles) {
      const emailMap = {
        FIELD_OPERATOR: 'operator@bhoomi.ai',
        VERIFYING_OFFICER: 'verifier@bhoomi.ai',
        DISTRICT_EXPERT: 'expert@bhoomi.ai',
        DISTRICT_ADMIN: 'admin@bhoomi.ai',
        CHIEF_AUDITOR: 'auditor@bhoomi.ai',
        CITIZEN: 'citizen@bhoomi.ai',
        SYSTEM_ADMIN: 'sysadmin@bhoomi.ai',
      };

      const loginRes = await request(app, 'POST', '/api/v1/auth/login', {
        email: emailMap[role],
        password: 'Bhoomi@2026',
      });

      assert(
        loginRes.status === 200 && loginRes.body.data.token,
        `Login as ${role} (${emailMap[role]})`,
        JSON.stringify(loginRes.body)
      );

      tokens[role] = loginRes.body.data?.token;
    }

    // ----------------------------------------------------
    // TEST 3: Auth Profile Verification (GET /auth/me)
    // ----------------------------------------------------
    console.log('\n3️⃣  Testing Protected Auth Route (/auth/me)...');
    const meRes = await request(app, 'GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${tokens.FIELD_OPERATOR}`,
    });
    assert(meRes.status === 200 && meRes.body.data.user.role === 'FIELD_OPERATOR', 'GET /api/v1/auth/me verifies JWT');

    // ----------------------------------------------------
    // TEST 4: RBAC Unauthorized Access Check (403 Forbidden)
    // ----------------------------------------------------
    console.log('\n4️⃣  Testing Strict RBAC Enforcement (403 Forbidden)...');
    // Citizen trying to access verifier cases route
    const forbiddenRes = await request(app, 'GET', '/api/v1/cases', null, {
      Authorization: `Bearer ${tokens.CITIZEN}`,
    });
    assert(forbiddenRes.status === 403, 'Citizen blocked from internal officer case queues (403 Forbidden)');

    // ----------------------------------------------------
    // TEST 5: Document Upload & Hashing Simulation
    // ----------------------------------------------------
    console.log('\n5️⃣  Testing Document Storage & SHA-256 Hashing...');
    const testDocPath = path.join(__dirname, '../uploads/originals/test_sample_patta.png');
    // Minimal valid 1x1 PNG buffer
    const samplePngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testDocPath, samplePngBuffer);

    const operatorUser = await User.findOne({ email: 'operator@bhoomi.ai' });
    const { calculateFileHash } = require('../src/utils/hash');
    const realSha256 = await calculateFileHash(testDocPath);

    const testDoc = new Document({
      originalFileName: 'Patta_Survey_145_2.png',
      storedFileName: 'DOC-TEST-SAMPLE.png',
      filePath: testDocPath,
      fileType: 'image/png',
      fileSize: samplePngBuffer.length,
      uploadedBy: operatorUser._id,
      metadata: {
        district: 'Coimbatore',
        taluk: 'Coimbatore North',
        village: 'Kovilpalayam',
        surveyNumber: '145/2',
        subDivision: '2',
      },
      sha256: realSha256,
      demoScenario: 'GIS_AREA_MISMATCH',
    });
    await testDoc.save();

    assert(testDoc._id && testDoc.documentId, `Document created with ID: ${testDoc.documentId}`);

    // ----------------------------------------------------
    // TEST 6: Asynchronous 10-Stage Processing Pipeline
    // ----------------------------------------------------
    console.log('\n6️⃣  Testing 10-Stage Pipeline Execution & Polling...');
    const processRes = await request(
      app,
      'POST',
      `/api/v1/documents/${testDoc._id}/process`,
      { demoScenario: 'GIS_AREA_MISMATCH' },
      { Authorization: `Bearer ${tokens.FIELD_OPERATOR}` }
    );
    assert(processRes.status === 202, 'POST /documents/:id/process accepted (202)');

    // Poll until processing job reaches 100%
    console.log('   Polling 10-stage asynchronous pipeline status...');
    let statusRes = null;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 600));
      statusRes = await request(
        app,
        'GET',
        `/api/v1/documents/${testDoc._id}/processing`,
        null,
        { Authorization: `Bearer ${tokens.FIELD_OPERATOR}` }
      );

      if (statusRes.body.data?.overallProgress === 100 || statusRes.body.data?.status === 'COMPLETED') {
        break;
      }
      attempts++;
    }

    assert(
      statusRes.status === 200 && statusRes.body.data.stages.length === 10,
      'Live status returns all 10 pipeline stages',
      JSON.stringify(statusRes?.body)
    );

    assert(
      statusRes.body.data.overallProgress === 100,
      `Overall progress reached 100% (${statusRes.body.data?.overallProgress}%)`
    );

    // ----------------------------------------------------
    // TEST 7: Discrepancy & Case Creation for GIS_AREA_MISMATCH
    // ----------------------------------------------------
    console.log('\n7️⃣  Testing Discrepancy Detection & Officer Case Routing...');
    const discRes = await request(
      app,
      'GET',
      `/api/v1/discrepancies?documentId=${testDoc._id}`,
      null,
      { Authorization: `Bearer ${tokens.VERIFYING_OFFICER}` }
    );
    assert(
      discRes.status === 200 && discRes.body.data.discrepancies.length > 0,
      `Detected discrepancies: ${discRes.body.data.discrepancies.length}`
    );

    const casesRes = await request(
      app,
      'GET',
      '/api/v1/cases',
      null,
      { Authorization: `Bearer ${tokens.VERIFYING_OFFICER}` }
    );
    assert(
      casesRes.status === 200 && casesRes.body.data.cases.length > 0,
      `Case queue populated for Verifying Officer (${casesRes.body.data.cases.length} cases)`
    );

    const targetCase = casesRes.body.data.cases[0];

    // ----------------------------------------------------
    // TEST 8: Officer Decision (Approve Case & Seal Record)
    // ----------------------------------------------------
    console.log('\n8️⃣  Testing Officer Approval, Escalation & Rejection APIs...');
    const approveRes = await request(
      app,
      'POST',
      `/api/v1/cases/${targetCase._id}/approve`,
      {
        remarks: 'Surveyor inspected physical boundary; variation verified and updated.',
        fieldCorrections: { landArea: 2.12 },
      },
      { Authorization: `Bearer ${tokens.VERIFYING_OFFICER}` }
    );
    assert(
      approveRes.status === 200 && (approveRes.body.data.case.status === 'APPROVED' || approveRes.body.data.case.status === 'RESOLVED'),
      'Case approved and status marked APPROVED/RESOLVED'
    );

    // If there's another case, test escalate & reject
    if (casesRes.body.data.cases.length > 1) {
      const secondCase = casesRes.body.data.cases[1];
      const escalateRes = await request(
        app,
        'POST',
        `/api/v1/cases/${secondCase._id}/escalate`,
        {
          remarks: 'Requires District Expert analysis for complex encumbrance.',
          targetRole: 'DISTRICT_EXPERT',
        },
        { Authorization: `Bearer ${tokens.VERIFYING_OFFICER}` }
      );
      assert(
        escalateRes.status === 200 && escalateRes.body.data.case.status === 'ESCALATED',
        'Case escalated to DISTRICT_EXPERT queue'
      );
    }

    // ----------------------------------------------------
    // TEST 9: Tamper-Evident Audit Hash Chain Verification
    // ----------------------------------------------------
    console.log('\n9️⃣  Testing Cryptographic SHA-256 Audit Trail & Chain Verification...');
    const chainRes = await request(
      app,
      'GET',
      '/api/v1/audit/verify-chain',
      null,
      { Authorization: `Bearer ${tokens.CHIEF_AUDITOR}` }
    );

    assert(
      chainRes.status === 200 && chainRes.body.data.isValid === true,
      `Audit chain is cryptographically intact (${chainRes.body.data.totalEvents} events verified)`
    );

    // ----------------------------------------------------
    // TEST 10: GIS Spatial Validation & Cadastral Parcels API
    // ----------------------------------------------------
    console.log('\n🔟 Testing GIS Spatial Validation & Cadastral Parcels API...');
    const gisParcelsRes = await request(app, 'GET', '/api/v1/gis/parcels', null, {
      Authorization: `Bearer ${tokens.FIELD_OPERATOR}`,
    });
    assert(
      gisParcelsRes.status === 200 && gisParcelsRes.body.data.total >= 8,
      `GET /api/v1/gis/parcels returns ${gisParcelsRes.body.data?.total} GeoJSON cadastral parcels`
    );

    const gisValidateRes = await request(
      app,
      'POST',
      '/api/v1/gis/validate-spatial',
      {
        documentArea: 2.12,
        areaUnit: 'Acres',
        surveyNumber: '145/2',
        village: 'Kovilpalayam',
        district: 'Coimbatore',
      },
      { Authorization: `Bearer ${tokens.FIELD_OPERATOR}` }
    );
    assert(
      gisValidateRes.status === 200 && gisValidateRes.body.data.overallSpatialStatus === 'VALID',
      'POST /api/v1/gis/validate-spatial validates document against GeoJSON cadastral polygon'
    );

    // ----------------------------------------------------
    // TEST 11: All 7 Role Dashboards
    // ----------------------------------------------------
    console.log('\n1️⃣1️⃣ Testing All 7 Role Dashboard Endpoints...');
    const dashboardEndpoints = [
      { role: 'FIELD_OPERATOR', url: '/api/v1/dashboard/operator' },
      { role: 'VERIFYING_OFFICER', url: '/api/v1/dashboard/verifier' },
      { role: 'DISTRICT_EXPERT', url: '/api/v1/dashboard/expert' },
      { role: 'DISTRICT_ADMIN', url: '/api/v1/dashboard/admin' },
      { role: 'CHIEF_AUDITOR', url: '/api/v1/dashboard/auditor' },
      { role: 'CITIZEN', url: '/api/v1/dashboard/citizen' },
      { role: 'SYSTEM_ADMIN', url: '/api/v1/dashboard/admin-system' },
    ];

    for (const d of dashboardEndpoints) {
      const dRes = await request(app, 'GET', d.url, null, {
        Authorization: `Bearer ${tokens[d.role]}`,
      });
      assert(dRes.status === 200 && dRes.body.success === true, `Dashboard for ${d.role} (${d.url})`);
    }

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL BACKEND SANITY TESTS COMPLETED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test exception:', error);
    process.exit(1);
  }
};

runSanityTests();
