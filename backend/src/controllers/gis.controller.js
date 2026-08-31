const Document = require('../models/Document');
const Parcel = require('../models/Parcel');
const gisService = require('../services/gis.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class GISController {
  /**
   * Run GIS spatial validation
   * POST /api/v1/gis/validate-spatial
   * Also handles legacy /validate/:documentId
   */
  async validateSpatial(req, res, next) {
    try {
      const documentId = req.body.documentId || req.params.documentId;

      if (documentId) {
        const isCustomId = documentId.startsWith('DOC-');
        const query = isCustomId ? { documentId } : { _id: documentId };

        const document = await Document.findOne(query);
        if (!document) {
          return errorResponse(res, `Document not found with ID: ${documentId}`, { code: 'NOT_FOUND' }, 404);
        }

        const spatialReport = await gisService.validateSpatialRecord({
          document,
          extractedData: document.extractedData,
        });

        document.gisValidation = spatialReport;
        await document.save();

        return successResponse(
          res,
          'GIS spatial validation executed successfully',
          spatialReport,
          200
        );
      }

      // Direct validation testing via request body payload
      const {
        documentArea,
        areaUnit = 'Acres',
        surveyNumber = '145/2',
        subDivision = '2',
        district = 'Coimbatore',
        taluk = 'Coimbatore North',
        village = 'Kovilpalayam',
        boundaries = {},
      } = req.body;

      if (documentArea === undefined || documentArea === null) {
        return errorResponse(res, 'Please provide either documentId or documentArea for spatial validation', { code: 'MISSING_FIELDS' }, 400);
      }

      const syntheticDoc = {
        metadata: { surveyNumber, subDivision, district, taluk, village },
        extractedData: {
          surveyNumber,
          subDivision,
          district,
          taluk,
          village,
          landArea: documentArea,
          areaUnit,
          boundaries,
        },
      };

      const spatialReport = await gisService.validateSpatialRecord({
        document: syntheticDoc,
        extractedData: syntheticDoc.extractedData,
      });

      return successResponse(
        res,
        'GIS spatial validation executed successfully',
        spatialReport,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all cadastral parcels from GeoJSON dataset & MongoDB
   * GET /api/v1/gis/parcels
   */
  async getParcels(req, res, next) {
    try {
      const geojsonParcels = gisService.getAllParcels();

      const { district, village, surveyNumber } = req.query;
      let filtered = geojsonParcels;

      if (district) {
        filtered = filtered.filter((p) => (p.district || '').toLowerCase().includes(district.toLowerCase()));
      }
      if (village) {
        filtered = filtered.filter((p) => (p.village || '').toLowerCase().includes(village.toLowerCase()));
      }
      if (surveyNumber) {
        filtered = filtered.filter((p) => (p.surveyNumber || '').toLowerCase().includes(surveyNumber.toLowerCase()));
      }

      return successResponse(
        res,
        'Cadastral reference parcels retrieved successfully',
        {
          total: filtered.length,
          parcels: filtered,
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single parcel by ID
   * GET /api/v1/gis/parcels/:id
   */
  async getParcelById(req, res, next) {
    try {
      const { id } = req.params;
      const all = gisService.getAllParcels();
      const parcel = all.find((p) => p.parcelId === id || p.surveyNumber === id);

      if (!parcel) {
        const isCustomId = id.startsWith('PAR-');
        const query = isCustomId ? { parcelId: id } : { _id: id };
        const dbParcel = await Parcel.findOne(query);

        if (!dbParcel) {
          return errorResponse(res, 'Parcel not found', { code: 'NOT_FOUND' }, 404);
        }

        return successResponse(res, 'Parcel retrieved successfully', { parcel: dbParcel }, 200);
      }

      return successResponse(res, 'Parcel retrieved successfully', { parcel }, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GISController();
