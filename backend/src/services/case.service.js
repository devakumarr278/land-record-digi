const Case = require('../models/Case');
const Document = require('../models/Document');
const Discrepancy = require('../models/Discrepancy');
const auditService = require('./audit.service');
const {
  CASE_STATUS,
  CASE_DECISIONS,
  CASE_PRIORITY,
  RISK_LEVELS,
  DOCUMENT_STATUS,
  DISCREPANCY_STATUS,
  ROLES,
  AUDIT_ACTIONS,
  SEVERITY_LEVELS,
} = require('../utils/constants');

class CaseService {
  /**
   * Automatically create and route a verification case based on risk level and detected discrepancies
   */
  async createCaseForDocument({
    documentId,
    discrepancies = [],
    overallConfidence = 1.0,
    riskScore = null,
    riskLevel = null,
    assignedRole = null,
    priority = null,
  }) {
    let finalRole = assignedRole;
    let finalPriority = priority;
    let finalRiskScore = typeof riskScore === 'number' ? riskScore : 0;
    let finalRiskLevel = riskLevel || RISK_LEVELS.LOW;

    // If risk not precomputed, compute automatically
    if (!finalRole || !finalPriority) {
      const hasCritical = discrepancies.some((d) => d.severity === SEVERITY_LEVELS.CRITICAL);
      const hasHigh = discrepancies.some((d) => d.severity === SEVERITY_LEVELS.HIGH);

      if (hasCritical || finalRiskScore > 70) {
        finalPriority = CASE_PRIORITY.CRITICAL;
        finalRole = ROLES.DISTRICT_ADMIN;
        finalRiskLevel = RISK_LEVELS.CRITICAL;
      } else if (hasHigh || finalRiskScore > 45) {
        finalPriority = CASE_PRIORITY.HIGH;
        finalRole = ROLES.DISTRICT_EXPERT;
        finalRiskLevel = RISK_LEVELS.HIGH;
      } else if (discrepancies.length > 0 || finalRiskScore > 20) {
        finalPriority = CASE_PRIORITY.MEDIUM;
        finalRole = ROLES.VERIFYING_OFFICER;
        finalRiskLevel = RISK_LEVELS.MEDIUM;
      } else {
        finalPriority = CASE_PRIORITY.LOW;
        finalRole = ROLES.FIELD_OPERATOR;
        finalRiskLevel = RISK_LEVELS.LOW;
      }
    }

    const discIds = discrepancies.map((d) => d._id || d);

    const newCase = new Case({
      document: documentId,
      discrepancies: discIds,
      assignedRole: finalRole,
      status: CASE_STATUS.PENDING_REVIEW,
      priority: finalPriority,
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      decision: CASE_DECISIONS.PENDING,
    });

    await newCase.save();

    // Log audit event
    await auditService.logEvent({
      document: documentId,
      case: newCase._id,
      action: AUDIT_ACTIONS.CASE_CREATED,
      actorRole: 'SYSTEM',
      actorName: 'Human-in-the-Loop Routing Engine',
      details: {
        caseId: newCase.caseId,
        assignedRole: finalRole,
        priority: finalPriority,
        riskScore: finalRiskScore,
        riskLevel: finalRiskLevel,
        discrepancyCount: discIds.length,
      },
    });

    return newCase;
  }

  /**
   * Assign a case to an officer
   */
  async assignCase(caseId, officerUser) {
    const isCustomId = caseId.startsWith('CASE-');
    const query = isCustomId ? { caseId } : { _id: caseId };

    const caseDoc = await Case.findOne(query);
    if (!caseDoc) throw new Error(`Case not found with ID: ${caseId}`);

    caseDoc.assignedTo = officerUser._id;
    caseDoc.status = CASE_STATUS.UNDER_REVIEW;
    await caseDoc.save();

    await auditService.logEvent({
      document: caseDoc.document,
      case: caseDoc._id,
      actor: officerUser._id,
      actorRole: officerUser.role,
      actorName: officerUser.name,
      action: AUDIT_ACTIONS.CASE_ASSIGNED,
      details: {
        caseId: caseDoc.caseId,
        assignedTo: officerUser.name,
        assignedRole: officerUser.role,
      },
    });

    return caseDoc;
  }

