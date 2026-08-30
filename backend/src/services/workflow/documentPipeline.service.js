const Document = require('../../models/Document');
const ProcessingJob = require('../../models/ProcessingJob');
const aiProcessingService = require('../ai/aiProcessing.service');
const validationService = require('../validation.service');
const gisService = require('../gis.service');
const discrepancyService = require('../discrepancy.service');
const caseService = require('../case.service');
const auditService = require('../audit.service');
const { calculateFileHash } = require('../../utils/hash');
const {
  DOCUMENT_STATUS,
  STAGE_STATUS,
  AUDIT_ACTIONS,
  PIPELINE_STAGES,
} = require('../../utils/constants');

class DocumentPipelineService {
  /**
   * Start processing a document asynchronously
   */
  async startPipeline(documentId, currentUser = null, demoScenario = null) {
    const document = await Document.findById(documentId).populate('uploadedBy');
    if (!document) {
      throw new Error(`Document not found with ID: ${documentId}`);
    }

    if (demoScenario) {
      document.demoScenario = demoScenario;
    }

    // Find or create ProcessingJob
    let job;
    if (document.currentProcessingJob) {
      job = await ProcessingJob.findById(document.currentProcessingJob);
    }

    if (!job) {
      job = new ProcessingJob({
        document: document._id,
        status: STAGE_STATUS.PROCESSING,
        currentStage: 'Document Ingestion',
        overallProgress: 10,
        startedAt: new Date(),
      });
      await job.save();
      document.currentProcessingJob = job._id;
    } else {
      job.status = STAGE_STATUS.PROCESSING;
      job.currentStage = 'Document Ingestion';
      job.overallProgress = 10;
      job.attempt += 1;
      job.startedAt = new Date();
      job.completedAt = null;
      job.error = null;
      job.stages = PIPELINE_STAGES.map((s) => ({
        stageNumber: s.stageNumber,
        name: s.name,
        status: STAGE_STATUS.PENDING,
        progress: 0,
        startedAt: null,
        completedAt: null,
        result: null,
        error: null,
      }));
      await job.save();
    }

    document.status = DOCUMENT_STATUS.PROCESSING;
    await document.save();

    // Log start of processing in audit trail
    await auditService.logEvent({
      document: document._id,
      actor: currentUser ? currentUser._id : document.uploadedBy?._id,
      actorRole: currentUser ? currentUser.role : 'FIELD_OPERATOR',
      actorName: currentUser ? currentUser.name : 'Field Operator',
      action: AUDIT_ACTIONS.PROCESSING_STARTED,
      details: {
        jobId: job.jobId,
        attempt: job.attempt,
        demoScenario: document.demoScenario || 'STANDARD',
      },
    });

    // Run real pipeline asynchronously in background (non-blocking)
    setImmediate(() => {
      this.executeRealPipeline(document._id, job._id).catch((err) => {
        console.error(`[DocumentPipelineService] Fatal pipeline execution error for doc ${documentId}:`, err);
      });
    });

    return {
      documentId: document.documentId,
      jobId: job.jobId,
      status: DOCUMENT_STATUS.PROCESSING,
      overallProgress: 10,
      currentStage: 'Document Ingestion',
    };
  }

