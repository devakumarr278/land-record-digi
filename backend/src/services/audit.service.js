const AuditLog = require('../models/AuditLog');
const { calculateAuditHash } = require('../utils/hash');
const { v4: uuidv4 } = require('uuid');

const GENESIS_HASH = 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000';

class AuditService {
  /**
   * Log an audit event with chained cryptographic provenance
   */
  async logEvent({
    document = null,
    case: caseRef = null,
    actor = null,
    actorRole = 'SYSTEM',
    actorName = 'BHOOMI AI Orchestrator',
    action,
    details = {},
  }) {
    try {
      // Find the most recent audit record to obtain previousHash and sequenceNumber
      const lastLog = await AuditLog.findOne().sort({ sequenceNumber: -1, createdAt: -1 });

      const previousHash = lastLog ? lastLog.currentHash : GENESIS_HASH;
      const sequenceNumber = lastLog && typeof lastLog.sequenceNumber === 'number' ? lastLog.sequenceNumber + 1 : 1;
      const eventId = `EVT-${uuidv4().substring(0, 8).toUpperCase()}`;
      const timestamp = new Date();

      const currentHash = calculateAuditHash({
        previousHash,
        eventId,
        action,
        timestamp,
        details,
      });

      const auditRecord = new AuditLog({
        eventId,
        sequenceNumber,
        document: document ? document._id || document : null,
        case: caseRef ? caseRef._id || caseRef : null,
        actor: actor ? actor._id || actor : null,
        actorRole,
        actorName,
        action,
        details,
        timestamp,
        previousHash,
        currentHash,
      });

      await auditRecord.save();
      return auditRecord;
    } catch (error) {
      console.error('[AuditService] Failed to create audit log:', error.message);
      // In critical systems, we shouldn't swallow audit failures silently
      return null;
    }
  }

  /**
   * Fetch all audit logs with filtering and pagination
   */
  async getLogs(query = {}, pagination = { page: 1, limit: 50 }) {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.documentId) filter.document = query.documentId;
    if (query.caseId) filter.case = query.caseId;
    if (query.action) filter.action = query.action;
    if (query.actorRole) filter.actorRole = query.actorRole;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ sequenceNumber: -1, timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name email role')
        .populate('document', 'documentId originalFileName status')
        .populate('case', 'caseId status priority'),
      AuditLog.countDocuments(filter),
    ]);

    return {
      logs,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetch audit history for a specific document
   */
  async getLogsForDocument(documentId) {
    return AuditLog.find({ document: documentId })
      .sort({ sequenceNumber: 1, timestamp: 1 })
      .populate('actor', 'name email role');
  }

  /**
   * Cryptographically verify the integrity of the audit hash chain
   */
  async verifyChain() {
    const logs = await AuditLog.find().sort({ sequenceNumber: 1, timestamp: 1 });

    if (logs.length === 0) {
      return {
        isValid: true,
        totalEvents: 0,
        message: 'Audit chain is empty. Genesis block ready.',
        brokenIndex: null,
      };
    }

    let expectedPreviousHash = GENESIS_HASH;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      // Verify previousHash links to prior currentHash
      if (log.previousHash !== expectedPreviousHash) {
        return {
          isValid: false,
          totalEvents: logs.length,
          brokenIndex: i,
          brokenEventId: log.eventId,
          sequenceNumber: log.sequenceNumber,
          reason: `Previous hash mismatch at sequence ${log.sequenceNumber}. Expected ${expectedPreviousHash}, found ${log.previousHash}.`,
        };
      }

      // Recalculate hash of current block
      const recalculatedHash = calculateAuditHash({
        previousHash: log.previousHash,
        eventId: log.eventId,
        action: log.action,
        timestamp: log.timestamp,
        details: log.details,
      });

      if (recalculatedHash !== log.currentHash) {
        return {
          isValid: false,
          totalEvents: logs.length,
          brokenIndex: i,
          brokenEventId: log.eventId,
          sequenceNumber: log.sequenceNumber,
          reason: `Hash tampered at sequence ${log.sequenceNumber}. Stored hash does not match computed payload hash.`,
        };
      }

      expectedPreviousHash = log.currentHash;
    }

    return {
      isValid: true,
      totalEvents: logs.length,
      genesisHash: GENESIS_HASH,
      latestHash: logs[logs.length - 1].currentHash,
      message: `Audit chain verified successfully. ${logs.length} events are cryptographically intact and tamper-evident.`,
    };
  }
}

module.exports = new AuditService();