  /**
   * Approve a case and seal the document record
   */
  async approveCase(caseId, user, payload = {}) {
    const isCustomId = caseId.startsWith('CASE-');
    const query = isCustomId ? { caseId } : { _id: caseId };

    const caseDoc = await Case.findOne(query).populate('document');
    if (!caseDoc) throw new Error(`Case not found with ID: ${caseId}`);

    const decisionReason = payload.remarks || payload.decisionReason || payload.notes || 'Record verified, approved, and sealed by officer.';
    const fieldCorrections = payload.fieldCorrections || {};

    caseDoc.status = CASE_STATUS.APPROVED;
    caseDoc.decision = CASE_DECISIONS.APPROVED;
    caseDoc.decisionReason = decisionReason;
    caseDoc.remarks = decisionReason;
    caseDoc.decisionBy = user._id;
    caseDoc.decisionAt = new Date();

    if (fieldCorrections && Object.keys(fieldCorrections).length > 0) {
      caseDoc.fieldCorrections = fieldCorrections;
      if (caseDoc.document && caseDoc.document.extractedData) {
        Object.assign(caseDoc.document.extractedData, fieldCorrections);
      }
    }

    await caseDoc.save();

    // Mark all associated discrepancies as resolved
    await Discrepancy.updateMany(
      { _id: { $in: caseDoc.discrepancies } },
      { $set: { status: DISCREPANCY_STATUS.RESOLVED } }
    );

    // Update document status to COMPLETED / VALIDATED
    if (caseDoc.document) {
      caseDoc.document.status = DOCUMENT_STATUS.COMPLETED;
      await caseDoc.document.save();
    }

    // Log approval audit event
    await auditService.logEvent({
      document: caseDoc.document?._id,
      case: caseDoc._id,
      actor: user._id,
      actorRole: user.role,
      actorName: user.name,
      action: AUDIT_ACTIONS.CASE_APPROVED,
      details: {
        caseId: caseDoc.caseId,
        decisionReason,
        remarks: decisionReason,
        fieldCorrections,
      },
    });

    // Log record sealing audit event
    await auditService.logEvent({
      document: caseDoc.document?._id,
      case: caseDoc._id,
      actor: user._id,
      actorRole: user.role,
      actorName: user.name,
      action: AUDIT_ACTIONS.RECORD_SEALED,
      details: {
        caseId: caseDoc.caseId,
        documentId: caseDoc.document?.documentId,
        finalStatus: DOCUMENT_STATUS.COMPLETED,
      },
    });

    return caseDoc;
  }

  /**
   * Reject a case and mark document rejected
   */
  async rejectCase(caseId, user, payload = {}) {
    const isCustomId = caseId.startsWith('CASE-');
    const query = isCustomId ? { caseId } : { _id: caseId };

    const caseDoc = await Case.findOne(query).populate('document');
    if (!caseDoc) throw new Error(`Case not found with ID: ${caseId}`);

    const reason = payload.remarks || payload.reason || payload.decisionReason || 'Record rejected due to unresolvable title or boundary conflict.';

    caseDoc.status = CASE_STATUS.REJECTED;
    caseDoc.decision = CASE_DECISIONS.REJECTED;
    caseDoc.decisionReason = reason;
    caseDoc.remarks = reason;
    caseDoc.decisionBy = user._id;
    caseDoc.decisionAt = new Date();
    await caseDoc.save();

    // Mark discrepancies rejected
    await Discrepancy.updateMany(
      { _id: { $in: caseDoc.discrepancies } },
      { $set: { status: DISCREPANCY_STATUS.REJECTED } }
    );

    if (caseDoc.document) {
      caseDoc.document.status = DOCUMENT_STATUS.FAILED;
      await caseDoc.document.save();
    }

    await auditService.logEvent({
      document: caseDoc.document?._id,
      case: caseDoc._id,
      actor: user._id,
      actorRole: user.role,
      actorName: user.name,
      action: AUDIT_ACTIONS.CASE_REJECTED,
      details: {
        caseId: caseDoc.caseId,
        reason,
        remarks: reason,
      },
    });

    return caseDoc;
  }

