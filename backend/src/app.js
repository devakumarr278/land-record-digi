const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/environment');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const documentRoutes = require('./routes/document.routes');
const processingRoutes = require('./routes/processing.routes');
const validationRoutes = require('./routes/validation.routes');
const gisRoutes = require('./routes/gis.routes');
const discrepancyRoutes = require('./routes/discrepancy.routes');
const caseRoutes = require('./routes/case.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditRoutes = require('./routes/audit.routes');
const demoRoutes = require('./routes/demo.routes');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();

// CORS Configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Standard Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads route (for viewing preview files securely)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger / OpenAPI Documentation Route
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'BHOOMI AI — API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { font-family: sans-serif; color: #1e3a8a }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
    },
  })
);

// Raw OpenAPI JSON Schema
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'BHOOMI AI Backend',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/processing', processingRoutes);
app.use('/api/v1/validation', validationRoutes);
app.use('/api/v1/gis', gisRoutes);
app.use('/api/v1/discrepancies', discrepancyRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/demo', demoRoutes);

// 404 Catch-all handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on BHOOMI AI server`,
    error: {
      code: 'ROUTE_NOT_FOUND',
      details: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
