require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bhoomi_ai',
  JWT_SECRET: process.env.JWT_SECRET || 'bhoomi_ai_sih_2026_super_secure_secret_key_892348712398',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Validation thresholds
  AREA_VARIANCE_THRESHOLD_PERCENT: parseFloat(process.env.AREA_VARIANCE_THRESHOLD_PERCENT) || 5.0,
  LOW_CONFIDENCE_THRESHOLD: parseFloat(process.env.LOW_CONFIDENCE_THRESHOLD) || 0.75,
  CRITICAL_CONFIDENCE_THRESHOLD: parseFloat(process.env.CRITICAL_CONFIDENCE_THRESHOLD) || 0.50,
};