  /**
   * Escalate case to higher authority (e.g. Verifying Officer -> District Expert -> District Admin)
   */
  async escalateCase(caseId, user, payload = {}) {
    const isCustomId = caseId.startsWith('CASE-');
    const query = isCustomId ? { caseId } : { _id: caseId };

    const caseDoc = await Case.findOne(query).populate('document');
    if (!caseDoc) throw new Error(`Case not found with ID: ${caseId}`);

    const reason = payload.remarks || payload.reason || 'Escalated for senior administrative or expert technical review.';
    const targetRole = payload.targetRole || payload.escalateTo || (caseDoc.assignedRole === ROLES.DISTRICT_EXPERT ? ROLES.DISTRICT_ADMIN : ROLES.DISTRICT_EXPERT);

    const fromRole = caseDoc.assignedRole;
    caseDoc.assignedRole = targetRole;
    caseDoc.status = CASE_STATUS.ESCALATED;
    caseDoc.priority = CASE_PRIORITY.CRITICAL;
    caseDoc.decision = CASE_DECISIONS.ESCALATED;
    caseDoc.remarks = reason;

    caseDoc.escalationHistory.push({
      escalatedFrom: fromRole,
      escalatedTo: targetRole,
      reason,
      remarks: reason,
      by: user._id,
      timestamp: new Date(),
    });

    await caseDoc.save();

    if (caseDoc.document) {
      caseDoc.document.status = DOCUMENT_STATUS.ESCALATED;
      await caseDoc.document.save();
    }

    await auditService.logEvent({
      document: caseDoc.document?._id || caseDoc.document,
      case: caseDoc._id,
      actor: user._id,
      actorRole: user.role,
      actorName: user.name,
      action: AUDIT_ACTIONS.CASE_ESCALATED,
      details: {
        caseId: caseDoc.caseId,
        fromRole,
        escalatedTo: targetRole,
        reason,
        remarks: reason,
      },
    });

    return caseDoc;
  }

  /**
   * Query cases with role-based and jurisdiction filtering
   */
  async getCases(user, filter = {}, pagination = { page: 1, limit: 20 }) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const query = { ...filter };

    // Strict Role-Based and Jurisdiction Scoping
    if (user.role === ROLES.CITIZEN) {
      // Citizen only sees cases for documents they uploaded
      const userDocs = await Document.find({ uploadedBy: user._id }).select('_id');
      query.document = { $in: userDocs.map((d) => d._id) };
    } else if (user.role === ROLES.VERIFYING_OFFICER) {
      // Verifying officer sees VERIFYING_OFFICER cases or cases assigned to them
      if (!query.assignedRole) {
        query.$or = [{ assignedRole: ROLES.VERIFYING_OFFICER }, { assignedTo: user._id }];
      }
    } else if (user.role === ROLES.DISTRICT_EXPERT) {
      // District expert sees DISTRICT_EXPERT or escalated cases
      if (!query.assignedRole) {
        query.$or = [{ assignedRole: ROLES.DISTRICT_EXPERT }, { status: CASE_STATUS.ESCALATED }];
      }
    } else if (user.role === ROLES.DISTRICT_ADMIN) {
      // District admin sees all district cases or critical cases
      // No filter needed, sees district overview
    }

    const [cases, total] = await Promise.all([
      Case.find(query)
        .populate({
          path: 'document',
          populate: { path: 'uploadedBy', select: 'name email role' },
        })
        .populate('discrepancies')
        .populate('assignedTo', 'name email role')
        .populate('decisionBy', 'name email role')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Case.countDocuments(query),
    ]);

    return {
      cases,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single case by ID
   */
  async getCaseById(id) {
    const isCustomId = id.startsWith('CASE-');
    const query = isCustomId ? { caseId: id } : { _id: id };

    return Case.findOne(query)
      .populate({
        path: 'document',
        populate: [
          { path: 'uploadedBy', select: 'name email role' },
          { path: 'currentProcessingJob' },
        ],
      })
      .populate('discrepancies')
      .populate('assignedTo', 'name email role')
      .populate('decisionBy', 'name email role')
      .populate('escalationHistory.by', 'name email role');
  }
}

module.exports = new CaseService();
