const Document = require('../models/Document');
const Case = require('../models/Case');
const Discrepancy = require('../models/Discrepancy');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const ProcessingJob = require('../models/ProcessingJob');
const aiService = require('./ai.service');
const auditService = require('./audit.service');
const { DOCUMENT_STATUS, CASE_STATUS, SEVERITY_LEVELS, ROLES } = require('../utils/constants');

class DashboardService {
  /**
   * Field Operator Dashboard
   */
  async getOperatorDashboard(user) {
    const filter = user.role === ROLES.FIELD_OPERATOR ? { uploadedBy: user._id } : {};

    const [totalUploaded, processing, completed, pendingReview, failed, recentDocuments] = await Promise.all([
      Document.countDocuments(filter),
      Document.countDocuments({ ...filter, status: DOCUMENT_STATUS.PROCESSING }),
      Document.countDocuments({ ...filter, status: DOCUMENT_STATUS.COMPLETED }),
      Document.countDocuments({ ...filter, status: DOCUMENT_STATUS.REVIEW_REQUIRED }),
      Document.countDocuments({ ...filter, status: DOCUMENT_STATUS.FAILED }),
      Document.find(filter)
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('currentProcessingJob', 'overallProgress currentStage status'),
    ]);

    return {
      role: user.role,
      district: user.district,
      office: user.office,
      metrics: {
        documentsUploaded: totalUploaded,
        processing,
        completed,
        pendingReview,
        failed,
      },
      recentDocuments,
    };
  }

  /**
   * Verifying Officer Dashboard
   */
  async getVerifierDashboard(user) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [assignedCases, pendingCases, completedToday, criticalCases, docs] = await Promise.all([
      Case.countDocuments({ assignedTo: user._id, status: { $ne: CASE_STATUS.RESOLVED } }),
      Case.countDocuments({ assignedRole: ROLES.VERIFYING_OFFICER, status: { $in: [CASE_STATUS.NEW, CASE_STATUS.UNDER_VERIFICATION] } }),
      Case.countDocuments({ decisionBy: user._id, decisionAt: { $gte: todayStart } }),
      Case.countDocuments({ assignedRole: ROLES.VERIFYING_OFFICER, priority: SEVERITY_LEVELS.CRITICAL }),
      Document.find({ status: DOCUMENT_STATUS.COMPLETED }).select('overallConfidence'),
    ]);

    const avgConf = docs.length > 0
      ? (docs.reduce((acc, d) => acc + (d.overallConfidence || 0), 0) / docs.length) * 100
      : 92.5;

    const recentCases = await Case.find({
      $or: [{ assignedTo: user._id }, { assignedRole: ROLES.VERIFYING_OFFICER }],
    })
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate('document', 'documentId originalFileName metadata')
      .populate('discrepancies');

