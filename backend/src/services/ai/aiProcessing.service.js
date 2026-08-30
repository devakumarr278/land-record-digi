const axios = require('axios');
const fs = require('fs');
const path = require('path');
const env = require('../../config/environment');

class AIProcessingService {
  constructor() {
    this.baseUrl = env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    this.timeout = 600000; // 10 minutes timeout for multi-page historical documents
  }

  /**
   * Check if Python FastAPI service is reachable and healthy
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
      return {
        isAvailable: response.status === 200,
        data: response.data,
      };
    } catch (error) {
      return {
        isAvailable: false,
        error: error.message,
      };
    }
  }

  /**
   * Send actual physical document file to Python FastAPI AI Microservice via multipart/form-data
   * @param {Object} params
   * @param {string} params.documentId - MongoDB Document tracking ID
   * @param {string} params.filePath - Absolute path to physical file on disk
   * @param {string} params.originalFileName - Original uploaded file name
   * @param {Object} params.metadata - Metadata hint (district, taluk, village, etc.)
   * @param {string} params.demoScenario - Optional scenario (for /demo endpoints only)
   */
  async processDocument({ documentId, filePath, originalFileName, metadata = {}, demoScenario = null }) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Physical document file does not exist on disk at: ${absolutePath}`);
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const fileName = originalFileName || path.basename(absolutePath);
    const fileBlob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append('file', fileBlob, fileName);
    formData.append('document_id', String(documentId || ''));
    formData.append('document_type', metadata.documentType || 'auto');
    formData.append('language', metadata.language || 'ta');
    formData.append('enable_fallback', 'true');

    if (demoScenario) {
      formData.append('demo_scenario', String(demoScenario));
    }

    console.log(`[AIProcessingService] Forwarding physical file (${fileName}, ${fileBuffer.length} bytes) to AI Microservice: ${this.baseUrl}/api/v1/process-document`);

    try {
      const response = await axios.post(`${this.baseUrl}/api/v1/process-document`, formData, {
        timeout: this.timeout,
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error?.message || response.data?.message || 'Python AI Service returned unsuccessful response');
      }

      const raw = response.data;
      return this.normalizeAIResponse(raw, fileName);
    } catch (error) {
      console.error(`[AIProcessingService] Python AI Microservice request failed: ${error.message}`);
      throw new Error(`AI Processing Service Failure: ${error.message}`);
    }
  }

  /**
   * Normalize raw response from Python FastAPI into clean internal domain structure
   */
  normalizeAIResponse(raw, fileName) {
    const ocrData = raw.ocr || {};
    const extractedData = raw.extracted_data || raw.extractedData || {};
    const confidenceData = raw.confidence || {};
    const processingInfo = raw.processing || {};

    const fullText = ocrData.full_text || ocrData.fullText || null;
    const pages = ocrData.pages || [];
    const modelUsed = ocrData.model_used || ocrData.model || 'gemini-3.6-flash';

    const normalizedExtracted = {
      surveyNumber: extractedData.survey_number || extractedData.surveyNumber || null,
      subDivision: extractedData.sub_division || extractedData.subDivision || null,
      ownerName: extractedData.owner_name || extractedData.ownerName || null,
      fatherName: extractedData.father_name || extractedData.fatherName || null,
      district: extractedData.district || null,
      taluk: extractedData.taluk || null,
      village: extractedData.village || null,
      landArea: typeof extractedData.area === 'number' ? extractedData.area : extractedData.landArea || null,
      areaUnit: extractedData.area_unit || extractedData.areaUnit || 'Acres',
      classification: extractedData.classification || null,
      boundaries: extractedData.boundaries || { north: null, south: null, east: null, west: null },
    };

    const overallConf = typeof confidenceData.overall === 'number' ? confidenceData.overall : raw.overallConfidence || 0.9;
    const fieldConf = confidenceData.fields || raw.fieldConfidence || {};

    return {
      success: true,
      processingId: raw.processing_id || raw.documentId,
      filename: raw.filename || fileName,
      documentType: raw.document_type || raw.documentType || 'PATTA',
      classificationConfidence: raw.classification_confidence || 0.94,
      pagesProcessed: raw.pages_processed || pages.length || 1,
      language: raw.language || ['Tamil', 'English'],
      ocr: {
        success: Boolean(ocrData.success !== false),
        modelUsed,
        fullText,
        pages,
      },
      extractedData: normalizedExtracted,
      overallConfidence: overallConf,
      fieldConfidence: fieldConf,
      processingTime: processingInfo.processing_time_seconds || 0,
      usedFallback: Boolean(processingInfo.used_fallback || raw.usedFallback),
      fallbackReason: raw.fallbackReason || null,
      processingMode: raw.processingMode || (processingInfo.used_fallback ? 'FALLBACK' : 'AI'),
      stages: raw.stages || {},
      notes: raw.notes || [],
    };
  }
}

module.exports = new AIProcessingService();
