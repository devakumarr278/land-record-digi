const documentPipelineService = require('./workflow/documentPipeline.service');

module.exports = {
  startProcessing: (docId, user, scenario) => documentPipelineService.startPipeline(docId, user, scenario),
  executePipeline: (docId, jobId) => documentPipelineService.executeRealPipeline(docId, jobId),
  getProcessingStatus: (docId) => documentPipelineService.getProcessingStatus(docId),
};
