const Case = require('../models/Case');
const caseService = require('../services/case.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { ROLES } = require('../utils/constants');

class CaseController {
  /**
   * Get all cases with role-aware and jurisdiction filtering
   * GET /api/v1/cases
   */
  async getCases(req, res, next) {
    try {
      const { status, priority, assignedRole, page = 1, limit = 20 } = req.query;
      const filter = {};

      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (assignedRole) filter.assignedRole = assignedRole;

      const result = await caseService.getCases(req.user, filter, { page, limit });
      return successResponse(res, 'Cases retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single case by ID
   * GET /api/v1/cases/:id
   */
  async getCaseById(req, res, next) {
    try {
      const { id } = req.params;
      const caseDoc = await caseService.getCaseById(id);

      if (!caseDoc) {
        return errorResponse(res, 'Case not found', { code: 'NOT_FOUND' }, 404);
      }

      return successResponse(res, 'Case details retrieved successfully', { case: caseDoc }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign case to officer
   * POST /api/v1/cases/:id/assign
   */
  async assignCase(req, res, next) {
    try {
      const { id } = req.params;
      const updatedCase = await caseService.assignCase(id, req.user);
      return successResponse(res, 'Case assigned to officer successfully', { case: updatedCase }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Officer approves case
   * POST /api/v1/cases/:id/approve
   */
  async approveCase(req, res, next) {
    try {
      const { id } = req.params;
      const { remarks, decisionReason, notes, fieldCorrections } = req.body;
      const reason = remarks || decisionReason || notes || 'Verified and approved by officer';

      const updatedCase = await caseService.approveCase(id, req.user, {
        remarks: reason,
        decisionReason: reason,
        fieldCorrections: fieldCorrections || {},
      });

      return successResponse(res, 'Case approved and record sealed successfully', { case: updatedCase }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Officer rejects case
   * POST /api/v1/cases/:id/reject
   */
  async rejectCase(req, res, next) {
    try {
      const { id } = req.params;
      const { remarks, reason, decisionReason } = req.body;
      const finalReason = remarks || reason || decisionReason;

      if (!finalReason) {
        return errorResponse(res, 'Rejection remarks/reason are required', { code: 'REMARKS_REQUIRED' }, 400);
      }

      const updatedCase = await caseService.rejectCase(id, req.user, {
        remarks: finalReason,
        decisionReason: finalReason,
      });

      return successResponse(res, 'Case rejected successfully', { case: updatedCase }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Officer escalates case
   * POST /api/v1/cases/:id/escalate
   */
  async escalateCase(req, res, next) {
    try {
      const { id } = req.params;
      const { remarks, reason, targetRole, escalateTo } = req.body;
      const finalReason = remarks || reason;

      if (!finalReason) {
        return errorResponse(res, 'Escalation remarks/reason are required', { code: 'REMARKS_REQUIRED' }, 400);
      }

      const updatedCase = await caseService.escalateCase(id, req.user, {
        remarks: finalReason,
        reason: finalReason,
        targetRole: targetRole || escalateTo || ROLES.DISTRICT_EXPERT,
      });

      return successResponse(res, 'Case escalated successfully', { case: updatedCase }, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CaseController();
