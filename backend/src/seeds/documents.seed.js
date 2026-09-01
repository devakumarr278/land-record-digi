const crypto = require('crypto');
const Document = require('../models/Document');
const User = require('../models/User');
const Discrepancy = require('../models/Discrepancy');

const SEED_DOCUMENTS = [
  {
    documentId: 'LR-1021',
    originalFileName: 'patta_scan_01.jpg',
    storedFileName: 'patta_scan_01_1788156822.jpg',
    filePath: 'uploads/patta_scan_01.jpg',
    fileType: 'image/jpeg',
    fileSize: 1240000,
    documentType: 'PATTA',
    status: 'REVIEW_REQUIRED',
    confidenceScore: 0.74,
    metadata: {
      surveyNumber: '125/2',
      village: 'Kinathukadavu',
      taluk: 'Pollachi',
      district: 'Coimbatore',
      documentType: 'Ownership Record',
    },
    extractedData: {
      surveyNumber: '125/2',
      subDivision: '2A',
      ownerName: 'MEENA R',
      fatherName: 'Ramasamy',
      district: 'Coimbatore',
      taluk: 'Pollachi',
      village: 'Kinathukadavu',
      landArea: 1.80,
      areaUnit: 'Acres',
      classification: 'Dry Land (Punjai)',
      boundaries: {
        north: 'Survey No 125/1 Cart Track',
        south: 'Survey No 125/3 Murugan Land',
        east: 'Pollachi Main Road',
        west: 'Odai Water Body',
      },
    },
    ocrData: {
      fullText: 'தமிழ்நாடு அரசு வருவாய்த்துறை பட்டா எண் 458\nகிராமம்: கிணத்துக்கடவு\nபுல எண்: 125/2\nஉரிமையாளர் பெயர்: மீனா ஆர்',
      modelUsed: 'gemini-3.6-flash',
    },
    processingHistory: [
      { stage: 'UPLOAD', status: 'COMPLETED', message: 'Document uploaded successfully' },
      { stage: 'ENHANCE', status: 'COMPLETED', message: 'CLAHE and adaptive binarization applied' },
      { stage: 'OCR', status: 'COMPLETED', message: 'Bilingual OCR completed with 94.2% character accuracy' },
      { stage: 'EXTRACT', status: 'COMPLETED', message: 'Key revenue entities parsed' },
      { stage: 'VALIDATE', status: 'FAILED', message: 'Discrepancy detected: Owner name mismatch with LRMS' },
    ],
  },
  {
    documentId: 'LR-1025',
    originalFileName: 'cadastral_map_02.jpg',
    storedFileName: 'cadastral_map_02_1788156823.jpg',
    filePath: 'uploads/cadastral_map_02.jpg',
    fileType: 'image/jpeg',
    fileSize: 2450000,
    documentType: 'CADASTRAL_MAP',
    status: 'PROCESSING',
    confidenceScore: 0.91,
    metadata: {
      surveyNumber: '125/2',
      village: 'Kinathukadavu',
      taluk: 'Pollachi',
      district: 'Coimbatore',
      documentType: 'Cadastral Map',
    },
    extractedData: {
      surveyNumber: '125/2',
      village: 'Kinathukadavu',
      taluk: 'Pollachi',
      landArea: 1.80,
      areaUnit: 'Acres',
    },
    processingHistory: [
      { stage: 'UPLOAD', status: 'COMPLETED', message: 'Document uploaded' },
      { stage: 'ENHANCE', status: 'COMPLETED', message: 'Deskewing and resolution optimization completed' },
    ],
  },
  {
    documentId: 'LR-1028',
    originalFileName: 'fmb_sketch_03.jpg',
    storedFileName: 'fmb_sketch_03_1788156824.jpg',
    filePath: 'uploads/fmb_sketch_03.jpg',
    fileType: 'image/jpeg',
    fileSize: 1890000,
    documentType: 'FMB_SKETCH',
    status: 'VALIDATING',
    confidenceScore: 0.88,
    metadata: {
      surveyNumber: '118/3',
      village: 'Anaimalai',
      taluk: 'Pollachi',
      district: 'Coimbatore',
      documentType: 'Field Measurement Book (FMB)',
    },
    extractedData: {
      surveyNumber: '118/3',
      village: 'Anaimalai',
      taluk: 'Pollachi',
      landArea: 8.20,
      areaUnit: 'Acres',
      ownerName: 'TN Revenue Dept',
    },
    processingHistory: [
      { stage: 'UPLOAD', status: 'COMPLETED' },
      { stage: 'ENHANCE', status: 'COMPLETED' },
      { stage: 'OCR', status: 'COMPLETED' },
      { stage: 'EXTRACT', status: 'COMPLETED' },
    ],
  },
  {
    documentId: 'LR-1030',
    originalFileName: 'patta_kovilpalayam_145_2.pdf',
    storedFileName: 'patta_kovilpalayam_145_2_1788156825.pdf',
    filePath: 'uploads/patta_kovilpalayam_145_2.pdf',
    fileType: 'application/pdf',
    fileSize: 850000,
    documentType: 'PATTA',
    status: 'PROCESSING',
    confidenceScore: 0.94,
    metadata: {
      surveyNumber: '145/2',
      village: 'Kovilpalayam',
      taluk: 'Coimbatore North',
      district: 'Coimbatore',
      documentType: 'Ownership Record',
    },
    extractedData: {
      surveyNumber: '145/2',
      village: 'Kovilpalayam',
      taluk: 'Coimbatore North',
      ownerName: 'Ramasamy Gounder',
      landArea: 2.12,
      areaUnit: 'Acres',
    },
  },
  {
    documentId: 'LR-1014',
    originalFileName: 'cadastral_map_anaimalai_118_3.jpg',
    storedFileName: 'cadastral_map_anaimalai_118_3_1788156826.jpg',
    filePath: 'uploads/cadastral_map_anaimalai_118_3.jpg',
    fileType: 'image/jpeg',
    fileSize: 3100000,
    documentType: 'CADASTRAL_MAP',
    status: 'COMPLETED',
    confidenceScore: 0.98,
    metadata: {
      surveyNumber: '118/3',
      village: 'Anaimalai',
      taluk: 'Pollachi',
      district: 'Coimbatore',
      documentType: 'Cadastral Map',
    },
    extractedData: {
      surveyNumber: '118/3',
      village: 'Anaimalai',
      taluk: 'Pollachi',
      ownerName: 'TN Revenue Dept',
      landArea: 8.20,
      areaUnit: 'Acres',
    },
  },
  {
    documentId: 'LR-1009',
    originalFileName: 'patta_sulur_54_2.jpg',
    storedFileName: 'patta_sulur_54_2_1788156827.jpg',
    filePath: 'uploads/patta_sulur_54_2.jpg',
    fileType: 'image/jpeg',
    fileSize: 1120000,
    documentType: 'PATTA',
    status: 'COMPLETED',
    confidenceScore: 0.99,
    metadata: {
      surveyNumber: '54/2',
      village: 'Sulur',
      taluk: 'Sulur',
      district: 'Coimbatore',
      documentType: 'Ownership Record',
    },
    extractedData: {
      surveyNumber: '54/2',
      village: 'Sulur',
      taluk: 'Sulur',
      ownerName: 'Karthik Subramanian',
      landArea: 3.10,
      areaUnit: 'Acres',
    },
  },
];