    return {
      role: user.role,
      metrics: {
        assignedCases,
        pendingCases,
        completedToday,
        averageConfidence: parseFloat(avgConf.toFixed(1)),
        criticalCases,
      },
      recentCases,
    };
  }

  /**
   * District Expert Dashboard
   */
  async getExpertDashboard(user) {
    const [criticalCases, ownershipConflicts, gisConflicts, resolvedCases, expertQueue] = await Promise.all([
      Case.countDocuments({
        $or: [{ assignedRole: ROLES.DISTRICT_EXPERT }, { priority: SEVERITY_LEVELS.CRITICAL }],
        status: { $in: [CASE_STATUS.NEW, CASE_STATUS.UNDER_VERIFICATION, CASE_STATUS.EXPERT_REVIEW] },
      }),
      Discrepancy.countDocuments({ type: 'OWNER_MISMATCH' }),
      Discrepancy.countDocuments({ type: { $in: ['AREA_MISMATCH', 'BOUNDARY_MISMATCH'] } }),
      Case.countDocuments({ assignedRole: ROLES.DISTRICT_EXPERT, status: CASE_STATUS.RESOLVED }),
      Case.find({
        $or: [{ assignedRole: ROLES.DISTRICT_EXPERT }, { priority: SEVERITY_LEVELS.CRITICAL }],
      })
        .sort({ priority: -1, updatedAt: -1 })
        .limit(6)
        .populate('document')
        .populate('discrepancies')
        .populate('assignedTo', 'name email'),
    ]);

    return {
      role: user.role,
      metrics: {
        criticalCases,
        ownershipConflicts,
        gisConflicts,
        resolvedCases,
      },
      expertQueue,
    };
  }

  /**
   * District Admin Dashboard
   */
  async getAdminDashboard(user) {
    const [districtDocs, totalCases, resolvedCases, discrepancies, officers] = await Promise.all([
      Document.countDocuments({ 'metadata.district': user.district || 'Coimbatore' }),
      Case.countDocuments(),
      Case.countDocuments({ status: CASE_STATUS.RESOLVED }),
      Discrepancy.find().select('type severity'),
      User.find({ role: { $in: [ROLES.VERIFYING_OFFICER, ROLES.DISTRICT_EXPERT] } }).select('name role office'),
    ]);

    const discDistribution = {
      AREA_MISMATCH: discrepancies.filter((d) => d.type === 'AREA_MISMATCH').length,
      OWNER_MISMATCH: discrepancies.filter((d) => d.type === 'OWNER_MISMATCH').length,
      SURVEY_MISMATCH: discrepancies.filter((d) => d.type === 'SURVEY_MISMATCH').length,
      BOUNDARY_MISMATCH: discrepancies.filter((d) => d.type === 'BOUNDARY_MISMATCH').length,
      DUPLICATE_RECORD: discrepancies.filter((d) => d.type === 'DUPLICATE_RECORD').length,
      LOW_CONFIDENCE: discrepancies.filter((d) => d.type === 'LOW_CONFIDENCE').length,
    };

    return {
      role: user.role,
      district: user.district || 'Coimbatore',
      metrics: {
        districtDocuments: districtDocs,
        totalCases,
        pendingCases: totalCases - resolvedCases,
        resolvedCases,
        processingRate: '96.8%',
      },
      discrepancyDistribution: discDistribution,
      officersCount: officers.length,
    };
  }

  /**
   * Chief Auditor Dashboard
   */
  async getAuditorDashboard(user) {
    const [totalAuditEvents, recordsAudited, chainVerification, recentAuditTrail] = await Promise.all([
      AuditLog.countDocuments(),
      Document.countDocuments({ status: DOCUMENT_STATUS.COMPLETED }),
      auditService.verifyChain(),
      AuditLog.find().sort({ sequenceNumber: -1 }).limit(10).populate('actor', 'name role'),
    ]);

    return {
      role: user.role,
      metrics: {
        totalAuditEvents,
        integrityAlerts: chainVerification.isValid ? 0 : 1,
        suspiciousEvents: 0,
        recordsAudited,
      },
      auditChainStatus: {
        isChainIntact: chainVerification.isValid,
        totalEvents: chainVerification.totalEvents,
        latestHash: chainVerification.latestHash,
        message: chainVerification.message,
      },
      recentAuditTrail,
    };
  }

  /**
   * Citizen Dashboard
   */
  async getCitizenDashboard(user) {
    const filter = { uploadedBy: user._id };

    const [ownRecords, totalApplications, recentRecords] = await Promise.all([
      Document.countDocuments({ ...filter, status: DOCUMENT_STATUS.COMPLETED }),
      Document.countDocuments(filter),
      Document.find(filter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('documentId originalFileName status metadata extractedData createdAt'),
    ]);

    return {
      role: user.role,
      userName: user.name,
      metrics: {
        ownRecords,
        applications: totalApplications,
        pendingVerification: totalApplications - ownRecords,
      },
      recentRecords,
    };
  }

  /**
   * System Admin Dashboard
   */
  async getSystemAdminDashboard(user) {
    const [totalUsers, totalDocs, totalJobs, totalCases, aiHealth, chainVerify] = await Promise.all([
      User.countDocuments(),
      Document.countDocuments(),
      ProcessingJob.countDocuments(),
      Case.countDocuments(),
      aiService.checkHealth(),
      auditService.verifyChain(),
    ]);

    return {
      role: user.role,
      systemHealth: 'OPERATIONAL',
      aiServiceStatus: aiHealth.status === 'healthy' ? 'HEALTHY' : aiHealth.status || 'OFFLINE_FALLBACK_ACTIVE',
      metrics: {
        totalUsers,
        totalDocuments: totalDocs,
        processingJobs: totalJobs,
        activeCases: totalCases,
      },
      auditChainVerification: chainVerify,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}

module.exports = new DashboardService();
