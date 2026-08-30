const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/apiResponse');

class DashboardController {
  async getOperatorDashboard(req, res, next) {
    try {
      const data = await dashboardService.getOperatorDashboard(req.user);
      return successResponse(res, 'Operator dashboard retrieved', data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getVerifierDashboard(req, res, next) {
    try {
      const data = await dashboardService.getVerifierDashboard(req.user);
      return successResponse(res, 'Verifier dashboard retrieved', data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getExpertDashboard(req, res, next) {
    try {
      const data = await dashboardService.getExpertDashboard(req.user);
      return successResponse(res, 'Expert dashboard retrieved', data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAdminDashboard(req, res, next) {
    try {
      const data = await dashboardService.getAdminDashboard(req.user);
      return successResponse(res, 'Admin dashboard retrieved', data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAuditorDashboard(req, res, next) {
    try {
      const data = await dashboardService.getAuditorDashboard(req.user);
      return successResponse(res, 'Auditor dashboard retrieved', data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getCitizenDashboard(req, res, next) {
    try {
      const data = await dashboardService.getCitizenDashboard(req.user);
      return successResponse(res, 'Citizen dashboard retrieved', data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getSystemAdminDashboard(req, res, next) {
    try {
      const data = await dashboardService.getSystemAdminDashboard(req.user);
      return successResponse(res, 'System Admin dashboard retrieved', data, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
