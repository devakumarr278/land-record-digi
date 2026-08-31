const Discrepancy = require('../models/Discrepancy');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class DiscrepancyController {
  /**
   * Get all discrepancies
   * GET /api/v1/discrepancies
   */
  async getDiscrepancies(req, res, next) {
    try {
      const { documentId, type, severity, status, page = 1, limit = 50 } = req.query;
      const filter = {};

      if (documentId) filter.document = documentId;
      if (type) filter.type = type;
      if (severity) filter.severity = severity;
      if (status) filter.status = status;

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const [discrepancies, total] = await Promise.all([
        Discrepancy.find(filter)
          .populate('document', 'documentId originalFileName status metadata')
          .populate('parcel', 'parcelId surveyNumber ownerName area')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit, 10)),
        Discrepancy.countDocuments(filter),
      ]);

      return successResponse(
        res,
        'Discrepancies retrieved successfully',
        {
          discrepancies,
          pagination: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            pages: Math.ceil(total / limit),
          },
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single discrepancy
   * GET /api/v1/discrepancies/:id
   */
  async getDiscrepancyById(req, res, next) {
    try {
      const { id } = req.params;
      const isCustomId = id.startsWith('DISC-');
      const query = isCustomId ? { discrepancyId: id } : { _id: id };

      const discrepancy = await Discrepancy.findOne(query)
        .populate('document')
        .populate('parcel');

      if (!discrepancy) {
        return errorResponse(res, 'Discrepancy not found', { code: 'NOT_FOUND' }, 404);
      }

      return successResponse(res, 'Discrepancy retrieved successfully', { discrepancy }, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiscrepancyController();
