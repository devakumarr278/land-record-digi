const swaggerUi = require('swagger-ui-express');

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BHOOMI AI — Intelligent Land Record Digitization & Validation API',
    version: '1.0.0',
    description: `
**BHOOMI AI Backend Orchestrator**
Intelligent Land Record Digitization, Multilingual OCR, Cadastral Cross-Validation, GIS Spatial Verification, Discrepancy Detection, Officer Routing, and Cryptographic SHA-256 Audit Trail (Smart India Hackathon 2026).

### 🔑 Available Demo Roles & Credentials (Password: \`Bhoomi@2026\`)
- **Field Operator**: \`operator@bhoomi.ai\`
- **Verifying Officer**: \`verifier@bhoomi.ai\`
- **District Revenue Expert**: \`expert@bhoomi.ai\`
- **District Admin**: \`admin@bhoomi.ai\`
- **Chief Auditor**: \`auditor@bhoomi.ai\`
- **Citizen**: \`citizen@bhoomi.ai\`
- **System Admin**: \`sysadmin@bhoomi.ai\`
    `,
    contact: {
      name: 'BHOOMI AI Engineering Team',
      email: 'engineering@bhoomi.ai',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Express Backend Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token obtained from `/api/v1/auth/login` as `Bearer <token>`',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Resource not found or validation failed' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              details: { type: 'string', example: 'Survey number is required' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66d0c1f2e8b0123456789abc' },
          name: { type: 'string', example: 'R. Rajesh' },
          email: { type: 'string', example: 'operator@bhoomi.ai' },
          role: {
            type: 'string',
            enum: ['FIELD_OPERATOR', 'VERIFYING_OFFICER', 'DISTRICT_EXPERT', 'DISTRICT_ADMIN', 'CHIEF_AUDITOR', 'CITIZEN', 'SYSTEM_ADMIN'],
            example: 'FIELD_OPERATOR',
          },
          district: { type: 'string', example: 'Coimbatore' },
          taluk: { type: 'string', example: 'Coimbatore North' },
        },
      },
      Document: {
        type: 'object',
        properties: {
          documentId: { type: 'string', example: 'DOC-8CB21096' },
          originalFileName: { type: 'string', example: 'Patta_Survey_145_2.pdf' },
          status: {
            type: 'string',
            enum: ['STORED', 'PREPROCESSING', 'EXTRACTING', 'EXTRACTED', 'VALIDATING', 'REVIEW_REQUIRED', 'COMPLETED', 'REJECTED', 'FAILED'],
            example: 'COMPLETED',
          },
          sha256: { type: 'string', example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
          documentType: { type: 'string', example: 'PATTA' },
          ocrResult: { type: 'string', example: 'தமிழ்நாடு அரசு வருவாய்த்துறை பட்டா எண் 1042...' },
          extractedData: {
            type: 'object',
            properties: {
              surveyNumber: { type: 'string', example: '145/2' },
              subDivision: { type: 'string', example: '2' },
              ownerName: { type: 'string', example: 'Ramasamy Gounder' },
              fatherName: { type: 'string', example: 'Marappa Gounder' },
              village: { type: 'string', example: 'Kovilpalayam' },
              taluk: { type: 'string', example: 'Coimbatore North' },
              district: { type: 'string', example: 'Coimbatore' },
              landArea: { type: 'number', example: 2.12 },
              areaUnit: { type: 'string', example: 'Acres' },
              classification: { type: 'string', example: 'Ryotwari Nanjai (Wet Land)' },
              boundaries: {
                type: 'object',
                properties: {
                  north: { type: 'string', example: 'East-West Main Cart Track' },
                  south: { type: 'string', example: 'Survey No 145/3 Senthil Land' },
                  east: { type: 'string', example: 'Kovilpalayam Water Channel' },
                  west: { type: 'string', example: 'Survey No 144 Odai Poramboke' },
                },
              },
            },
          },
          overallConfidence: { type: 'number', example: 0.94 },
        },
      },
      ProcessingJobStatus: {
        type: 'object',
        properties: {
          documentId: { type: 'string', example: 'DOC-8CB21096' },
          jobId: { type: 'string', example: 'JOB-91D0E44A' },
          overallProgress: { type: 'number', example: 100 },
          currentStage: { type: 'string', example: 'Completed' },
          status: { type: 'string', example: 'COMPLETED' },
          stages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                stageNumber: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Document Ingestion & Integrity Hashing' },
                status: { type: 'string', example: 'COMPLETED' },
                progress: { type: 'integer', example: 100 },
              },
            },
          },
        },
      },
      Discrepancy: {
        type: 'object',
        properties: {
          discrepancyId: { type: 'string', example: 'DISC-B8E5F012' },
          type: { type: 'string', example: 'GIS_AREA_MISMATCH' },
          field: { type: 'string', example: 'landArea' },
          documentValue: { type: 'string', example: '2.45' },
          referenceValue: { type: 'string', example: '2.12' },
          variancePercentage: { type: 'number', example: 15.5 },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
          status: { type: 'string', enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'WAIVED', 'OVERRULED'], example: 'OPEN' },
        },
      },
      Case: {
        type: 'object',
        properties: {
          caseId: { type: 'string', example: 'CASE-77B1A04C' },
          status: { type: 'string', enum: ['OPEN', 'ASSIGNED', 'IN_REVIEW', 'ESCALATED', 'RESOLVED', 'REJECTED'], example: 'OPEN' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], example: 'HIGH' },
          assignedRole: { type: 'string', example: 'VERIFYING_OFFICER' },
        },
      },
      AuditChainStatus: {
        type: 'object',
        properties: {
          isValid: { type: 'boolean', example: true },
          totalEvents: { type: 'integer', example: 56 },
          message: { type: 'string', example: 'Audit chain verified successfully. 56 events are cryptographically intact and tamper-evident.' },
        },
      },
    },
  },
  tags: [
    { name: 'System & Health', description: 'Server health and connectivity' },
    { name: 'Authentication & RBAC', description: 'JWT authentication, user registration, and 7-role access control' },
    { name: 'Document Management', description: 'Document upload, metadata hashing, and record querying' },
    { name: 'Processing Pipeline', description: '10-stage asynchronous pipeline execution and live progress polling' },
    { name: 'Cadastral Registry Validation', description: 'Cross-verification against official government revenue records' },
    { name: 'GIS Spatial Validation', description: 'Cadastral GIS polygon area, boundary, and threshold validation' },
    { name: 'Discrepancies', description: 'Conflict detection, variance computation, and severity grading' },
    { name: 'Case Management & Review', description: 'Officer verification queue, approve, reject, and escalation workflows' },
    { name: 'Cryptographic Audit Trail', description: 'Tamper-evident SHA-256 blockchain-style provenance verification' },
    { name: 'Role Dashboards', description: 'Tailored metrics and queues for each of the 7 user roles' },
    { name: 'Demo Scenarios', description: 'Pre-configured hackathon demo scenarios & quick simulations' },
  ],
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['System & Health'],
        summary: 'Backend Health Check',
        description: 'Returns server uptime, health status, and environment info.',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Authentication & RBAC'],
        summary: 'Register a New User',
        description: 'Creates a new user with assigned role and jurisdiction.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string', example: 'R. Rajesh' },
                  email: { type: 'string', example: 'operator2@bhoomi.ai' },
                  password: { type: 'string', example: 'Bhoomi@2026' },
                  role: { type: 'string', enum: ['FIELD_OPERATOR', 'VERIFYING_OFFICER', 'DISTRICT_EXPERT', 'DISTRICT_ADMIN', 'CHIEF_AUDITOR', 'CITIZEN', 'SYSTEM_ADMIN'], example: 'FIELD_OPERATOR' },
                  district: { type: 'string', example: 'Coimbatore' },
                  taluk: { type: 'string', example: 'Coimbatore North' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error or email already in use' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication & RBAC'],
        summary: 'Login & Obtain JWT Token',
        description: 'Authenticates user credentials and returns JWT Bearer token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'operator@bhoomi.ai' },
                  password: { type: 'string', example: 'Bhoomi@2026' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful, returns JWT token and user info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Authentication & RBAC'],
        summary: 'Get Current Authenticated User',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile retrieved successfully' },
          401: { description: 'Unauthorized — missing or invalid token' },
        },
      },
    },
    '/api/v1/documents/upload': {
      post: {
        tags: ['Document Management'],
        summary: 'Upload Land Record Document',
        security: [{ BearerAuth: [] }],
        description: 'Upload a PDF or image file with metadata. Computes SHA-256 integrity hash and initializes processing job.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary', description: 'PDF or Image file (.pdf, .png, .jpg, .jpeg)' },
                  district: { type: 'string', example: 'Coimbatore' },
                  taluk: { type: 'string', example: 'Coimbatore North' },
                  village: { type: 'string', example: 'Kovilpalayam' },
                  surveyNumber: { type: 'string', example: '145/2' },
                  documentType: { type: 'string', example: 'PATTA' },
                  demoScenario: { type: 'string', example: 'GIS_AREA_MISMATCH', description: 'Optional demo scenario trigger' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Document uploaded and hashed successfully' },
          400: { description: 'Invalid file type or missing required fields' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/documents': {
      get: {
        tags: ['Document Management'],
        summary: 'List All Documents',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'documentType', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Documents retrieved successfully' },
        },
      },
    },
    '/api/v1/documents/{id}': {
      get: {
        tags: ['Document Management'],
        summary: 'Get Document Details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'DOC-8CB21096' }],
        responses: {
          200: { description: 'Document details retrieved' },
          404: { description: 'Document not found' },
        },
      },
    },
    '/api/v1/documents/{id}/process': {
      post: {
        tags: ['Processing Pipeline'],
        summary: 'Trigger 10-Stage Pipeline for Document',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'DOC-8CB21096' }],
        responses: {
          202: { description: 'Pipeline execution initiated asynchronously' },
          404: { description: 'Document not found' },
        },
      },
    },
    '/api/v1/documents/{id}/processing': {
      get: {
        tags: ['Processing Pipeline'],
        summary: 'Poll Live 10-Stage Pipeline Status',
        security: [{ BearerAuth: [] }],
        description: 'Returns real-time milestone progress (0% to 100%) and stage results for the frontend live progress bar.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'DOC-8CB21096' }],
        responses: {
          200: {
            description: 'Live processing job status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProcessingJobStatus' },
              },
            },
          },
          404: { description: 'Document or processing job not found' },
        },
      },
    },
    '/api/v1/validation/parcels': {
      get: {
        tags: ['Cadastral Registry Validation'],
        summary: 'List Cadastral Reference Parcels',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'village', in: 'query', schema: { type: 'string', example: 'Kovilpalayam' } },
          { name: 'taluk', in: 'query', schema: { type: 'string', example: 'Coimbatore North' } },
          { name: 'district', in: 'query', schema: { type: 'string', example: 'Coimbatore' } },
          { name: 'surveyNumber', in: 'query', schema: { type: 'string', example: '145/2' } },
        ],
        responses: {
          200: { description: 'Parcels retrieved successfully' },
        },
      },
    },
    '/api/v1/gis/parcels': {
      get: {
        tags: ['GIS Spatial Validation'],
        summary: 'List Cadastral Parcels with GeoJSON Coordinates & Turf Metrics',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string', example: 'Coimbatore' } },
          { name: 'village', in: 'query', schema: { type: 'string', example: 'Kovilpalayam' } },
          { name: 'surveyNumber', in: 'query', schema: { type: 'string', example: '145/2' } },
        ],
        responses: {
          200: {
            description: 'GIS cadastral parcels retrieved with Turf calculated area and GeoJSON polygon geometry',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 10 },
                        parcels: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              parcelId: { type: 'string', example: 'TN-CBE-KOV-145-2' },
                              surveyNumber: { type: 'string', example: '145/2' },
                              village: { type: 'string', example: 'Kovilpalayam' },
                              officialAreaSqm: { type: 'number', example: 8579.34 },
                              calculatedArea: {
                                type: 'object',
                                properties: {
                                  sqm: { type: 'number', example: 8579.34 },
                                  acres: { type: 'number', example: 2.12 },
                                  hectares: { type: 'number', example: 0.8579 },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/gis/validate-spatial': {
      post: {
        tags: ['GIS Spatial Validation'],
        summary: 'Validate Document Claimed Area and Boundaries Against GIS Spatial Cadastre',
        security: [{ BearerAuth: [] }],
        description: 'Performs Turf.js polygon geodesic area calculation, unit normalization (Acres/Hectares/Cents/Sqm), variance percentage threshold grading, and fuzzy 4-direction boundary comparison.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  documentId: { type: 'string', example: 'DOC-8CB21096', description: 'MongoDB Document tracking ID' },
                  documentArea: { type: 'number', example: 2.12, description: 'Direct test claimed area' },
                  areaUnit: { type: 'string', example: 'Acres' },
                  surveyNumber: { type: 'string', example: '145/2' },
                  village: { type: 'string', example: 'Kovilpalayam' },
                  district: { type: 'string', example: 'Coimbatore' },
                  boundaries: {
                    type: 'object',
                    properties: {
                      north: { type: 'string', example: 'Survey No. 145/1 and Cart Track' },
                      south: { type: 'string', example: 'Survey No 145/3 Senthil Land' },
                      east: { type: 'string', example: 'Kovilpalayam Water Channel' },
                      west: { type: 'string', example: 'Survey No 144 Odai Poramboke' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Spatial validation report with Turf area, variance %, and boundary similarity',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        parcelFound: { type: 'boolean', example: true },
                        parcel: { type: 'object' },
                        areaValidation: {
                          type: 'object',
                          properties: {
                            documentAreaSqm: { type: 'number', example: 8579.34 },
                            gisAreaSqm: { type: 'number', example: 8579.34 },
                            differenceSqm: { type: 'number', example: 0.0 },
                            variancePercentage: { type: 'number', example: 0.0 },
                            threshold: { type: 'number', example: 5 },
                            status: { type: 'string', enum: ['MATCH', 'WARNING', 'MISMATCH'], example: 'MATCH' },
                          },
                        },
                        boundaryValidation: {
                          type: 'object',
                          properties: {
                            overallBoundaryMatch: { type: 'number', example: 94 },
                            status: { type: 'string', example: 'MATCH' },
                          },
                        },
                        overallSpatialStatus: { type: 'string', enum: ['VALID', 'WARNING', 'MISMATCH', 'PARCEL_NOT_FOUND'], example: 'VALID' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/discrepancies': {
      get: {
        tags: ['Discrepancies'],
        summary: 'List All Detected Discrepancies',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'severity', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'WAIVED', 'OVERRULED'] } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Discrepancies retrieved successfully' },
        },
      },
    },
    '/api/v1/cases': {
      get: {
        tags: ['Case Management & Review'],
        summary: 'List Verification Cases for Officer Queue',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] } },
          { name: 'assignedRole', in: 'query', schema: { type: 'string', enum: ['FIELD_OPERATOR', 'VERIFYING_OFFICER', 'DISTRICT_EXPERT', 'DISTRICT_ADMIN'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Cases retrieved successfully' },
        },
      },
    },
    '/api/v1/cases/{id}': {
      get: {
        tags: ['Case Management & Review'],
        summary: 'Get Complete Verification Case Details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'CASE-7A8B9C0D' }],
        responses: {
          200: { description: 'Case details retrieved with document, discrepancies, risk score, and escalation history' },
          404: { description: 'Case not found' },
        },
      },
    },
    '/api/v1/cases/{id}/assign': {
      post: {
        tags: ['Case Management & Review'],
        summary: 'Assign Case to Authenticated Officer',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Case assigned successfully' },
        },
      },
    },
    '/api/v1/cases/{id}/approve': {
      post: {
        tags: ['Case Management & Review'],
        summary: 'Approve Case & Seal Record',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  remarks: { type: 'string', example: 'Surveyor inspected physical boundary; variation verified and updated.' },
                  fieldCorrections: {
                    type: 'object',
                    example: { landArea: 2.12 },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Case approved and record sealed successfully' },
        },
      },
    },
    '/api/v1/cases/{id}/reject': {
      post: {
        tags: ['Case Management & Review'],
        summary: 'Reject Case',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['remarks'],
                properties: {
                  remarks: { type: 'string', example: 'Ownership conflict confirmed with sub-registrar deed.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Case rejected' },
        },
      },
    },
    '/api/v1/cases/{id}/escalate': {
      post: {
        tags: ['Case Management & Review'],
        summary: 'Escalate Case to Expert or Admin',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['remarks'],
                properties: {
                  targetRole: { type: 'string', enum: ['DISTRICT_EXPERT', 'DISTRICT_ADMIN'], example: 'DISTRICT_EXPERT' },
                  remarks: { type: 'string', example: 'Complex boundary encroachment requires revenue expert review.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Case escalated' },
        },
      },
    },
    '/api/v1/audit/logs': {
      get: {
        tags: ['Cryptographic Audit Trail'],
        summary: 'List Cryptographic Audit Logs',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Audit logs retrieved' },
        },
      },
    },
    '/api/v1/audit/verify-chain': {
      get: {
        tags: ['Cryptographic Audit Trail'],
        summary: 'Verify Cryptographic SHA-256 Audit Chain Integrity',
        security: [{ BearerAuth: [] }],
        description: 'Sequentially recalculates chained SHA-256 hashes across all audit log events to verify tamper-evident proof of state.',
        responses: {
          200: {
            description: 'Audit chain verification results',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuditChainStatus' },
              },
            },
          },
        },
      },
    },
    '/api/v1/dashboard/operator': {
      get: {
        tags: ['Role Dashboards'],
        summary: 'Field Operator Dashboard Metrics',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Operator dashboard data' } },
      },
    },
    '/api/v1/dashboard/verifier': {
      get: {
        tags: ['Role Dashboards'],
        summary: 'Verifying Officer Dashboard Metrics',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Verifier dashboard data' } },
      },
    },
    '/api/v1/dashboard/expert': {
      get: {
        tags: ['Role Dashboards'],
        summary: 'District Revenue Expert Dashboard Metrics',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Expert dashboard data' } },
      },
    },
    '/api/v1/dashboard/admin': {
      get: {
        tags: ['Role Dashboards'],
        summary: 'District Admin Dashboard Metrics',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Admin dashboard data' } },
      },
    },
    '/api/v1/dashboard/auditor': {
      get: {
        tags: ['Role Dashboards'],
        summary: 'Chief Auditor Dashboard Metrics',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Auditor dashboard data' } },
      },
    },
    '/api/v1/dashboard/citizen': {
      get: {
        tags: ['Role Dashboards'],
        summary: 'Citizen Portal Dashboard Metrics',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Citizen portal data' } },
      },
    },
    '/api/v1/dashboard/admin-system': {
      get: {
        tags: ['Role Dashboards'],
        summary: 'System Administrator Dashboard Metrics',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'System admin metrics' } },
      },
    },
    '/api/v1/demo/scenarios': {
      get: {
        tags: ['Demo Scenarios'],
        summary: 'List Available Hackathon Demonstration Scenarios',
        responses: { 200: { description: 'Scenarios list' } },
      },
    },
    '/api/v1/demo/trigger-pipeline': {
      post: {
        tags: ['Demo Scenarios'],
        summary: 'Trigger Instant Pipeline Simulation',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  scenario: { type: 'string', enum: ['CLEAN_RECORD', 'LOW_CONFIDENCE', 'OWNERSHIP_CONFLICT', 'GIS_AREA_MISMATCH', 'DUPLICATE_RECORD', 'BOUNDARY_CONFLICT'], example: 'GIS_AREA_MISMATCH' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Simulation completed' } },
      },
    },
  },
};

module.exports = {
  swaggerUi,
  swaggerSpec,
};
