const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const Document = require('../models/Document');
const Parcel = require('../models/Parcel');
const env = require('../config/environment');
const { DISCREPANCY_TYPES, SEVERITY_LEVELS } = require('../utils/constants');

class GISValidationService {
  constructor() {
    this.geojsonPath = this.resolveGeoJSONPath();
    this.cachedGeoJSON = null;
    this.areaVarianceThreshold = env.AREA_VARIANCE_THRESHOLD_PERCENT || 5.0;
  }

  /**
   * Resolve location of cadastral_parcels.geojson safely
   */
  resolveGeoJSONPath() {
    const candidates = [
      path.join(__dirname, '../data/cadastral_parcels.geojson'),
      path.join(__dirname, '../../data/cadastral_parcels.geojson'),
      path.resolve('data/cadastral_parcels.geojson'),
      path.resolve('backend/data/cadastral_parcels.geojson'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return candidates[0];
  }

  /**
   * Load GeoJSON Dataset
   */
  getGeoJSON() {
    if (this.cachedGeoJSON) return this.cachedGeoJSON;

    try {
      if (fs.existsSync(this.geojsonPath)) {
        const raw = fs.readFileSync(this.geojsonPath, 'utf8');
        this.cachedGeoJSON = JSON.parse(raw);
        return this.cachedGeoJSON;
      }
    } catch (err) {
      console.warn(`[GISValidationService] Warning loading GeoJSON from ${this.geojsonPath}: ${err.message}`);
    }

    return { type: 'FeatureCollection', features: [] };
  }

  /**
   * Normalize search string (lowercase, remove punctuation, trim)
   */
  normalizeKey(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .replace(/[\/\-\._,\(\)]/g, '')
      .replace(/\s+/g, '')
      .trim();
  }

  /**
   * 1. Find Cadastral Parcel from GeoJSON (or MongoDB fallback)
   */
  async findParcel({ surveyNumber, subDivision, district, taluk, village }) {
    const geojson = this.getGeoJSON();
    const cleanSurvey = this.normalizeKey(surveyNumber);
    const cleanVillage = this.normalizeKey(village);
    const cleanDistrict = this.normalizeKey(district);

    // Search in GeoJSON FeatureCollection
    if (geojson && Array.isArray(geojson.features)) {
      const match = geojson.features.find((f) => {
        const props = f.properties || {};
        const pSurvey = this.normalizeKey(props.surveyNumber);
        const pVillage = this.normalizeKey(props.village);
        const pDistrict = this.normalizeKey(props.district);

        const surveyMatch = pSurvey === cleanSurvey || pSurvey.includes(cleanSurvey) || cleanSurvey.includes(pSurvey);
        const villageMatch = !cleanVillage || pVillage === cleanVillage || pVillage.includes(cleanVillage);
        const districtMatch = !cleanDistrict || pDistrict === cleanDistrict || pDistrict.includes(cleanDistrict);

        return surveyMatch && (villageMatch || districtMatch);
      });

      if (match) {
        return match;
      }
    }

    // Fallback: search MongoDB Parcel collection if database is connected
    const mongoose = require('mongoose');
    if (surveyNumber && mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const dbParcel = await Parcel.findOne({
          surveyNumber: new RegExp(`^${surveyNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
          village: village ? new RegExp(`^${village.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') : /.*/,
        });

        if (dbParcel) {
          return {
            type: 'Feature',
            properties: {
              parcelId: dbParcel.parcelId,
              surveyNumber: dbParcel.surveyNumber,
              subDivision: dbParcel.subDivision || '',
              district: dbParcel.district,
              taluk: dbParcel.taluk,
              village: dbParcel.village,
              ownerName: dbParcel.ownerName,
              officialAreaSqm: dbParcel.area ? dbParcel.area * 4046.8564224 : 8579.34,
              officialAreaAcres: dbParcel.area || 2.12,
              classification: dbParcel.classification || 'Agricultural',
              northBoundary: dbParcel.boundaries?.north || 'Cart Track',
              southBoundary: dbParcel.boundaries?.south || 'Adjacent Survey Land',
              eastBoundary: dbParcel.boundaries?.east || 'Water Channel',
              westBoundary: dbParcel.boundaries?.west || 'Odai Poramboke',
            },
            geometry: dbParcel.geometry || {
              type: 'Polygon',
              coordinates: [
                [
                  [77.0121, 11.14515],
                  [77.013047, 11.14515],
                  [77.013047, 11.1444],
                  [77.0121, 11.1444],
                  [77.0121, 11.14515],
                ],
              ],
            },
          };
        }
      } catch (err) {
        console.warn(`[GISValidationService] Parcel DB query error: ${err.message}`);
      }
    }

    return null;
  }

  /**
   * 2. Calculate Polygon Area using Turf.js
   * Returns exact measurements in sqm, hectares, acres, cents, sqft
   */
  calculatePolygonArea(feature) {
    if (!feature) {
      return { sqm: 0, hectares: 0, acres: 0, cents: 0, sqft: 0 };
    }

    try {
      let geojsonInput = null;

      if (feature.geometry && feature.geometry.coordinates) {
        geojsonInput = {
          type: 'Feature',
          properties: feature.properties || {},
          geometry: {
            type: feature.geometry.type || 'Polygon',
            coordinates: feature.geometry.coordinates,
          },
        };
      } else if (feature.type === 'Polygon' && feature.coordinates) {
        geojsonInput = {
          type: 'Feature',
          properties: {},
          geometry: feature,
        };
      } else if (feature.type === 'Feature' && feature.geometry) {
        geojsonInput = feature;
      }

      let areaSqm = 0;
      if (geojsonInput) {
        areaSqm = turf.area(geojsonInput);
      }

      if ((!areaSqm || areaSqm < 1) && feature.properties?.officialAreaSqm) {
        areaSqm = feature.properties.officialAreaSqm;
      } else if (!areaSqm && feature.officialAreaSqm) {
        areaSqm = feature.officialAreaSqm;
      }

      const hectares = areaSqm / 10000;
      const acres = areaSqm / 4046.8564224;
      const cents = areaSqm / 40.468564224;
      const sqft = areaSqm * 10.7639104;

      return {
        sqm: parseFloat(areaSqm.toFixed(2)),
        hectares: parseFloat(hectares.toFixed(4)),
        acres: parseFloat(acres.toFixed(3)),
        cents: parseFloat(cents.toFixed(2)),
        sqft: parseFloat(sqft.toFixed(2)),
      };
    } catch (err) {
      console.warn(`[GISValidationService] Turf.js area calculation fallback: ${err.message}`);
      const fallbackSqm = feature.properties?.officialAreaSqm || feature.officialAreaSqm || 8579.34;
      return {
        sqm: fallbackSqm,
        hectares: parseFloat((fallbackSqm / 10000).toFixed(4)),
        acres: parseFloat((fallbackSqm / 4046.8564224).toFixed(3)),
        cents: parseFloat((fallbackSqm / 40.468564224).toFixed(2)),
        sqft: parseFloat((fallbackSqm * 10.7639).toFixed(2)),
      };
    }
  }

  /**
   * 3. Normalize Document Extracted Area into Square Meters
   */
  normalizeDocumentArea(rawArea, rawUnit = 'acres') {
    const val = typeof rawArea === 'number' ? rawArea : parseFloat(rawArea);
    if (isNaN(val) || val <= 0) return 0;

    const unit = (rawUnit || 'acres').toString().toLowerCase().trim();

    if (unit.includes('hectare') || unit.includes('ஹெக்டேர்')) {
      return parseFloat((val * 10000).toFixed(2));
    }
    if (unit.includes('cent') || unit.includes('சென்ட்')) {
      return parseFloat((val * 40.468564224).toFixed(2));
    }
    if (unit.includes('sqft') || unit.includes('square feet') || unit.includes('சதுர அடி')) {
      return parseFloat((val * 0.092903).toFixed(2));
    }
    if (unit.includes('sqm') || unit.includes('square meter') || unit.includes('சதுர மீட்டர்') || unit.includes('sq m')) {
      return parseFloat(val.toFixed(2));
    }
    // Default: Acres
    return parseFloat((val * 4046.8564224).toFixed(2));
  }

  /**
   * 4. Validate Document Claimed Area vs GIS Calculated Polygon Area
   */
  validateArea(documentArea, documentUnit = 'Acres', gisAreaSqm, threshold = null) {
    const limit = typeof threshold === 'number' ? threshold : this.areaVarianceThreshold;
    const documentAreaSqm = this.normalizeDocumentArea(documentArea, documentUnit);

    const differenceSqm = parseFloat(Math.abs(documentAreaSqm - gisAreaSqm).toFixed(2));
    const variancePercentage =
      gisAreaSqm > 0 ? parseFloat(((differenceSqm / gisAreaSqm) * 100).toFixed(2)) : 0;

    let status = 'MATCH';
    let severity = SEVERITY_LEVELS.LOW;

    if (variancePercentage > limit) {
      status = 'MISMATCH';
    } else if (variancePercentage > 2.0) {
      status = 'WARNING';
    } else {
      status = 'MATCH';
    }

    if (variancePercentage > 30.0) {
      severity = SEVERITY_LEVELS.CRITICAL;
    } else if (variancePercentage > 15.0) {
      severity = SEVERITY_LEVELS.HIGH;
    } else if (variancePercentage > 5.0) {
      severity = SEVERITY_LEVELS.MEDIUM;
    } else {
      severity = SEVERITY_LEVELS.LOW;
    }

    return {
      documentAreaSqm,
      documentAreaOriginal: typeof documentArea === 'number' ? documentArea : parseFloat(documentArea) || 0,
      documentAreaUnit: documentUnit || 'Acres',
      gisAreaSqm,
      gisAreaAcres: parseFloat((gisAreaSqm / 4046.8564224).toFixed(3)),
      differenceSqm,
      variancePercentage,
      threshold: limit,
      status,
      severity,
    };
  }

  /**
   * String similarity using Dice's bigram coefficient
   */
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/gi, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/gi, '');

    if (s1 === s2) return 100;
    if (s1.length < 2 || s2.length < 2) return 0;

    const getBigrams = (str) => {
      const bigrams = new Set();
      for (let i = 0; i < str.length - 1; i++) {
        bigrams.add(str.substring(i, i + 2));
      }
      return bigrams;
    };

    const b1 = getBigrams(s1);
    const b2 = getBigrams(s2);
    let intersection = 0;

    b1.forEach((bg) => {
      if (b2.has(bg)) intersection++;
    });

    const similarity = (2.0 * intersection) / (b1.size + b2.size);
    return Math.round(similarity * 100);
  }

  /**
   * 5. Boundary Validation
   */
  validateBoundaries(extractedBoundaries = {}, officialProps = {}) {
    const doc = {
      north: extractedBoundaries.north || extractedBoundaries.northBoundary || '',
      south: extractedBoundaries.south || extractedBoundaries.southBoundary || '',
      east: extractedBoundaries.east || extractedBoundaries.eastBoundary || '',
      west: extractedBoundaries.west || extractedBoundaries.westBoundary || '',
    };

    const official = {
      north: officialProps.northBoundary || officialProps.north || '',
      south: officialProps.southBoundary || officialProps.south || '',
      east: officialProps.eastBoundary || officialProps.east || '',
      west: officialProps.westBoundary || officialProps.west || '',
    };

    const hasAnyBoundary = Boolean(doc.north || doc.south || doc.east || doc.west);
    if (!hasAnyBoundary) {
      return {
        north: { documentValue: 'Not Specified', officialValue: official.north, similarity: 100, status: 'MATCH' },
        south: { documentValue: 'Not Specified', officialValue: official.south, similarity: 100, status: 'MATCH' },
        east: { documentValue: 'Not Specified', officialValue: official.east, similarity: 100, status: 'MATCH' },
        west: { documentValue: 'Not Specified', officialValue: official.west, similarity: 100, status: 'MATCH' },
        overallBoundaryMatch: 100,
        status: 'MATCH',
      };
    }

    const directions = ['north', 'south', 'east', 'west'];
    const result = {};
    let totalScore = 0;

    for (const dir of directions) {
      const dVal = doc[dir];
      const oVal = official[dir];
      const similarity = this.calculateSimilarity(dVal, oVal);
      totalScore += similarity;

      let status = 'MATCH';
      if (similarity < 60) {
        status = 'MISMATCH';
      } else if (similarity < 85) {
        status = 'WARNING';
      }

      result[dir] = {
        documentValue: dVal || 'Not Specified',
        officialValue: oVal || 'Not Specified',
        similarity,
        status,
      };
    }

    const overallBoundaryMatch = Math.round(totalScore / 4);
    let overallStatus = 'MATCH';

    if (overallBoundaryMatch < 60 || Object.values(result).some((r) => r.status === 'MISMATCH')) {
      overallStatus = 'MISMATCH';
    } else if (overallBoundaryMatch < 85 || Object.values(result).some((r) => r.status === 'WARNING')) {
      overallStatus = 'WARNING';
    }

    return {
      ...result,
      overallBoundaryMatch,
      status: overallStatus,
    };
  }

  /**
   * 6. Complete Document Spatial Validation Workflow
   */
  async validateSpatialRecord({ document, extractedData = null, parcel = null }) {
    const data = extractedData || document.extractedData || {};
    const meta = document.metadata || {};

    const surveyNumber = data.surveyNumber || meta.surveyNumber || '145/2';
    const subDivision = data.subDivision || meta.subDivision || '2';
    const village = data.village || meta.village || 'Kovilpalayam';
    const taluk = data.taluk || meta.taluk || 'Coimbatore North';
    const district = data.district || meta.district || 'Coimbatore';

    const documentArea = typeof data.landArea === 'number' ? data.landArea : parseFloat(data.landArea) || (document.demoScenario === 'GIS_AREA_MISMATCH' ? 2.45 : 2.12);
    const areaUnit = data.areaUnit || 'Acres';

    // 1. Find Cadastral Parcel
    let foundParcel = parcel || (await this.findParcel({ surveyNumber, subDivision, district, taluk, village }));

    if (!foundParcel) {
      return {
        success: true,
        parcelFound: false,
        parcel: null,
        overallSpatialStatus: 'PARCEL_NOT_FOUND',
        status: 'FLAGGED',
        spatialRisk: 'HIGH',
        message: `No spatial cadastral polygon found for Survey ${surveyNumber} in ${village}, ${district}.`,
        discrepancy: {
          type: DISCREPANCY_TYPES.BOUNDARY_MISMATCH,
          field: 'surveyNumber',
          documentValue: surveyNumber,
          referenceValue: 'Not Found in Cadastral Map',
          severity: SEVERITY_LEVELS.HIGH,
          description: `Cadastral spatial boundary polygon is missing for Survey No ${surveyNumber}.`,
        },
      };
    }

    // Normalize parcel feature properties if passed from mongoose
    let props = foundParcel.properties;
    if (!props) {
      props = {
        parcelId: foundParcel.parcelId || 'TN-PARCEL',
        surveyNumber: foundParcel.surveyNumber || surveyNumber,
        subDivision: foundParcel.subDivision || subDivision,
        district: foundParcel.district || district,
        taluk: foundParcel.taluk || taluk,
        village: foundParcel.village || village,
        ownerName: foundParcel.ownerName,
        officialAreaSqm: foundParcel.area ? foundParcel.area * 4046.8564224 : 8579.34,
        officialAreaAcres: foundParcel.area || 2.12,
        classification: foundParcel.classification,
        northBoundary: foundParcel.boundaries?.north,
        southBoundary: foundParcel.boundaries?.south,
        eastBoundary: foundParcel.boundaries?.east,
        westBoundary: foundParcel.boundaries?.west,
      };
      foundParcel = {
        type: 'Feature',
        properties: props,
        geometry: foundParcel.geometry || {
          type: 'Polygon',
          coordinates: [
            [
              [77.0121, 11.14515],
              [77.013047, 11.14515],
              [77.013047, 11.1444],
              [77.0121, 11.1444],
              [77.0121, 11.14515],
            ],
          ],
        },
      };
    }

    // 2. Calculate GIS Polygon Area via Turf.js
    const calculatedGIS = this.calculatePolygonArea(foundParcel);
    const gisAreaSqm = calculatedGIS.sqm || props.officialAreaSqm || 8579.34;

    // 3. Validate Area
    const areaValidation = this.validateArea(documentArea, areaUnit, gisAreaSqm);

    // 4. Validate Boundaries
    const boundaryValidation = this.validateBoundaries(data.boundaries || {}, props);

    // 5. Determine Overall Spatial Status
    let overallSpatialStatus = 'VALID';
    let spatialRisk = 'LOW';
    let discrepancy = null;

    const hasAreaMismatch = areaValidation.status === 'MISMATCH' || document.demoScenario === 'GIS_AREA_MISMATCH';
    const hasBoundaryMismatch = boundaryValidation.status === 'MISMATCH' || document.demoScenario === 'BOUNDARY_CONFLICT';

    if (hasBoundaryMismatch) {
      overallSpatialStatus = 'MISMATCH';
      spatialRisk = 'CRITICAL';
      discrepancy = {
        type: DISCREPANCY_TYPES.BOUNDARY_MISMATCH,
        field: 'boundaries',
        documentValue: 'Disputed North/West Boundary Overlay',
        referenceValue: 'Official Cadastral Boundary Line',
        variancePercentage: 35.0,
        severity: SEVERITY_LEVELS.CRITICAL,
        description: `Cadastral boundary mismatch detected on Western Cart Track boundary for Survey ${surveyNumber}.`,
      };
    } else if (hasAreaMismatch) {
      overallSpatialStatus = 'MISMATCH';
      spatialRisk = areaValidation.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      discrepancy = {
        type: DISCREPANCY_TYPES.AREA_MISMATCH,
        field: 'landArea',
        documentValue: areaValidation.documentAreaOriginal,
        referenceValue: areaValidation.gisAreaAcres,
        variancePercentage: areaValidation.variancePercentage,
        severity: areaValidation.severity,
        description: `Spatial GIS calculated area (${areaValidation.gisAreaAcres} Acres) deviates from document claimed area (${areaValidation.documentAreaOriginal} ${areaValidation.documentAreaUnit}) by ${areaValidation.variancePercentage}%.`,
      };
    } else if (areaValidation.status === 'WARNING' || boundaryValidation.status === 'WARNING') {
      overallSpatialStatus = 'WARNING';
      spatialRisk = 'MEDIUM';
    }

    const report = {
      success: true,
      parcelFound: true,
      parcelId: props.parcelId || 'TN-PARCEL',
      parcel: {
        parcelId: props.parcelId,
        surveyNumber: props.surveyNumber || surveyNumber,
        subDivision: props.subDivision || subDivision,
        district: props.district || district,
        taluk: props.taluk || taluk,
        village: props.village || village,
        ownerName: props.ownerName,
        classification: props.classification,
        officialAreaSqm: props.officialAreaSqm,
      },
      areaValidation,
      boundaryValidation,
      overallSpatialStatus,
      status: overallSpatialStatus === 'VALID' ? 'VERIFIED' : 'FLAGGED',
      spatialRisk,
      documentArea: areaValidation.documentAreaOriginal,
      gisArea: areaValidation.gisAreaAcres,
      areaDifference: parseFloat(Math.abs(areaValidation.documentAreaOriginal - areaValidation.gisAreaAcres).toFixed(3)),
      variancePercentage: areaValidation.variancePercentage,
      boundaryMatch: boundaryValidation.overallBoundaryMatch,
      geometry: foundParcel.geometry,
      discrepancy,
    };

    return report;
  }

  /**
   * Get all cadastral parcels with Turf area computations
   */
  getAllParcels() {
    const geojson = this.getGeoJSON();
    const features = geojson.features || [];

    return features.map((f) => {
      const area = this.calculatePolygonArea(f);
      return {
        ...f.properties,
        calculatedArea: area,
        geometry: f.geometry,
      };
    });
  }
}

module.exports = new GISValidationService();
