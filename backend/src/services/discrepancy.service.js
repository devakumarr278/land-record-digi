const Discrepancy = require('../models/Discrepancy');
const env = require('../config/environment');
const {
  DISCREPANCY_TYPES,
  SEVERITY_LEVELS,
  RISK_LEVELS,
  DISCREPANCY_STATUS,
  ROLES,
} = require('../utils/constants');

class DiscrepancyService {
  /**
   * Centralized Discrepancy Detection Engine
   * Analyzes OCR confidence, extracted entities, cadastral registry checks, and GIS validation
   */
  detectAllDiscrepancies({
    document = {},
    extractedData = {},
    validationResults = null,
    gisValidation = null,
    overallConfidence = 1.0,
    fieldConfidence = {},
  }) {
    const discrepancies = [];
    const meta = document.metadata || {};
    const data = extractedData || document.extractedData || {};
    const demoScenario = document.demoScenario || null;

    const conf = typeof overallConfidence === 'number' ? overallConfidence : document.overallConfidence || 0.95;

    // ----------------------------------------------------
    // 1. OCR Confidence Analysis
    // ----------------------------------------------------
    if (conf < 0.50 || demoScenario === 'LOW_CONFIDENCE') {
      discrepancies.push({
        type: DISCREPANCY_TYPES.OCR_LOW_CONFIDENCE,
        field: 'overallConfidence',
        documentValue: `${(conf * 100).toFixed(1)}%`,
        officialValue: '>= 90%',
        difference: `${((0.90 - conf) * 100).toFixed(1)}% below standard`,
        severity: SEVERITY_LEVELS.HIGH,
        confidence: conf,
        status: DISCREPANCY_STATUS.OPEN,
        description: `Critical OCR degradation: Overall confidence is ${(conf * 100).toFixed(1)}%. Text transcription has unreadable or damaged ink sections.`,
      });
    } else if (conf < 0.70) {
      discrepancies.push({
        type: DISCREPANCY_TYPES.OCR_LOW_CONFIDENCE,
        field: 'overallConfidence',
        documentValue: `${(conf * 100).toFixed(1)}%`,
        officialValue: '>= 90%',
        difference: `${((0.90 - conf) * 100).toFixed(1)}% below standard`,
        severity: SEVERITY_LEVELS.MEDIUM,
        confidence: conf,
        status: DISCREPANCY_STATUS.OPEN,
        description: `Moderate OCR confidence degradation: Document clarity is ${(conf * 100).toFixed(1)}%. Requires officer verification.`,
      });
    } else if (conf < 0.90) {
      discrepancies.push({
        type: DISCREPANCY_TYPES.OCR_LOW_CONFIDENCE,
        field: 'overallConfidence',
        documentValue: `${(conf * 100).toFixed(1)}%`,
        officialValue: '>= 90%',
        difference: `${((0.90 - conf) * 100).toFixed(1)}% below standard`,
        severity: SEVERITY_LEVELS.LOW,
        confidence: conf,
        status: DISCREPANCY_STATUS.OPEN,
        description: `Minor OCR confidence variance: Overall confidence is ${(conf * 100).toFixed(1)}%.`,
      });
    }

    // ----------------------------------------------------
    // 2. Cadastral Registry Validation Checks
    // ----------------------------------------------------
    if (validationResults) {
      if (validationResults.flags && Array.isArray(validationResults.flags)) {
        for (const flag of validationResults.flags) {
          discrepancies.push({
            type: flag.type || DISCREPANCY_TYPES.REGISTRY_MISMATCH,
            field: flag.field || 'registry',
            documentValue: flag.documentValue,
            officialValue: flag.referenceValue,
            difference: flag.difference || 'Value mismatch against official registry',
            variancePercentage: flag.variancePercentage || null,
            severity: flag.severity || SEVERITY_LEVELS.MEDIUM,
            confidence: 0.95,
            status: DISCREPANCY_STATUS.OPEN,
            description: flag.description || `Discrepancy detected in field ${flag.field}.`,
          });
        }
      }

      if (validationResults.parcelFound === false) {
        discrepancies.push({
          type: DISCREPANCY_TYPES.PARCEL_NOT_FOUND,
          field: 'surveyNumber',
          documentValue: data.surveyNumber || meta.surveyNumber,
          officialValue: 'Registered Cadastral Record',
          difference: 'Record missing in land registry',
          severity: SEVERITY_LEVELS.CRITICAL,
          confidence: 1.0,
          status: DISCREPANCY_STATUS.OPEN,
          description: `Survey number ${data.surveyNumber || meta.surveyNumber} does not exist in village ${data.village || meta.village} land records.`,
        });
      }
    }

    // Ownership Conflict Demo Injection
    if (demoScenario === 'OWNERSHIP_CONFLICT') {
      const alreadyHasOwner = discrepancies.some((d) => d.type === DISCREPANCY_TYPES.OWNER_NAME_MISMATCH || d.type === DISCREPANCY_TYPES.OWNER_MISMATCH);
      if (!alreadyHasOwner) {
        discrepancies.push({
          type: DISCREPANCY_TYPES.OWNER_NAME_MISMATCH,
          field: 'ownerName',
          documentValue: 'K. Marimuthu',
          officialValue: 'Ramasamy Gounder',
          difference: 'Claimant differs from registered patta holder',
          severity: SEVERITY_LEVELS.HIGH,
          confidence: 0.95,
          status: DISCREPANCY_STATUS.OPEN,
          description: 'Ownership Conflict: Extracted owner name (K. Marimuthu) conflicts with registered cadastral deed holder (Ramasamy Gounder).',
        });
      }
    }

    // ----------------------------------------------------
    // 3. GIS Area Validation Checks
    // ----------------------------------------------------
    if (gisValidation && gisValidation.areaValidation) {
      const areaVal = gisValidation.areaValidation;
      const varPct = areaVal.variancePercentage || 0;

      if (areaVal.status === 'MISMATCH' || demoScenario === 'GIS_AREA_MISMATCH' || varPct > 5.0) {
        let sev = SEVERITY_LEVELS.MEDIUM;
        if (varPct > 30.0) sev = SEVERITY_LEVELS.CRITICAL;
        else if (varPct > 15.0) sev = SEVERITY_LEVELS.HIGH;
        else if (varPct > 5.0) sev = SEVERITY_LEVELS.MEDIUM;
        else sev = SEVERITY_LEVELS.LOW;

        discrepancies.push({
          type: DISCREPANCY_TYPES.AREA_MISMATCH,
          field: 'landArea',
          documentValue: `${areaVal.documentAreaOriginal} ${areaVal.documentAreaUnit}`,
          officialValue: `${areaVal.gisAreaAcres} Acres (${areaVal.gisAreaSqm} sqm)`,
          difference: `${areaVal.differenceSqm} sqm (${varPct.toFixed(2)}% variance)`,
          variancePercentage: varPct,
          severity: sev,
          confidence: 0.96,
          status: DISCREPANCY_STATUS.OPEN,
          description: `GIS Spatial Area Mismatch: Document area (${areaVal.documentAreaOriginal} ${areaVal.documentAreaUnit}) deviates from GIS shape area (${areaVal.gisAreaAcres} Acres) by ${varPct.toFixed(2)}%.`,
        });
      }
    }

    // ----------------------------------------------------
    // 4. GIS Boundary Validation Checks
    // ----------------------------------------------------
    if (gisValidation && gisValidation.boundaryValidation) {
      const bVal = gisValidation.boundaryValidation;
      const dirs = ['north', 'south', 'east', 'west'];
      let mismatchCount = 0;
      let warningCount = 0;

      dirs.forEach((dir) => {
        if (bVal[dir]?.status === 'MISMATCH') mismatchCount++;
        else if (bVal[dir]?.status === 'WARNING') warningCount++;
      });

      if (mismatchCount > 0 || demoScenario === 'BOUNDARY_CONFLICT' || bVal.status === 'MISMATCH') {
        let bSev = SEVERITY_LEVELS.MEDIUM;
        if (mismatchCount >= 3 || demoScenario === 'BOUNDARY_CONFLICT') bSev = SEVERITY_LEVELS.CRITICAL;
        else if (mismatchCount >= 2) bSev = SEVERITY_LEVELS.HIGH;
        else if (mismatchCount === 1) bSev = SEVERITY_LEVELS.MEDIUM;
        else bSev = SEVERITY_LEVELS.LOW;

        discrepancies.push({
          type: DISCREPANCY_TYPES.BOUNDARY_MISMATCH,
          field: 'boundaries',
          documentValue: `${bVal.north?.documentValue || ''} / ${bVal.west?.documentValue || ''}`,
          officialValue: `${bVal.north?.officialValue || ''} / ${bVal.west?.officialValue || ''}`,
          difference: `${mismatchCount} boundary directions mismatch (Match score: ${bVal.overallBoundaryMatch}%)`,
          variancePercentage: (100 - bVal.overallBoundaryMatch),
          severity: bSev,
          confidence: 0.92,
          status: DISCREPANCY_STATUS.OPEN,
          description: `Cadastral Boundary Encroachment/Mismatch: ${mismatchCount} boundary side(s) conflict with official cadastral FMB map. Overall boundary match score: ${bVal.overallBoundaryMatch}%.`,
        });
      }
    }

    // Remove duplicates by type + field
    const uniqueDiscrepancies = [];
    const seen = new Set();
    for (const d of discrepancies) {
      const key = `${d.type}_${d.field}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueDiscrepancies.push(d);
      }
    }

    return uniqueDiscrepancies;
  }

  /**
   * Calculate Overall Document Risk Score (0 to 100) and Categorize Level
   */
  calculateRiskScore(discrepancies = [], overallConfidence = 1.0) {
    if (!discrepancies || discrepancies.length === 0) {
      return {
        riskScore: 5,
        riskLevel: RISK_LEVELS.LOW,
      };
    }

    let score = 0;

    for (const d of discrepancies) {
      switch (d.severity) {
        case SEVERITY_LEVELS.CRITICAL:
          score += 45;
          break;
        case SEVERITY_LEVELS.HIGH:
          score += 30;
          break;
        case SEVERITY_LEVELS.MEDIUM:
          score += 18;
          break;
        case SEVERITY_LEVELS.LOW:
          score += 8;
          break;
        default:
          score += 10;
      }
    }

    // Add confidence penalty if confidence is degraded
    if (overallConfidence < 0.90) {
      score += Math.round((0.90 - overallConfidence) * 35);
    }

    score = Math.min(100, Math.max(0, score));

    let riskLevel = RISK_LEVELS.LOW;
    if (score > 70) {
      riskLevel = RISK_LEVELS.CRITICAL;
    } else if (score > 45) {
      riskLevel = RISK_LEVELS.HIGH;
    } else if (score > 20) {
      riskLevel = RISK_LEVELS.MEDIUM;
    } else {
      riskLevel = RISK_LEVELS.LOW;
    }

    return {
      riskScore: score,
      riskLevel,
    };
  }

  /**
   * Determine Role Based Routing based on Risk Level & Discrepancies
   */
  determineAssignedRole(riskLevel, discrepancies = []) {
    const hasCritical = discrepancies.some((d) => d.severity === SEVERITY_LEVELS.CRITICAL);
    const hasHigh = discrepancies.some((d) => d.severity === SEVERITY_LEVELS.HIGH);

    if (riskLevel === RISK_LEVELS.CRITICAL || hasCritical) {
      return {
        assignedRole: ROLES.DISTRICT_ADMIN,
        priority: SEVERITY_LEVELS.CRITICAL,
      };
    }

    if (riskLevel === RISK_LEVELS.HIGH || hasHigh) {
      return {
        assignedRole: ROLES.DISTRICT_EXPERT,
        priority: SEVERITY_LEVELS.HIGH,
      };
    }

    if (riskLevel === RISK_LEVELS.MEDIUM) {
      return {
        assignedRole: ROLES.VERIFYING_OFFICER,
        priority: SEVERITY_LEVELS.MEDIUM,
      };
    }

    return {
      assignedRole: ROLES.FIELD_OPERATOR,
      priority: SEVERITY_LEVELS.LOW,
    };
  }

  /**
   * Create single discrepancy in DB
   */
  async createDiscrepancy(data) {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const disc = new Discrepancy({
          document: data.documentId || data.document,
          parcel: data.parcelId || data.parcel || null,
          type: data.type,
          field: data.field,
          documentValue: data.documentValue,
          officialValue: data.officialValue || data.referenceValue,
          difference: data.difference,
          variancePercentage: data.variancePercentage,
          confidence: data.confidence || 0.9,
          severity: data.severity || SEVERITY_LEVELS.MEDIUM,
          status: data.status || DISCREPANCY_STATUS.OPEN,
          description: data.description,
        });

        await disc.save();
        return disc;
      } catch (e) {
        console.warn(`[DiscrepancyService] Discrepancy save warning: ${e.message}`);
      }
    }

    return {
      discrepancyId: `DISC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      ...data,
    };
  }