const seedDocuments = async () => {
  console.log('[Seed] Seeding Workflow Documents...');
  const operatorUser = await User.findOne({ email: 'operator@bhoomi.ai' });
  const uId = operatorUser ? operatorUser._id : (await User.findOne())._id;

  for (const docData of SEED_DOCUMENTS) {
    const sha256 = crypto.createHash('sha256').update(docData.documentId + docData.originalFileName).digest('hex');
    const existing = await Document.findOne({ documentId: docData.documentId });
    let savedDoc;
    if (existing) {
      Object.assign(existing, { ...docData, uploadedBy: uId, sha256 });
      savedDoc = await existing.save();
    } else {
      const doc = new Document({ ...docData, uploadedBy: uId, sha256 });
      savedDoc = await doc.save();
    }

    // Seed discrepancy for LR-1021
    if (docData.documentId === 'LR-1021') {
      const existingDisc = await Discrepancy.findOne({ document: savedDoc._id });
      if (!existingDisc) {
        await Discrepancy.create({
          document: savedDoc._id,
          type: 'OWNER_MISMATCH',
          field: 'ownerName',
          documentValue: 'MEENA R',
          referenceValue: 'MURUGAN KUMAR',
          severity: 'HIGH',
          description: "Document owner 'MEENA R' does not match LRMS Registry 'MURUGAN KUMAR'",
          status: 'OPEN',
        });
      }
    }
  }
  console.log(`[Seed] Successfully seeded ${SEED_DOCUMENTS.length} workflow documents and discrepancies.`);
};

module.exports = { seedDocuments, SEED_DOCUMENTS };
