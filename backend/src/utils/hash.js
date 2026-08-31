const crypto = require('crypto');
const fs = require('fs');

/**
 * Calculate SHA-256 hash of a file on disk
 * @param {string} filePath
 * @returns {Promise<string>}
 */
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Calculate SHA-256 hash for buffer or string
 * @param {string|Buffer} data
 * @returns {string}
 */
const calculateSha256 = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Calculate the next audit block hash in a tamper-evident chain
 * currentHash = SHA-256(previousHash + eventId + action + timestamp + stringifiedDetails)
 * @param {Object} params
 * @param {string} params.previousHash
 * @param {string} params.eventId
 * @param {string} params.action
 * @param {Date|string} params.timestamp
 * @param {Object|string} params.details
 * @returns {string}
 */
const calculateAuditHash = ({ previousHash = 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000', eventId, action, timestamp, details }) => {
  const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');
  const tsStr = timestamp instanceof Date ? timestamp.toISOString() : String(timestamp);
  const payload = `${previousHash}|${eventId}|${action}|${tsStr}|${detailsStr}`;
  return calculateSha256(payload);
};

module.exports = {
  calculateFileHash,
  calculateSha256,
  calculateAuditHash,
};