  /**
   * Persist a list of detected discrepancies in MongoDB
   */
  async persistDiscrepancies(discrepanciesList = [], documentId, parcelId = null) {
    const saved = [];
    for (const d of discrepanciesList) {
      const docDisc = await this.createDiscrepancy({
        ...d,
        documentId,
        parcelId,
      });
      saved.push(docDisc);
    }
    return saved;
  }

  /**
   * Get discrepancies from MongoDB with filtering and pagination
   */
  async getDiscrepancies(query = {}) {
    const {
      severity,
      status,
      type,
      documentId,
      page = 1,
      limit = 50,
    } = query;

    const filter = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (documentId) filter.document = documentId;

    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const [discrepancies, total] = await Promise.all([
        Discrepancy.find(filter)
          .populate('document', 'documentId originalFileName metadata status')
          .populate('parcel', 'parcelId surveyNumber village area')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit, 10)),
        Discrepancy.countDocuments(filter),
      ]);

      return {
        discrepancies,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / limit),
        },
      };
    }

    return { discrepancies: [], pagination: { total: 0, page: 1, limit: 50, pages: 1 } };
  }

  /**
   * Get single discrepancy by ID
   */
  async getDiscrepancyById(id) {
    const isCustomId = id.startsWith('DISC-');
    const query = isCustomId ? { discrepancyId: id } : { _id: id };

    return Discrepancy.findOne(query)
      .populate('document', 'documentId originalFileName metadata status extractedData')
      .populate('parcel');
  }

  /**
   * Resolve discrepancy
   */
  async resolveDiscrepancy(id, { status, resolutionNotes, currentUser }) {
    const disc = await this.getDiscrepancyById(id);
    if (!disc) throw new Error(`Discrepancy not found with ID: ${id}`);

    disc.status = status || DISCREPANCY_STATUS.RESOLVED;
    await disc.save();
    return disc;
  }
}

module.exports = new DiscrepancyService();
