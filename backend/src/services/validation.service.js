const Parcel = require('../models/Parcel');
const Document = require('../models/Document');
const env = require('../config/environment');
const { DISCREPANCY_TYPES, SEVERITY_LEVELS } = require('../utils/constants');

class ValidationService {
  /**
   * Run cross-validation against cadastral Reference Parcel registry
   */
  async validateExtractedData({ document, extractedData, fieldConfidence = {}, overallConfidence = 1.0 }) {
    const results = {
      isValid: true,
      flags: [],
      parcelFound: false,
      parcel: null,
      checks: {
        surveyNumberCheck: { status: 'PENDING' },
        ownerNameCheck: { status: 'PENDING' },
        areaCheck: { status: 'PENDING' },
        villageCheck: { status: 'PENDING' },
        duplicateCheck: { status: 'PENDING' },
        confidenceCheck: { status: 'PENDING' },
      },
    };

    const surveyNumber = extractedData.surveyNumber || document.metadata?.surveyNumber;
    const village = extractedData.village || document.metadata?.village;
    const district = extractedData.district || document.metadata?.district;
    const extractedOwner = (extractedData.ownerName || '').trim();
    const extractedArea = parseFloat(extractedData.landArea);

    // 1. Find Reference Parcel in registry
    let parcelQuery = {};
    if (surveyNumber) {
      parcelQuery.surveyNumber = new RegExp(`^${surveyNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }
    if (village) {
      parcelQuery.village = new RegExp(`^${village.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    const parcel = await Parcel.findOne(parcelQuery);

    if (parcel) {
      results.parcelFound = true;
      results.parcel = parcel;
      results.checks.surveyNumberCheck = {
        status: 'PASSED',
        documentValue: surveyNumber,
        referenceValue: parcel.surveyNumber,
      };

      // 2. Owner Name Match Check (Levenshtein or substring matching)
      const refOwner = (parcel.ownerName || '').trim();
      const isOwnerMatch = this.fuzzyNameMatch(extractedOwner, refOwner);
      if (!isOwnerMatch) {
        results.isValid = false;
        const flag = {
          type: DISCREPANCY_TYPES.OWNER_MISMATCH,
          field: 'ownerName',
          documentValue: extractedOwner,
          referenceValue: refOwner,
          severity: SEVERITY_LEVELS.HIGH,
          description: `Extracted owner name '${extractedOwner}' does not match official registry record '${refOwner}'.`,
        };
        results.flags.push(flag);
        results.checks.ownerNameCheck = { status: 'FAILED', ...flag };
      } else {
        results.checks.ownerNameCheck = {
          status: 'PASSED',
          documentValue: extractedOwner,
          referenceValue: refOwner,
        };
      }

      // 3. Area Match Check
      if (!isNaN(extractedArea) && parcel.area) {
        const areaDiff = Math.abs(extractedArea - parcel.area);
        const variancePct = (areaDiff / parcel.area) * 100;

        if (variancePct > env.AREA_VARIANCE_THRESHOLD_PERCENT) {
          results.isValid = false;
          const flag = {
            type: DISCREPANCY_TYPES.AREA_MISMATCH,
            field: 'landArea',
            documentValue: extractedArea,
            referenceValue: parcel.area,
            variancePercentage: parseFloat(variancePct.toFixed(2)),
            severity: variancePct > 20 ? SEVERITY_LEVELS.CRITICAL : SEVERITY_LEVELS.HIGH,
            description: `Document land area (${extractedArea} ${extractedData.areaUnit || 'Acres'}) deviates by ${variancePct.toFixed(1)}% from reference area (${parcel.area} ${parcel.areaUnit}). Threshold is ${env.AREA_VARIANCE_THRESHOLD_PERCENT}%.`,
          };
          results.flags.push(flag);
          results.checks.areaCheck = { status: 'FAILED', ...flag };
        } else {
          results.checks.areaCheck = {
            status: 'PASSED',
            documentValue: extractedArea,
            referenceValue: parcel.area,
            variancePercentage: parseFloat(variancePct.toFixed(2)),
          };
        }
      }

      // 4. Village check
      if (village && parcel.village) {
        results.checks.villageCheck = {
          status: 'PASSED',
          documentValue: village,
          referenceValue: parcel.village,
        };
      }
    } else {
      // Parcel not found in registry
      results.isValid = false;
      const flag = {
        type: DISCREPANCY_TYPES.SURVEY_MISMATCH,
        field: 'surveyNumber',
        documentValue: surveyNumber,
        referenceValue: null,
        severity: SEVERITY_LEVELS.CRITICAL,
        description: `Survey Number '${surveyNumber}' in Village '${village || 'Unknown'}' was not found in the official cadastral registry.`,
      };
      results.flags.push(flag);
      results.checks.surveyNumberCheck = { status: 'FAILED', ...flag };
    }

    // 5. Duplicate Record Check
    if (surveyNumber) {
      const duplicateDocs = await Document.find({
        _id: { $ne: document._id },
        'extractedData.surveyNumber': surveyNumber,
        status: { $in: ['COMPLETED', 'VALIDATING', 'PROCESSING'] },
      });

      if (duplicateDocs.length > 0 || document.demoScenario === 'DUPLICATE_RECORD') {
        results.isValid = false;
        const flag = {
          type: DISCREPANCY_TYPES.DUPLICATE_RECORD,
          field: 'surveyNumber',
          documentValue: surveyNumber,
          referenceValue: duplicateDocs.map((d) => d.documentId).join(', ') || 'DOC-PREV-RECORD-001',
          severity: SEVERITY_LEVELS.HIGH,
          description: `Survey Number '${surveyNumber}' has active or previously processed registration records. Potential duplicate digitization attempt.`,
        };
        results.flags.push(flag);
        results.checks.duplicateCheck = { status: 'FAILED', ...flag };
      } else {
        results.checks.duplicateCheck = { status: 'PASSED' };
      }
    }

    // 6. Confidence Threshold Validation
    if (overallConfidence < env.LOW_CONFIDENCE_THRESHOLD || document.demoScenario === 'LOW_CONFIDENCE') {
      results.isValid = false;
      const severity = overallConfidence < env.CRITICAL_CONFIDENCE_THRESHOLD ? SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM;
      const flag = {
        type: DISCREPANCY_TYPES.LOW_CONFIDENCE,
        field: 'confidence',
        documentValue: overallConfidence,
        referenceValue: env.LOW_CONFIDENCE_THRESHOLD,
        severity,
        description: `AI extraction overall confidence (${(overallConfidence * 100).toFixed(1)}%) is below acceptable threshold (${(env.LOW_CONFIDENCE_THRESHOLD * 100).toFixed(1)}%). Human verification required.`,
      };
      results.flags.push(flag);
      results.checks.confidenceCheck = { status: 'FAILED', ...flag };
    } else {
      results.checks.confidenceCheck = { status: 'PASSED', confidence: overallConfidence };
    }

    return results;
  }

  fuzzyNameMatch(nameA, nameB) {
    if (!nameA || !nameB) return false;
    const cleanA = nameA.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanB = nameB.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanA === cleanB) return true;
    if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return true;
    return false;
  }
}

module.exports = new ValidationService();
