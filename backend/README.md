# BHOOMI AI — Node.js Express Backend Orchestrator

## Overview
The Node.js Express backend serves as the **Central Orchestrator** for BHOOMI AI. It manages user authentication, role-based access control (RBAC), document lifecycle, 10-stage asynchronous pipeline execution, cadastral validation, GIS spatial analysis, human officer decision workflows, cryptographic SHA-256 audit trails, and role-specific analytics dashboards.

---

## 🛠️ Architecture & Technologies
- **Runtime**: Node.js v18+ / v22+
- **Framework**: Express.js
- **Database**: MongoDB (Local or Atlas) via Mongoose
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **File Storage**: Local immutable directory storage in `uploads/originals/` with SHA-256 integrity hashing
- **Microservice Client**: Axios communicating with Python FastAPI AI Service on port 8000

---

## ⚙️ Environment Variables (`.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bhoomi_ai
JWT_SECRET=bhoomi_ai_sih_2026_super_secure_secret_key_892348712398
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
MAX_FILE_SIZE=10485760
AREA_VARIANCE_THRESHOLD_PERCENT=5
LOW_CONFIDENCE_THRESHOLD=0.75
CRITICAL_CONFIDENCE_THRESHOLD=0.50
NODE_ENV=development
```

---

## 👥 Pre-seeded RBAC Accounts
Password for all development accounts: **`Bhoomi@2026`**

| Role | Email | Name / Function |
|:---|:---|:---|
| `FIELD_OPERATOR` | `operator@bhoomi.ai` | Document upload, ingestion, and trigger processing |
| `VERIFYING_OFFICER` | `verifier@bhoomi.ai` | Field verification, standard discrepancy resolution, approvals |
| `DISTRICT_EXPERT` | `expert@bhoomi.ai` | Critical conflicts, cadastral GIS boundary reviews |
| `DISTRICT_ADMIN` | `admin@bhoomi.ai` | District analytics, officer workload, policy reporting |
| `CHIEF_AUDITOR` | `auditor@bhoomi.ai` | Cryptographic SHA-256 audit trail & chain verification |
| `CITIZEN` | `citizen@bhoomi.ai` | Self-record tracking and deed verification status |
| `SYSTEM_ADMIN` | `sysadmin@bhoomi.ai` | System health, user management, configuration |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
# Or for production:
npm start
```

### 4. Open Swagger UI API Documentation
Open **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)** in your browser for interactive API testing, schema exploration, and authorization.

### 5. Run Sanity Verification Test Suite
```bash
npm test
```

---

## 📋 API Endpoints Summary

### Authentication
- `POST /api/v1/auth/login` - Login & obtain JWT
- `GET  /api/v1/auth/me` - Get profile of authenticated user

### Document Management
- `POST /api/v1/documents/upload` - Upload land document (PDF/PNG/JPG)
- `GET  /api/v1/documents` - List documents (supports pagination & filtering)
- `GET  /api/v1/documents/:id` - Get document details
- `GET  /api/v1/documents/:id/download` - Download original document
- `POST /api/v1/documents/:id/reprocess` - Reprocess document

### 10-Stage Processing Pipeline
- `POST /api/v1/documents/:id/process` - Asynchronously start 10-stage processing
- `GET  /api/v1/documents/:id/processing` - Live status polling for frontend UI
- `GET  /api/v1/processing/jobs/:jobId` - Processing job details

### Validation & GIS
- `POST /api/v1/validation/validate/:documentId` - Execute cross-validation
- `POST /api/v1/gis/validate/:documentId` - Execute spatial GIS analysis
- `GET  /api/v1/gis/parcels` - Browse cadastral reference parcels & GeoJSON polygons

### Discrepancy & Case Management
- `GET  /api/v1/discrepancies` - List all detected discrepancies
- `GET  /api/v1/cases` - List officer review cases
- `GET  /api/v1/cases/:id` - Case details & discrepancy breakdown
- `POST /api/v1/cases/:id/assign` - Assign case to officer
- `POST /api/v1/cases/:id/approve` - Approve case & seal document record
- `POST /api/v1/cases/:id/reject` - Reject case
- `POST /api/v1/cases/:id/escalate` - Escalate case to District Expert

### Tamper-Evident Audit Trail
- `GET /api/v1/audit` - List chronological audit records
- `GET /api/v1/audit/document/:documentId` - Document provenance timeline
- `GET /api/v1/audit/verify-chain` - Verify cryptographic SHA-256 hash chain

### Role Dashboards
- `GET /api/v1/dashboard/operator`
- `GET /api/v1/dashboard/verifier`
- `GET /api/v1/dashboard/expert`
- `GET /api/v1/dashboard/admin`
- `GET /api/v1/dashboard/auditor`
- `GET /api/v1/dashboard/citizen`
- `GET /api/v1/dashboard/admin-system`

### Health & Demo Scenarios
- `GET /api/v1/health` - Server health status
- `GET /api/v1/demo/scenarios` - Available demo test scenarios