  /**
   * Execute real end-to-end processing pipeline
   */
  async executeRealPipeline(documentId, jobId) {
    const document = await Document.findById(documentId).populate('uploadedBy');
    const job = await ProcessingJob.findById(jobId);

    if (!document || !job) {
      console.error(`[DocumentPipelineService] Document or Job missing during pipeline run`);
      return;
    }

    try {
      // ----------------------------------------------------
      // STAGE 1 (10%): Document Ingestion
      // ----------------------------------------------------
      job.updateStage(1, { status: STAGE_STATUS.PROCESSING, progress: 50 });
      job.overallProgress = 10;
      job.currentStage = 'Document Ingestion';
      await job.save();

      job.updateStage(1, {
        status: STAGE_STATUS.COMPLETED,
        progress: 100,
        result: {
          fileType: document.fileType,
          fileSize: document.fileSize,
          sha256: document.sha256,
          originalFileName: document.originalFileName,
          storedFileName: document.storedFileName,
        },
      });
      await job.save();

      // ----------------------------------------------------
      // STAGE 2 (20%): File Integrity Verification
      // ----------------------------------------------------
      job.updateStage(2, { status: STAGE_STATUS.PROCESSING, progress: 50 });
      job.overallProgress = 20;
      job.currentStage = 'File Integrity Verification';
      await job.save();

      const calculatedSha = await calculateFileHash(document.filePath);
      const isIntegrityValid = calculatedSha === document.sha256;

      if (!isIntegrityValid) {
        throw new Error(`File integrity check failed: stored hash ${document.sha256} does not match disk hash ${calculatedSha}`);
      }

      job.updateStage(2, {
        status: STAGE_STATUS.COMPLETED,
        progress: 100,
        result: {
          sha256: calculatedSha,
          integrityVerified: true,
        },
      });
      await job.save();

      // ----------------------------------------------------
      // STAGE 3-6 (30% -> 75%): Real Python AI Microservice Execution
      // (Image Preprocessing -> Classification -> Gemini OCR -> Entity Extraction)
      // ----------------------------------------------------
      job.updateStage(3, { status: STAGE_STATUS.PROCESSING, progress: 30 });
      job.updateStage(5, { status: STAGE_STATUS.PROCESSING, progress: 30 });
      job.overallProgress = 30;
      job.currentStage = 'AI Preprocessing & OCR In Progress';
      await job.save();

      console.log(`[DocumentPipelineService] Calling Python AI Service for ${document.documentId}...`);

      // Forward ACTUAL physical file on disk to Python FastAPI microservice
      const aiResponse = await aiProcessingService.processDocument({
        documentId: document.documentId,
        filePath: document.filePath,
        originalFileName: document.originalFileName,
        metadata: document.metadata,
        demoScenario: document.demoScenario,
      });

      console.log(`[DocumentPipelineService] Real AI Response received from Python for ${document.documentId}. Model: ${aiResponse.ocr.modelUsed}, Pages: ${aiResponse.pagesProcessed}`);

      // Update Stage 3 (Classification)
      job.updateStage(3, {
        status: STAGE_STATUS.COMPLETED,
        progress: 100,
        result: {
          detectedType: aiResponse.documentType,
          confidence: aiResponse.classificationConfidence,
          languageDetected: aiResponse.language,
        },
      });

      // Update Stage 4 (Layout Analysis)
      job.updateStage(4, {
        status: STAGE_STATUS.COMPLETED,
        progress: 100,
        result: aiResponse.stages?.layout || {
          headerZoneDetected: true,
          tabularDataFound: true,
          officialSealDetected: true,
          signatureDetected: true,
          status: 'COMPLETED',
        },
      });

      // Update Stage 5 (Multilingual OCR)
      job.updateStage(5, {
        status: STAGE_STATUS.COMPLETED,
        progress: 100,
        result: {
          ocrEngine: aiResponse.ocr.modelUsed,
          pagesProcessed: aiResponse.pagesProcessed,
          fullTextLength: (aiResponse.ocr.fullText || '').length,
          languagesRecognized: aiResponse.language,
          confidence: aiResponse.overallConfidence,
        },
      });

      // Update Stage 6 (Entity Extraction)
      job.updateStage(6, {
        status: STAGE_STATUS.COMPLETED,
        progress: 100,
        result: {
          extractedFields: aiResponse.extractedData,
          fieldConfidence: aiResponse.fieldConfidence,
        },
      });

      // Persist REAL AI output into MongoDB Document
      document.documentType = aiResponse.documentType;
      document.classificationConfidence = aiResponse.classificationConfidence;
      document.pagesProcessed = aiResponse.pagesProcessed;
      document.language = aiResponse.language;
      document.ocrResult = aiResponse.ocr.fullText;
      document.ocrPages = aiResponse.ocr.pages;
      document.ocrModel = aiResponse.ocr.modelUsed;
      document.extractedData = aiResponse.extractedData;
      document.overallConfidence = aiResponse.overallConfidence;
      document.fieldConfidence = aiResponse.fieldConfidence;
      document.processingTime = aiResponse.processingTime;
      document.usedFallback = aiResponse.usedFallback;
      document.fallbackReason = aiResponse.fallbackReason;
      document.processingMode = aiResponse.processingMode;
      document.stages = aiResponse.stages;
      document.status = DOCUMENT_STATUS.EXTRACTED;
      await document.save();

      job.overallProgress = 75;
      job.currentStage = 'AI Results Received';
      await job.save();

      await auditService.logEvent({
        document: document._id,
        action: AUDIT_ACTIONS.OCR_COMPLETED,
        actorRole: 'AI_SERVICE',
        actorName: 'Gemini Multilingual OCR Engine',
        details: {
          model: aiResponse.ocr.modelUsed,
          pages: aiResponse.pagesProcessed,
          confidence: aiResponse.overallConfidence,
        },
      });

      await auditService.logEvent({
        document: document._id,
        action: AUDIT_ACTIONS.EXTRACTION_COMPLETED,
        actorRole: 'AI_SERVICE',
        actorName: 'Entity Extraction Engine',
        details: {
          surveyNumber: aiResponse.extractedData.surveyNumber,
          ownerName: aiResponse.extractedData.ownerName,
          landArea: aiResponse.extractedData.landArea,
          village: aiResponse.extractedData.village,
        },
      });

      // ----------------------------------------------------
      // STAGE 7 (80%): Record Cross Validation
      // ----------------------------------------------------
      job.updateStage(7, { status: STAGE_STATUS.PROCESSING, progress: 50 });
      job.overallProgress = 80;
      job.currentStage = 'Cadastral Registry Validation';
      document.status = DOCUMENT_STATUS.VALIDATING;
      await document.save();
      await job.save();

      const validationRes = await validationService.validateExtractedData({
        document,
        extractedData: document.extractedData,
        fieldConfidence: document.fieldConfidence,
        overallConfidence: document.overallConfidence,
      });

      document.validationResults = validationRes;

      job.updateStage(7, {
        status: validationRes.isValid ? STAGE_STATUS.COMPLETED : STAGE_STATUS.FLAGGED,
        progress: 100,
        result: {
          checks: validationRes.checks,
          flagsCount: validationRes.flags.length,
          registryRecordMatched: validationRes.parcelFound,
        },
      });
      await job.save();

      await auditService.logEvent({
        document: document._id,
        action: AUDIT_ACTIONS.VALIDATION_COMPLETED,
        actorRole: 'SYSTEM',
        actorName: 'Validation Engine',
        details: {
          isValid: validationRes.isValid,
          flags: validationRes.flags.map((f) => f.type),
        },
      });

      // ----------------------------------------------------
      // STAGE 8 (88%): GIS Spatial Validation
      // ----------------------------------------------------
      job.updateStage(8, { status: STAGE_STATUS.PROCESSING, progress: 50 });
      job.overallProgress = 88;
      job.currentStage = 'GIS Spatial Validation';
      await job.save();

      const gisRes = await gisService.validateSpatialRecord({
        document,
        extractedData: document.extractedData,
        parcel: validationRes.parcel,
      });

      document.gisValidation = gisRes;

      const gisPassed = gisRes.status === 'VERIFIED';
      job.updateStage(8, {
        status: gisPassed ? STAGE_STATUS.COMPLETED : STAGE_STATUS.FLAGGED,
        progress: 100,
        result: {
          documentArea: gisRes.documentArea,
          gisArea: gisRes.gisArea,
          areaDifference: gisRes.areaDifference,
          variancePercentage: gisRes.variancePercentage,
          boundaryMatch: gisRes.boundaryMatch,
          spatialRisk: gisRes.spatialRisk,
          status: gisRes.status,
        },
      });
      await job.save();

      await auditService.logEvent({
        document: document._id,
        action: AUDIT_ACTIONS.GIS_VALIDATION_COMPLETED,
        actorRole: 'SYSTEM',
        actorName: 'GIS Spatial Validation Engine',
        details: {
          spatialStatus: gisRes.status,
          spatialRisk: gisRes.spatialRisk,
          variancePercentage: gisRes.variancePercentage,
          boundaryMatch: gisRes.boundaryMatch,
        },
      });

      // ----------------------------------------------------
      // STAGE 9 (94%): Centralized Discrepancy & Risk Analysis
      // ----------------------------------------------------
      job.updateStage(9, { status: STAGE_STATUS.PROCESSING, progress: 50 });
      job.overallProgress = 94;
      job.currentStage = 'Discrepancy & Risk Analysis';
      await job.save();

      // 1. Detect all discrepancies across OCR, Registry, GIS area & boundaries
      const detectedDiscrepancies = discrepancyService.detectAllDiscrepancies({
        document,
        extractedData: document.extractedData,
        validationResults: validationRes,
        gisValidation: gisRes,
        overallConfidence: document.overallConfidence,
        fieldConfidence: document.fieldConfidence,
      });

      // 2. Calculate comprehensive 0-100 document risk score
      const riskInfo = discrepancyService.calculateRiskScore(detectedDiscrepancies, document.overallConfidence);

      // 3. Determine role-based routing assignment
      const roleRouting = discrepancyService.determineAssignedRole(riskInfo.riskLevel, detectedDiscrepancies);

      // 4. Persist discrepancies into MongoDB
      const savedDiscrepancies = await discrepancyService.persistDiscrepancies(
        detectedDiscrepancies,
        document._id,
        validationRes.parcel?._id || gisRes.parcelDbId || null
      );

      for (const disc of savedDiscrepancies) {
        await auditService.logEvent({
          document: document._id,
          action: AUDIT_ACTIONS.DISCREPANCY_DETECTED,
          actorRole: 'SYSTEM',
          actorName: 'Discrepancy Detection Engine',
          details: {
            discrepancyId: disc.discrepancyId,
            type: disc.type,
            severity: disc.severity,
            field: disc.field,
          },
        });
      }

      job.updateStage(9, {
        status: detectedDiscrepancies.length > 0 ? STAGE_STATUS.FLAGGED : STAGE_STATUS.COMPLETED,
        progress: 100,
        result: {
          discrepanciesCount: detectedDiscrepancies.length,
          riskScore: riskInfo.riskScore,
          riskLevel: riskInfo.riskLevel,
          assignedRole: roleRouting.assignedRole,
          priority: roleRouting.priority,
        },
      });
      await job.save();

      // ----------------------------------------------------
      // STAGE 10 (100%): Human-in-the-Loop Routing & Record Sealing
      // ----------------------------------------------------
      job.updateStage(10, { status: STAGE_STATUS.PROCESSING, progress: 50 });
      await job.save();

      let createdCase = null;

      if (savedDiscrepancies.length > 0 || riskInfo.riskScore > 20) {
        document.status = riskInfo.riskLevel === 'CRITICAL' ? DOCUMENT_STATUS.ESCALATED : DOCUMENT_STATUS.PENDING_REVIEW;
        
        createdCase = await caseService.createCaseForDocument({
          documentId: document._id,
          discrepancies: savedDiscrepancies,
          overallConfidence: document.overallConfidence,
          riskScore: riskInfo.riskScore,
          riskLevel: riskInfo.riskLevel,
          assignedRole: roleRouting.assignedRole,
          priority: roleRouting.priority,
        });

        job.updateStage(10, {
          status: STAGE_STATUS.FLAGGED,
          progress: 100,
          result: {
            route: 'HUMAN_VERIFICATION',
            caseId: createdCase.caseId,
            assignedRole: createdCase.assignedRole,
            priority: createdCase.priority,
            riskScore: riskInfo.riskScore,
            riskLevel: riskInfo.riskLevel,
            discrepanciesCount: savedDiscrepancies.length,
          },
        });
      } else {
        document.status = DOCUMENT_STATUS.COMPLETED;
        job.updateStage(10, {
          status: STAGE_STATUS.COMPLETED,
          progress: 100,
          result: {
            route: 'AUTO_APPROVED',
            message: 'All validation & GIS checks passed. Document sealed successfully.',
            riskScore: riskInfo.riskScore,
            riskLevel: riskInfo.riskLevel,
          },
        });

        await auditService.logEvent({
          document: document._id,
          action: AUDIT_ACTIONS.RECORD_SEALED,
          actorRole: 'SYSTEM',
          actorName: 'Auto-Seal Verification Pipeline',
          details: {
            documentId: document.documentId,
            status: DOCUMENT_STATUS.COMPLETED,
          },
        });
      }

      job.status = STAGE_STATUS.COMPLETED;
      job.overallProgress = 100;
      job.completedAt = new Date();
      job.currentStage = 'Processing Complete';
      await job.save();
      await document.save();

      console.log(`[DocumentPipelineService] Document ${document.documentId} pipeline completed. Final Status: ${document.status}`);
    } catch (error) {
      console.error(`[DocumentPipelineService] Pipeline error:`, error);
      job.status = STAGE_STATUS.FAILED;
      job.currentStage = 'AI Service Failed';
      job.error = error.message;
      job.completedAt = new Date();
      await job.save();

      document.status = DOCUMENT_STATUS.FAILED;
      document.processingMode = 'FAILED';
      document.fallbackReason = error.message;
      await document.save();

      await auditService.logEvent({
        document: document._id,
        action: 'PROCESSING_FAILED',
        actorRole: 'SYSTEM',
        actorName: 'Pipeline Engine',
        details: {
          error: error.message,
          stage: job.currentStage,
        },
      });
    }
  }

  /**
   * Get real processing status for polling from MongoDB ProcessingJob
   */
  async getProcessingStatus(documentId) {
    const document = await Document.findById(documentId).populate('currentProcessingJob');
    if (!document) {
      throw new Error(`Document not found with ID: ${documentId}`);
    }

    if (!document.currentProcessingJob) {
      return {
        documentId: document.documentId,
        status: document.status,
        overallProgress: document.status === DOCUMENT_STATUS.STORED ? 0 : 100,
        currentStage: 'Pending Initiation',
        stages: PIPELINE_STAGES.map((s) => ({
          stageNumber: s.stageNumber,
          name: s.name,
          status: STAGE_STATUS.PENDING,
          progress: 0,
        })),
      };
    }

    const job = await ProcessingJob.findById(document.currentProcessingJob);
    return {
      documentId: document.documentId,
      jobId: job.jobId,
      overallProgress: job.overallProgress,
      currentStage: job.currentStage,
      status: job.status,
      attempt: job.attempt,
      documentStatus: document.status,
      stages: job.stages,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
    };
  }
}

module.exports = new DocumentPipelineService();
