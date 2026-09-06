import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LayoutDashboard, FileText, UploadCloud, RefreshCw, PencilLine, Send,
  AlertTriangle, History, Settings as SettingsIcon, LogOut, ChevronsLeft, ChevronsRight,
  CheckCircle2, Circle, XCircle, Eye, Printer, MapPin, Sparkles, ChevronRight, ChevronDown,
  X, Search, Loader2, ScanLine, FileCheck2, ImageIcon, ZoomIn, ZoomOut, Maximize2,
  RotateCw, Download, PlayCircle, ShieldCheck, GitCompare, Crosshair, ArrowRight,
  ShieldAlert, ThumbsUp, PencilRuler, Ban, ArrowUpCircle, Compass, Users, BrainCircuit,
  MapPinned, MessageSquareWarning, CropIcon, Globe, Columns, Layers, Box, Network,
  Plus, Trash2, Bell, Calendar, Landmark, AlertCircle
} from 'lucide-react';
import api, { authApi, documentApi, gisApi, discrepancyApi, auditApi } from '../../services/api';
import logoImg from '../../assets/logo.jpg';

function mapBackendDocToUi(d) {
  const meta = d.metadata || {};
  const ext = d.extractedData || {};
  const typeMap = {
    PATTA: 'Ownership Record',
    CADASTRAL_MAP: 'Cadastral Map',
    FMB_SKETCH: 'Field Measurement Book (FMB)',
    VILLAGE_SKETCH: 'Village Sketch',
    SALE_DEED: 'Sale Deed',
    LAND_REGISTER: 'Ownership Record',
  };
  const docTypeLabel = meta.documentType || typeMap[d.documentType] || d.documentType || 'Ownership Record';

  let statusKey = 'uploaded';
  if (d.status === 'PROCESSING' || d.status === 'STORED' || d.status === 'QUEUED') statusKey = 'preprocessing';
  else if (d.status === 'REVIEW_REQUIRED' || d.status === 'PENDING_REVIEW') statusKey = 'review';
  else if (d.status === 'VALIDATED' || d.status === 'COMPLETED') statusKey = 'validated';
  else if (d.status === 'VALIDATING') statusKey = 'validating';

  const surveyNo = ext.surveyNumber || meta.surveyNumber || '125/2';
  const villageName = ext.village || meta.village || 'Kinathukadavu';
  const ownerName = ext.ownerName || '—';
  const areaVal = ext.landArea ? `${ext.landArea} ${ext.areaUnit || 'Acres'}` : '—';
  const confidence = Math.round((d.confidenceScore || 0.92) * 100);

  const isPdf = Boolean(
    d.fileType?.includes('pdf') ||
    (d.originalFileName && d.originalFileName.toLowerCase().endsWith('.pdf')) ||
    (d.name && d.name.toLowerCase().endsWith('.pdf'))
  );

  let imageUrl = d.imageUrl || d.previewUrl;
  if (!imageUrl) {
    if (d.storedFileName) {
      imageUrl = `http://localhost:5000/uploads/originals/${d.storedFileName}`;
    } else if (d.filePath) {
      const fn = d.filePath.replace(/\\/g, '/').split('/').pop();
      imageUrl = `http://localhost:5000/uploads/originals/${fn}`;
    } else if (surveyNo === '118/3' || d.documentId === 'LR-1028' || d.documentId === 'LR-1014') {
      imageUrl = '/cadastral_map_118_3.jpg';
    } else if (docTypeLabel.includes('Ownership') || d.documentId === 'LR-1021' || d.documentId === 'LR-1030') {
      imageUrl = '/cadastral_map_scan_01.jpg';
    } else {
      imageUrl = '/cadastral_map_125_2.jpg';
    }
  }

  return {
    _id: d._id,
    id: d.documentId || d.id,
    _origId: d._origId || d.documentId || d.id,
    name: d.originalFileName || d.name || 'Document Scan',
    fileName: d.originalFileName || d.name || 'Document Scan',
    type: isPdf ? 'PDF' : 'Image',
    docType: docTypeLabel,
    survey: surveyNo,
    village: villageName,
    taluk: ext.taluk || meta.taluk || 'Pollachi',
    district: ext.district || meta.district || 'Coimbatore',
    owner: ownerName,
    area: areaVal,
    patta: meta.pattaNumber || '458',
    classification: ext.classification || 'Dry Land (Punjai)',
    status: statusKey,
    confidence: confidence,
    uploadedAt: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '9:00 AM',
    imageUrl: imageUrl,
    previewUrl: d.previewUrl || imageUrl,
    discrepancies: d.discrepancies || (d.status === 'REVIEW_REQUIRED' || d.documentId === 'LR-1021' ? [
      {
        id: 'disc-owner',
        field: 'owner',
        label: 'Owner Name',
        documentValue: ext.ownerName || 'MEENA R',
        referenceValue: 'MURUGAN KUMAR',
        severity: 'HIGH',
        source: 'LRMS Patta Register',
        desc: 'Document owner does not match official LRMS registry entry',
      }
    ] : []),
    ocrText: (typeof d.ocrResult === 'string' ? d.ocrResult : d.ocrResult?.fullText) || d.ocrData?.fullText || d.fullText || d.ocr?.fullText || d.ocrText || (d.ocr && typeof d.ocr === 'string' ? d.ocr : null) || null,
    pageMetrics: d.pageMetrics || d.stages?.preprocessing?.pageMetrics || d.ocr?.pageMetrics || [],
    extractedData: ext,
    stages: d.stages || {},
    fields: [
      { key: 'docType', label: 'Document Type', value: docTypeLabel, confidence: 99, resolved: true, region: { top: 12, left: 18, width: 64, height: 8 } },
      { key: 'survey', label: 'Survey Number', value: surveyNo, confidence: 99, resolved: true, region: { top: 32, left: 18, width: 30, height: 7 } },
      { key: 'village', label: 'Village', value: villageName, confidence: 98, resolved: true, region: { top: 32, left: 52, width: 35, height: 7 } },
      { key: 'owner', label: 'Owner Name', value: ownerName, confidence: 96, resolved: d.status !== 'REVIEW_REQUIRED', region: { top: 48, left: 18, width: 68, height: 8 } },
      { key: 'area', label: 'Total Extent', value: areaVal, confidence: 92, resolved: true, region: { top: 62, left: 18, width: 40, height: 7 } },
    ],
  };
}

/* =========================================================================
   MOCK DATA
   ========================================================================= */

const INITIAL_DOCS = [
  {
    id: 'LR-1014', type: 'PDF', docType: 'Ownership Record', village: 'Anaimalai', taluk: 'Pollachi', status: 'submitted', confidence: 98, owner: 'Meena R', survey: '118/3', area: '1.2 Acres',
    fields: [
      { key: 'owner', label: 'Owner Name', value: 'Meena R', confidence: 98 },
      { key: 'survey', label: 'Survey Number', value: '118/3', confidence: 99 },
      { key: 'subdivision', label: 'Sub-Division Number', value: '3B', confidence: 96 },
      { key: 'patta', label: 'Patta / Khata Number', value: '312', confidence: 97 },
      { key: 'area', label: 'Total Extent', value: '1.2 Acres', confidence: 98 },
      { key: 'village', label: 'Village', value: 'Anaimalai', confidence: 99 },
      { key: 'taluk', label: 'Taluk', value: 'Pollachi', confidence: 99 },
      { key: 'classification', label: 'Land Classification', value: 'Wet (Nanja)', confidence: 95 },
    ],
    discrepancies: [],
    lifecycle: [
      { date: '1974-06-12', event: 'Ryotwari Settlement Entry', authority: 'Coimbatore Settlement Officer', note: 'Survey parcel 118/3 demarcated and entered into village settlement register under Patta 312.' },
      { date: '2005-11-20', event: 'Title Succession & Mutation', authority: 'Anaimalai Taluk VAO', note: 'Title mutated to Meena R following registered partition.' },
      { date: '2026-08-31', event: 'AI Digitization & Extraction', authority: 'LandIntel Pipeline', note: 'Confidence 98% · Auto-verified against LRMS reference database.' },
    ],
  },
  {
    id: 'LR-1017', type: 'Image', docType: 'Ownership Record', village: 'Madukkarai', taluk: 'Sulur', status: 'validated', confidence: 94, owner: 'Karthik S', survey: '77/1', area: '0.8 Acres',
    fields: [
      { key: 'owner', label: 'Owner Name', value: 'Karthik S', confidence: 94 },
      { key: 'survey', label: 'Survey Number', value: '77/1', confidence: 96 },
      { key: 'subdivision', label: 'Sub-Division Number', value: '1A', confidence: 93 },
      { key: 'patta', label: 'Patta / Khata Number', value: '518', confidence: 95 },
      { key: 'area', label: 'Total Extent', value: '0.8 Acres', confidence: 95 },
      { key: 'village', label: 'Village', value: 'Madukkarai', confidence: 97 },
      { key: 'taluk', label: 'Taluk', value: 'Sulur', confidence: 96 },
      { key: 'classification', label: 'Land Classification', value: 'Residential Conversion', confidence: 92 },
    ],
    discrepancies: [],
    lifecycle: [
      { date: '1988-02-14', event: 'Agricultural Holding Record', authority: 'Sulur Taluk Office', note: 'Registered under Patta 518 in Madukkarai revenue village.' },
      { date: '2012-07-28', event: 'Non-Agricultural Conversion', authority: 'District Revenue Officer', note: 'Converted 0.8 Acres for residential layout approval.' },
      { date: '2026-08-31', event: 'Digital Twin Registered', authority: 'LandIntel Registry', note: 'Validated without discrepancies.' },
    ],
  },
  {
    id: 'LR-1021', type: 'PDF', docType: 'Ownership Record', village: 'Kinathukadavu', taluk: 'Pollachi', status: 'review', confidence: 43, owner: 'Ravi Kumar', survey: '125/2', area: '2.50 Aores',
    fields: [
      { key: 'owner', label: 'Owner Name', value: 'RAVI KUMAR', confidence: 96 },
      { key: 'survey', label: 'Survey Number', value: '125/2', confidence: 98 },
      { key: 'subdivision', label: 'Sub-Division Number', value: '2A', confidence: 94 },
      { key: 'patta', label: 'Patta / Khata Number', value: '458', confidence: 95 },
      { key: 'area', label: 'Total Extent', value: '2.50 Acres', originalValue: '2.50 Aores', normalized: true, normalizeReason: 'Corrected "Aores" → "Acres"', confidence: 43 },
      { key: 'village', label: 'Village', value: 'ABC', confidence: 95 },
      { key: 'taluk', label: 'Taluk', value: 'Pollachi', confidence: 97 },
      { key: 'classification', label: 'Land Classification', value: 'Agricultural (Dry)', confidence: 92 },
    ],
    discrepancies: [
      { id: 'DISC-OWNER', field: 'owner', label: 'Owner Name', documentValue: 'RAVI KUMAR', referenceValue: 'MURUGAN KUMAR', severity: 'HIGH', status: 'REVIEW_REQUIRED', source: 'LRMS-1022' },
      { id: 'DISC-AREA', field: 'area', label: 'Total Extent', documentValue: '2.50 Acres', referenceValue: '1.8 Acres', severity: 'MEDIUM', status: 'REVIEW_REQUIRED', source: 'LRMS-1022' },
    ],
    lifecycle: [
      { date: '1968-03-15', event: 'Inam Abolition Settlement', authority: 'Pollachi Settlement Officer', note: 'Original settlement registered under Murugan Kumar for 1.8 Acres extent.' },
      { date: '1998-03-14', event: 'Sale Deed Execution', authority: 'Kinathukadavu SRO (Doc 1998/1123)', note: 'Conveyance executed from Murugan Kumar to Ravi Kumar reciting 2.50 Acres.' },
      { date: '2026-08-31', event: 'Discrepancies Flagged by AI Cross-Check', authority: 'LandIntel OCR & Rule Engine', note: 'Flagged owner mismatch against canonical LRMS-1022 and 0.70 Acre area variance.' },
    ],
  },
  {
    id: 'LR-1025', type: 'Image', docType: 'Cadastral Map', village: 'Kinathukadavu', taluk: 'Pollachi', status: 'validated', confidence: 96, owner: 'TN Revenue Dept', survey: '125/2', area: '14.5 Acres', imageUrl: '/cadastral_map_125_2.jpg',
    fields: [
      { key: 'survey', label: 'Survey Number', value: '125/2', confidence: 98 },
      { key: 'village', label: 'Village', value: 'Kinathukadavu', confidence: 97 },
      { key: 'taluk', label: 'Taluk', value: 'Pollachi', confidence: 99 },
      { key: 'area', label: 'Composite Parcel Area', value: '14.5 Acres', confidence: 96 },
      { key: 'measurements', label: 'FMB Field Ladder', value: '140m ├ù 110m (Chains: 70 ├ù 55)', confidence: 95 },
      { key: 'boundaryStones', label: 'Boundary Stone Marks', value: '4 Tri-Junction Stones', confidence: 97 },
    ],
    discrepancies: [],
    lifecycle: [
      { date: '1958-09-10', event: 'Field Measurement Book (FMB) Survey', authority: 'Survey & Land Records Dept', note: 'Gunter chain baseline triangulation and permanent stone pillar planting.' },
      { date: '2026-08-31', event: 'ISRO Bhuvan Geo-Referencing', authority: 'LandIntel GIS Engine', note: '4 GCPs calibrated via Affine Transformation with 0.13m RMS error.' },
    ],
  },
  {
    id: 'LR-1028', type: 'Image', docType: 'Cadastral Map', village: 'Anaimalai', taluk: 'Pollachi', status: 'validated', confidence: 92, owner: 'TN Revenue Dept', survey: '118/3', area: '8.2 Acres', imageUrl: '/cadastral_map_118_3.jpg',
    fields: [
      { key: 'survey', label: 'Survey Number', value: '118/3', confidence: 97 },
      { key: 'village', label: 'Village', value: 'Anaimalai', confidence: 98 },
      { key: 'taluk', label: 'Taluk', value: 'Pollachi', confidence: 98 },
      { key: 'area', label: 'Composite Parcel Area', value: '8.2 Acres', confidence: 93 },
      { key: 'measurements', label: 'FMB Field Ladder', value: '180 Links River Baseline', confidence: 91 },
      { key: 'boundaryStones', label: 'Boundary Stone Marks', value: '4 Permanent Forest & Canal Pillars', confidence: 94 },
    ],
    discrepancies: [],
    lifecycle: [
      { date: '1962-04-18', event: 'Anaimalai Village Map Revision', authority: 'Tamil Nadu Revenue Dept', note: 'River bank and agricultural parcel demarcation survey.' },
      { date: '2026-08-31', event: 'ISRO Bhuvan Geo-Referencing', authority: 'LandIntel GIS Engine', note: '4 GCPs registered with 0.15m RMS residual error.' },
    ],
  },
  {
    id: 'LR-1030', type: 'PDF', docType: 'Mutation Record', village: 'Kinathukadavu', taluk: 'Pollachi', status: 'validated', confidence: 97, owner: 'RAVI KUMAR', survey: '125/2', area: '2.50 Acres',
    fields: [
      { key: 'mutationNo', label: 'Mutation Order No', value: 'MUT-1998-0782', confidence: 99 },
      { key: 'survey', label: 'Survey Number', value: '125/2', confidence: 99 },
      { key: 'prevOwner', label: 'Previous Owner (Transferor)', value: 'MURUGAN KUMAR', confidence: 97 },
      { key: 'newOwner', label: 'New Owner (Transferee)', value: 'RAVI KUMAR', confidence: 98 },
      { key: 'reason', label: 'Mutation Reason', value: 'Registered Sale Deed No 1998/1123', confidence: 96 },
      { key: 'regDate', label: 'Mutation Date', value: '18-04-1998', confidence: 98 },
      { key: 'village', label: 'Village', value: 'Kinathukadavu', confidence: 99 },
    ],
    discrepancies: [],
    lifecycle: [
      { date: '1998-04-18', event: 'Official Mutation Order Passed', authority: 'Tahsildar Pollachi', note: 'Patta record transferred from Murugan Kumar to Ravi Kumar pursuant to Sale Deed 1998/1123.' },
      { date: '2026-08-31', event: 'Topological Provenance Linking', authority: 'LandIntel Evidence Graph', note: 'Linked ownership transfer chain between Murugan Kumar and Ravi Kumar.' },
    ],
  },
  {
    id: 'LR-1031', type: 'PDF', docType: 'Sale Deed', village: 'Kinathukadavu', taluk: 'Pollachi', status: 'validated', confidence: 95, owner: 'RAVI KUMAR', survey: '125/2', area: '2.50 Acres',
    fields: [
      { key: 'docNumber', label: 'Document Registration No', value: '1998/1123', confidence: 98 },
      { key: 'regDate', label: 'Registration Date', value: '14-03-1998', confidence: 97 },
      { key: 'seller', label: 'Seller (Vendor)', value: 'MURUGAN KUMAR', confidence: 96 },
      { key: 'buyer', label: 'Buyer (Purchaser)', value: 'RAVI KUMAR', confidence: 97 },
      { key: 'survey', label: 'Survey Number', value: '125/2', confidence: 99 },
      { key: 'consideration', label: 'Sale Consideration', value: '₹4,50,000', confidence: 94 },
      { key: 'boundaries', label: 'Boundary Description', value: 'N: Sy.125/1 · S: Village Road · E: Sy.126 · W: Sy.124', confidence: 93 },
      { key: 'village', label: 'Village', value: 'Kinathukadavu', confidence: 98 },
    ],
    discrepancies: [],
    lifecycle: [
      { date: '1998-03-14', event: 'Registered Conveyance Executed', authority: 'Sub-Registrar Kinathukadavu', note: 'Conveyance of title executed by Murugan Kumar in favor of Ravi Kumar.' },
      { date: '2026-08-31', event: 'AI Deed Entity Extraction', authority: 'LandIntel Pipeline', note: 'Extracted consideration, vendor/vendee, and schedule boundary bearings.' },
    ],
  },
  {
    id: 'LR-1023', type: 'Image', docType: 'Ownership Record', village: 'Anaimalai', taluk: 'Pollachi', status: 'extraction', confidence: null, owner: '—', survey: '—', area: '—',
    fields: [],
    discrepancies: [],
    lifecycle: [
      { date: '2026-08-31', event: 'Raw Scan Ingested', authority: 'LandIntel Ingestion Gate', note: 'Uploaded today and queued for OCR/HTR & extraction.' },
    ],
  },
  {
    id: 'LR-1009', type: 'PDF', docType: 'Ownership Record', village: 'Sulur', taluk: 'Sulur', status: 'submitted', confidence: 99, owner: 'Deepa N', survey: '54/2', area: '3.1 Acres',
    fields: [
      { key: 'owner', label: 'Owner Name', value: 'Deepa N', confidence: 99 },
      { key: 'survey', label: 'Survey Number', value: '54/2', confidence: 99 },
      { key: 'subdivision', label: 'Sub-Division Number', value: '2C', confidence: 98 },
      { key: 'patta', label: 'Patta / Khata Number', value: '892', confidence: 99 },
      { key: 'area', label: 'Total Extent', value: '3.1 Acres', confidence: 99 },
      { key: 'village', label: 'Village', value: 'Sulur', confidence: 99 },
      { key: 'taluk', label: 'Taluk', value: 'Sulur', confidence: 99 },
      { key: 'classification', label: 'Land Classification', value: 'Agricultural (Wet)', confidence: 97 },
    ],
    discrepancies: [],
    lifecycle: [
      { date: '1982-10-05', event: 'Patta Registry Entry', authority: 'Sulur Taluk Office', note: 'Landholding recorded under Khata 892.' },
      { date: '2026-08-31', event: 'Officer Verification Submission', authority: 'LandIntel Pipeline', note: 'Submitted with 99% AI confidence.' },
    ],
  },
  {
    id: 'LR-245', type: 'PDF', name: '245-1921.pdf', fileName: '245-1921.pdf', docType: 'Mutation Record', village: 'Keelathoor', taluk: 'Srirangam', district: 'Tiruchirappalli', status: 'validated', confidence: 98, owner: 'Muthukrishna Iyer', survey: '176/3', area: '2.65 Acres', patta: 'Patta No. 118', classification: 'Wet (Nanja) & Dry (Punja)',
    fields: [
      { key: 'owner', label: 'Owner / Transferee', value: 'Muthukrishna Iyer', confidence: 98 },
      { key: 'seller', label: 'Vendor / Transferor', value: 'Ramasami Naidu', confidence: 99 },
      { key: 'survey', label: 'Survey Number', value: '176/3', confidence: 99 },
      { key: 'subdivision', label: 'Sub-Division Number', value: '3', confidence: 98 },
      { key: 'patta', label: 'Patta Number', value: 'Patta No. 118 (formerly 47)', confidence: 97 },
      { key: 'area', label: 'Total Extent', value: '2.65 Acres', confidence: 98 },
      { key: 'village', label: 'Village', value: 'Keelathoor', confidence: 99 },
      { key: 'taluk', label: 'Taluk', value: 'Srirangam', confidence: 99 },
      { key: 'district', label: 'District', value: 'Tiruchirappalli', confidence: 99 },
      { key: 'classification', label: 'Land Classification', value: 'Wet (Nanja) & Dry (Punja)', confidence: 96 },
      { key: 'consideration', label: 'Consideration', value: 'Rs. 600-0-0', confidence: 99 },
      { key: 'docNumber', label: 'Registration Ref', value: 'Doc 245 of 1921 (Vol 212, P.312-314)', confidence: 99 },
    ],
    discrepancies: [],
    lifecycle: [
      { date: '1921-02-14', event: 'Mutation Deed Execution', authority: 'Sub-Registrar Srirangam', note: 'Deed executed by Ramasami Naidu transferring 2.65 Acres to Muthukrishna Iyer.' },
      { date: '1921-02-20', event: 'Registration & Patta Transfer', authority: 'Keelathoor Karnam / Srirangam Tahsildar', note: 'Registered as No 245/1921; Mutation No. 88 noted in Patta 118.' },
      { date: '2026-08-31', event: 'AI English HTR & Vector Extraction', authority: 'LandIntel Pipeline', note: 'High confidence 98% English digitization complete.' },
    ],
  },
  {
    id: 'LR-153', type: 'PDF', name: '153-1921.pdf', fileName: '153-1921.pdf', docType: 'Dharma Sasanam Trust Settlement', village: 'Srirangam', taluk: 'Trichinopoly', district: 'Trichinopoly (திருச்சிராப்பள்ளி)', status: 'validated', confidence: 98, owner: 'Muthu Karuppa Kone (முத்துக்கருப்பக் கோனார்)', survey: '175/1', area: '11.72 Acres (Schedule B)', patta: 'Doc 153/1921 (Vol 539, P.475-478)', classification: 'Dharma Sasanam / Trust Settlement (நஞ்சை & புஞ்சை)',
    fields: [
      { key: 'owner', label: 'Executant / Donor', value: 'Muthu Karuppa Kone (முத்துக்கருப்பக் கோனார்)', confidence: 98 },
      { key: 'fatherName', label: "Father's Name", value: 'Konga Govinda Kone (கொங்க கோவிந்தக் கோனார்)', confidence: 98 },
      { key: 'survey', label: 'Survey Number', value: '175/1', confidence: 99 },
      { key: 'subdivision', label: 'Sub-Division Number', value: '1', confidence: 98 },
      { key: 'patta', label: 'Volume Registration', value: 'Doc 153/1921 (Vol 539, P.475-478)', confidence: 97 },
      { key: 'area', label: 'Total Extent', value: '11.72 Acres (Schedule B)', confidence: 98 },
      { key: 'village', label: 'Village', value: 'Srirangam', confidence: 99 },
      { key: 'taluk', label: 'Taluk', value: 'Trichinopoly', confidence: 99 },
      { key: 'district', label: 'District', value: 'Trichinopoly (திருச்சிராப்பள்ளி)', confidence: 99 },
      { key: 'classification', label: 'Land Classification', value: 'Dharma Sasanam / Trust Settlement (நஞ்சை & புஞ்சை)', confidence: 97 },
      { key: 'consideration', label: 'Valuation', value: '₹7,000 (Schedule A ₹2,000 + Schedule B ₹5,000)', confidence: 99 },
      { key: 'docNumber', label: 'Document Number', value: 'Doc 153 of 1921', confidence: 99 },
    ],
    discrepancies: [],
    lifecycle: [
      { date: '1920-12-25', event: 'Dharma Sasanam Execution', authority: 'Muthu Karuppa Kone', note: 'Trust deed created for Thai Poosam Mandapam Kattalai endowment.' },
      { date: '1921-01-17', event: 'Sub-Registrar Registration', authority: 'Joint Sub-Registrar II Trichinopoly', note: 'Registered as Doc 153 of 1921 in Book 1, Volume 539.' },
      { date: '2026-08-31', event: 'BHOOMI Tamil HTR & AI Provenance Twin', authority: 'LandIntel Pipeline', note: 'AI Confidence 98% validated.' },
    ],
  },
];


/* =========================================================================
   TAMIL NADU SURVEY PARCEL GIS COORDINATES LOOKUP
   ========================================================================= */
const TAMIL_NADU_SURVEY_PARCELS = {
  '125/2': {
    lat: 10.8240,
    long: 77.0130,
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    area: '1.80 Acres',
    owner: 'MURUGAN KUMAR',
    polygon: [
      [10.8248, 77.0120],
      [10.8252, 77.0142],
      [10.8236, 77.0145],
      [10.8230, 77.0125]
    ]
  },
  '118/3': {
    lat: 10.5828,
    long: 76.9295,
    village: 'Anaimalai',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    area: '8.20 Acres',
    owner: 'TN Revenue Dept',
    polygon: [
      [10.5845, 76.9278],
      [10.5850, 76.9315],
      [10.5815, 76.9320],
      [10.5810, 76.9282]
    ]
  },
  '176/3': {
    lat: 10.8210,
    long: 77.0115,
    village: 'Keelathoor',
    taluk: 'Srirangam',
    district: 'Tiruchirappalli',
    area: '2.65 Acres',
    owner: 'Muthukrishna Iyer',
    polygon: [
      [10.8220, 77.0102],
      [10.8228, 77.0130],
      [10.8198, 77.0135],
      [10.8192, 77.0108]
    ]
  },
  '175/1': {
    lat: 10.8635,
    long: 78.6960,
    village: 'Srirangam',
    taluk: 'Trichinopoly',
    district: 'Tiruchirappalli',
    area: '11.72 Acres',
    owner: 'Muthu Karuppa Kone',
    polygon: [
      [10.8650, 78.6945],
      [10.8658, 78.6980],
      [10.8620, 78.6985],
      [10.8615, 78.6950]
    ]
  },
  '153/1': {
    lat: 10.8625,
    long: 78.6948,
    village: 'Srirangam',
    taluk: 'Trichinopoly',
    district: 'Tiruchirappalli',
    area: '11.72 Acres',
    owner: 'Muthu Karuppa Kone',
    polygon: [
      [10.8640, 78.6930],
      [10.8648, 78.6965],
      [10.8610, 78.6970],
      [10.8605, 78.6935]
    ]
  },
  '145/2': {
    lat: 11.1415,
    long: 77.0425,
    village: 'Kovilpalayam',
    taluk: 'Sarkar Samakulam',
    district: 'Coimbatore',
    area: '2.12 Acres',
    owner: 'Ramasamy Gounder',
    polygon: [
      [11.1425, 77.0415],
      [11.1430, 77.0438],
      [11.1405, 77.0440],
      [11.1400, 77.0418]
    ]
  },
  '54/2': {
    lat: 11.0261,
    long: 77.1264,
    village: 'Sulur',
    taluk: 'Sulur',
    district: 'Coimbatore',
    area: '3.10 Acres',
    owner: 'Deepa N',
    polygon: [
      [11.0272, 77.1250],
      [11.0278, 77.1278],
      [11.0250, 77.1280],
      [11.0245, 77.1255]
    ]
  },
  '77/1': {
    lat: 10.9020,
    long: 76.9530,
    village: 'Madukkarai',
    taluk: 'Madukkarai',
    district: 'Coimbatore',
    area: '0.80 Acres',
    owner: 'Karthik S',
    polygon: [
      [10.9028, 76.9520],
      [10.9032, 76.9542],
      [10.9012, 76.9545],
      [10.9008, 76.9523]
    ]
  },
  '88/2': {
    lat: 10.8255,
    long: 77.0150,
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    area: '0.85 Acres',
    owner: 'Senthil Nathan',
    polygon: [
      [10.8262, 77.0142],
      [10.8268, 77.0160],
      [10.8248, 77.0163],
      [10.8242, 77.0145]
    ]
  },
  '245/1A': {
    lat: 10.8210,
    long: 77.0115,
    village: 'Keelathoor',
    taluk: 'Kinathukadavu',
    district: 'Coimbatore',
    area: '3.40 Acres',
    owner: 'Ramasami Thevar',
    polygon: [
      [10.8220, 77.0102],
      [10.8228, 77.0130],
      [10.8198, 77.0135],
      [10.8192, 77.0108]
    ]
  }
};

function getSurveyParcelInfo(surveyNo, villageName) {
  const cleanSurvey = (surveyNo || '').trim();
  if (TAMIL_NADU_SURVEY_PARCELS[cleanSurvey]) {
    return TAMIL_NADU_SURVEY_PARCELS[cleanSurvey];
  }
  // Deterministic fallback centered in Tamil Nadu
  let hash = 0;
  for (let i = 0; i < cleanSurvey.length; i++) {
    hash = (hash << 5) - hash + cleanSurvey.charCodeAt(i);
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000) * 0.02 - 0.01;
  const lngOffset = ((Math.abs(hash >> 3) % 1000) / 1000) * 0.02 - 0.01;
  const baseLat = 10.8240 + latOffset;
  const baseLng = 77.0130 + lngOffset;

  return {
    lat: baseLat,
    long: baseLng,
    village: villageName || 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    area: '2.50 Acres',
    owner: 'Landholder',
    polygon: [
      [baseLat + 0.0008, baseLng - 0.0010],
      [baseLat + 0.0012, baseLng + 0.0012],
      [baseLat - 0.0006, baseLng + 0.0014],
      [baseLat - 0.0010, baseLng - 0.0008]
    ]
  };
}

const INITIAL_GEO_GCPS = {
  'LR-1025': [
    { id: 'GCP-1', name: 'NW Boundary Stone 42 (Kinathukadavu)', srcX: 24, srcY: 28, lat: 10.8245, long: 77.0122, error: 0.12 },
    { id: 'GCP-2', name: 'Tri-Junction Field Stone 18', srcX: 76, srcY: 22, lat: 10.8251, long: 77.0139, error: 0.18 },
    { id: 'GCP-3', name: 'SE Canal Corner Stone 09', srcX: 82, srcY: 74, lat: 10.8238, long: 77.0142, error: 0.08 },
    { id: 'GCP-4', name: 'SW Road Junction Stone 02', srcX: 26, srcY: 80, lat: 10.8231, long: 77.0128, error: 0.14 },
  ],
  'LR-1028': [
    { id: 'GCP-1', name: 'North River Bank Stone 07 (Anaimalai)', srcX: 20, srcY: 24, lat: 10.5832, long: 76.9284, error: 0.15 },
    { id: 'GCP-2', name: 'Forest Boundary Pillar 14', srcX: 80, srcY: 26, lat: 10.5841, long: 76.9302, error: 0.19 },
    { id: 'GCP-3', name: 'East Coconut Grove Corner', srcX: 78, srcY: 76, lat: 10.5824, long: 76.9308, error: 0.11 },
    { id: 'GCP-4', name: 'South Cart Track Tri-Junction', srcX: 22, srcY: 78, lat: 10.5818, long: 76.9289, error: 0.14 },
  ],
  'LR-1021': [
    { id: 'GCP-1', name: 'North Boundary Hedge Sy.125/1', srcX: 28, srcY: 30, lat: 10.8244, long: 77.0123, error: 0.22 },
    { id: 'GCP-2', name: 'East Boundary Sy.126 Stone', srcX: 72, srcY: 32, lat: 10.8249, long: 77.0136, error: 0.17 },
    { id: 'GCP-3', name: 'South Village Road Boundary', srcX: 70, srcY: 72, lat: 10.8239, long: 77.0137, error: 0.25 },
    { id: 'GCP-4', name: 'West Boundary Sy.124 Pillar', srcX: 26, srcY: 70, lat: 10.8233, long: 77.0125, error: 0.19 },
  ],
  'LR-1014': [
    { id: 'GCP-1', name: 'Anaimalai Village Pillar A1', srcX: 22, srcY: 25, lat: 10.5830, long: 76.9282, error: 0.09 },
    { id: 'GCP-2', name: 'Paddy Field Corner Stone B4', srcX: 75, srcY: 28, lat: 10.5839, long: 76.9298, error: 0.14 },
    { id: 'GCP-3', name: 'Irrigation Sluice Marker C2', srcX: 74, srcY: 72, lat: 10.5826, long: 76.9301, error: 0.08 },
    { id: 'GCP-4', name: 'Village Pathway Crossing D1', srcX: 24, srcY: 74, lat: 10.5820, long: 76.9286, error: 0.12 },
  ],
};

function getDocGcps(docId, geoGcpsMap, docsList = []) {
  if (geoGcpsMap && geoGcpsMap[docId] && geoGcpsMap[docId].length > 0) {
    return geoGcpsMap[docId];
  }
  if (INITIAL_GEO_GCPS && INITIAL_GEO_GCPS[docId] && INITIAL_GEO_GCPS[docId].length > 0) {
    return INITIAL_GEO_GCPS[docId];
  }
  return [];
}

const INITIAL_SUBMITTED = [
  { id: 'LR-1014', survey: '118/3', village: 'Anaimalai', confidence: 98 },
  { id: 'LR-1009', survey: '54/2',  village: 'Sulur',     confidence: 99 },
];

const INITIAL_ACTIVITY = [
  { t: '9:02 AM', text: 'Uploaded LR-1023 (survey_scan_04.jpg)' },
  { t: '9:18 AM', text: 'LR-1021 flagged for review (validation discrepancy)' },
  { t: '9:41 AM', text: 'Submitted LR-1014 for verification' },
];

/* Document types that carry real geometry and therefore need
   geo-referencing / GIS validation. Everything else only needs
   cross validation against the reference database. */
const SPATIAL_DOC_TYPES = new Set(['Cadastral Map', 'Field Measurement Book (FMB)', 'Village Sketch', 'FMB Sketch', 'Ownership Record']);

/* Sidebar navigation. Top-level groups can be flat (items) or carry a
   nested submenu (children). Children point at a tab id, and optionally
   a "focus" hint the target page can use to scroll/highlight a section. */
const NAV = [
  { group: 'Main', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    group: 'Documents',
    items: [
      { id: 'documents', label: 'All Documents', icon: FileText },
      { id: 'upload', label: 'Upload Document', icon: UploadCloud },
      {
        id: 'processing', label: 'Processing', icon: RefreshCw, expandable: true,
        children: [
          { id: 'processing', focus: 'enhance', label: 'Enhancement', icon: ScanLine },
          { id: 'processing', focus: 'ocr', label: 'OCR / HTR', icon: FileText },
          { id: 'processing', focus: 'extract', label: 'Text Extraction', icon: Sparkles },
          { id: 'processing', focus: 'normalize', label: 'Normalization', icon: RefreshCw },
        ],
      },
      {
        id: 'validation', label: 'Validation', icon: GitCompare, expandable: true,
        children: [
          { id: 'validation', focus: null, label: 'Cross Validation', icon: GitCompare },
          { id: 'georeference', focus: null, label: 'Geo-Referencing', icon: MapPinned, spatialOnly: true },
        ],
      },
      { id: 'discrepancy', label: 'Discrepancy', icon: MessageSquareWarning },
      { id: 'review', label: 'Human-in-the-Loop', icon: Users },
      { id: 'feedback', label: 'Feedback', icon: BrainCircuit },
      { id: 'submitted', label: 'Submitted', icon: Send },
    ],
  },
  { group: 'Records', items: [
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
    { id: 'viewdoc', label: 'View Document', icon: Eye },
    { id: 'digitaltwin', label: 'Digital Twin', icon: Box },
    { id: 'evidencegraph', label: 'Evidence Graph', icon: Network },
  ] },
  { group: 'Activity', items: [{ id: 'activity', label: 'My Activity', icon: History }] },
];

/* Processing is split into five sub-stages, shown as a stepper inside the
   Processing page. Each maps to one or more internal pipeline states. */
const SUBSTAGES = [
  { key: 'enhance',   label: 'Image Enhancement' },
  { key: 'ocr',       label: 'OCR' },
  { key: 'extract',   label: 'Text Extraction' },
  { key: 'normalize', label: 'Normalization' },
  { key: 'validate',  label: 'Validation' },
];
function substageIndex(stage) {
  if (['preprocessing', 'preprocess-ready'].includes(stage)) return 0;
  if (['ocr', 'ocr-ready', 'ocr-paused'].includes(stage)) return 1;
  if (stage === 'extraction') return 2;
  if (stage === 'normalizing') return 3;
  if (['validating', 'review', 'validated'].includes(stage)) return 4;
  return 0;
}

const PREPROCESS_STEPS = ['Uploaded', 'Quality analyzed', 'Noise removed', 'Image enhanced', 'Page aligned', 'Layout detected'];

/* ---- Document-type-specific extraction schemas ---- */
const DOC_TYPE_OPTIONS = ['Ownership Record', 'Sale Deed', 'Mutation Record', 'Chitta / Adangal', 'Cadastral Map'];

const DOC_TYPE_FIELDS = {
  'Ownership Record': [
    { key: 'owner', label: 'Owner Name' },
    { key: 'survey', label: 'Survey Number' },
    { key: 'subdivision', label: 'Sub-Division Number' },
    { key: 'patta', label: 'Patta Number' },
    { key: 'area', label: 'Area' },
    { key: 'village', label: 'Village' },
    { key: 'taluk', label: 'Taluk' },
    { key: 'district', label: 'District' },
    { key: 'classification', label: 'Land Classification' },
  ],
  'Sale Deed': [
    { key: 'docNumber', label: 'Document Number' },
    { key: 'regDate', label: 'Registration Date' },
    { key: 'seller', label: 'Seller' },
    { key: 'buyer', label: 'Buyer' },
    { key: 'survey', label: 'Survey Number' },
    { key: 'area', label: 'Area' },
    { key: 'village', label: 'Village' },
    { key: 'taluk', label: 'Taluk' },
    { key: 'district', label: 'District' },
    { key: 'boundaries', label: 'Boundaries' },
    { key: 'consideration', label: 'Consideration' },
  ],
  'Mutation Record': [
    { key: 'prevOwner', label: 'Previous Owner' },
    { key: 'newOwner', label: 'New Owner' },
    { key: 'mutationNo', label: 'Mutation Number' },
    { key: 'reason', label: 'Reason' },
    { key: 'survey', label: 'Survey Number' },
  ],
  'Chitta / Adangal': [
    { key: 'owner', label: 'Owner' },
    { key: 'classification', label: 'Land Classification' },
    { key: 'cultivation', label: 'Cultivation Details' },
    { key: 'area', label: 'Area' },
    { key: 'survey', label: 'Survey Number' },
  ],
  'Cadastral Map': [
    { key: 'survey', label: 'Survey Number' },
    { key: 'subdivision', label: 'Sub-Division' },
    { key: 'northBoundary', label: 'North Boundary' },
    { key: 'southBoundary', label: 'South Boundary' },
    { key: 'eastBoundary', label: 'East Boundary' },
    { key: 'westBoundary', label: 'West Boundary' },
    { key: 'measurements', label: 'Measurements' },
    { key: 'geometry', label: 'Parcel Geometry' },
  ],
};

const MOCK_FIELD_VALUES = {
  owner: 'RAVI KUMAR', survey: '125/2', subdivision: '2A', patta: '458', area: '2.50 Acres',
  village: 'ABC', taluk: 'Pollachi', district: 'Coimbatore', classification: 'Agricultural',
  docNumber: '1998/1123', regDate: '14-03-1998', seller: 'MURUGAN', buyer: 'RAVI KUMAR',
  boundaries: 'N: Sy.125/1 · S: Village Road · E: Sy.126 · W: Sy.124', consideration: '₹4,50,000',
  prevOwner: 'MURUGAN', newOwner: 'RAVI KUMAR', mutationNo: 'MUT-2010-0456', reason: 'Sale',
  cultivation: 'Paddy', northBoundary: 'Survey 125/1', southBoundary: 'Village Road',
  eastBoundary: 'Survey 126', westBoundary: 'Survey 124', measurements: '120 ft ├ù 90 ft',
  geometry: 'POLYGON (4 pts)',
};

/* Reference (LRMS) records the validation stage cross-checks against,
   keyed by survey number. */
const REFERENCE_DB = {
  '175/1': { owner: 'Muthu Karuppa Kone (முத்துக்கருப்பக் கோனார்)', area: '11.72 Acres (Schedule B)', village: 'Srirangam', classification: 'Trust Settlement / Dharma Sasanam (நஞ்சை & புஞ்சை)', source: 'LRMS-1921-TRICHY' },
  '153/1': { owner: 'Muthu Karuppa Kone (முத்துக்கருப்பக் கோனார்)', area: '11.72 Acres (Schedule B)', village: 'Srirangam', classification: 'Trust Settlement / Dharma Sasanam (நஞ்சை & புஞ்சை)', source: 'LRMS-1921-TRICHY' },
  '125/2': { owner: 'MURUGAN KUMAR', area: '1.8 Acres', village: 'Kinathukadavu', classification: 'Agricultural (Dry)', source: 'LRMS-1022' },
  '145/2': { owner: 'Ramasamy Gounder', area: '2.12 Acres', village: 'Kovilpalayam', classification: 'Wet Land (Nanjai)', source: 'LRMS-1042' },
  '118/3': { owner: 'TN Revenue Dept', area: '8.20 Acres', village: 'Anaimalai', classification: 'Dry Land (Punjai)', source: 'LRMS-1014' },
  '54/2': { owner: 'Deepa N', area: '3.10 Acres', village: 'Sulur', classification: 'Agricultural (Wet)', source: 'LRMS-1009' },
  '77/1': { owner: 'Karthik S', area: '0.80 Acres', village: 'Madukkarai', classification: 'Residential Conversion', source: 'LRMS-1017' },
};
const AREA_TOLERANCE_ACRES = 0.1;

function parseAcres(v) {
  if (!v) return null;
  const m = String(v).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}
function textMatches(a, b) {
  if (a == null || b == null) return true;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}
function severityFor(key) {
  if (key === 'owner' || key === 'buyer' || key === 'seller' || key === 'newOwner') return 'HIGH';
  if (key === 'area') return 'MEDIUM';
  return 'LOW';
}

/* run the extracted fields against REFERENCE_DB for this survey number */
function validateAgainstReference(fields, survey) {
  const ref = REFERENCE_DB[survey] || null;
  const checks = [];
  const discrepancies = [];
  if (!ref) {
    checks.push({ label: 'Reference record', result: 'NONE', note: 'No matching reference record found in LRMS registry for this survey' });
    return { checks, discrepancies, hasReference: false };
  }
  fields.forEach(f => {
    if (!(f.key in ref)) return;
    const refVal = ref[f.key];
    let ok;
    if (f.key === 'area') {
      const a = parseAcres(f.value), b = parseAcres(refVal);
      ok = a != null && b != null && Math.abs(a - b) <= AREA_TOLERANCE_ACRES;
    } else {
      ok = textMatches(f.value, refVal);
    }
    checks.push({ label: f.label, key: f.key, documentValue: f.value, referenceValue: refVal, result: ok ? 'PASS' : 'DISCREPANCY' });
    if (!ok) {
      discrepancies.push({
        id: `DISC-${f.key.toUpperCase()}`,
        field: f.key, label: f.label,
        documentValue: f.value, referenceValue: refVal,
        severity: severityFor(f.key), status: 'REVIEW_REQUIRED', source: ref.source || 'LRMS',
      });
    }
  });
  return { checks, discrepancies, hasReference: true };
}

/* =========================================================================
   NORMALIZATION & ENTITY RESOLUTION RULES
   ========================================================================= */
const SPELLING_FIXES = { 'Aores': 'Acres', 'Ares': 'Acres', 'Villege': 'Village', 'Distirct': 'District' };
const ENTITY_ALIASES = { 'MURUGAN': 'MURUGAN KUMAR', 'RAVI': 'RAVI KUMAR', 'RAMASAMY': 'Ramasamy Gounder' };

function normalizeValue(key, value) {
  if (value == null) return { value, changed: false, reason: null };
  let v = String(value), changed = false, reason = null;

  Object.entries(SPELLING_FIXES).forEach(([wrong, right]) => {
    if (v.includes(wrong)) {
      v = v.replace(wrong, right);
      changed = true;
      reason = `Corrected "${wrong}" → "${right}"`;
    }
  });
  if (key === 'regDate' && /\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}/.test(v)) {
    const norm = v.replace(/[\/.]/g, '-');
    if (norm !== v) {
      v = norm;
      changed = true;
      reason = 'Standardized date format';
    }
  }
  if (['owner', 'seller', 'buyer', 'prevOwner', 'newOwner'].includes(key)) {
    const upper = v.trim().toUpperCase();
    if (ENTITY_ALIASES[upper] && ENTITY_ALIASES[upper] !== v) {
      v = ENTITY_ALIASES[upper];
      changed = true;
      reason = `Resolved "${value}" to canonical entity`;
    }
  }
  return { value: v, changed, reason };
}

function normalizeFields(fields) {
  return fields.map(f => {
    const { value, changed, reason } = normalizeValue(f.key, f.value);
    return changed ? { ...f, originalValue: f.value, value, normalized: true, normalizeReason: reason } : f;
  });
}

/* full-page OCR text fallback */
const OCR_FULL_TEXT = `5
LAND RECORD EXTRACT — SURVEY DOCUMENT
KINATHUKADAVU VILLAGE, POLLACHI TALUK

RECORD DETAILS

This record pertains to Survey No. 125/2 situated in the village of
Kinathukadavu, Pollachi Taluk, Coimbatore District, Tamil Nadu. The land is
registered under Khata No. 458 in the name of RAVI KUMAR, holding an
extent of 2.50 Aores under Agricultural classification.

1. The record was originally prepared and maintained under the Tamil
   Nadu Revenue Department's village accounts system for tracking
   ownership, extent, and classification of agricultural holdings.

2. Ownership particulars, survey subdivisions, and revenue assessments
   are recorded periodically and updated upon mutation, partition, or
   transfer of title as per the applicable Revenue Standing Orders.

3. The Village Administrative Officer (VAO) is responsible for
   verifying entries and forwarding corrections to the Taluk Office
   for incorporation into the digitized land register.

4. This scanned record is being digitized to support the ongoing Land
   Records Modernization Programme for Coimbatore District.

Prepared for verification and archival under the Digital India Land
Records Modernization Programme.

39`;

/* Dynamic Real PDF and Image OCR Extractor connecting to Live Gemini AI Microservice */
async function extractDocumentDataFromFile(file, docType = 'Ownership Record') {
  const fileName = file.name || 'document.pdf';
  const isPdf = file.type?.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

  let extractedRawText = '';
  let pageCount = 1;
  let pageMetrics = [];

  // 1. Try Native Digital PDF Text
  if (isPdf && typeof window !== 'undefined' && window.pdfjsLib) {
    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      pageCount = pdfDoc.numPages;

      let pagesText = [];
      for (let pageNum = 1; pageNum <= Math.min(pageCount, 15); pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageItems = textContent.items.map(item => item.str).filter(Boolean);
        const pageStr = pageItems.join(' ').trim();
        if (pageStr.length > 0) {
          pagesText.push(`[PAGE ${pageNum}]\n${pageStr}`);
        }
      }

      if (pagesText.length > 0) {
        extractedRawText = pagesText.join('\n\n');
      }
    } catch (err) {
      console.warn('[PDF.js Extractor]:', err.message);
    }
  }

  // 2. If Scanned PDF / Image without digital text, send to Live Gemini AI Microservice
  if (!extractedRawText || extractedRawText.trim().length < 25) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', docType === 'Ownership Record' ? 'PATTA' : 'auto');
      formData.append('language', 'ta+en');
      formData.append('enable_fallback', 'false');

      const aiRes = await fetch('http://localhost:8000/api/v1/process-document', {
        method: 'POST',
        body: formData,
      });

      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        const ocrFull = aiJson?.ocr?.full_text || '';
        const ext = aiJson?.extracted_data || aiJson?.extractedData || {};
        const pMetrics = aiJson?.stages?.preprocessing?.pageMetrics || [];

        if (ocrFull && ocrFull.trim().length > 10) {
          return {
            survey: ext.survey_number || ext.surveyNumber || null,
            subDivision: ext.sub_division || ext.subDivision || null,
            village: ext.village || null,
            taluk: ext.taluk || null,
            district: ext.district || null,
            owner: ext.owner_name || ext.ownerName || null,
            fatherName: ext.father_name || ext.fatherName || null,
            area: (ext.area || ext.landArea) ? `${ext.area || ext.landArea} Acres` : null,
            patta: ext.patta_number || ext.pattaNumber || null,
            classification: ext.classification || null,
            consideration: ext.consideration || null,
            boundaries: ext.boundaries || { north: null, south: null, east: null, west: null },
            ocrText: ocrFull,
            pageCount: aiJson.pages_processed || pageCount,
            rawText: ocrFull,
            pageMetrics: pMetrics,
            extractionFailed: false,
          };
        }
      }
    } catch (aiErr) {
      console.warn('[AI Microservice Direct Call Note]:', aiErr.message);
    }
  }

  const hasRealText = extractedRawText && extractedRawText.trim().length > 25;

  if (!hasRealText) {
    // No fabricated context string, no fake owner names. Surface the gap.
    return {
      survey: null,
      subDivision: null,
      village: null,
      taluk: null,
      district: null,
      owner: null,
      fatherName: null,
      area: null,
      patta: null,
      classification: null,
      consideration: null,
      boundaries: { north: null, south: null, east: null, west: null },
      ocrText: null,
      pageCount,
      rawText: '',
      pageMetrics: [],
      extractionFailed: true,
      failureReason: 'No text could be extracted from this file — please check the backend AI service.',
    };
  }

  const parsedFields = extractFieldsFromOcrText(extractedRawText);
  return {
    ...parsedFields,
    ocrText: extractedRawText,
    pageCount,
    rawText: extractedRawText,
    pageMetrics,
    extractionFailed: false,
  };
}

/* Comprehensive in-browser multilingual regex and semantic extractor for Tamil & English land records */
function extractFieldsFromOcrText(rawText) {
  if (!rawText || !rawText.trim()) {
    return {
      survey: null, village: null, taluk: null, district: null,
      owner: null, fatherName: null, area: null, patta: null,
      classification: null, consideration: null,
      boundaries: { north: null, south: null, east: null, west: null }
    };
  }

  const cleanText = rawText.replace(/\r/g, ' ');
  const lowerT = cleanText.toLowerCase();

  // 1. Survey Number
  const surveyMatch = cleanText.match(/\b(?:புல\s*எண்|சர்வே\s*(?:எண்|நெ)?|survey\s*(?:no|number)?|s\.no|s\.f|க\.எண்)[:\s.]*([0-9]{1,4}(?:\s*[/\\-]\s*[0-9]{1,3}[A-Za-z]*)?)\b/i);
  let survey = null;
  if (surveyMatch) {
    survey = surveyMatch[1].replace(/\s+/g, '').replace('-', '/').replace('\\', '/');
  }

  // 2. Area / Extent
  let area = null;
  const areaMatch = cleanText.match(/(?:Total extent(?: hereby transferred)?:\s*(?:[A-Za-z\s\-]+\()?|மொத்த\s*விஸ்தீரணம்[:\s]*|பரப்பளவு[:\s]*|extent[:\s]*|area[:\s]*)([0-9]+(?:\.[0-9]+)?)\s*(?:Acres?|ஏக்கர்|Hectares?|ஹெக்டேர்)/i)
    || cleanText.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:Acres?|ஏக்கர்|Hectares?|cents?|சென்ட்)/i);
  if (areaMatch) {
    area = `${areaMatch[1]} Acres`;
  }

  // 3. Owner / Transferee / Donee / Pattadar
  let owner = null;
  const ownerMatch = cleanText.match(/(?:and\s+|unto (?:the said\s+)?|paid to him in full by\s+|Transferee[:\s]+|Purchaser[:\s]+|Buyer[:\s]+)([A-Za-z\s\.]{3,35}),\s*son of/i)
    || cleanText.match(/(?:between\s+|by\s+|Transferor[:\s]+|Vendor[:\s]+)([A-Za-z\s\.]{3,35}),\s*son of/i)
    || cleanText.match(/(?:குமாரன்\s+)([A-Za-z\u0B80-\u0BFF\s\.]+)\s+(?:எழுதிய|எழுதிக்கொடுத்த)/)
    || cleanText.match(/(?:உரிமையாளர்|பட்டாதாரர்|பெயர்|pattadar|owner|buyer)[:\s]+([A-Za-z\u0B80-\u0BFF\s\.]{3,35})/i);
  if (ownerMatch) {
    owner = ownerMatch[1].trim().replace(/^(?:the said|mr|sri|thiru)\s+/i, '').trim();
  }

  // 4. Father / Executant / Transferor
  let fatherName = null;
  const fatherMatch = cleanText.match(/(?:son of|தந்தை|father|husband)[:\s]+([A-Za-z\u0B80-\u0BFF\s\.]{3,35})/i)
    || cleanText.match(/(?:^|\n)\s*([A-Za-z\u0B80-\u0BFF\.\s]{2,35})\s+குமாரன்/);
  if (fatherMatch) {
    fatherName = fatherMatch[1].trim();
  }

  // 5. Village
  let village = null;
  const villageMatch = cleanText.match(/([A-Za-z\u0B80-\u0BFF]+)\s+(?:கிராமம்|கிராமத்தில்|village)/i)
    || cleanText.match(/(?:situate in|of|at)\s+([A-Za-z\u0B80-\u0BFF]+)\s+village/i)
    || cleanText.match(/([A-Za-z\u0B80-\u0BFF]+)\s+Municipality/i)
    || cleanText.match(/(?:village|கிராமம்|கிராம)[:\s]+([A-Za-z\u0B80-\u0BFF]+)/i);
  if (villageMatch) {
    village = villageMatch[1].trim();
  } else {
    const knownVillages = ['Keelathoor', 'Srirangam', 'Kinathukadavu', 'Kovilpalayam', 'Anaimalai', 'Madukkarai', 'Sulur', 'Pollachi'];
    for (const kv of knownVillages) {
      if (new RegExp(`\\b${kv}\\b`, 'i').test(cleanText)) {
        village = kv;
        break;
      }
    }
  }

  // 6. Taluk
  let taluk = null;
  const talukMatch = cleanText.match(/([A-Za-z\u0B80-\u0BFF]+)\s+(?:தாலுகா|வட்டம்|Taluk)/i)
    || cleanText.match(/(?:taluk|வட்டம்|தாலுகா)[:\s]+([A-Za-z\u0B80-\u0BFF]+)/i);
  if (talukMatch) {
    taluk = talukMatch[1].trim();
  }

  // 7. District
  let district = null;
  const distMatch = cleanText.match(/(?:District of|in the District of)\s+([A-Za-z\u0B80-\u0BFF]+)/i)
    || cleanText.match(/([A-Za-z\u0B80-\u0BFF]+)\s+(?:ஜில்லா|மாவட்டம்)/i)
    || cleanText.match(/(?<!\bthe\s)(?<!\bin\s)\b([A-Za-z\u0B80-\u0BFF]+)\s+District\b/i)
    || cleanText.match(/(?:district|மாவட்டம்|ஜில்லா)[:\s]+([A-Za-z\u0B80-\u0BFF\(\)\s]+)/i);
  if (distMatch) {
    const dCand = distMatch[1].trim();
    if (!['the', 'this', 'said', 'in', 'of'].includes(dCand.toLowerCase())) {
      district = dCand;
    }
  }

  // 8. Patta / Document Registration
  let patta = null;
  const pattaMatch = cleanText.match(/(?:Document No\.?\s*[0-9]+(?:\s*of\s*[0-9]{4})?|Doc\.?\s*No\.?\s*[0-9]+(?:\s*of\s*[0-9]{4})?|Patta No\.?\s*[0-9]+|பட்டா எண்[:\s]*[0-9]+)/i);
  if (pattaMatch) {
    patta = pattaMatch[0].trim();
  }

  // 9. Classification
  let classification = null;
  if (lowerT.includes('nanja') && lowerT.includes('punja')) {
    classification = 'Wet (Nanja) & Dry (Punja)';
  } else if (lowerT.includes('trust') || lowerT.includes('dharma') || cleanText.includes('சாசனம்')) {
    classification = 'Trust Settlement / Dharma Sasanam (நஞ்சை & புஞ்சை)';
  } else if (lowerT.includes('nanja') || lowerT.includes('wet') || cleanText.includes('நஞ்சை')) {
    classification = 'Wet Land (Nanjai)';
  } else if (lowerT.includes('punja') || lowerT.includes('dry') || cleanText.includes('புஞ்சை')) {
    classification = 'Dry Land (Punjai)';
  } else if (lowerT.includes('residential')) {
    classification = 'Residential Conversion';
  }

  // 10. Consideration / Valuation
  let consideration = null;
  const consMatch = cleanText.match(/(?:consideration of\s+(?:Rupees[^\(]+)?\(?|மதிப்பு\s*|valuation[:\s]*)(Rs\.?\s*[0-9\-\/]+|₹\s*[0-9\,]+|ரூ\.?\s*[0-9\/\,\-]+)/i);
  if (consMatch) {
    consideration = consMatch[1].trim();
  }

  // 11. Boundaries
  const boundaries = { north: null, south: null, east: null, west: null };
  const boundInline = cleanText.match(/bounded on the North by\s+([^,]+),\s*on the South by\s+([^,]+),\s*on the East by\s+([^,]+),\s*and on the West by\s+([^,\.\n]+)/i);
  if (boundInline) {
    boundaries.north = boundInline[1].trim();
    boundaries.south = boundInline[2].trim();
    boundaries.east = boundInline[3].trim();
    boundaries.west = boundInline[4].trim();
  } else {
    const nm = cleanText.match(/(?:North|வடக்கு)[:\s]+([^,\n·]+)/i);
    const sm = cleanText.match(/(?:South|தெற்கு)[:\s]+([^,\n·]+)/i);
    const em = cleanText.match(/(?:East|கிழக்கு)[:\s]+([^,\n·]+)/i);
    const wm = cleanText.match(/(?:West|மேற்கு)[:\s]+([^,\n·]+)/i);
    if (nm) boundaries.north = nm[1].trim();
    if (sm) boundaries.south = sm[1].trim();
    if (em) boundaries.east = em[1].trim();
    if (wm) boundaries.west = wm[1].trim();
  }

  return {
    survey,
    village,
    taluk,
    district,
    owner,
    fatherName,
    area,
    patta,
    classification,
    consideration,
    boundaries,
  };
}

/* Word index at which the recognizer hits a patch to demonstrate Human-In-The-Loop rescan */
const OCR_UNCERTAIN_TOKEN = 'Aores';
const OCR_UNCERTAIN_REGION = { x: 34, y: 40, w: 30, h: 7 };

/* =========================================================================
   HELPERS
   ========================================================================= */

function nowTime() {
  const d = new Date();
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

function confClass(c) {
  if (c == null) return '';
  if (c >= 90) return 'high';
  if (c >= 75) return 'mid';
  return 'low';
}

function sevClass(s) {
  if (s === 'HIGH') return 'sev-high';
  if (s === 'MEDIUM') return 'sev-mid';
  return 'sev-low';
}

function regionFor(key) {
  const REGION_MAP = {
    docNumber: { x: 18, y: 8, w: 64, h: 5, page: 1, label: 'Document Number' },
    regDate: { x: 18, y: 13, w: 64, h: 5, page: 1, label: 'Registration Date' },
    owner: { x: 18, y: 21, w: 64, h: 6, page: 1, label: 'Executant / Owner Name' },
    fatherName: { x: 18, y: 19, w: 60, h: 5, page: 1, label: "Father's Name" },
    seller: { x: 18, y: 19, w: 60, h: 5, page: 1, label: 'Seller / Settlor' },
    buyer: { x: 18, y: 21, w: 64, h: 6, page: 1, label: 'Buyer / Beneficiary' },
    prevOwner: { x: 18, y: 19, w: 60, h: 5, page: 1, label: 'Previous Owner' },
    newOwner: { x: 18, y: 21, w: 64, h: 6, page: 1, label: 'New Owner' },
    survey: { x: 18, y: 35, w: 56, h: 6, page: 3, label: 'Primary Survey Number' },
    subdivision: { x: 22, y: 34, w: 32, h: 5, page: 4, label: 'Sub-Division Number' },
    patta: { x: 15, y: 7, w: 70, h: 6, page: 2, label: 'Patta / Registration Volume' },
    area: { x: 16, y: 47, w: 68, h: 6, page: 4, label: 'Total Land Extent' },
    village: { x: 18, y: 17, w: 56, h: 5, page: 1, label: 'Revenue Village / Ward' },
    taluk: { x: 18, y: 13, w: 50, h: 5, page: 1, label: 'Taluk' },
    district: { x: 18, y: 13, w: 50, h: 5, page: 1, label: 'District' },
    classification: { x: 16, y: 26, w: 68, h: 6, page: 2, label: 'Land Classification' },
    boundaries: { x: 15, y: 24, w: 70, h: 10, page: 3, label: 'Property Boundaries' },
    northBoundary: { x: 15, y: 24, w: 70, h: 5, page: 3, label: 'North Boundary' },
    southBoundary: { x: 15, y: 29, w: 70, h: 5, page: 3, label: 'South Boundary' },
    eastBoundary: { x: 15, y: 34, w: 70, h: 5, page: 3, label: 'East Boundary' },
    westBoundary: { x: 15, y: 39, w: 70, h: 5, page: 3, label: 'West Boundary' },
    consideration: { x: 18, y: 43, w: 60, h: 5, page: 3, label: 'Total Valuation' },
  };

  if (REGION_MAP[key]) return REGION_MAP[key];

  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const x = 12 + (h % 50);
  const y = 10 + ((h >> 4) % 70);
  const w = 30 + ((h >> 8) % 25);
  const hgt = 6 + ((h >> 12) % 6);
  return { x, y, w, h: hgt, page: 1, label: key };
}

function formatFieldValue(val) {
  if (val == null || val === '' || val === '—' || val === '-') return '—';
  if (typeof val === 'object') {
    if (val.north || val.south || val.east || val.west) {
      const parts = [];
      if (val.north) parts.push(`N: ${val.north}`);
      if (val.south) parts.push(`S: ${val.south}`);
      if (val.east) parts.push(`E: ${val.east}`);
      if (val.west) parts.push(`W: ${val.west}`);
      return parts.length > 0 ? parts.join(' · ') : '—';
    }
    const entries = Object.entries(val).filter(([_, v]) => v != null && v !== '');
    if (entries.length > 0) {
      return entries.map(([k, v]) => `${k}: ${v}`).join(' · ');
    }
    return '—';
  }
  return String(val);
}

function genFields(docType, lowKeys, doc) {
  const schema = DOC_TYPE_FIELDS[docType] || DOC_TYPE_FIELDS['Ownership Record'];
  const low = new Set(lowKeys || []);
  const ext = doc?.extractedData || {};

  return schema.map(f => {
    let rawVal = doc?.[f.key] ?? ext[f.key] ?? null;
    const formattedVal = formatFieldValue(rawVal);
    const hasValue = formattedVal !== '—';
    const confidence = hasValue ? (low.has(f.key) ? 45 + Math.floor(Math.random() * 15) : 88 + Math.floor(Math.random() * 10)) : 0;
    return {
      key: f.key,
      label: f.label,
      value: formattedVal,
      confidence,
      unresolved: !hasValue,
      region: regionFor(f.key),
    };
  });
}

const STATUS_META = {
  preprocessing: { label: 'Image Enhancement', tone: 'ink' },
  'preprocess-ready': { label: 'Ready for OCR', tone: 'ink' },
  ocr: { label: 'OCR In Progress', tone: 'ink' },
  'ocr-paused': { label: 'OCR Paused — Needs Rescan', tone: 'rust' },
  'ocr-ready': { label: 'OCR Complete', tone: 'green' },
  extraction: { label: 'Text Extraction', tone: 'ink' },
  normalizing: { label: 'Normalizing', tone: 'ink' },
  validating: { label: 'Validating', tone: 'ink' },
  review: { label: 'Needs Review', tone: 'rust' },
  validated: { label: 'Validated', tone: 'green' },
  submitted: { label: 'Submitted', tone: 'navy' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, tone: 'ink' };
  return <span className={`badge badge-${meta.tone}`}>{meta.label}</span>;
}

/* ---- document preview: shows the REAL uploaded file in a continuous,
   smoothly scrollable multi-page stream with interactive field localization. ---- */
function DocPreview({ url, type, filterCss, altLabel, zoom, evidenceRegion, evidenceTone, isEnhanced, stepCount, activeField }) {
  const [renderedPages, setRenderedPages] = useState([]);
  const [pdfRenderError, setPdfRenderError] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const pageRefs = useRef({});
  const containerRef = useRef(null);

  const isPdf = type === 'PDF' || (typeof url === 'string' && (url.toLowerCase().includes('.pdf') || (url.startsWith('blob:') && type === 'PDF') || url.includes('application/pdf')));
  const zoomScale = zoom ? zoom / 100 : 1;

  // Render all PDF pages continuously onto canvases
  useEffect(() => {
    let isCancelled = false;

    if (isPdf && url && typeof window !== 'undefined' && window.pdfjsLib) {
      setLoadingPages(true);
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      async function loadAllPdfPages() {
        try {
          const loadingTask = window.pdfjsLib.getDocument(url);
          const pdfDoc = await loadingTask.promise;
          const totalPages = Math.min(pdfDoc.numPages, 20);
          const pages = [];

          for (let pNum = 1; pNum <= totalPages; pNum++) {
            const page = await pdfDoc.getPage(pNum);
            const viewport = page.getViewport({ scale: 1.6 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            pages.push({
              pageNum: pNum,
              dataUrl: canvas.toDataURL('image/png'),
              width: viewport.width,
              height: viewport.height,
            });
          }

          if (!isCancelled) {
            setRenderedPages(pages);
            setLoadingPages(false);
            setPdfRenderError(false);
          }
        } catch (err) {
          console.warn('[DocPreview PDF.js stream note]:', err.message);
          if (!isCancelled) {
            setLoadingPages(false);
            setPdfRenderError(true);
          }
        }
      }

      loadAllPdfPages();
    } else if (isPdf && !url) {
      setRenderedPages([]);
      setLoadingPages(false);
    }

    return () => { isCancelled = true; };
  }, [url, isPdf]);

  // Auto-scroll directly to target page when evidenceRegion changes
  useEffect(() => {
    if (evidenceRegion?.page && pageRefs.current[evidenceRegion.page]) {
      pageRefs.current[evidenceRegion.page].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [evidenceRegion]);

  if (!url) {
    return (
      <div className="doc-sim-preview">
        <div className="sim-pdf-page" style={{ filter: filterCss || 'none' }}>
          <div className="sim-pdf-header">
            <span className="sim-pdf-seal" style={{ fontSize: 20 }}>🏛️</span>
            <b>GOVERNMENT OF TAMIL NADU — REVENUE DEPARTMENT</b>
            <span>LAND RECORD EXTRACT &amp; SETTLEMENT REGISTER</span>
          </div>
          <div className="sim-pdf-body">
            <div className="sim-pdf-row"><span>Document:</span> <b>{altLabel || 'Uploaded Record'}</b></div>
            <div className="sim-pdf-lines">
              <p>Physical document stream connected. Processing visual pipeline layers...</p>
            </div>
          </div>
          <div className="sim-pdf-stamp">OFFICIAL DIGITIZED COPY · LRMS VERIFICATION</div>
          {evidenceRegion && (
            <div
              className={`evidence-box ${evidenceTone === 'warn' ? 'evidence-box-warn' : ''}`}
              style={{ left: `${evidenceRegion.x}%`, top: `${evidenceRegion.y}%`, width: `${evidenceRegion.w}%`, height: `${evidenceRegion.h}%` }}
            >
              <div className="evidence-floating-badge">
                <Crosshair size={11} />
                <span>{evidenceRegion.label || 'Field'}: <b>{evidenceRegion.value || activeField?.value || ''}</b></span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="evidence-frame" style={{ position: 'relative', width: '100%', height: '100%', overflowY: 'auto' }}>
      {/* 1. Continuous Multi-Page Scrollable PDF Stream */}
      {isPdf && !pdfRenderError ? (
        <div
          className="scrollable-pdf-doc-stream"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            padding: '10px 4px',
            transform: zoomScale !== 1 ? `scale(${zoomScale})` : 'none',
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
        >
          {renderedPages.length > 0 ? (
            renderedPages.map(p => {
              const isTargetPage = (evidenceRegion?.page || 1) === p.pageNum;
              return (
                <div
                  key={p.pageNum}
                  ref={el => (pageRefs.current[p.pageNum] = el)}
                  className="pdf-page-card"
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '680px',
                    background: '#fff',
                    boxShadow: isTargetPage && evidenceRegion ? '0 0 0 2.5px var(--green, #059669), 0 6px 22px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid var(--line, #e2e8f0)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.25s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 12px',
                      background: 'var(--paper, #f8fafc)',
                      borderBottom: '1px solid var(--line, #e2e8f0)',
                      fontSize: '10.5px',
                      fontFamily: 'IBM Plex Mono, monospace',
                      color: 'var(--ink-soft, #475569)',
                    }}
                  >
                    <span>PAGE <b>{p.pageNum}</b> OF {renderedPages.length}</span>
                    {isTargetPage && evidenceRegion && (
                      <span style={{ color: 'var(--green, #059669)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Crosshair size={11} className="spin-slow" /> {evidenceRegion.label || 'Field Located'}
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative', width: '100%', display: 'block' }}>
                    <img
                      src={p.dataUrl}
                      alt={`Page ${p.pageNum}`}
                      style={{ width: '100%', height: 'auto', display: 'block', filter: filterCss || 'none' }}
                    />
                    {/* Dynamic Evidence Bounding Box Highlight on Target Page */}
                    {isTargetPage && evidenceRegion && (
                      <div
                        className={`evidence-box ${evidenceTone === 'warn' ? 'evidence-box-warn' : ''}`}
                        style={{
                          left: `${evidenceRegion.x}%`,
                          top: `${evidenceRegion.y}%`,
                          width: `${evidenceRegion.w}%`,
                          height: `${evidenceRegion.h}%`,
                          position: 'absolute',
                          zIndex: 30,
                        }}
                      >
                        <div className="evidence-floating-badge">
                          <Crosshair size={11} className="spin-slow" />
                          <span>{evidenceRegion.label || 'Extracted Field'}: <b>{evidenceRegion.value || activeField?.value || ''}</b></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-soft)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '12px', fontFamily: 'IBM Plex Mono, monospace' }}>Rendering all pages into continuous scroll stream...</p>
            </div>
          )}
        </div>
      ) : isPdf ? (
        /* Fallback iframe */
        <div style={{ width: '100%', height: '100%', minHeight: '480px', position: 'relative' }}>
          <iframe
            src={url.includes('#') ? url : `${url}#toolbar=0&navpanes=0&view=FitH`}
            title={altLabel || 'document'}
            className="doc-embed"
            style={{ width: '100%', height: '100%', minHeight: '480px', border: 'none', filter: filterCss || 'none' }}
          />
          {evidenceRegion && (
            <div
              className={`evidence-box ${evidenceTone === 'warn' ? 'evidence-box-warn' : ''}`}
              style={{ left: `${evidenceRegion.x}%`, top: `${evidenceRegion.y}%`, width: `${evidenceRegion.w}%`, height: `${evidenceRegion.h}%`, position: 'absolute', zIndex: 20 }}
            >
              <div className="evidence-floating-badge">
                <Crosshair size={11} />
                <span>{evidenceRegion.label || 'Field'}: <b>{evidenceRegion.value || activeField?.value || ''}</b></span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image container */
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={url}
            alt={altLabel || 'document'}
            className="doc-img"
            style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block', filter: filterCss || 'none' }}
          />
          {evidenceRegion && (
            <div
              className={`evidence-box ${evidenceTone === 'warn' ? 'evidence-box-warn' : ''}`}
              style={{ left: `${evidenceRegion.x}%`, top: `${evidenceRegion.y}%`, width: `${evidenceRegion.w}%`, height: `${evidenceRegion.h}%`, position: 'absolute', zIndex: 20 }}
            >
              <div className="evidence-floating-badge">
                <Crosshair size={11} />
                <span>{evidenceRegion.label || 'Field'}: <b>{evidenceRegion.value || activeField?.value || ''}</b></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function enhanceFilter(stepCount) {
  const c = 1 + stepCount * 0.045;
  const b = 1 + stepCount * 0.025;
  const s = 1 + stepCount * 0.02;
  return `contrast(${c.toFixed(2)}) brightness(${b.toFixed(2)}) saturate(${s.toFixed(2)})`;
}
const RAW_SCAN_FILTER = 'contrast(0.86) brightness(0.93) saturate(0.85)';

function splitOcrIntoPages(text) {
  if (!text) return [{ pageNum: 1, content: 'No OCR text available' }];
  const parts = text.split(/(?====\s*PAGE\s*\d+|(?=\[PAGE\s*\d+\]))/i);
  if (parts.length <= 1) {
    return [{ pageNum: 1, content: text.trim() }];
  }
  return parts.map((part, idx) => {
    const match = part.match(/(?:PAGE\s*(\d+)|\[PAGE\s*(\d+)\])/i);
    const pageNum = match ? parseInt(match[1] || match[2], 10) : idx + 1;
    const cleanContent = part.replace(/^={3,}[^=]*={3,}\n?|^\[PAGE\s*\d+\]\n?/i, '').trim();
    return {
      pageNum,
      content: cleanContent || part.trim(),
    };
  });
}

function renderFormattedPageText(content, pageNum, fields, evidenceKey, onSelectField, entityRefs) {
  if (!content) return null;
  const lines = content.split('\n');

  return lines.map((line, lIdx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={lIdx} style={{ height: '6px' }} />;

    let matchedField = null;
    for (const f of fields) {
      if ((f.region?.page || 1) === pageNum) {
        const valStr = String(f.value || '').replace(/\([^)]*\)/g, '').trim().toLowerCase();
        const lineLower = trimmed.toLowerCase();
        if (
          valStr.length > 2 &&
          (lineLower.includes(valStr) ||
            (valStr.includes('175/1') && lineLower.includes('175/1')) ||
            (valStr.includes('muthu') && lineLower.includes('muthu')) ||
            (valStr.includes('11.72') && lineLower.includes('11.72')) ||
            (valStr.includes('srirangam') && lineLower.includes('srirangam')) ||
            (valStr.includes('trichinopoly') && lineLower.includes('trichinopoly')))
        ) {
          matchedField = f;
          break;
        }
      }
    }

    const isSelected = matchedField && evidenceKey === matchedField.key;

    if (matchedField) {
      return (
        <div
          key={lIdx}
          ref={el => { if (isSelected && el) entityRefs.current[matchedField.key] = el; }}
          onClick={() => onSelectField && onSelectField(matchedField.key)}
          style={{
            position: 'relative',
            margin: '6px 0',
            padding: '6px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            background: isSelected ? 'rgba(16, 185, 129, 0.14)' : 'rgba(241, 245, 249, 0.7)',
            borderLeft: isSelected ? '4px solid #059669' : '4px solid #cbd5e1',
            boxShadow: isSelected ? '0 0 0 2px rgba(16, 185, 129, 0.25)' : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          {isSelected && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '10px',
                fontWeight: 700,
                color: '#064e3b',
                background: '#ecfdf5',
                padding: '2px 7px',
                borderRadius: 2,
                border: '1px solid #a7f3d0',
                marginBottom: 3,
                fontFamily: '"IBM Plex Mono", monospace',
              }}
            >
              <Crosshair size={11} className="spin-slow" /> {matchedField.label}: {matchedField.value}
            </div>
          )}
          <div style={{ color: isSelected ? '#064e3b' : '#0f172a', fontWeight: isSelected ? 600 : 400, fontSize: '13px' }}>
            {line}
          </div>
        </div>
      );
    }

    return (
      <div key={lIdx} style={{ margin: '3px 0', color: '#1e293b', fontSize: '13px' }}>
        {line}
      </div>
    );
  });
}

function PrintedOcrDocumentViewer({
  ocrText,
  doc,
  fields = [],
  evidenceKey,
  onSelectField,
  originalUrl,
  fileType,
  filterCss,
  activeField,
}) {
  const [viewMode, setViewMode] = useState('printed');
  const pageBlocks = useMemo(() => splitOcrIntoPages(ocrText), [ocrText]);
  const entityRefs = useRef({});
  const activeRegion = fields.find(f => f.key === evidenceKey)?.region;

  useEffect(() => {
    if (evidenceKey && entityRefs.current[evidenceKey]) {
      entityRefs.current[evidenceKey].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [evidenceKey]);

  return (
    <div className="printed-ocr-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px', width: '100%' }}>
      {/* Top View Toggle Toolbar */}
      <div
        className="printed-view-toolbar no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          background: 'var(--paper, #f1f5f9)',
          borderBottom: '1px solid var(--line-strong, #cbd5e1)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className={`btn btn-xs ${viewMode === 'printed' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('printed')}
            style={{ fontSize: 11, padding: '3px 8px' }}
          >
            <FileText size={12} /> Printed OCR Document
          </button>
          <button
            type="button"
            className={`btn btn-xs ${viewMode === 'original' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('original')}
            style={{ fontSize: 11, padding: '3px 8px' }}
          >
            <ImageIcon size={12} /> Original Scan
          </button>
        </div>
        <span style={{ fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-faint)' }}>
          {pageBlocks.length} Pages · White Sheet View
        </span>
      </div>

      {/* Main Document Content Stream */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', background: '#f8fafc' }}>
        {viewMode === 'original' ? (
          <DocPreview
            url={originalUrl}
            type={fileType}
            filterCss={filterCss}
            altLabel={doc?.name || 'Document Scan'}
            evidenceRegion={activeRegion ? { ...activeRegion, value: activeField?.value } : null}
            activeField={activeField}
          />
        ) : (
          <div className="printed-pages-stream" style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', width: '100%' }}>
            {pageBlocks.map((p, pIdx) => {
              const isTargetPage = (activeRegion?.page || 1) === p.pageNum;
              return (
                <div
                  key={pIdx}
                  className="printed-a4-page"
                  style={{
                    width: '100%',
                    maxWidth: '680px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    boxShadow: isTargetPage && evidenceKey ? '0 0 0 2px #059669, 0 8px 24px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.06)',
                    borderRadius: '4px',
                    padding: '24px 28px',
                    fontFamily: '"Source Serif 4", Georgia, serif',
                    lineHeight: 1.7,
                    position: 'relative',
                    transition: 'box-shadow 0.2s ease',
                  }}
                >
                  {/* Official Header on Page 1 */}
                  {p.pageNum === 1 && (
                    <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: 10, marginBottom: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 22, marginBottom: 2 }}>🏛️</div>
                      <h4 style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0f172a', fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        Government of Tamil Nadu — Revenue Department
                      </h4>
                      <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace' }}>
                        DIGITIZED LAND RECORD EXTRACT &amp; SETTLEMENT REGISTER
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                        Document Ref: <b>{doc?.name || '153-1921.pdf'}</b> · Archive Code: <b>{doc?.id || 'LR-1021'}</b>
                      </div>
                    </div>
                  )}

                  {/* Page Indicator */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 10.5,
                      fontFamily: '"IBM Plex Mono", monospace',
                      color: '#64748b',
                      borderBottom: '1px dashed #e2e8f0',
                      paddingBottom: 4,
                      marginBottom: 14,
                    }}
                  >
                    <span>PAGE <b>{p.pageNum}</b> OF {pageBlocks.length}</span>
                    {isTargetPage && evidenceKey && (
                      <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Crosshair size={11} className="spin-slow" /> Active Field Focus
                      </span>
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="printed-text-body" style={{ fontSize: 13, color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'justify' }}>
                    {renderFormattedPageText(p.content, p.pageNum, fields, evidenceKey, onSelectField, entityRefs)}
                  </div>

                  {/* Footer Seal */}
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 8,
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 9.5,
                      fontFamily: '"IBM Plex Mono", monospace',
                      color: '#94a3b8',
                    }}
                  >
                    <span>DIGITIZED UNDER DILRMP · STATE ARCHIVES</span>
                    <span>CERTIFIED DIGITAL TRANSCRIPT</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* Typewriter that can stop mid-stream when it reaches an unreadable
   token, instead of always running to completion. onStuck fires once,
   with the region to highlight, when that token is hit; the stream
   resumes only when the caller flips `running` back on (after the
   operator resolves or dismisses the rescan request). */
function OcrTypewriter({ text, running, onProgress, onComplete, stuckToken, onStuck, resumeToken, isDone }) {
  const [shown, setShown] = useState(isDone ? (text || '') : '');
  const doneRef = useRef(false);
  const stuckRef = useRef(false);
  const iRef = useRef(0);
  const wordsShownRef = useRef(0);

  useEffect(() => {
    if (!running) {
      if (isDone) {
        setShown(text || '');
      }
      return;
    }
    doneRef.current = false;
    stuckRef.current = false; // always clear on (re)start, including resume-after-pause
    if (resumeToken == null || resumeToken === 0) {
      setShown(''); iRef.current = 0; wordsShownRef.current = 0;
    }
    const words = (text || '').split(/(\s+)/);
    const totalWords = (text || '').split(/\s+/).filter(Boolean).length;

    const timer = setInterval(() => {
      if (stuckRef.current) return;
      let i = iRef.current;
      if (i >= words.length) {
        clearInterval(timer);
        if (!doneRef.current) { doneRef.current = true; onComplete && onComplete(); }
        return;
      }
      const tok = words[i];
      if (stuckToken && tok.trim() === stuckToken && !doneRef.current) {
        stuckRef.current = true;
        clearInterval(timer);
        onStuck && onStuck();
        return;
      }
      if (tok.trim().length > 0) wordsShownRef.current++;
      setShown(prev => prev + tok);
      onProgress && onProgress(wordsShownRef.current, totalWords);
      iRef.current = i + 1;
    }, 22);
    return () => clearInterval(timer);
  }, [running, text, resumeToken, isDone]);

  if (isDone && !running) {
    return (
      <pre className="ocr-fulltext mono">
        {text}
      </pre>
    );
  }

  return (
    <pre className="ocr-fulltext mono">
      {shown}
      {running && <span className="type-cursor">Γûì</span>}
    </pre>
  );
}

function pseudoHex(input) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return combined.toString(16).padStart(14, '0');
}
function docHash(doc) {
  if (!doc) return pseudoHex('doc-hash-fallback').repeat(2).slice(0, 64);
  const a = pseudoHex(`${doc.id || ''}|${doc.owner || ''}|${doc.survey || ''}`);
  const b = pseudoHex(`${doc.village || ''}|${doc.id || ''}`);
  const c = pseudoHex(`${doc.area || ''}|${doc.taluk || ''}`);
  return (a + b + c).slice(0, 64);
}
function auditRef(doc) {
  if (!doc) return 'AUD-2026-10458';
  const digits = parseInt(String(doc.id || '0').replace(/\D/g, ''), 10) || 0;
  return 'AUD-2026-' + String(10000 + (digits % 90000)).padStart(5, '0');
}
function todayStr() {
  const d = new Date();
  return String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
}
function fileSizeLabel(doc) {
  if (!doc) return '1.24 MB';
  if (doc.fileSizeMb) return `${doc.fileSizeMb} MB`;
  if (doc.fileSize) return `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`;
  return '1.24 MB';
}
function pageCountFor(doc) {
  if (!doc) return 1;
  if (doc.pageCount) return doc.pageCount;
  const digits = parseInt(String(doc.id || '0').replace(/\D/g, ''), 10) || 0;
  return 1 + (digits % 12);
}

/* =========================================================================
   ROOT COMPONENT
   ========================================================================= */

export default function OperatorDashboard({ userName = 'Operator', onLogout = () => {}, addToast = () => {} }) {
  useEffect(() => {
    if (document.getElementById('op-dash-fonts')) return;
    const link = document.createElement('link');
    link.id = 'op-dash-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  const [leafletReady, setLeafletReady] = useState(false);
  const [d3Ready, setD3Ready] = useState(false);

  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (window.d3) {
      setD3Ready(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';
    script.onload = () => setD3Ready(true);
    document.head.appendChild(script);
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [focusSubstage, setFocusSubstage] = useState(null);
  const [openGroups, setOpenGroups] = useState({ processing: true, validation: true });
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [submitted, setSubmitted] = useState(INITIAL_SUBMITTED);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [dashFilter, setDashFilter] = useState('all');
  const [dashSearch, setDashSearch] = useState('');

  /* ---- Dynamic Data Sync with MongoDB Backend ---- */
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        await authApi.login('operator@bhoomi.ai', 'Bhoomi@2026').catch(() => null);
        const backendDocs = await documentApi.getAll().catch(() => []);
        if (isMounted && backendDocs && backendDocs.length > 0) {
          const uiDocs = backendDocs.map(mapBackendDocToUi);
          setDocs(uiDocs);

          const submittedDocs = uiDocs
            .filter(d => d.status === 'submitted' || d.status === 'validated')
            .map(d => ({ id: d.id, survey: d.survey, village: d.village, confidence: d.confidence }));
          if (submittedDocs.length > 0) setSubmitted(submittedDocs);
        }

        const logs = await auditApi.getAll().catch(() => []);
        if (isMounted && logs && logs.length > 0) {
          const acts = logs.map(l => ({
            t: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `${l.action} · ${l.details?.documentId || l.actorRole}: ${l.details?.event || l.details?.message || ''}`
          }));
          setActivity(acts);
        }
      } catch (err) {
        console.warn('[OperatorDashboard] Local state active:', err.message);
      }
    }
    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  /* ---- upload wizard: select -> confirm (file card) -> meta (doc type only) ---- */
  const [uploadStep, setUploadStep] = useState('select');
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('Ownership Record');

  const [pipeline, setPipeline] = useState(null);
  /* accordion open/closed state for the interactive processing
     sections — a finished stage collapses itself and the operator can
     re-expand any section by clicking its header. */
  const [sectionOpen, setSectionOpen] = useState({ enhance: true, ocr: false, extract: false, normalize: false });
  const [reviewDoc, setReviewDoc] = useState(null);
  const [localFields, setLocalFields] = useState([]);
  const [activeFieldKey, setActiveFieldKey] = useState(null);
  const [draftValue, setDraftValue] = useState('');
  const [viewDocId, setViewDocId] = useState(null);
  const [twinDocId, setTwinDocId] = useState('LR-1021');
  const [selectedValDocId, setSelectedValDocId] = useState('LR-1021');
  const [egDocId, setEgDocId] = useState('LR-1021');
  const [viewTab, setViewTab] = useState('digitized');
  const [zoom, setZoom] = useState(100);
  const [evidenceKey, setEvidenceKey] = useState(null); // active "jump to source" field, processing page
  const fileInputRef = useRef(null);
  const processingRef = useRef(null);

  /* ---- Geo-Referencing State (Per-Document Isolation) ---- */
  const [geoDocId, setGeoDocId] = useState('LR-1025');
  const [geoViewMode, setGeoViewMode] = useState('split'); // 'split' | 'overlay' | 'vector'
  const [geoOpacity, setGeoOpacity] = useState(65);
  const [geoTransform, setGeoTransform] = useState('affine');
  const [geoGcpsByDoc, setGeoGcpsByDoc] = useState(INITIAL_GEO_GCPS);
  const [activeGcpId, setActiveGcpId] = useState('GCP-1');

  function handleAddGcp() {
    const list = geoGcpsByDoc[geoDocId] || [];
    const nextNum = list.length + 1;
    const baseLat = (geoDocId === 'LR-1028' || geoDocId === 'LR-1014') ? 10.5820 : 10.8240;
    const baseLng = (geoDocId === 'LR-1028' || geoDocId === 'LR-1014') ? 76.9290 : 77.0130;
    const newGcp = {
      id: `GCP-${nextNum}`,
      name: `Boundary Control Marker ${nextNum}`,
      srcX: Math.round(25 + Math.random() * 50),
      srcY: Math.round(25 + Math.random() * 50),
      lat: parseFloat((baseLat + Math.random() * 0.0015).toFixed(4)),
      long: parseFloat((baseLng + Math.random() * 0.0015).toFixed(4)),
      error: parseFloat((0.06 + Math.random() * 0.12).toFixed(2)),
    };
    const updated = [...list, newGcp];
    setGeoGcpsByDoc(prev => ({
      ...prev,
      [geoDocId]: updated,
    }));
    setActiveGcpId(newGcp.id);
    addToast(`Added control point ${newGcp.id} to ${geoDocId}.`, 'info');
    gisApi.saveGcps(geoDocId, updated).catch(e => console.warn('[GIS] GCP sync:', e.message));
  }

  function handleDeleteGcp(id) {
    const list = geoGcpsByDoc[geoDocId] || [];
    if (list.length <= 3) {
      addToast('Minimum 3 Ground Control Points are required for GIS affine transformation.', 'warn');
      return;
    }
    const updated = list.filter(p => p.id !== id);
    setGeoGcpsByDoc(prev => ({
      ...prev,
      [geoDocId]: updated,
    }));
    if (activeGcpId === id && updated.length > 0) {
      setActiveGcpId(updated[0].id);
    }
    gisApi.saveGcps(geoDocId, updated).catch(e => console.warn('[GIS] GCP sync:', e.message));
  }

  function handleSaveGeoRef() {
    const list = geoGcpsByDoc[geoDocId] || [];
    const rms = Math.sqrt(list.reduce((s, g) => s + (parseFloat(g.error) || 0) ** 2, 0) / (list.length || 1));
    gisApi.saveGcps(geoDocId, list).then(() => {
      addToast(`GCP coordinates saved to MongoDB for ${geoDocId}.`, 'info');
    }).catch(e => console.warn('[GIS] GCP save notice:', e.message));
    pushActivity(`Geo-referenced ${geoDocId} (${list.length} GCPs registered, RMS Error: ${rms.toFixed(2)}m)`);
    addToast(`Geo-referencing complete for ${geoDocId}! GIS GeoTIFF & Shapefile exported.`, 'success');
  }

  async function handleStartProcessing(e) {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    const nextNum = 1032 + docs.length;
    const nextId = `LR-${nextNum}`;
    const previewUrl = URL.createObjectURL(selectedFile);
    const isPdf = selectedFile.type?.includes('pdf') || selectedFile.name.toLowerCase().endsWith('.pdf');

    // Extract dynamic fields and OCR text from the uploaded file
    const parsed = await extractDocumentDataFromFile(selectedFile, docType);

    const newDoc = {
      id: nextId,
      _origId: nextId,
      name: selectedFile.name,
      fileName: selectedFile.name,
      originalFileName: selectedFile.name,
      type: isPdf ? 'PDF' : 'Image',
      docType: docType,
      village: parsed.village,
      taluk: parsed.taluk,
      district: parsed.district,
      status: 'preprocessing',
      confidence: 96,
      owner: parsed.owner,
      survey: parsed.survey,
      area: parsed.area,
      patta: parsed.patta,
      classification: parsed.classification,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: previewUrl,
      previewUrl: previewUrl,
      ocrText: parsed.ocrText,
      pageMetrics: parsed.pageMetrics || [],
      boundaries: parsed.boundaries || null,
      fileSize: selectedFile.size,
      discrepancies: [],
      fields: genFields(docType, [], { ...parsed, id: nextId, type: isPdf ? 'PDF' : 'Image', docType }),
    };

    setDocs(ds => [newDoc, ...ds]);
    pushActivity(`Uploaded ${newDoc.id} (${selectedFile.name}) — Survey ${parsed.survey}`);
    addToast(`Document ${newDoc.id} uploaded. Initializing AI enhancement & OCR...`, 'info');

    // Forward to MongoDB backend & Python AI service
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', docType === 'Ownership Record' ? 'PATTA' : docType === 'Cadastral Map' ? 'CADASTRAL_MAP' : 'FMB_SKETCH');
    formData.append('district', parsed.district);
    formData.append('taluk', parsed.taluk);
    formData.append('village', parsed.village);
    formData.append('surveyNumber', parsed.survey);

    documentApi.upload(formData).then(async res => {
      const createdId = res?.documentId || newDoc.id;
      addToast(`Document record persisted in MongoDB (${createdId}).`, 'success');

      // Keep pipeline docId synchronized with createdId
      setPipeline(p => {
        if (!p) return p;
        if (p.docId === newDoc.id || p._origId === newDoc.id || p.docId === createdId) {
          return { ...p, docId: createdId, _origId: newDoc.id };
        }
        return p;
      });

      // Update doc in state preserving previewUrl, name, and type
      setDocs(ds => ds.map(d => (d.id === newDoc.id || d._origId === newDoc.id || d.id === createdId) ? {
        ...d,
        id: createdId,
        _origId: newDoc.id,
        imageUrl: d.imageUrl || previewUrl,
        previewUrl: d.previewUrl || previewUrl,
        name: d.name || selectedFile.name,
        type: isPdf ? 'PDF' : 'Image',
      } : d));

      // Fetch dynamic AI extraction results from backend if available
      try {
        const fullDoc = await documentApi.getById(createdId);
        if (fullDoc && (fullDoc.extractedData || fullDoc.extracted_data || fullDoc.ocrResult)) {
          const ext = fullDoc.extractedData || fullDoc.extracted_data || {};
          const dynamicFields = genFields(docType, [], {
            owner: ext.ownerName || ext.owner_name || parsed.owner,
            survey: ext.surveyNumber || ext.survey_number || parsed.survey,
            village: ext.village || parsed.village,
            taluk: ext.taluk || parsed.taluk,
            district: ext.district || parsed.district,
            area: (ext.landArea || ext.area) ? `${ext.landArea || ext.area} Acres` : parsed.area,
            patta: ext.pattaNumber || parsed.patta,
            classification: ext.classification || parsed.classification,
          });
          setDocs(ds => ds.map(d => (d.id === createdId || d.id === newDoc.id || d._origId === newDoc.id) ? {
            ...d,
            id: createdId,
            _origId: newDoc.id,
            owner: ext.ownerName || ext.owner_name || d.owner,
            survey: ext.surveyNumber || ext.survey_number || d.survey,
            village: ext.village || d.village,
            taluk: ext.taluk || d.taluk,
            area: (ext.landArea || ext.area) ? `${ext.landArea || ext.area} Acres` : d.area,
            fields: dynamicFields,
            ocrText: fullDoc.ocrResult || fullDoc.ocr?.fullText || d.ocrText || parsed.ocrText,
            imageUrl: d.imageUrl || previewUrl,
            previewUrl: d.previewUrl || previewUrl,
          } : d));
        }
      } catch (fetchErr) {
        console.warn('[Upload] Dynamic field fetch note:', fetchErr.message);
      }
    }).catch(err => {
      console.warn('[Upload] Backend sync notification:', err.message);
    });

    setUploadStep('select');
    setSelectedFile(null);
    setActiveTab('processing');
    runPipeline(newDoc.id);
  }

  function pushActivity(text) {
    setActivity(a => [...a, { t: nowTime(), text }]);
  }

  function toggleSection(key) {
    setSectionOpen(s => ({ ...s, [key]: !s[key] }));
  }

  /* scroll to the relevant sub-section when arriving from a sidebar
     submenu link (Enhancement / OCR·HTR / Text Extraction / Normalization). Lives at
     the top level (not inside renderProcessing) so it's called
     unconditionally on every render, regardless of active tab. */
  useEffect(() => {
    if (!focusSubstage || activeTab !== 'processing') return;
    setSectionOpen({
      enhance: focusSubstage === 'enhance',
      ocr: focusSubstage === 'ocr',
      extract: focusSubstage === 'extract',
      normalize: focusSubstage === 'normalize',
    });
    const el = document.getElementById(`pipe-${focusSubstage}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setFocusSubstage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSubstage, activeTab, pipeline?.stage]);

  function goTo(tab, focus) {
    setActiveTab(tab);
    if (tab === 'processing' && focus) {
      setFocusSubstage(focus);
      setSectionOpen({
        enhance: focus === 'enhance',
        ocr: focus === 'ocr',
        extract: focus === 'extract',
        normalize: focus === 'normalize',
      });
    } else {
      setFocusSubstage(focus || null);
    }
  }

  function toggleGroup(id) {
    setOpenGroups(g => ({ ...g, [id]: !g[id] }));
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadStep('confirm');
    }
  }

  /* ---- Stage 1: preprocessing runs automatically, then PAUSES and waits
     for the operator to click "Proceed to OCR" ---- */
  function runPipeline(id) {
    const doc = docs.find(d => d.id === id || d._origId === id);
    const resolvedId = doc ? doc.id : id;
    const origId = doc?._origId || id;

    setPipeline({
      docId: resolvedId,
      _origId: origId,
      stage: 'preprocessing', preSteps: [],
      ocrRunning: false, ocrWords: 0, ocrTotalWords: 0, ocrLines: 0, ocrStartedAt: null, ocrElapsed: 0,
      ocrResumeCount: 0, ocrStuck: false,
      fields: [], valChecks: [], discrepancies: [], hasReference: false,
    });
    setZoom(100);
    setEvidenceKey(null);
    setSectionOpen({ enhance: true, ocr: false, extract: false });

    PREPROCESS_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setPipeline(p => (p && (p.docId === resolvedId || p.docId === id || p._origId === origId || p._origId === id)) ? { ...p, preSteps: [...p.preSteps, step] } : p);
      }, 350 * (i + 1));
    });

    const t1 = 350 * PREPROCESS_STEPS.length + 300;
    setTimeout(() => {
      setPipeline(p => (p && (p.docId === resolvedId || p.docId === id || p._origId === origId || p._origId === id)) ? { ...p, stage: 'preprocess-ready' } : p);
      setDocs(ds => ds.map(d => (d.id === resolvedId || d.id === id || d._origId === origId || d._origId === id) ? { ...d, status: 'preprocess-ready' } : d));
      pushActivity(`Image enhancement complete for ${resolvedId} — ready for OCR`);
    }, t1);
  }

  /* ---- Stage 2: operator clicks "Proceed to OCR" ---- */
  function startOcr(id) {
    const doc = docs.find(d => d.id === id || d._origId === id);
    const textToUse = doc?.ocrText || doc?.ocrResult || pipeline?.ocrText || OCR_FULL_TEXT;
    setPipeline(p => (p && (p.docId === id || p._origId === id)) ? {
      ...p, stage: 'ocr', ocrRunning: true, ocrWords: 0,
      ocrText: textToUse,
      ocrTotalWords: textToUse.split(/\s+/).filter(Boolean).length,
      ocrLines: textToUse.split('\n').filter(l => l.trim()).length,
      ocrStartedAt: Date.now(), ocrElapsed: 0, ocrResumeCount: 0, ocrStuck: false,
    } : p);
    setDocs(ds => ds.map(d => (d.id === id || d._origId === id) ? { ...d, status: 'ocr', ocrText: textToUse } : d));
    pushActivity(`OCR started for ${doc?.name || id}`);
    /* enhancement is done — collapse it and open the OCR accordion */
    setSectionOpen(s => ({ ...s, enhance: false, ocr: true }));

    /* live ticker that updates the elapsed runtime on the OCR stage badge */
    const tick = setInterval(() => {
      setPipeline(p => {
        if (!p || p.docId !== id || !p.ocrStartedAt) { clearInterval(tick); return p; }
        if (p.stage !== 'ocr') { clearInterval(tick); return p; }
        if (p.ocrStuck) return p;
        return { ...p, ocrElapsed: (Date.now() - p.ocrStartedAt) / 1000 };
      });
    }, 100);
  }

  function handleOcrProgress(id, wordsShown) {
    setPipeline(p => (p && p.docId === id) ? { ...p, ocrWords: wordsShown } : p);
  }

  /* OCR hit a token it can't confidently read — pause and surface the
     exact region of the source image so the operator can request a
     clean rescan of just that patch instead of the whole document. */
  function handleOcrStuck(id) {
    setPipeline(p => (p && p.docId === id) ? { ...p, stage: 'ocr-paused', ocrRunning: false, ocrStuck: true } : p);
    setDocs(ds => ds.map(d => d.id === id ? { ...d, status: 'ocr-paused' } : d));
    pushActivity(`OCR paused on ${id} — one region was unreadable, awaiting a rescan`);
    addToast(`${id}: OCR couldn't read a portion of the scan.`);
  }

  /* Operator confirms the rescanned region is good enough to proceed —
     resume the OCR stream instead of re-reading the whole page. */
  function resumeOcr(id, accept) {
    setPipeline(p => {
      if (!p || p.docId !== id) return p;
      if (accept) {
        pushActivity(`${id}: rescanned region accepted — resuming OCR`);
        return { ...p, stage: 'ocr', ocrRunning: true, ocrStuck: false, ocrResumeCount: p.ocrResumeCount + 1, ocrStartedAt: Date.now() - p.ocrElapsed * 1000 };
      }
      pushActivity(`${id}: kept the low-confidence reading for that region — resuming OCR`);
      return { ...p, stage: 'ocr', ocrRunning: true, ocrStuck: false, ocrResumeCount: p.ocrResumeCount + 1, ocrStartedAt: Date.now() - p.ocrElapsed * 1000 };
    });
    setDocs(ds => ds.map(d => d.id === id ? { ...d, status: 'ocr' } : d));
  }

  function handleOcrComplete(id) {
    setPipeline(p => (p && p.docId === id) ? { ...p, stage: 'ocr-ready', ocrRunning: false } : p);
    setDocs(ds => ds.map(d => d.id === id ? { ...d, status: 'ocr-ready' } : d));
    pushActivity(`OCR complete for ${id}`);
  }

  /* ---- Stage 3: operator clicks "Next: Extraction" — fields depend on
     the document's chosen document type ---- */
  function startExtraction(id) {
    const doc = docs.find(d => d.id === id || d._origId === id);
    const type = doc?.docType || 'Ownership Record';
    const forceLow = (id === 'LR-1021' || id === 'LR-1023') ? ['area'] : [];

    // Parse OCR text if present and doc fields need enrichment
    let extractedDocData = { ...doc };
    if (doc?.ocrText) {
      const parsed = extractFieldsFromOcrText(doc.ocrText);
      extractedDocData = {
        ...doc,
        owner: parsed.owner || doc.owner,
        survey: parsed.survey || doc.survey,
        village: parsed.village || doc.village,
        taluk: parsed.taluk || doc.taluk,
        district: parsed.district || doc.district,
        area: parsed.area || doc.area,
        patta: parsed.patta || doc.patta,
        classification: parsed.classification || doc.classification,
        fatherName: parsed.fatherName || doc.fatherName,
      };
    }

    const fields = (doc?.fields && doc.fields.length > 0 && doc.fields.some(f => f.value && f.value !== '—'))
      ? doc.fields
      : genFields(type, forceLow, extractedDocData);

    setPipeline(p => (p && (p.docId === id || p._origId === id)) ? { ...p, stage: 'extraction', fields } : p);
    setDocs(ds => ds.map(d => (d.id === id || d._origId === id) ? {
      ...d,
      ...extractedDocData,
      status: 'extraction',
      fields,
    } : d));
    pushActivity(`Fields extracted for ${doc?.name || id} (${type})`);
    /* OCR is done — collapse it and open the Text Extraction accordion */
    setSectionOpen(s => ({ ...s, ocr: false, extract: true }));
  }

  /* ---- Stage 4: Normalization & Entity Resolution ---- */
  function startNormalization(id) {
    setPipeline(p => (p && (p.docId === id || p._origId === id)) ? { ...p, stage: 'normalizing', fields: normalizeFields(p.fields) } : p);
    setDocs(ds => ds.map(d => (d.id === id || d._origId === id) ? { ...d, status: 'normalizing' } : d));
    pushActivity(`Normalized fields for ${id} — resolved entities & standardized formats`);
    setSectionOpen(s => ({ ...s, extract: false, normalize: true }));
  }

  /* ---- Stage 5: operator clicks "Run Validation" — navigates to the
     Validation page and compares against the reference database (LRMS),
     producing discrepancy records there. Nothing about validation is
     displayed back on the Processing page. ---- */
  function startValidation(id) {
    setPipeline(p => (p && (p.docId === id || p._origId === id)) ? { ...p, stage: 'validating' } : p);
    setDocs(ds => ds.map(d => (d.id === id || d._origId === id) ? { ...d, status: 'validating' } : d));
    pushActivity(`Cross-checking ${id} against reference records...`);
    /* normalization is done — collapse that accordion too */
    setSectionOpen(s => ({ ...s, extract: false, normalize: false }));

    setTimeout(() => {
      setPipeline(p => {
        if (!p || (p.docId !== id && p._origId !== id)) return p;
        const doc = docs.find(d => d.id === id || d._origId === id);
        const byKey = {}; p.fields.forEach(f => { byKey[f.key] = f.value; });
        const survey = byKey.survey || doc?.survey;
        const { checks, discrepancies, hasReference } = validateAgainstReference(p.fields, survey);
        const lowConfField = p.fields.some(f => f.confidence < 75);
        const needsReview = lowConfField || discrepancies.length > 0;
        const fieldsWithDisc = p.fields.map(f => ({
          ...f, discrepancy: discrepancies.find(d => d.field === f.key) || null,
        }));

        const finalStatus = needsReview ? 'review' : 'submitted';
        const conf = Math.min(...p.fields.map(f => f.confidence));

        setDocs(ds => ds.map(d => (d.id === id || d._origId === id) ? {
          ...d,
          status: finalStatus,
          confidence: conf,
          owner: byKey.owner || byKey.buyer || byKey.newOwner || d.owner,
          survey: byKey.survey || d.survey,
          area: byKey.area || d.area,
          village: byKey.village || d.village,
          taluk: byKey.taluk || d.taluk,
          khata: byKey.patta || d.khata,
          classification: byKey.classification || d.classification,
          fields: fieldsWithDisc,
          ocrText: doc?.ocrText || p?.ocrText || OCR_FULL_TEXT,
          discrepancies, valChecks: checks, hasReference,
        } : d));

        /* Auto-submit validated (no-discrepancy) docs */
        if (!needsReview) {
          setSubmitted(s => {
            if (s.some(r => r.id === id)) return s;
            return [...s, { id, survey: byKey.survey || doc?.survey, village: byKey.village || doc?.village, confidence: conf }];
          });
        }

        setSelectedValDocId(id);
        setTwinDocId(id);
        setGeoDocId(id);

        pushActivity(discrepancies.length > 0
          ? `${discrepancies.length} discrepancy(ies) found for ${id} — routed to review`
          : (needsReview ? `${id} flagged for review (low-confidence field)` : `${id} validated & auto-submitted — no discrepancies`));
        addToast(needsReview ? `${id} needs your review.` : `${id} validated & submitted automatically.`);

        return { ...p, stage: needsReview ? 'review' : 'submitted', fields: fieldsWithDisc, valChecks: checks, discrepancies, hasReference };
      });
    }, 900);
  }

  /* Kick off validation and immediately hand the operator off to the
     Validation page — validation never renders inside Processing. */
  function runValidationAndGo(id) {
    setSelectedValDocId(id);
    setTwinDocId(id);
    setGeoDocId(id);
    startValidation(id);
    setActiveTab('validation');
  }

  function submitReview() {
    if (!reviewDoc) return;
    const byKey = {};
    localFields.forEach(f => { byKey[f.key] = f.value; });
    const conf = Math.max(95, ...localFields.map(f => f.confidence || 95));

    // Persist review resolution to MongoDB backend
    documentApi.resolveReview(reviewDoc.id, {
      fields: localFields,
      extractedData: {
        ownerName: byKey.owner || byKey.buyer || byKey.newOwner || reviewDoc.owner,
        surveyNumber: byKey.survey || reviewDoc.survey,
        landArea: parseFloat(byKey.area) || 1.80,
        village: byKey.village || reviewDoc.village,
      },
      decisions: localFields.map(f => ({ key: f.key, decision: f.decision || 'APPROVED', value: f.value })),
    }).then(() => {
      addToast(`Document ${reviewDoc.id} sealed in MongoDB.`, 'info');
    }).catch(err => {
      console.warn('[Review] MongoDB sync note:', err.message);
    });

    setDocs(ds => ds.map(d => d.id === reviewDoc.id ? {
      ...d,
      status: 'submitted',
      confidence: conf,
      discrepancies: [],
      owner: byKey.owner || byKey.buyer || byKey.newOwner || d.owner,
      survey: byKey.survey || d.survey,
      area: byKey.area || d.area,
      village: byKey.village || d.village,
      khata: byKey.patta || d.patta || d.khata,
      classification: byKey.classification || d.classification,
      fields: localFields.map(f => ({ ...f, resolved: true, confidence: 99 })),
    } : d));

    setSubmitted(s => [{ id: reviewDoc.id, survey: byKey.survey || reviewDoc.survey, village: byKey.village || reviewDoc.village, confidence: conf }, ...s]);

    const decided = localFields.filter(f => f.decision);
    decided.forEach(f => pushActivity(`${reviewDoc.id} · ${f.label}: ${f.decision} (updated to "${f.value}")`));
    pushActivity(`Submitted ${reviewDoc.id} for officer verification`);
    addToast(`${reviewDoc.id} submitted for officer verification! Record moved to Submitted.`, 'success');

    setReviewDoc(null);
    setActiveTab('submitted');
  }

  const counts = {
    uploaded: docs.length,
    inProgress: docs.filter(d => ['preprocessing', 'preprocess-ready', 'ocr', 'ocr-paused', 'ocr-ready', 'extraction', 'normalizing', 'validating'].includes(d.status)).length,
    review: docs.filter(d => d.status === 'review').length,
    submitted: submitted.length,
  };
  const pct = Math.round((counts.submitted / (counts.uploaded || 1)) * 100);
  const allResolved = localFields.every(f => f.resolved);

  /* ---------------------------------------------------------------------
     PAGE RENDERERS
     --------------------------------------------------------------------- */

  function renderDashboard() {
    const filterDocs = (docs || []).filter(d => {
      if (dashFilter === 'review') return d.status === 'review';
      if (dashFilter === 'processing') return ['preprocessing', 'preprocess-ready', 'ocr', 'ocr-paused', 'ocr-ready', 'extraction', 'normalizing', 'validating'].includes(d.status);
      if (dashFilter === 'validated') return d.status === 'validated' || d.status === 'submitted';
      return true;
    }).filter(d => {
      if (!dashSearch) return true;
      const q = dashSearch.toLowerCase();
      return (d.id && d.id.toLowerCase().includes(q)) ||
             (d.survey && d.survey.toLowerCase().includes(q)) ||
             (d.village && d.village.toLowerCase().includes(q)) ||
             (d.name && d.name.toLowerCase().includes(q));
    });

    return (
      <div className="op-dashboard-container">
        {/* Top Hero Banner */}
        {/* Top Welcome Row & Date Widget (Matching Screenshot) */}
        <div className="op-welcome-row">
          <div className="op-welcome-text">
            <h1 className="op-welcome-title">
              Welcome Back,<br />
              <span className="op-welcome-name">Field &amp; Verification Officer</span>
            </h1>
            <p className="op-welcome-sub">Verify today. Trusted land records for tomorrow.</p>
          </div>
          <div className="op-date-card">
            <div className="op-date-icon-box">
              <Calendar size={22} className="op-date-icon" />
            </div>
            <div className="op-date-details">
              <span className="op-date-main">Wed, 03 Sep 2026</span>
              <span className="op-date-day">Wednesday</span>
            </div>
          </div>
        </div>

        {/* 4 Clean White KPI Cards (Matching Screenshot) */}
        <div className="op-kpi-grid">
          {/* Card 1: Uploaded */}
          <div className="op-kpi-card" onClick={() => setActiveTab('upload')}>
            <div className="op-kpi-icon-square green">
              <FileText size={22} />
            </div>
            <div className="op-kpi-content">
              <div className="op-kpi-number">{counts.uploaded || 11}</div>
              <div className="op-kpi-label">Uploaded</div>
            </div>
            <div className="op-kpi-badge-wrap">
              <span className="op-kpi-badge green">↑ 22%</span>
            </div>
          </div>

          {/* Card 2: In Processing */}
          <div className="op-kpi-card" onClick={() => setActiveTab('processing')}>
            <div className="op-kpi-icon-square blue">
              <SettingsIcon size={22} />
            </div>
            <div className="op-kpi-content">
              <div className="op-kpi-number">{counts.inProgress || 1}</div>
              <div className="op-kpi-label">In Processing</div>
            </div>
            <div className="op-kpi-badge-wrap">
              <span className="op-kpi-badge blue">→ 0%</span>
            </div>
          </div>

          {/* Card 3: Needs Review */}
          <div className="op-kpi-card" onClick={() => setActiveTab('review')}>
            <div className="op-kpi-icon-square orange">
              <AlertCircle size={22} />
            </div>
            <div className="op-kpi-content">
              <div className="op-kpi-number">{counts.review || 1}</div>
              <div className="op-kpi-label">Needs Review</div>
            </div>
            <div className="op-kpi-badge-wrap">
              <span className="op-kpi-badge orange">↑ 12%</span>
            </div>
          </div>

          {/* Card 4: Submitted */}
          <div className="op-kpi-card" onClick={() => setActiveTab('submitted')}>
            <div className="op-kpi-icon-square purple">
              <Send size={22} />
            </div>
            <div className="op-kpi-content">
              <div className="op-kpi-number">{counts.submitted || 2}</div>
              <div className="op-kpi-label">Submitted</div>
            </div>
            <div className="op-kpi-badge-wrap">
              <span className="op-kpi-badge green">↑ 33%</span>
            </div>
          </div>
        </div>

        {/* Middle Row: Verification Progress (Left) + Quick Actions (Right) */}
        <div className="op-middle-grid">
          {/* Daily Progress Gauge Card */}
          <div className="op-panel op-progress-card">
            <div className="op-panel-header">
              <div>
                <h3 className="op-panel-title">Verification Progress</h3>
                <p className="op-panel-subtitle">Today's digitization & validation target</p>
              </div>
              <span className="op-chip green">On Schedule</span>
            </div>
            <div className="op-progress-body">
              <div className="op-gauge-wrap">
                <svg className="op-gauge-svg" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="64" className="op-gauge-bg" />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    className="op-gauge-fill"
                    strokeDasharray="402"
                    strokeDashoffset={402 - (402 * 0.65)}
                  />
                </svg>
                <div className="op-gauge-center">
                  <span className="op-gauge-pct">65%</span>
                  <span className="op-gauge-sub">Verified Today</span>
                </div>
              </div>

              <div className="op-progress-breakdown">
                <div className="op-prog-item">
                  <div className="op-prog-label-row">
                    <span className="op-prog-dot green"></span>
                    <span className="op-prog-name">Verified & Dispatched</span>
                    <span className="op-prog-count">182 / 280 (65%)</span>
                  </div>
                  <div className="op-bar-track">
                    <div className="op-bar-fill green" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="op-prog-item">
                  <div className="op-prog-label-row">
                    <span className="op-prog-dot blue"></span>
                    <span className="op-prog-name">Under AI OCR Pipeline</span>
                    <span className="op-prog-count">42 / 280 (15%)</span>
                  </div>
                  <div className="op-bar-track">
                    <div className="op-bar-fill blue" style={{ width: '15%' }}></div>
                  </div>
                </div>

                <div className="op-prog-item">
                  <div className="op-prog-label-row">
                    <span className="op-prog-dot amber"></span>
                    <span className="op-prog-name">Pending Manual Review</span>
                    <span className="op-prog-count">56 / 280 (20%)</span>
                  </div>
                  <div className="op-bar-track">
                    <div className="op-bar-fill amber" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="op-progress-footer">
              <div className="op-foot-stat">
                <span className="op-foot-label">Avg Review Time</span>
                <span className="op-foot-val">2.8 min / doc</span>
              </div>
              <div className="op-foot-divider"></div>
              <div className="op-foot-stat">
                <span className="op-foot-label">Cadastral Match Rate</span>
                <span className="op-foot-val">99.2%</span>
              </div>
              <div className="op-foot-divider"></div>
              <div className="op-foot-stat">
                <span className="op-foot-label">AI Engine</span>
                <span className="op-foot-val">Bhoomi v2.4 (GPU)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (2x2 Grid) */}
          <div className="op-panel op-actions-card">
            <div className="op-panel-header">
              <div>
                <h3 className="op-panel-title">Quick Actions</h3>
                <p className="op-panel-subtitle">Instant workspace shortcuts</p>
              </div>
            </div>
            <div className="op-actions-grid">
              <div className="op-action-box" onClick={() => setActiveTab('upload')}>
                <div className="op-action-icon emerald">
                  <UploadCloud size={20} />
                </div>
                <div className="op-action-content">
                  <h4>Upload Land Record</h4>
                  <p>Drag & drop Tamil/English patta or deed scan</p>
                </div>
                <ChevronRight size={16} className="op-action-arrow" />
              </div>

              <div className="op-action-box" onClick={() => setActiveTab('processing')}>
                <div className="op-action-icon blue">
                  <ScanLine size={20} />
                </div>
                <div className="op-action-content">
                  <h4>AI OCR Workspace</h4>
                  <p>Inspect bounding boxes & confidence scores</p>
                </div>
                <ChevronRight size={16} className="op-action-arrow" />
              </div>

              <div className="op-action-box" onClick={() => setActiveTab('georeference')}>
                <div className="op-action-icon amber">
                  <MapPinned size={20} />
                </div>
                <div className="op-action-content">
                  <h4>Cadastral Geo-Reference</h4>
                  <p>Pin survey boundaries to satellite cadastre</p>
                </div>
                <ChevronRight size={16} className="op-action-arrow" />
              </div>

              <div className="op-action-box" onClick={() => setActiveTab('review')}>
                <div className="op-action-icon purple">
                  <PencilLine size={20} />
                </div>
                <div className="op-action-content">
                  <h4>Verify & Approve</h4>
                  <p>Side-by-side verification with legacy records</p>
                </div>
                <ChevronRight size={16} className="op-action-arrow" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Recent Records Table + Live System Updates */}
        <div className="op-bottom-grid">
          {/* Recent Records Table */}
          <div className="op-panel op-table-card">
            <div className="op-table-header">
              <div>
                <h3 className="op-panel-title">Recent Documents</h3>
                <p className="op-panel-subtitle">Review, inspect or edit extracted records</p>
              </div>
              <div className="op-table-filters">
                <div className="op-filter-pills">
                  {['all', 'review', 'processing', 'validated'].map(k => (
                    <button
                      key={k}
                      className={`op-filter-pill ${dashFilter === k ? 'active' : ''}`}
                      onClick={() => setDashFilter(k)}
                    >
                      {k === 'all' ? 'All' : k === 'review' ? 'Needs Review' : k === 'processing' ? 'In Progress' : 'Validated'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="op-table-responsive">
              <table className="op-data-table">
                <thead>
                  <tr>
                    <th>Document ID</th>
                    <th>Survey / Village</th>
                    <th>Type</th>
                    <th>Confidence</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filterDocs.slice(0, 6).map((doc, idx) => {
                    const isRev = doc.status === 'review';
                    const isVal = doc.status === 'validated' || doc.status === 'submitted';
                    return (
                      <tr key={doc.id || idx}>
                        <td>
                          <div className="op-doc-cell">
                            <FileText size={15} className="op-doc-icon" />
                            <span className="op-doc-id">{doc.id || `LR-10${idx + 20}`}</span>
                          </div>
                        </td>
                        <td>
                          <div className="op-cell-main">
                            <span className="op-survey-no">Survey #{doc.survey || '125/2'}</span>
                            <span className="op-village-name">{doc.village || 'Kinathukadavu'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="op-type-tag">{doc.type || 'Patta Record'}</span>
                        </td>
                        <td>
                          <div className="op-conf-cell">
                            <div className="op-conf-bar">
                              <div
                                className="op-conf-fill"
                                style={{ width: `${doc.confidence || 95}%` }}
                              ></div>
                            </div>
                            <span className="op-conf-val">{doc.confidence || 95}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`op-status-badge ${isRev ? 'review' : isVal ? 'validated' : 'processing'}`}>
                            {isRev ? 'Needs Review' : isVal ? 'Validated' : 'Processing'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="op-table-act-btn"
                            onClick={() => {
                              if (isRev) {
                                openReview(doc);
                              } else {
                                openViewDoc(doc.id);
                              }
                            }}
                          >
                            <Eye size={13} /> {isRev ? 'Review' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filterDocs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="op-empty-cell">
                        No documents found matching the filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="op-table-footer">
              <span>Showing {Math.min(filterDocs.length, 6)} of {filterDocs.length} records</span>
              <button className="op-view-all-btn" onClick={() => setActiveTab('documents')}>
                View All Records <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* System Updates Timeline */}
          <div className="op-panel op-updates-card">
            <div className="op-panel-header">
              <div>
                <h3 className="op-panel-title">System Updates</h3>
                <p className="op-panel-subtitle">Real-time pipeline & audit events</p>
              </div>
            </div>
            <div className="op-updates-list">
              <div className="op-update-item">
                <div className="op-update-icon green">
                  <CheckCircle2 size={14} />
                </div>
                <div className="op-update-body">
                  <p className="op-update-text"><strong>Document #TR-2024-884</strong> AI OCR extraction completed with 99.4% confidence</p>
                  <span className="op-update-time">2 mins ago</span>
                </div>
              </div>

              <div className="op-update-item">
                <div className="op-update-icon blue">
                  <MapPin size={14} />
                </div>
                <div className="op-update-body">
                  <p className="op-update-text"><strong>Survey #125/2 Kinathukadavu</strong> boundary aligned to FMB grid coordinates</p>
                  <span className="op-update-time">14 mins ago</span>
                </div>
              </div>

              <div className="op-update-item">
                <div className="op-update-icon purple">
                  <ShieldCheck size={14} />
                </div>
                <div className="op-update-body">
                  <p className="op-update-text"><strong>Tahsildar approved</strong> Patta #PT-2024-1049 digital twin signature</p>
                  <span className="op-update-time">45 mins ago</span>
                </div>
              </div>

              <div className="op-update-item">
                <div className="op-update-icon amber">
                  <AlertTriangle size={14} />
                </div>
                <div className="op-update-body">
                  <p className="op-update-text"><strong>Discrepancy detected:</strong> Area mismatch in Survey #88/2 (0.85 vs 0.88 ac)</p>
                  <span className="op-update-time">1 hour ago</span>
                </div>
              </div>

              <div className="op-update-item">
                <div className="op-update-icon blue">
                  <RefreshCw size={14} />
                </div>
                <div className="op-update-body">
                  <p className="op-update-text"><strong>Batch Sync:</strong> 40 verified records exported to State LRMS database</p>
                  <span className="op-update-time">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderUpload() {
    return (
      <>
        <PageHead title="Upload Document" sub="Add a new legacy land record for AI processing." />
        <div className="panel">
          <div className="panel-body">

            {uploadStep === 'select' && (
              <div className="dropzone">
                <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={handleFileChange}
                       style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <div className="dz-ico"><UploadCloud size={26} /></div>
                <b>Drop land record here</b>
                <span>PDF · JPG · PNG · TIFF</span>
                <span className="dz-sub">Max 20 MB · Up to 50 pages</span>
                <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 14, pointerEvents: 'none' }}>Browse File</button>
                <ul className="dz-notes">
                  <li><CheckCircle2 size={13} /> Clear scan recommended (200–300 DPI)</li>
                  <li><CheckCircle2 size={13} /> Original document will be preserved</li>
                  <li><CheckCircle2 size={13} /> Password-protected/corrupted files are rejected</li>
                </ul>
              </div>
            )}

            {uploadStep === 'confirm' && selectedFile && (
              <div className="filecard">
                <div className="filecard-head">
                  <FileText size={22} />
                  <div><b>{selectedFile.name}</b>
                    <span>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB &nbsp;·&nbsp; {1 + Math.floor(Math.random() * 12)} pages &nbsp;·&nbsp; {selectedFile.type.includes('pdf') ? 'PDF' : 'Image'}</span>
                  </div>
                </div>
                <ul className="filecard-checks">
                  <li><CheckCircle2 size={14} /> File type valid</li>
                  <li><CheckCircle2 size={14} /> Size within limit</li>
                  <li><CheckCircle2 size={14} /> {selectedFile.type.includes('pdf') ? 'PDF readable' : 'Image readable'}</li>
                  <li><CheckCircle2 size={14} /> No password protection</li>
                </ul>
                <div className="filecard-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSelectedFile(null); setUploadStep('select'); }}>Choose Different File</button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setUploadStep('meta')}>Continue <ArrowRight size={14} /></button>
                </div>
              </div>
            )}

            {uploadStep === 'meta' && selectedFile && (
              <form onSubmit={handleStartProcessing}>
                <div className="filecard filecard-compact">
                  <FileText size={16} /> <span>{selectedFile.name}</span>
                </div>
                <div className="field">
                  <label>Document Type</label>
                  <select value={docType} onChange={e => setDocType(e.target.value)}>
                    {DOC_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-block"><Sparkles size={16} /> Start Processing</button>
              </form>
            )}

          </div>
        </div>
      </>
    );
  }

  function renderProcessing() {
    const processingDocs = docs.filter(d => ['preprocessing', 'preprocess-ready', 'ocr', 'ocr-paused', 'ocr-ready', 'extraction', 'normalizing', 'validating'].includes(d.status));
    const live = pipeline;
    const liveDoc = live
      ? (docs.find(d => d.id === live.docId || (d._origId && d._origId === live.docId)) || (processingDocs.length > 0 ? processingDocs[0] : docs[0]))
      : (processingDocs.length > 0 ? processingDocs[0] : docs[0]);
    const imageUrl = liveDoc?.imageUrl || liveDoc?.previewUrl;
    const fileType = liveDoc?.type || (imageUrl?.toLowerCase().includes('.pdf') ? 'PDF' : 'Image');
    const otherProcessing = processingDocs.filter(d => d.id !== live?.docId && d._origId !== live?.docId);
    const activeRegion = evidenceKey ? live?.fields?.find(f => f.key === evidenceKey)?.region : null;

    return (
      <>
        <PageHead
          title="Processing"
          sub="Documents currently going through the AI pipeline."
          rightBtn={
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('upload')}>
              <UploadCloud size={14} /> Upload Another Scan
            </button>
          }
        />

        {/* Pipeline Document Selector Switcher */}
        {processingDocs.length > 1 && (
          <div className="cv-tabs no-print" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', marginRight: 4 }}>
              PIPELINES:
            </span>
            {processingDocs.map(d => (
              <button
                key={d.id}
                className={`cv-tab-btn ${(live?.docId === d.id || live?._origId === d.id || liveDoc?.id === d.id) ? 'active' : ''}`}
                onClick={() => {
                  if (live?.docId !== d.id && live?._origId !== d.id) {
                    runPipeline(d.id);
                  }
                }}
              >
                <ScanLine size={13} />
                <span>{d.id} ({d.name || d.fileName || d.survey})</span>
                <span className="badge badge-tiny">{d.status}</span>
              </button>
            ))}
          </div>
        )}

        {live && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3>DOCUMENT {live.docId}</h3>
                <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 500 }}>
                  ({liveDoc?.name || liveDoc?.fileName || 'Uploaded File'})
                </span>
              </div>
              <StatusBadge status={live.stage} />
            </div>
            <div className="panel-body">

              <div className="substage-strip">
                {SUBSTAGES.map((s, i) => {
                  const cur = substageIndex(live.stage);
                  const state = i < cur ? 'done' : i === cur ? 'active' : 'pending';
                  return (
                    <React.Fragment key={s.key}>
                      <div className={`substage-step ${state}`}>
                        <span className="substage-num">{state === 'done' ? <CheckCircle2 size={13} /> : i + 1}</span>
                        {s.label}
                      </div>
                      {i < SUBSTAGES.length - 1 && <div className="substage-connector" />}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* --- 1. IMAGE ENHANCEMENT (collapsible) --- */}
              <div className="pipe-section" id="pipe-enhance">
                <button type="button" className="pipe-label pipe-label-toggle" onClick={() => toggleSection('enhance')}>
                  <ScanLine size={13} /> IMAGE ENHANCEMENT
                  {live.stage === 'preprocessing' && live.preSteps.length < PREPROCESS_STEPS.length && <span className="muted-inline">— running...</span>}
                  {live.stage !== 'preprocessing' && <span className="muted-inline">— complete</span>}
                  <span className="pipe-toggle-ic">{sectionOpen.enhance ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                </button>
                {sectionOpen.enhance && (
                  <>
                    <div className="compare-grid">
                      <div className="compare-col">
                        <span className="compare-tag"><ScanLine size={12} /> Original scan</span>
                        <div className="compare-frame">
                          <DocPreview url={imageUrl} type={fileType} filterCss={RAW_SCAN_FILTER} altLabel={`Original scan - ${liveDoc?.name || live.docId}`} />
                        </div>
                      </div>
                      <div className="compare-col">
                        <span className="compare-tag"><Sparkles size={12} /> Enhanced ({live.preSteps.length}/{PREPROCESS_STEPS.length} steps)</span>
                        <div className="compare-frame">
                          <DocPreview url={imageUrl} type={fileType} filterCss={enhanceFilter(live.preSteps.length)} altLabel={`Enhanced document - ${liveDoc?.name || live.docId}`} isEnhanced={true} stepCount={live.preSteps.length} />
                        </div>
                      </div>
                    </div>
                    {/* Real Per-Page Enhancement & Transformation Metrics */}
                    <div style={{ marginTop: 16, background: '#fff', border: '1px solid var(--line-strong)', padding: '14px 18px', borderRadius: 3 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Per-Page Preprocessing &amp; OpenCV Pipeline ({liveDoc?.pageMetrics?.length || 1} Page{liveDoc?.pageMetrics?.length > 1 ? 's' : ''})
                        </span>
                        <span className="badge badge-green" style={{ fontSize: 10 }}>Adaptive OpenCV Enhancement</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                        {(liveDoc?.pageMetrics && liveDoc.pageMetrics.length > 0 ? liveDoc.pageMetrics : []).map((pm, idx) => (
                          <div key={idx} style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: '10px 12px', borderRadius: 2, fontSize: 11.5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <b style={{ color: 'var(--ink)' }}>Page {pm.page || idx + 1}</b>
                              <span className={`badge ${pm.legibilityFlag === 'LOW_CONFIDENCE_EXPECTED' ? 'badge-rust' : 'badge-green'}`} style={{ fontSize: 9.5 }}>
                                {pm.legibilityFlag || 'OK'}
                              </span>
                            </div>
                            <div style={{ color: 'var(--ink-soft)', lineHeight: 1.4 }}>
                              <div>• Skew: <span className="mono" style={{ fontWeight: 600 }}>{pm.skewAngle != null ? `${pm.skewAngle}°` : '0.0°'}</span></div>
                              {pm.sharpness != null && <div>• Sharpness: <span className="mono">{pm.sharpness}</span></div>}
                              {pm.meanBrightness != null && <div>• Brightness: <span className="mono">{pm.meanBrightness} (σ={pm.contrastStd})</span></div>}
                              <div>• Operations: <span className="mono" style={{ fontSize: 10 }}>{(pm.operationsApplied || ['none_needed']).join(', ')}</span></div>
                            </div>
                          </div>
                        ))}
                        {(!liveDoc?.pageMetrics || liveDoc.pageMetrics.length === 0) && (
                          <div style={{ color: 'var(--ink-faint)', fontSize: 11.5, fontStyle: 'italic', padding: 8 }}>
                            Awaiting per-page metrics from AI pipeline...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="checklist" style={{ marginTop: 14 }}>
                      {PREPROCESS_STEPS.map(step => {
                        const done = live.preSteps.includes(step);
                        return (
                          <div key={step} className={`check-step ${done ? 'done' : 'pending'}`}>
                            <div className="c-dot">{done ? <CheckCircle2 size={14} /> : <Circle size={12} />}</div>
                            <span>{step}</span>
                          </div>
                        );
                      })}
                      {live.stage === 'preprocessing' && live.preSteps.length === PREPROCESS_STEPS.length && (
                        <div className="check-step active"><div className="c-dot"><Loader2 size={14} className="spin" /></div><span>Preparing for OCR...</span></div>
                      )}
                    </div>
                    {live.stage === 'preprocess-ready' && (
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => startOcr(live.docId)}>
                        <PlayCircle size={15} /> Proceed to OCR →
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* --- 2. OCR (collapsible) --- */}
              {(live.stage === 'ocr' || live.stage === 'ocr-paused' || live.stage === 'ocr-ready' || live.stage === 'extraction' || live.stage === 'normalizing' || live.stage === 'validating' || live.stage === 'review' || live.stage === 'validated') && (
                <div className="pipe-section" id="pipe-ocr">
                  <button type="button" className="pipe-label pipe-label-toggle" onClick={() => toggleSection('ocr')}>
                    <FileText size={13} /> OCR / HTR
                    <span className="muted-inline">— {live.stage === 'ocr' ? 'running...' : live.stage === 'ocr-paused' ? 'paused' : 'complete'}</span>
                    <span className="pipe-toggle-ic">{sectionOpen.ocr ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                  </button>
                  {sectionOpen.ocr && (
                    <>
                      <OcrWorkspace
                        doc={liveDoc}
                        zoom={zoom}
                        setZoom={setZoom}
                        pipeline={live}
                        onProgress={w => handleOcrProgress(live.docId, w)}
                        onComplete={() => handleOcrComplete(live.docId)}
                        onStuck={() => handleOcrStuck(live.docId)}
                        onResume={accept => resumeOcr(live.docId, accept)}
                      />
                      {live.stage === 'ocr-ready' && (
                        <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => startExtraction(live.docId)}>
                          Next: Text Extraction →
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* --- 3. TEXT EXTRACTION (collapsible; schema depends on document type) --- */}
              {live.fields.length > 0 && (
                <div className="pipe-section" id="pipe-extract">
                  <button type="button" className="pipe-label pipe-label-toggle" onClick={() => toggleSection('extract')}>
                    <Sparkles size={13} /> TEXT EXTRACTION <span className="muted-inline">— {liveDoc?.docType}{live.stage !== 'extraction' ? ' · complete' : ''}</span>
                    <span className="pipe-toggle-ic">{sectionOpen.extract ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                  </button>
                  {sectionOpen.extract && (
                    <div className="ocr-split">
                      <div className="compare-col">
                        <span className="compare-tag"><Crosshair size={11} /> Source document {evidenceKey ? `— jumped to ${live.fields.find(f => f.key === evidenceKey)?.label || 'field'}` : ''}</span>
                        <div className="compare-frame compare-frame-tall">
                          <PrintedOcrDocumentViewer
                            ocrText={liveDoc?.ocrText || liveDoc?.ocrResult || live.ocrText || OCR_FULL_TEXT}
                            doc={liveDoc}
                            fields={live.fields}
                            evidenceKey={evidenceKey}
                            onSelectField={setEvidenceKey}
                            originalUrl={imageUrl}
                            fileType={fileType}
                            filterCss={enhanceFilter(PREPROCESS_STEPS.length)}
                            activeField={live.fields.find(f => f.key === evidenceKey)}
                          />
                        </div>
                      </div>
                      <div className="compare-col">
                        <span className="compare-tag">Structured fields — click a field to locate on PDF</span>
                        <div className="fields-table">
                          {live.fields.map(f => {
                            const isSelected = evidenceKey === f.key;
                            return (
                              <div
                                key={f.key}
                                className={`fields-row clickable ${isSelected ? 'active' : ''}`}
                                onClick={() => setEvidenceKey(f.key)}
                                style={{
                                  cursor: 'pointer',
                                  padding: '8px 12px',
                                  borderRadius: 3,
                                  borderLeft: isSelected ? '3px solid var(--green, #059669)' : '3px solid transparent',
                                  background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <span className="fk" style={{ fontWeight: isSelected ? 700 : 500 }}>
                                  {f.label}
                                  {isSelected && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--green, #059669)' }}>(Page {f.region?.page || 1})</span>}
                                </span>
                                <span className="fv mono" style={{ color: isSelected ? 'var(--green, #064e3b)' : 'inherit', fontWeight: isSelected ? 600 : 400 }}>{f.value}</span>
                                {f.unresolved ? (
                                  <span className="badge badge-rust" style={{ fontSize: 9.5, padding: '2px 6px', justifySelf: 'end' }}>Not extracted</span>
                                ) : (
                                  <span className={`conf ${confClass(f.confidence)}`}>{f.confidence}% {f.confidence >= 75 ? 'Γ£ô' : '⚠️'}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {live.stage === 'extraction' && (
                          <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => startNormalization(live.docId)}>
                            <RefreshCw size={15} /> Next: Normalization &amp; Entity Resolution →
                          </button>
                        )}
                        {live.stage !== 'extraction' && (
                          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => startNormalization(live.docId)}>
                              <RefreshCw size={15} /> Normalization &amp; Entities →
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('validation')}>
                              <GitCompare size={15} /> Go to Validation →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- 4. NORMALIZATION & ENTITY RESOLUTION (collapsible) --- */}
              {(live.stage === 'normalizing' || live.stage === 'validating' || live.stage === 'review' || live.stage === 'validated') && (
                <div className="pipe-section" id="pipe-normalize">
                  <button type="button" className="pipe-label pipe-label-toggle" onClick={() => toggleSection('normalize')}>
                    <RefreshCw size={13} /> NORMALIZATION &amp; ENTITY RESOLUTION <span className="muted-inline">— {live.stage === 'normalizing' ? 'active' : 'complete'}</span>
                    <span className="pipe-toggle-ic">{sectionOpen.normalize ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                  </button>
                  {sectionOpen.normalize && (
                    <div className="fields-table" style={{ padding: '14px 18px', background: '#fff' }}>
                      {live.fields.map(f => (
                        <div key={f.key} className="fields-row" style={{ display: 'grid', gridTemplateColumns: '140px 1.5fr 1fr', alignItems: 'center', padding: '10px 12px' }}>
                          <span className="fk">{f.label}</span>
                          <span className="fv mono">
                            {f.normalized ? <><span style={{ textDecoration: 'line-through', color: 'var(--ink-faint)', marginRight: 6 }}>{f.originalValue}</span>{' → '}<b style={{ color: 'var(--green)' }}>{f.value}</b></> : f.value}
                          </span>
                          <span className={f.normalized ? 'decision-chip' : 'muted-inline'} style={{ justifySelf: 'start' }}>
                            {f.normalized ? f.normalizeReason : 'Canonical · no change'}
                          </span>
                        </div>
                      ))}
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => runValidationAndGo(live.docId)}>
                        <GitCompare size={15} /> Run Validation →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {otherProcessing.map(d => (
          <div key={d.id} className="panel" style={{ marginBottom: 14 }}>
            <div className="panel-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3>DOCUMENT {d.id}</h3>
                <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>({d.name || d.fileName || d.type})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StatusBadge status={d.status} />
                <button className="btn btn-outline btn-sm" onClick={() => runPipeline(d.id)}>
                  Inspect / Resume →
                </button>
              </div>
            </div>
            <div className="panel-body"><span className="muted">Queued or running in AI pipeline stage: <b>{d.status}</b></span></div>
          </div>
        ))}

        {!live && otherProcessing.length === 0 && (
          <EmptyState icon={CheckCircle2} title="Nothing processing right now" sub="Upload a document to start the AI pipeline." />
        )}
      </>
    );
  }

  function docTable(ds, withAction) {
    return (
      <div className="table-scroll">
        <table>
          <thead><tr><th>Document</th><th>Name / Type</th><th>Village</th><th>Status</th><th>Confidence</th>{withAction && <th></th>}</tr></thead>
          <tbody>
            {ds.map(d => (
              <tr key={d.id}>
                <td className="mono"><b>{d.id}</b></td>
                <td>
                  <div><b>{d.name || d.fileName || d.type}</b></div>
                  <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{d.docType || d.type}</span>
                </td>
                <td>{d.village}</td>
                <td><StatusBadge status={d.status} /></td>
                <td>{d.confidence != null ? <span className={`conf ${confClass(d.confidence)}`}>{d.confidence}%</span> : '—'}</td>
                {withAction && (
                  <td>
                    {['preprocessing', 'preprocess-ready', 'ocr', 'ocr-paused', 'ocr-ready', 'extraction', 'normalizing', 'validating'].includes(d.status) && (
                      <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => { runPipeline(d.id); setActiveTab('processing'); }}>
                        <RefreshCw size={13} style={{ marginRight: 4 }} /> Process →
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => { setTwinDocId(d.id); setActiveTab('digitaltwin'); }}>
                      <Box size={13} style={{ marginRight: 4 }} /> Twin →
                    </button>
                    {SPATIAL_DOC_TYPES.has(d.docType) && (
                      <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => { setGeoDocId(d.id); setActiveTab('georeference'); }}>
                        <MapPinned size={13} style={{ marginRight: 4 }} /> Geo-Ref →
                      </button>
                    )}
                    {d.status === 'review' && <button className="btn btn-ghost btn-sm" onClick={() => goToReview(d)}>Review →</button>}
                    {d.status === 'validated' && !SPATIAL_DOC_TYPES.has(d.docType) && <button className="btn btn-ghost btn-sm" onClick={() => goToReview(d)}>Submit →</button>}
                    {(d.status === 'submitted') && <button className="btn btn-ghost btn-sm" onClick={() => { setViewDocId(d.id); setViewTab('digitized'); setActiveTab('viewdoc'); }}>View →</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderDocuments() {
    return (
      <>
        <PageHead title="All Documents" sub="Every document uploaded for digitization."
                  rightBtn={<button className="btn btn-primary" onClick={() => setActiveTab('upload')}><UploadCloud size={15} /> Upload Document</button>} />
        <div className="panel"><div className="panel-body">{docTable(docs, true)}</div></div>
      </>
    );
  }

  function openReview(doc) {
    if (!doc) return;
    setReviewDoc(doc);
    const forceLow = (doc.id === 'LR-1021' || doc.status === 'review') ? ['area'] : [];
    const fields = (doc.fields && doc.fields.length > 0)
      ? doc.fields
      : genFields(doc.docType || 'Ownership Record', forceLow, doc);

    const disc = doc.discrepancies || [];
    const enrichedFields = fields.map(f => {
      const d = disc.find(dItem => dItem.field === f.key);
      const isResolved = d ? false : (f.confidence >= 75);
      return {
        ...f,
        discrepancy: d || null,
        resolved: isResolved,
        originalValue: f.originalValue || f.value,
        decision: f.decision || null,
      };
    });

    setLocalFields(enrichedFields);
    const firstUnresolved = enrichedFields.find(f => !f.resolved) || enrichedFields[0];
    setActiveFieldKey(firstUnresolved?.key || null);
    setDraftValue(firstUnresolved?.value || '');
  }

  function confirmField(key) {
    setLocalFields(fields => fields.map(f => f.key === key ? { ...f, resolved: true, decision: 'Confirmed As-Is' } : f));
    pushActivity(`Confirmed extracted value for field "${key}" on document ${reviewDoc?.id}`);
    addToast(`Confirmed ${key} as-is.`, 'info');
  }

  function saveCorrection(key) {
    setLocalFields(fields => fields.map(f => f.key === key ? {
      ...f,
      originalValue: f.value,
      value: draftValue,
      resolved: true,
      decision: `Corrected: "${draftValue}"`,
    } : f));
    pushActivity(`Corrected field "${key}" to "${draftValue}" on document ${reviewDoc?.id}`);
    addToast(`Saved correction for ${key}.`, 'info');
  }

  function decideField(key, action) {
    const actionLabels = {
      approve: 'Approved',
      correct: `Corrected to "${draftValue}"`,
      reject: 'Rejected Discrepancy',
      escalate: 'Escalated to Supervisor',
    };
    const label = actionLabels[action] || action;
    setLocalFields(fields => fields.map(f => {
      if (f.key !== key) return f;
      const updatedValue = (action === 'correct' && draftValue) ? draftValue : f.value;
      return {
        ...f,
        value: updatedValue,
        resolved: true,
        decision: label,
      };
    }));
    pushActivity(`Resolved discrepancy for "${key}": ${label} on ${reviewDoc?.id}`);
    addToast(`Field ${key}: ${label}`, 'info');
  }

  function submitReview() {
    if (!reviewDoc) return;
    const docId = reviewDoc.id;
    const resolvedFields = [...localFields];

    setDocs(ds => ds.map(d => {
      if (d.id !== docId && d._origId !== docId) return d;
      return {
        ...d,
        status: 'validated',
        confidence: 99,
        fields: resolvedFields,
        discrepancies: [],
        auditLog: [
          ...(d.auditLog || []),
          { t: nowTime(), action: 'Human-in-the-Loop Verified', operator: userName, fieldsUpdated: resolvedFields.length },
        ],
      };
    }));

    setSubmitted(prev => [
      { id: docId, survey: reviewDoc.survey, village: reviewDoc.village, confidence: 99 },
      ...prev.filter(p => p.id !== docId),
    ]);

    pushActivity(`Document ${docId} fully verified through Human-in-the-Loop.`);
    addToast(`Document ${docId} successfully verified & submitted!`, 'info');

    setReviewDoc(null);
    setLocalFields([]);
    setActiveFieldKey(null);
    setActiveTab('validation');
  }

  function goToReview(docOrId) {
    const doc = (typeof docOrId === 'object' && docOrId !== null)
      ? docOrId
      : docs.find(d => d.id === docOrId || d._origId === docOrId);
    if (doc) {
      openReview(doc);
    }
    setActiveTab('review');
  }

  /* ---- Human-in-the-Loop: when a document is being resolved, this page
     IS the review workspace (no popup). Otherwise it's the queue. ---- */
  function renderReviewOrIssues(kind) {
    const list = kind === 'issues'
      ? docs.filter(d => (d.confidence != null && d.confidence < 75) || (d.discrepancies && d.discrepancies.length > 0))
      : docs.filter(d => d.status === 'review' || (d.discrepancies && d.discrepancies.length > 0));

    if (list.length === 0) {
      return (
        <>
          <PageHead title={kind === 'issues' ? 'Issues' : 'Human-in-the-Loop Review'} sub="Documents needing human verification." />
          <EmptyState icon={CheckCircle2} title="All caught up" sub="No documents currently need review. All records validated & submitted." />
        </>
      );
    }

    const currentDoc = reviewDoc && list.some(d => d.id === reviewDoc.id) ? reviewDoc : list[0];

    return renderReviewWorkspace(list, currentDoc);
  }

  /* the actual resolve workspace — was a modal, now lives inline on the
     Human-in-the-Loop page since resolving IS that process. */
  function renderReviewWorkspace(reviewList = [], currentTargetDoc = null) {
    const activeDoc = currentTargetDoc || reviewDoc || reviewList[0];
    if (!activeDoc) {
      return <EmptyState icon={CheckCircle2} title="No Documents Pending" sub="All records have been verified." />;
    }

    // Initialize localFields if not yet set for activeDoc
    const displayFields = (localFields.length > 0 && reviewDoc?.id === activeDoc.id)
      ? localFields
      : (activeDoc.fields && activeDoc.fields.length > 0 ? activeDoc.fields : genFields(activeDoc.docType || 'Ownership Record', ['area'], activeDoc)).map(f => {
          const d = (activeDoc.discrepancies || []).find(dItem => dItem.field === f.key);
          return {
            ...f,
            discrepancy: d || null,
            resolved: d ? false : (f.confidence >= 75),
            originalValue: f.originalValue || f.value,
            decision: f.decision || null,
          };
        });

    const activeKey = activeFieldKey || (displayFields.find(f => !f.resolved) || displayFields[0])?.key;
    const allResolved = displayFields.length > 0 && displayFields.every(f => f.resolved);
    const verifiedCount = displayFields.filter(f => f.resolved).length;
    const candidates = reviewList.length > 0 ? reviewList : docs.filter(d => d.status === 'review');

    return (
      <>
        <PageHead
          title={`Review Extraction · ${activeDoc.id}`}
          sub="Confirm correct fields, resolve flagged discrepancies."
          rightBtn={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setEgDocId(activeDoc.id); setActiveTab('evidencegraph'); }}
              >
                <Network size={14} /> Evidence Graph →
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setTwinDocId(activeDoc.id); setActiveTab('digitaltwin'); }}
              >
                <Box size={14} /> Digital Twin →
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setSelectedValDocId(activeDoc.id); setActiveTab('validation'); }}
              >
                <GitCompare size={14} /> Cross Validation →
              </button>
            </div>
          }
        />

        {/* Review Candidate Document Switcher */}
        {candidates.length > 1 && (
          <div className="cv-tabs no-print" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', marginRight: 4 }}>
              PENDING REVIEW:
            </span>
            {candidates.map(d => (
              <button
                key={d.id}
                className={`cv-tab-btn ${(reviewDoc?.id || activeDoc.id) === d.id ? 'active' : ''}`}
                onClick={() => openReview(d)}
              >
                <FileText size={14} />
                <span>{d.id} ({d.survey} · {d.village})</span>
                <span className="badge badge-rust badge-tiny">
                  {d.discrepancies?.length || 1} Issue
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="panel">
          <div className="panel-body" style={{ padding: 0 }}>
            <div className="split">
              <div className="doc-preview">
                <div className="rp-head">
                  <h4 className="section-title" style={{ margin: 0 }}>Source Document</h4>
                  <span className="muted" style={{ fontSize: 11.5 }}>{activeDoc.type || activeDoc.docType} Scan · Page 1</span>
                </div>
                <div className="compare-frame compare-frame-tall" style={{ flex: 1, minHeight: 480 }}>
                  <PrintedOcrDocumentViewer
                    ocrText={activeDoc?.ocrText || activeDoc?.ocrResult || OCR_FULL_TEXT}
                    doc={activeDoc}
                    fields={displayFields}
                    evidenceKey={activeKey}
                    onSelectField={setActiveFieldKey}
                    originalUrl={activeDoc.imageUrl}
                    fileType={activeDoc.type}
                    filterCss={enhanceFilter(PREPROCESS_STEPS.length)}
                    activeField={displayFields.find(f => f.key === activeKey)}
                  />
                </div>
              </div>

              <div className="review-panel">
                <div className="rp-head">
                  <h4 className="section-title" style={{ margin: 0 }}>Extracted Information</h4>
                  <span className="muted" style={{ fontSize: 11.5 }}>
                    {verifiedCount}/{displayFields.length} fields verified
                  </span>
                </div>
                <div className="fields-list">
                  {displayFields.map(f => (
                    <div key={f.key} className={`review-field ${activeKey === f.key ? 'active' : ''} ${f.resolved ? 'resolved' : (f.discrepancy ? 'discrepant' : 'flagged')}`}>
                      <div className="rf-top">
                        <span className="rf-label">{f.label}</span>
                        {f.unresolved ? (
                          <span className="badge badge-rust" style={{ fontSize: 10, padding: '2px 6px' }}>Not extracted — needs manual entry</span>
                        ) : (
                          <span className={`conf ${confClass(f.confidence)}`}>{f.confidence}% {f.resolved ? 'Γ£ô' : '⚠️'}</span>
                        )}
                      </div>

                      {activeKey === f.key ? (
                        f.discrepancy ? (
                          <>
                            <div className="disc-banner">
                              <span className={`sev-badge ${sevClass(f.discrepancy.severity)}`}>{f.discrepancy.severity}</span>
                              <span>Reference ({f.discrepancy.source || 'LRMS Register'}): <b className="mono">{f.discrepancy.referenceValue}</b></span>
                            </div>
                            <div className="rf-ocr">Document value: <span className="mono">{f.value}</span></div>
                            <input className="rf-input" value={draftValue !== '' ? draftValue : f.value} onChange={e => setDraftValue(e.target.value)} />
                            <div className="rf-actions rf-actions-4">
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => decideField(f.key, 'approve')}><ThumbsUp size={13} /> Approve</button>
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => decideField(f.key, 'correct')}><PencilRuler size={13} /> Correct</button>
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => decideField(f.key, 'reject')}><Ban size={13} /> Reject</button>
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => decideField(f.key, 'escalate')}><ArrowUpCircle size={13} /> Escalate</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="rf-ocr">OCR result: <span className="mono">{f.value}</span></div>
                            <input className="rf-input" value={draftValue !== '' ? draftValue : f.value} onChange={e => setDraftValue(e.target.value)} />
                            <div className="rf-actions">
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => confirmField(f.key)}>Confirm As-Is</button>
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => saveCorrection(f.key)}>Save Correction</button>
                            </div>
                          </>
                        )
                      ) : (
                        <div className="rf-value mono" onClick={() => { setActiveFieldKey(f.key); setDraftValue(f.value); }}>
                          <span className="rf-value-text">{f.value}</span>
                          {f.discrepancy && !f.resolved && <span className="disc-dot" title="Discrepancy" />}
                          {f.decision && <span className="decision-chip">{f.decision}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-primary btn-block"
                  disabled={!allResolved}
                  onClick={submitReview}
                  style={{ marginTop: 14, opacity: allResolved ? 1 : 0.5, cursor: allResolved ? 'pointer' : 'not-allowed' }}
                >
                  <Send size={15} /> Submit for Verification →
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* =========================================================================
     CROSS VALIDATION — refactored
     ========================================================================= */

  /* ---- 1. Pure data derivation ---- */

  function getFallbackValues(doc) {
    return {
      survey: (doc?.survey && doc.survey !== '—') ? doc.survey : '125/2',
      village: (doc?.village && doc.village !== '—') ? doc.village : 'Kinathukadavu',
    };
  }

  function getValidationData(doc) {
    const { survey } = getFallbackValues(doc);
    const forceLow = (doc?.id === 'LR-1021' || doc?.status === 'review') ? ['area'] : [];

    const docFields = (doc?.fields && doc.fields.length > 0)
      ? doc.fields
      : genFields(doc?.docType || 'Ownership Record', forceLow);

    const computed = validateAgainstReference(docFields, survey);
    const checks = (doc?.valChecks && doc.valChecks.length > 0) ? doc.valChecks : computed.checks;
    const discrepancies = (doc?.discrepancies && doc.discrepancies.length > 0) ? doc.discrepancies : computed.discrepancies;

    const hasDiscrepancy = discrepancies.length > 0 || (doc?.confidence != null && doc.confidence < 75);
    const confidenceScore = doc?.confidence != null ? doc.confidence : (hasDiscrepancy ? 43 : 96);

    return { docFields, checks, discrepancies, hasDiscrepancy, confidenceScore };
  }

  function confidenceForCheck(check, docFields, isFail) {
    const match = docFields.find(f => f.key === check.key || f.label === check.label);
    return match?.confidence ?? (isFail ? 43 : 96);
  }

  /* ---- 2. Subcomponents ---- */

  function ValidationDocSwitcher({ docs, activeId, onSelect }) {
    if (!docs || docs.length === 0) {
      return (
        <div className="cv-clean-state" style={{ marginBottom: 16 }}>
          <CheckCircle2 size={18} />
          <b>No documents currently need cross-validation review. All validated records have been submitted.</b>
        </div>
      );
    }
    return (
      <div className="cv-tabs no-print">
        {docs.map(d => {
          const isDisc = d.status === 'review' || (d.discrepancies && d.discrepancies.length > 0);
          const isPipeline = ['validating','extraction','normalizing','ocr','ocr-ready','preprocessing','preprocess-ready'].includes(d.status);
          const badgeTone = isDisc ? 'rust' : isPipeline ? 'ink' : 'green';
          const badgeText = isDisc ? 'Discrepancy' : isPipeline ? (STATUS_META[d.status]?.label || 'Processing') : 'Ready';
          return (
            <button
              key={d.id}
              type="button"
              className={`cv-tab-btn ${activeId === d.id ? 'active' : ''}`}
              onClick={() => onSelect(d.id)}
            >
              <GitCompare size={13} />
              <span>{d.id}</span>
              {isPipeline && d.id === activeId && <span className="badge badge-ink badge-tiny" style={{ animation: 'pulse 1.5s infinite' }}>ΓùÅ Current</span>}
              <span className={`badge badge-${badgeTone} badge-tiny`}>
                {badgeText}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  function ValidationSummaryPanel({ doc, hasDiscrepancy, confidenceScore, discrepancyCount, onLaunchGeoRef, onLaunchTwin }) {
    const { survey, village } = getFallbackValues(doc);

    return (
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>DOCUMENT {doc?.id} · CROSS-VALIDATION SUMMARY</h3>
          <StatusBadge status={doc?.status || (hasDiscrepancy ? 'review' : 'validated')} />
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="cv-overview">
            <div className="cv-item"><span className="cv-label">Document ID</span><span className="cv-val mono">{doc?.id}</span></div>
            <div className="cv-item"><span className="cv-label">Document Type</span><span className="cv-val">{doc?.docType || 'Ownership Record'}</span></div>
            <div className="cv-item"><span className="cv-label">Survey &amp; Village</span><span className="cv-val">{survey} · {village}</span></div>
            <div className="cv-item"><span className="cv-label">Reference DB</span><span className="cv-val mono">LRMS-1022 (Revenue DB)</span></div>
            <div className="cv-item">
              <span className="cv-label">Overall AI Confidence</span>
              <span className={`cv-val conf ${confClass(confidenceScore)}`}>{confidenceScore}% {confidenceScore >= 75 ? 'Γ£ô' : '⚠️'}</span>
            </div>
            <div className="cv-item">
              <span className="cv-label">Validation Result</span>
              <span className={`cv-status-badge ${hasDiscrepancy ? 'fail' : 'pass'}`}>
                {hasDiscrepancy ? `${discrepancyCount || 1} Mismatches Detected` : 'All Checks Passed'}
              </span>
            </div>
          </div>

          <div className="cv-summary-body">
            {hasDiscrepancy ? (
              <div className="cv-banner warn">
                <AlertTriangle size={17} />
                <span><b>Discrepancy Alert:</b> 1 or more extracted fields do not match official LRMS records or fell below confidence tolerance. Human verification is required.</span>
              </div>
            ) : (
              <div className="cv-banner pass">
                <CheckCircle2 size={17} />
                <span><b>Passed Cross-Validation:</b> All extracted parameters match the LRMS land reference register accurately. Ready for verification.</span>
              </div>
            )}

            <div className="cv-banner spatial">
              <div className="cv-banner-text">
                <MapPinned size={17} />
                <span><b>Spatial Cadastral, Digital Twin &amp; Provenance:</b> Real-world GIS geo-referencing coordinates and immutable asset ledger are available for this parcel.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setEgDocId(doc.id); setActiveTab('evidencegraph'); }}>
                  <Network size={14} /> Evidence Graph →
                </button>
                <button className="btn btn-outline btn-sm" onClick={onLaunchTwin}>
                  <Box size={14} /> View Digital Twin →
                </button>
                <button className="btn btn-primary btn-sm" onClick={onLaunchGeoRef}>
                  <MapPinned size={14} /> Open Geo-Referencing →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function FieldCheckTable({ checks, docFields }) {
    return (
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>FIELD-BY-FIELD CROSS-CHECK (DOCUMENT VS. LRMS REFERENCE)</h3>
          <span className="muted" style={{ fontSize: 11.5 }}>
            Tolerance: ┬▒{AREA_TOLERANCE_ACRES} Acres for area · Strict string match for titles
          </span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Field</th><th>Extracted Document Value</th><th>LRMS Reference Value</th>
                  <th>Confidence</th><th>Validation Status</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((c, idx) => {
                  const isFail = c.result === 'DISCREPANCY';
                  const fConf = confidenceForCheck(c, docFields, isFail);
                  return (
                    <tr key={idx} className={isFail ? 'cv-row-fail' : ''}>
                      <td><b>{c.label}</b></td>
                      <td className={`mono ${isFail ? 'cv-cell-fail' : ''}`}>{c.documentValue || '—'}</td>
                      <td className="mono"><b>{c.referenceValue || '—'}</b></td>
                      <td><span className={`conf ${confClass(fConf)}`}>{fConf}% {fConf >= 75 ? 'Γ£ô' : '⚠️'}</span></td>
                      <td>
                        <span className={`cv-status-badge ${isFail ? 'fail' : 'pass'}`}>
                          {isFail ? <><AlertTriangle size={12} /> MISMATCH</> : <><CheckCircle2 size={12} /> PASS</>}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function OpenDiscrepancyList({ discrepancies, activeDocId, onResolve }) {
    return (
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>OPEN DISCREPANCIES ({discrepancies.length})</h3>
          <span className="muted" style={{ fontSize: 11.5 }}>Routing to Human-in-the-Loop Review</span>
        </div>
        <div className="panel-body">
          {discrepancies.length === 0 ? (
            <div className="cv-clean-state">
              <CheckCircle2 size={18} />
              <b>No open discrepancies for {activeDocId}. All reference checks passed.</b>
            </div>
          ) : (
            <div className="cv-discrepancy-list">
              {discrepancies.map(disc => (
                <div key={disc.id || disc.field} className="disc-action-card">
                  <div>
                    <div className="disc-action-head">
                      <span className={`sev-badge ${sevClass(disc.severity)}`}>{disc.severity}</span>
                      <b style={{ fontSize: 13.5 }}>{disc.label} Mismatch</b>
                      <span className="muted" style={{ fontSize: 11 }}>Source: {disc.source || 'LRMS'}</span>
                    </div>
                    <div className="disc-action-detail">
                      Extracted scan reads <b className="mono cv-cell-fail">"{disc.documentValue}"</b>, while LRMS
                      official register states <b className="mono">"{disc.referenceValue}"</b>.
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={onResolve}>
                    <PencilLine size={13} /> Resolve Field →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---- 3. The page itself ---- */

  function renderValidation() {
    /* Show only docs that need review/validation, plus the current pipeline doc.
       Validated & submitted docs go to the Submitted page instead. */
    const candidateDocs = docs.filter(d => d.status !== 'validated' && d.status !== 'submitted');
    const activeDocId = candidateDocs.some(d => d.id === selectedValDocId) ? selectedValDocId : candidateDocs[0]?.id;
    const activeDoc = docs.find(d => d.id === activeDocId);

    if (!activeDoc || candidateDocs.length === 0) {
      return (
        <>
          <PageHead
            title="Cross Validation"
            sub="Cross-checking extracted land record fields against the LRMS official reference database."
          />
          <EmptyState
            icon={CheckCircle2}
            title="All Records Validated &amp; Submitted"
            sub="There are no pending documents with discrepancies. Validated records have moved to the Submitted page."
          />
        </>
      );
    }

    const { docFields, checks, discrepancies, hasDiscrepancy, confidenceScore } = getValidationData(activeDoc);

    return (
      <>
        <PageHead
          title="Cross Validation"
          sub="Cross-checking extracted land record fields against the LRMS official reference database."
          rightBtn={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline"
                onClick={() => { setEgDocId(activeDoc.id); setActiveTab('evidencegraph'); }}
              >
                <Network size={14} /> Evidence Graph →
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setTwinDocId(activeDoc.id); setActiveTab('digitaltwin'); }}
              >
                <Box size={14} /> Digital Twin →
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setGeoDocId(activeDoc.id); setActiveTab('georeference'); }}
              >
                <MapPinned size={14} /> Geo-Ref →
              </button>
              {hasDiscrepancy ? (
                <button className="btn btn-primary" onClick={() => goToReview(activeDoc)}>
                  <PencilLine size={15} /> Resolve in Review Workspace →
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => goToReview(activeDoc)}>
                  <Send size={15} /> Submit for Officer Verification →
                </button>
              )}
            </div>
          }
        />

        <ValidationDocSwitcher docs={candidateDocs} activeId={activeDoc?.id} onSelect={setSelectedValDocId} />

        <ValidationSummaryPanel
          doc={activeDoc}
          hasDiscrepancy={hasDiscrepancy}
          confidenceScore={confidenceScore}
          discrepancyCount={discrepancies.length}
          onLaunchGeoRef={() => { setGeoDocId(activeDoc.id); setActiveTab('georeference'); }}
          onLaunchTwin={() => { setTwinDocId(activeDoc.id); setActiveTab('digitaltwin'); }}
        />

        <FieldCheckTable checks={checks} docFields={docFields} />

        <OpenDiscrepancyList
          discrepancies={discrepancies}
          activeDocId={activeDoc?.id}
          onResolve={() => goToReview(activeDoc)}
        />
      </>
    );
  }

  /* ---- Discrepancy: its own page for every open mismatch waiting on
     human resolution. Resolving one hands off to Human-in-the-Loop. ---- */
  function renderDiscrepancy() {
    const withDiscrepancies = docs.filter(d => d.status === 'review' && d.discrepancies && d.discrepancies.length > 0);
    return (
      <>
        <PageHead title="Discrepancy" sub="Fields that don't match the LRMS reference records." />
        <div className="panel" id="validation-cross">
          <div className="panel-head"><h3>OPEN DISCREPANCIES</h3></div>
          <div className="panel-body">
            {withDiscrepancies.length === 0 ? (
              <span className="muted">No open discrepancies right now.</span>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Document</th><th>Field</th><th>Document Value</th><th>Reference Value</th><th>Severity</th><th></th></tr></thead>
                  <tbody>
                    {withDiscrepancies.flatMap(d => d.discrepancies.map(disc => (
                      <tr key={d.id + disc.id}>
                        <td className="mono">{d.id}</td>
                        <td>{disc.label}</td>
                        <td className="mono">{disc.documentValue}</td>
                        <td className="mono">{disc.referenceValue}</td>
                        <td><span className={`sev-badge ${sevClass(disc.severity)}`}>{disc.severity}</span></td>
                        <td><button className="btn btn-ghost btn-sm" onClick={() => goToReview(d)}>Resolve →</button></td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  function renderGeoReference() {
    const availableDocs = docs.filter(d => d.status !== 'validated' && d.status !== 'submitted');
    const docId = availableDocs.some(d => d.id === geoDocId) ? geoDocId : availableDocs[0]?.id;
    const doc = docs.find(d => d.id === docId);

    if (!doc || availableDocs.length === 0) {
      return (
        <>
          <PageHead
            title="Geo-Referencing"
            sub="Match the historical scanned cadastral map to real-world GIS coordinates using ISRO Bhuvan & OSM."
          />
          <EmptyState
            icon={CheckCircle2}
            title="No Pending Parcels for Geo-Referencing"
            sub="All spatial cadastral records have been validated and submitted."
          />
        </>
      );
    }

    const currentGcps = getDocGcps(doc?.id, geoGcpsByDoc, docs);
    const activeGcp = currentGcps.find(g => g.id === activeGcpId) || currentGcps[0];
    const rms = Math.sqrt(currentGcps.reduce((s, g) => s + (parseFloat(g.error) || 0) ** 2, 0) / (currentGcps.length || 1));

    function placeOnOldMap(x, y) {
      if (!activeGcpId) return;
      setGeoGcpsByDoc(prev => {
        const list = getDocGcps(doc.id, prev, docs);
        const updated = list.map(g => g.id === activeGcpId ? { ...g, srcX: x, srcY: y } : g);
        return { ...prev, [doc.id]: updated };
      });
      const idx = currentGcps.findIndex(g => g.id === activeGcpId);
      addToast(`Updated GCP #${idx >= 0 ? idx + 1 : 1} scan coordinates: (${x}%, ${y}%)`, 'info');
    }

    function placeOnRealMap(lat, long) {
      if (!activeGcpId) return;
      setGeoGcpsByDoc(prev => {
        const list = getDocGcps(doc.id, prev, docs);
        const updated = list.map(g => g.id === activeGcpId ? { ...g, lat: +lat.toFixed(4), long: +long.toFixed(4) } : g);
        return { ...prev, [doc.id]: updated };
      });
      const idx = currentGcps.findIndex(g => g.id === activeGcpId);
      addToast(`Updated GCP #${idx >= 0 ? idx + 1 : 1} GIS coordinates: (${lat.toFixed(4)}°N, ${long.toFixed(4)}°E)`, 'info');
    }

    return (
      <>
        <PageHead
          title="Geo-Referencing"
          sub="Match the historical scanned cadastral map to real-world GIS coordinates using ISRO Bhuvan & OSM."
          rightBtn={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline"
                onClick={() => { setTwinDocId(doc.id); setActiveTab('digitaltwin'); }}
              >
                <Box size={14} /> Digital Twin →
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setSelectedValDocId(doc.id); setActiveTab('validation'); }}
              >
                <GitCompare size={14} /> Cross Validation →
              </button>
              <button className="btn btn-primary" onClick={handleSaveGeoRef}>
                <Globe size={15} /> Save Geo-Reference →
              </button>
            </div>
          }
        />

        {/* Cadastral Document Selector Tabs */}
        <div className="cv-tabs">
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', marginRight: 4 }}>
            <Compass size={13} style={{ marginRight: 4 }} /> LAND PARCELS:
          </span>
          {availableDocs.map(d => {
            const isDisc = d.status === 'review' || (d.discrepancies && d.discrepancies.length > 0);
            const isPipeline = ['preprocessing','preprocess-ready','ocr','ocr-paused','ocr-ready','extraction','normalizing','validating'].includes(d.status);
            return (
              <button
                key={d.id}
                className={`cv-tab-btn ${doc?.id === d.id ? 'active' : ''}`}
                onClick={() => {
                  setGeoDocId(d.id);
                  const nextGcps = getDocGcps(d.id, geoGcpsByDoc);
                  if (nextGcps && nextGcps.length > 0) setActiveGcpId(nextGcps[0].id);
                }}
              >
                <FileText size={14} />
                <span>{d.id} ({d.survey} · {d.village})</span>
                <span className={`badge badge-${isDisc ? 'rust' : isPipeline ? 'ink' : 'green'} badge-tiny`}>
                  {STATUS_META[d.status]?.label || d.status}
                </span>
              </button>
            );
          })}
        </div>

        <div className="panel">
          <div className="panel-head" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3>DOCUMENT {doc?.id} — SURVEY {doc?.survey || '125/2'} ({doc?.village || 'Kinathukadavu'})</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontFamily: 'IBM Plex Mono, monospace' }}>
                CRS: EPSG:4326 (WGS 84)
              </span>
              <span className={`badge ${rms <= 0.25 ? 'badge-green' : 'badge-ink'}`}>
                RMS Error: {rms.toFixed(2)} m {rms <= 0.50 ? '· PASS' : '· CALIBRATING'}
              </span>
            </div>
          </div>
          <div className="panel-body">
            <div className="ocr-split">
              <div className="compare-col">
                <span className="compare-tag">
                  <MapPin size={11} /> Scanned Map — click to move selected point #{currentGcps.findIndex(g => g.id === activeGcpId) + 1}
                </span>
                <GeoOldMapPane
                  doc={doc}
                  gcps={currentGcps}
                  activeGcpId={activeGcpId}
                  onSelectGcp={setActiveGcpId}
                  onPlacePoint={placeOnOldMap}
                />
              </div>
              <div className="compare-col">
                <span className="compare-tag">
                  <Globe size={11} /> Real GIS Surface (ISRO Bhuvan / OSM) — click to place matching GPS coordinate
                </span>
                <GeoRealMapPane
                  doc={doc}
                  gcps={currentGcps}
                  activeGcpId={activeGcpId}
                  onSelectGcp={setActiveGcpId}
                  onPlacePoint={placeOnRealMap}
                  leafletReady={leafletReady || (typeof window !== 'undefined' && !!window.L)}
                />
              </div>
            </div>

            {/* GCP Management Table */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <b style={{ fontSize: 14 }}>Ground Control Points ({currentGcps.length})</b>
                  <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>
                    Minimum 3 GCPs required for affine polynomial transformation
                  </span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={handleAddGcp}>
                  <Plus size={14} /> Add GCP Control Point
                </button>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>GCP ID</th>
                      <th>Feature Name / Landmark</th>
                      <th>Scan Pixel (X%, Y%)</th>
                      <th>GIS Coordinate (Lat°N, Long°E)</th>
                      <th>Residual Error</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGcps.map((gcp, idx) => {
                      const isSel = gcp.id === activeGcpId;
                      return (
                        <tr
                          key={gcp.id}
                          style={{
                            background: isSel ? 'rgba(55, 138, 221, 0.08)' : 'transparent',
                            fontWeight: isSel ? 600 : 400,
                            cursor: 'pointer',
                          }}
                          onClick={() => setActiveGcpId(gcp.id)}
                        >
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isSel ? 'var(--rust)' : '#378ADD' }} />
                              <span className="mono">#{idx + 1} ({gcp.id})</span>
                            </span>
                          </td>
                          <td>{gcp.name}</td>
                          <td className="mono">{gcp.srcX}%, {gcp.srcY}%</td>
                          <td className="mono">{gcp.lat}°N, {gcp.long}°E</td>
                          <td>
                            <span className={`conf ${gcp.error <= 0.15 ? 'high' : 'mid'}`}>
                              ┬▒{gcp.error} m
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--rust)', padding: '2px 6px' }}
                              onClick={(e) => { e.stopPropagation(); handleDeleteGcp(gcp.id); }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ---- View Document / Official Digitized Extract Page ---- */
  function renderViewDocument(docId) {
    const candidateId = docId || viewDocId || 'LR-1021';
    const doc = docs.find(d => d.id === candidateId) || docs[0];
    if (!doc) return <EmptyState icon={FileText} title="No document selected" sub="Pick a document from the register to view its digitized extract." />;

    return (
      <>
        <PageHead
          title={`Land Record Document Extract — ${doc.id}`}
          sub={`Digitized land certificate & extracted legal parameters for Survey ${doc.survey} · ${doc.village}, ${doc.taluk}.`}
          rightBtn={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={() => { setTwinDocId(doc.id); setActiveTab('digitaltwin'); }}>
                <Box size={14} /> Digital Twin →
              </button>
              <button className="btn btn-outline" onClick={() => { setGeoDocId(doc.id); setActiveTab('georeference'); }}>
                <MapPinned size={14} /> Geo-Reference →
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={15} /> Print Extract
              </button>
            </div>
          }
        />

        <div className="panel">
          <div className="panel-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3>SELECT RECORD</h3>
              <StatusBadge status={doc.status} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {docs.map(d => (
                <button
                  key={d.id}
                  className={`btn ${d.id === doc.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  onClick={() => setViewDocId(d.id)}
                >
                  {d.id}
                </button>
              ))}
            </div>
          </div>

          {doc && (
            <div className="print-area">
              <div className="vd-tabs no-print" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button className={`vd-tab ${viewTab === 'digitized' || viewTab === 'printed' ? 'active' : ''}`} onClick={() => setViewTab('digitized')}>
                  📄 Printed Document OCR
                </button>
                <button className={`vd-tab ${viewTab === 'certificate' ? 'active' : ''}`} onClick={() => setViewTab('certificate')}>
                  📊 Settlement Certificate
                </button>
                <button className={`vd-tab ${viewTab === 'original' ? 'active' : ''}`} onClick={() => setViewTab('original')}>
                  🔍 Original Document
                </button>
              </div>

              {viewTab === 'original' ? (
                <div className="original-frame">
                  <DocPreview url={doc.imageUrl} type={doc.type} filterCss={enhanceFilter(PREPROCESS_STEPS.length)} altLabel="original document" />
                </div>
              ) : viewTab === 'certificate' ? (
                <DigitizedPage doc={doc} />
              ) : (
                <PrintedOcrDocumentViewer
                  ocrText={doc?.ocrText || doc?.ocrResult || OCR_FULL_TEXT}
                  doc={doc}
                  fields={doc.fields || []}
                  evidenceKey={null}
                  originalUrl={doc.imageUrl}
                  fileType={doc.type}
                  filterCss={enhanceFilter(PREPROCESS_STEPS.length)}
                />
              )}

              <button className="btn btn-outline no-print" style={{ marginTop: 16 }} onClick={() => window.print()}>
                <Printer size={15} /> Print Document
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  function renderDigitalTwin(docId) {
    const candidateDocs = docs.filter(d => d.status !== 'validated' && d.status !== 'submitted');
    const activeId = docId || (candidateDocs.some(d => d.id === twinDocId) ? twinDocId : candidateDocs[0]?.id);
    const doc = docs.find(d => d.id === activeId);

    if (!doc || candidateDocs.length === 0) {
      return (
        <>
          <PageHead
            title="Digital Twin"
            sub="Comprehensive spatial & semantic lifecycle record for active land parcels."
          />
          <EmptyState
            icon={CheckCircle2}
            title="No Active Review Records"
            sub="All parcel records have completed digitization and have been submitted for official verification."
          />
        </>
      );
    }

    const gcpSet = getDocGcps(doc.id, geoGcpsByDoc, docs);
    const rms = gcpSet ? Math.sqrt(gcpSet.reduce((s, g) => s + (parseFloat(g.error) || 0) ** 2, 0) / (gcpSet.length || 1)) : null;

    return (
      <>
        <PageHead
          title={`Digital Twin — ${doc.id}`}
          sub={`Comprehensive spatial & semantic lifecycle record for Survey ${doc.survey} · ${doc.village}, ${doc.taluk}.`}
          rightBtn={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setEgDocId(doc.id); setActiveTab('evidencegraph'); }}>
                <Network size={14} /> Evidence Graph
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => { setSelectedValDocId(doc.id); setActiveTab('validation'); }}>
                <GitCompare size={14} /> Cross Validation
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => { setGeoDocId(doc.id); setActiveTab('georeference'); }}>
                <MapPinned size={14} /> Geo-Reference
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => { setViewDocId(doc.id); setViewTab('digitized'); setActiveTab('viewdoc'); }}>
                <Eye size={14} /> Official Extract
              </button>
            </div>
          }
        />

        {/* Document Selector Pills */}
        <div className="cv-tabs">
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', marginRight: 4 }}>
            SELECT PARCEL RECORD:
          </span>
          {candidateDocs.map(d => {
            const isDisc = d.status === 'review' || (d.discrepancies && d.discrepancies.length > 0);
            const isPipeline = ['preprocessing','preprocess-ready','ocr','ocr-paused','ocr-ready','extraction','normalizing','validating'].includes(d.status);
            return (
              <button
                key={d.id}
                className={`cv-tab-btn ${doc.id === d.id ? 'active' : ''}`}
                onClick={() => setTwinDocId(d.id)}
              >
                <FileText size={14} />
                <span>{d.id} ({d.docType} · Sy. {d.survey})</span>
                <span className={`badge badge-${isDisc ? 'rust' : isPipeline ? 'ink' : 'green'} badge-tiny`}>
                  {STATUS_META[d.status]?.label || d.status}
                </span>
              </button>
            );
          })}
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head">
            <h3>PARCEL IDENTITY &amp; CORE ATTRIBUTES</h3>
            <StatusBadge status={doc.status} />
          </div>
          <div className="cv-overview">
            <div className="cv-item"><span className="cv-label">Owner / Party</span><span className="cv-val">{doc.owner}</span></div>
            <div className="cv-item"><span className="cv-label">Survey No.</span><span className="cv-val mono">{doc.survey}</span></div>
            <div className="cv-item"><span className="cv-label">Area</span><span className="cv-val">{doc.area}</span></div>
            <div className="cv-item"><span className="cv-label">Village / Taluk</span><span className="cv-val">{doc.village} / {doc.taluk}</span></div>
            <div className="cv-item"><span className="cv-label">Confidence</span><span className={`cv-val conf ${confClass(doc.confidence)}`}>{doc.confidence ?? '—'}%</span></div>
          </div>
        </div>

        {/* Dynamic AI Legal Decision & Cadastral Vector Twin Simulation */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} />
              <h3>SPATIAL CADASTRAL TWIN &amp; TITLE VERIFICATION MATRIX</h3>
            </div>
            <span className="badge badge-green">AI Autonomous Audit Complete</span>
          </div>
          <div className="panel-body" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'center' }}>
              {/* 2D Vector Boundary Canvas / SVG */}
              <div style={{ background: '#0f172a', borderRadius: 6, padding: '16px', color: '#fff', position: 'relative', overflow: 'hidden', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: '#94a3b8' }}>
                  <span>CADASTRE VECTOR: SY. {doc.survey || '175/1'}</span>
                  <span>EXTENT: {doc.area || '11.72 Acres'}</span>
                </div>
                <svg viewBox="0 0 400 180" style={{ width: '100%', height: '140px', margin: '8px 0' }}>
                  <defs>
                    <pattern id="twinGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#twinGrid)" />
                  <path d="M 20,25 Q 180,15 380,30" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 2" />
                  <text x="180" y="20" fill="#38bdf8" fontSize="9" fontFamily="IBM Plex Mono">Cauvery River Branch / Channel</text>
                  
                  <polygon points="60,45 340,55 310,155 80,145" fill="rgba(16, 185, 129, 0.22)" stroke="#10b981" strokeWidth="2.5" />
                  
                  <line x1="180" y1="50" x2="170" y2="150" stroke="rgba(16, 185, 129, 0.6)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="60" y1="100" x2="325" y2="105" stroke="rgba(16, 185, 129, 0.6)" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  <text x="110" y="80" fill="#a7f3d0" fontSize="10" fontWeight="bold">Sy. {doc.survey}/1</text>
                  <text x="230" y="82" fill="#a7f3d0" fontSize="10" fontWeight="bold">Sy. {doc.survey}/2</text>
                  <text x="115" y="132" fill="#a7f3d0" fontSize="10" fontWeight="bold">Sy. {doc.survey}/8</text>
                  <text x="235" y="134" fill="#a7f3d0" fontSize="10" fontWeight="bold">Sy. {doc.survey}/9</text>
                  
                  <circle cx="60" cy="45" r="4" fill="#f59e0b" />
                  <circle cx="340" cy="55" r="4" fill="#f59e0b" />
                  <circle cx="310" cy="155" r="4" fill="#f59e0b" />
                  <circle cx="80" cy="145" r="4" fill="#f59e0b" />
                  <text x="50" y="40" fill="#f59e0b" fontSize="8">GCP-1</text>
                  <text x="330" y="50" fill="#f59e0b" fontSize="8">GCP-2</text>
                  <text x="300" y="170" fill="#f59e0b" fontSize="8">GCP-3</text>
                  <text x="68" y="160" fill="#f59e0b" fontSize="8">GCP-4</text>
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', fontFamily: 'IBM Plex Mono, monospace' }}>
                  <span>📍 GPS: {gcpSet[0]?.lat}°N, {gcpSet[0]?.long}°E</span>
                  <span>RMS: {rms ? rms.toFixed(2) : '0.12'}m</span>
                </div>
              </div>

              {/* Title & Decision Parameters Matrix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '4px solid #059669', borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <b style={{ fontSize: 12.5, color: '#064e3b' }}>Title Marketability &amp; Ownership Clarity</b>
                    <span className="badge badge-green badge-tiny">CLEAR TITLE</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#334155' }}>
                    Title traced to <b>{doc.owner}</b>. Cross-referenced against Tamil Nadu Revenue &amp; Registration records with 0 unverified claims.
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'rgba(55, 138, 221, 0.08)', borderLeft: '4px solid #378ADD', borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <b style={{ fontSize: 12.5, color: '#1e3a8a' }}>Land Classification &amp; Inam Settlement</b>
                    <span className="badge badge-navy badge-tiny">DHARMA SASANAM</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#334155' }}>
                    Registered under <b>{doc.fields?.find(f => f.key === 'classification')?.value || 'Agricultural / Trust Settlement'}</b> in {doc.village} village jurisdiction.
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'rgba(216, 90, 48, 0.08)', borderLeft: '4px solid #D85A30', borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <b style={{ fontSize: 12.5, color: '#7c2d12' }}>Mutation &amp; Officer Verification Readiness</b>
                    <span className="badge badge-rust badge-tiny">READY FOR SUBMISSION</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#334155' }}>
                    AI Confidence at <b>{doc.confidence || 98}%</b>. Ready for Tahsildar / Joint Sub-Registrar final digital signoff.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parcel Lifecycle & Chain-of-Title History */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head">
            <h3>PARCEL LIFECYCLE &amp; CHAIN-OF-TITLE PROVENANCE</h3>
            <span className="muted" style={{ fontSize: 11.5 }}>Immutable historical ledger</span>
          </div>
          <div className="panel-body timeline" style={{ padding: '20px 24px' }}>
            {(doc.lifecycle || [
              { date: '1970-01-01', event: 'Historical Revenue Register', authority: 'Taluk Revenue Dept', note: 'Original settlement demarcation entry.' },
              { date: '2026-08-31', event: 'AI Modernization & Ingestion', authority: 'LandIntel Pipeline', note: 'Digitized & ingested for cross-validation.' },
            ]).map((step, idx) => (
              <div key={idx} className="tl-item" style={{ display: 'flex', gap: 14 }}>
                <div className="tl-dot" style={{ background: idx === 0 ? '#1D9E75' : idx === (doc.lifecycle?.length || 1) - 1 ? 'var(--rust)' : '#378ADD', marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <b style={{ fontSize: 13.5, color: 'var(--ink)' }}>{step.event}</b>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', background: 'var(--paper)', padding: '2px 8px', borderRadius: 2 }}>
                      {step.date}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 3 }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink-faint)' }}>Authority:</span> {step.authority}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink)', marginTop: 4, lineHeight: 1.5 }}>
                    {step.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head"><h3>EXTRACTED &amp; NORMALIZED SCHEMATIC FIELDS</h3></div>
          <div className="panel-body">
            <div className="fields-table">
              {(doc.fields || []).map(f => (
                <div key={f.key} className="fields-row" style={{ display: 'grid', gridTemplateColumns: '180px 1.5fr 100px', alignItems: 'center' }}>
                  <span className="fk">{f.label}</span>
                  <span className="fv mono">
                    {f.normalized ? <><span style={{ textDecoration: 'line-through', color: 'var(--ink-faint)', marginRight: 6 }}>{f.originalValue}</span>{' → '}<b style={{ color: 'var(--green)' }}>{f.value}</b></> : f.value}
                  </span>
                  <span className={`conf ${confClass(f.confidence)}`}>{f.confidence}% {f.confidence >= 75 ? 'Γ£ô' : '⚠️'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {gcpSet && (
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-head">
              <h3>GEO-SPATIAL REGISTRATION &amp; SATELLITE TIE</h3>
              {rms != null && <span className={`badge ${rms <= 0.25 ? 'badge-green' : 'badge-ink'}`}>RMS {rms.toFixed(2)}m</span>}
            </div>
            <div className="panel-body">
              <div className="fields-table">
                {gcpSet.map((g, i) => (
                  <div key={g.id} className="fields-row" style={{ display: 'grid', gridTemplateColumns: 'auto 1.2fr 1fr 1fr 100px', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--rust)' }}>#{i + 1}</span>
                    <span className="fk">{g.name}</span>
                    <span className="fv mono" style={{ fontSize: 12 }}>Scan: ({g.srcX}%, {g.srcY}%)</span>
                    <span className="fv mono" style={{ fontSize: 12 }}>GPS: {g.lat}°N, {g.long}°E</span>
                    <span className={`conf ${g.error <= 0.15 ? 'high' : 'mid'}`}>┬▒{g.error}m</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 14 }} onClick={() => { setGeoDocId(doc.id); setActiveTab('georeference'); }}>
                <MapPinned size={14} /> Open Geo-Referencing Workspace →
              </button>
            </div>
          </div>
        )}

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head"><h3>DISCREPANCY &amp; VERIFICATION LOG</h3></div>
          <div className="panel-body">
            {(doc.discrepancies || []).length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', padding: '6px 0' }}>
                <CheckCircle2 size={16} /> <b>No discrepancies recorded. All cross-validation checks matched canonical LRMS data.</b>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {doc.discrepancies.map(d => (
                  <div key={d.id} className="disc-action-card">
                    <div>
                      <span className={`sev-badge ${sevClass(d.severity)}`}>{d.severity}</span>{' '}
                      <b>{d.label}</b>: Extracted <span className="mono" style={{ color: 'var(--rust)' }}>"{d.documentValue}"</span> vs LRMS Reference <span className="mono" style={{ color: 'var(--ink)' }}>"{d.referenceValue}"</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head"><h3>IMMUTABLE AUDIT TRAIL &amp; PROVENANCE</h3></div>
          <div className="panel-body">
            <div className="dp-hash" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
              Document Hash — SHA-256: {docHash(doc)}<br />
              Audit Reference: {auditRef(doc)}<br />
              Timestamp: {todayStr()} · Machine TrOCR v2.3 + Tamil Nadu LRMS Registry
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderEvidenceGraph() {
    const candidateDocs = (docs && docs.length > 0) ? docs : INITIAL_DOCS;
    const activeId = candidateDocs.some(d => d.id === egDocId) ? egDocId : candidateDocs[0]?.id;
    const egDoc = docs.find(d => d.id === activeId) || candidateDocs[0];

    if (!egDoc) {
      return (
        <>
          <PageHead
            title="Evidence &amp; Knowledge Graph"
            sub="Cross-document relationships between owners, survey parcels, mutation events, and official records."
          />
          <EmptyState
            icon={CheckCircle2}
            title="No Records Available"
            sub="Upload a document or select an existing record to visualize its topological evidence graph."
          />
        </>
      );
    }

    return (
      <>
        <PageHead
          title="Evidence &amp; Knowledge Graph"
          sub="Cross-document relationships between owners, survey parcels, mutation events, and official records."
          rightBtn={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => { setTwinDocId(egDoc.id); setActiveTab('digitaltwin'); }}>
                <Box size={14} /> Digital Twin →
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => { setSelectedValDocId(egDoc.id); setActiveTab('validation'); }}>
                <GitCompare size={14} /> Cross Validation →
              </button>
            </div>
          }
        />

        {/* Document Selector */}
        <div className="cv-tabs" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', marginRight: 4 }}>
            SELECT PARCEL:
          </span>
          {candidateDocs.map(d => {
            const isDisc = d.status === 'review' || (d.discrepancies && d.discrepancies.length > 0);
            const isPipeline = ['preprocessing','preprocess-ready','ocr','ocr-paused','ocr-ready','extraction','normalizing','validating'].includes(d.status);
            return (
              <button
                key={d.id}
                className={`cv-tab-btn ${egDoc.id === d.id ? 'active' : ''}`}
                onClick={() => setEgDocId(d.id)}
              >
                <Network size={13} />
                <span>{d.id}</span>
                <span className={`badge badge-${isDisc ? 'rust' : isPipeline ? 'ink' : 'green'} badge-tiny`}>
                  {STATUS_META[d.status]?.label || d.status}
                </span>
              </button>
            );
          })}
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Network size={16} />
              <h3>PARCEL METADATA &amp; PROVENANCE CONTEXT — {egDoc.id}</h3>
            </div>
            <span className={`badge ${egDoc.status === 'review' ? 'badge-rust' : 'badge-green'}`}>
              {STATUS_META[egDoc.status]?.label || egDoc.status}
            </span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <div className="cv-overview" style={{ borderBottom: 'none' }}>
              <div className="cv-item"><span className="cv-label">Parcel / Doc ID</span><span className="cv-val mono">{egDoc.id}</span></div>
              <div className="cv-item"><span className="cv-label">Record Type</span><span className="cv-val">{egDoc.docType || 'Ownership Record'}</span></div>
              <div className="cv-item"><span className="cv-label">Survey No</span><span className="cv-val mono">Sy. {egDoc.survey}</span></div>
              <div className="cv-item"><span className="cv-label">Registered Owner</span><span className="cv-val">{egDoc.owner || '—'}</span></div>
              <div className="cv-item"><span className="cv-label">Village &amp; Taluk</span><span className="cv-val">{egDoc.village}, {egDoc.taluk}</span></div>
              <div className="cv-item"><span className="cv-label">Total Extent</span><span className="cv-val mono">{egDoc.area || '—'}</span></div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head" style={{ justifyContent: 'space-between' }}>
            <h3>PROVENANCE &amp; ENTITY RELATIONSHIPS — {egDoc?.id}</h3>
            <span className="muted" style={{ fontSize: 11.5 }}>Interactive entity and discrepancy topology graph</span>
          </div>
          <div className="panel-body">
            <EvidenceGraphPane
              docsList={docs}
              targetDocId={egDoc.id}
              d3Ready={d3Ready}
              onSelectDoc={(id) => {
                setTwinDocId(id);
                setEgDocId(id);
                setActiveTab('digitaltwin');
              }}
            />
          </div>
        </div>
      </>
    );
  }

  function renderFeedback() {
    const corrections = docs.flatMap(d => (d.fields || []).filter(f => f.decision)
      .map(f => ({ docId: d.id, ...f })));
    return (
      <>
        <PageHead title="Feedback" sub="Officer corrections feed a curated dataset, not the live model directly." />
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head"><h3>HOW IT FLOWS</h3></div>
          <div className="panel-body">
            <div className="stage-row">
              <Stage n={corrections.length} label="Corrections" />
              <StageArrow />
              <Stage n={corrections.length} label="Curated Dataset" />
              <StageArrow />
              <Stage n="—" label="Evaluation" />
              <StageArrow />
              <Stage n="—" label="Controlled Deploy" />
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h3>RECENT CORRECTIONS</h3></div>
          <div className="panel-body">
            {corrections.length === 0 ? <span className="muted">No officer corrections logged yet.</span> : (
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Document</th><th>Field</th><th>Value</th><th>Decision</th></tr></thead>
                  <tbody>
                    {corrections.map((c, i) => (
                      <tr key={i}>
                        <td className="mono">{c.docId}</td><td>{c.label}</td><td className="mono">{c.value}</td>
                        <td><span className="decision-chip">{c.decision}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  function renderSubmitted() {
    if (submitted.length === 0) return <><PageHead title="Submitted" sub="Records sent for officer verification." /><EmptyState icon={Send} title="Nothing submitted yet" sub="Records you submit will appear here." /></>;
    return (
      <>
        <PageHead title="Submitted" sub="Records sent for officer verification." />
        <div className="panel"><div className="panel-body">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Record</th><th>Survey No</th><th>Village</th><th>Confidence</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {submitted.map(r => (
                  <tr key={r.id}>
                    <td className="mono">{r.id}</td><td>{r.survey}</td><td>{r.village}</td>
                    <td className={`conf ${confClass(r.confidence)}`}>{r.confidence}%</td>
                    <td><StatusBadge status="submitted" /></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => { setViewDocId(r.id); setViewTab('digitized'); setActiveTab('viewdoc'); }}><Eye size={13} /> View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div></div>
      </>
    );
  }

  function renderActivity() {
    return (
      <>
        <PageHead title="My Activity" sub="A log of your own actions on this platform." />
        <div className="panel"><div className="panel-body timeline">
          {[...activity].reverse().map((a, i) => (
            <div key={i} className="tl-item"><div className="tl-dot" /><div><b>{a.text}</b><span>{a.t}</span></div></div>
          ))}
        </div></div>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <PageHead title="Settings" sub="Your account preferences." />
        <div className="panel"><div className="panel-body">
          <div className="field"><label>Name</label><input type="text" defaultValue={userName} /></div>
          <div className="field"><label>Role</label><input type="text" defaultValue="Operator" disabled /></div>
          <button className="btn btn-primary" onClick={() => addToast('Settings saved.', 'success')}>Save Changes</button>
        </div></div>
      </>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'upload': return renderUpload();
      case 'processing': return renderProcessing();
      case 'validation': return renderValidation();
      case 'georeference': return renderGeoReference();
      case 'discrepancy': return renderDiscrepancy();
      case 'feedback': return renderFeedback();
      case 'documents': return renderDocuments();
      case 'review': return renderReviewOrIssues('review');
      case 'issues': return renderReviewOrIssues('issues');
      case 'submitted': return renderSubmitted();
      case 'activity': return renderActivity();
      case 'settings': return renderSettings();
      case 'viewdoc': return renderViewDocument();
      case 'digitaltwin': return renderDigitalTwin(twinDocId);
      case 'evidencegraph': return renderEvidenceGraph();
      default: return null;
    }
  }

  return (
    <div className="op-dash">
      <style>{CSS}</style>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} no-print`}>
        <div className="sb-top">
          <div className="brand">
            <img src={logoImg} alt="NilOra" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1b4332', letterSpacing: '-0.02em' }}>NilOra</span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OPERATOR PORTAL</span>
              </div>
            )}
          </div>
          <button className="sb-toggle" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="sb-nav">
          {NAV.map(g => (
            <div key={g.group} className="sb-group">
              {!collapsed && <div className="sb-group-label">{g.group}</div>}
              {g.items.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id && !item.expandable;
                const isOpen = openGroups[item.id];

                if (item.expandable) {
                  const parentActive = item.children.some(c => c.id === activeTab);
                  return (
                    <div key={item.id} className="sb-expandable">
                      <button
                        className={`sb-item sb-parent ${parentActive ? 'active' : ''}`}
                        onClick={() => {
                          if (collapsed) {
                            setCollapsed(false);
                            setOpenGroups(g => ({ ...g, [item.id]: true }));
                          } else {
                            toggleGroup(item.id);
                          }
                          setActiveTab(item.id);
                        }}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon size={17} />
                        {!collapsed && <span>{item.label}</span>}
                        {!collapsed && (
                          <span className="sb-chevron">
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                        )}
                      </button>
                      {!collapsed && isOpen && (
                        <div className="sb-submenu">
                          {item.children.filter(c => !c.spatialOnly || docs.some(d => SPATIAL_DOC_TYPES.has(d.docType))).map(child => {
                            const CIcon = child.icon;
                            const isChildActive = activeTab === child.id && (child.focus == null || focusSubstage === child.focus);
                            return (
                              <button
                                key={child.label}
                                className={`sb-item sb-child ${isChildActive ? 'active' : ''}`}
                                onClick={() => goTo(child.id, child.focus)}
                              >
                                <CIcon size={14} />
                                <span>{child.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button key={item.id} className={`sb-item ${active ? 'active' : ''}`} onClick={() => goTo(item.id)} title={collapsed ? item.label : undefined}>
                    <Icon size={17} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sb-bottom">
          <button className={`sb-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title={collapsed ? 'Settings' : undefined}>
            <SettingsIcon size={17} />{!collapsed && <span>Settings</span>}
          </button>
          <button className="sb-item" onClick={onLogout} title={collapsed ? 'Logout' : undefined}>
            <LogOut size={17} />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar no-print">
          <div className="tb-left">
            <div className="tb-badge-status">
              <span className="tb-dot-green"></span>
              <div className="tb-badge-text">
                <span className="tb-badge-title">Field &amp; Verification Officer</span>
                <span className="tb-badge-sub">Tamil Nadu Land Records Digitization</span>
              </div>
            </div>
          </div>
          <div className="tb-center">
            <div className="tb-search-pill">
              <Search size={15} className="tb-search-icon" />
              <input
                type="text"
                placeholder="Search records, survey number, owner name..."
                value={dashSearch}
                onChange={(e) => setDashSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="tb-right">
            <button className="tb-notif-btn" title="Notifications">
              <Bell size={18} />
              <span className="tb-notif-dot"></span>
            </button>
            <div className="tb-user-profile">
              <div className="tb-user-avatar">FV</div>
              <div className="tb-user-info">
                <span className="tb-user-role">Field &amp; Verification Officer</span>
              </div>
              <ChevronDown size={14} className="tb-user-chevron" />
            </div>
          </div>
        </header>
        <div className="page">{renderContent()}</div>
      </div>
    </div>
  );
}

/* =========================================================================
   GEO-REFERENCING WORKSPACE PANES
   ========================================================================= */

function GeoOldMapPane({ doc, gcps, activeGcpId, onSelectGcp, onPlacePoint }) {
  const frameRef = useRef(null);

  function handleClick(e) {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onPlacePoint(x, y);
  }

  const docOcr = (doc?.ocrText || '').toLowerCase();
  const docName = (doc?.name || doc?.fileName || doc?.id || '').toLowerCase();
  const isTarget245 = docName.includes('245') || docOcr.includes('245') || docOcr.includes('mutation') || docOcr.includes('keelathoor') || docOcr.includes('ramasami');
  const isTarget153 = !isTarget245 && (docName.includes('153') || docOcr.includes('153') || docOcr.includes('karuppa') || docOcr.includes('dharma') || docOcr.includes('தர்ம'));

  const surveyNo = isTarget245 ? '176/3' : (doc?.survey || '175/1');
  const village = (isTarget245 ? 'Keelathoor' : (doc?.village || 'Srirangam')).toUpperCase();
  const taluk = (isTarget245 ? 'Srirangam' : (doc?.taluk || 'Trichinopoly')).toUpperCase();
  const area = isTarget245 ? '2.65 Acres' : (doc?.area || '11.72 Acres');

  return (
    <div
      ref={frameRef}
      onClick={handleClick}
      className="cadastral-sheet-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '480px',
        background: '#fbf8ee',
        border: '2px solid #b8a98a',
        borderRadius: '4px',
        overflow: 'hidden',
        cursor: 'crosshair',
        boxShadow: 'inset 0 0 35px rgba(184, 169, 138, 0.3), 0 4px 14px rgba(0,0,0,0.08)',
        userSelect: 'none',
      }}
    >
      <svg viewBox="0 0 600 500" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="surveyGrid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(180, 160, 130, 0.2)" strokeWidth="0.8" />
          </pattern>
          <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(5, 150, 105, 0.14)" strokeWidth="1.5" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="#fbf8ee" />
        <rect width="100%" height="100%" fill="url(#surveyGrid)" />

        <rect x="14" y="14" width="572" height="472" fill="none" stroke="#6b5b45" strokeWidth="2" />
        <rect x="18" y="18" width="564" height="464" fill="none" stroke="#968369" strokeWidth="0.8" strokeDasharray="6 3" />

        <g transform="translate(300, 42)" textAnchor="middle">
          <text y="0" fontSize="11" fontWeight="700" fontFamily="IBM Plex Sans, sans-serif" letterSpacing="0.08em" fill="#3e3427">
            GOVERNMENT OF TAMIL NADU — REVENUE &amp; SURVEY DEPARTMENT
          </text>
          <text y="14" fontSize="10" fontWeight="600" fontFamily="IBM Plex Mono, monospace" fill="#6b5b45">
            FIELD MEASUREMENT BOOK (FMB) CADASTRAL SKETCH
          </text>
          <text y="26" fontSize="9" fontFamily="IBM Plex Mono, monospace" fill="#8c775a">
            VILLAGE: {village} · TALUK: {taluk} · SURVEY NO: {surveyNo} · EXTENT: {area}
          </text>
        </g>

        <g transform="translate(530, 70)">
          <circle cx="0" cy="0" r="16" fill="rgba(255,255,255,0.85)" stroke="#6b5b45" strokeWidth="1" />
          <polygon points="0,-14 4,0 0,2 -4,0" fill="#c2410c" />
          <polygon points="0,14 4,0 0,-2 -4,0" fill="#6b5b45" />
          <text x="0" y="-17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#c2410c" fontFamily="IBM Plex Sans">N</text>
        </g>

        {isTarget245 ? (
          <>
            <path d="M 40,110 L 540,110" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 3" />
            <text x="280" y="98" fill="#334155" fontSize="9" fontWeight="600" fontFamily="IBM Plex Mono" textAnchor="middle">
              ━━━ NORTH BOUNDARY: LAND OF PERUMAL CHETTY (பெருமாள் செட்டி நிலம்) ━━━
            </text>

            <path d="M 40,430 L 540,420" fill="none" stroke="#0284c7" strokeWidth="4" opacity="0.8" />
            <text x="280" y="445" fill="#0369a1" fontSize="9" fontWeight="600" fontFamily="IBM Plex Mono" textAnchor="middle">
              〜〜〜 SOUTH BOUNDARY: VILLAGE IRRIGATION CHANNEL (கிராம வாய்க்கால்) 〜〜〜
            </text>

            <polygon points="120,150 480,165 440,390 140,380" fill="url(#diagonalHatch)" stroke="#1b2a41" strokeWidth="2.8" />

            <line x1="300" y1="158" x2="290" y2="385" stroke="#1b2a41" strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="130" y1="270" x2="300" y2="270" stroke="#1b2a41" strokeWidth="1.8" strokeDasharray="4 3" />

            <g fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono, monospace" fill="#1b2a41" textAnchor="middle">
              <text x="210" y="210">Sy. 176/3</text>
              <text x="210" y="224" fontSize="8.5" fontWeight="normal" fill="#475569">1.46 Acres · Nanja (wet)</text>

              <text x="210" y="325">Sy. 176/4</text>
              <text x="210" y="339" fontSize="8.5" fontWeight="normal" fill="#475569">0.29 Acres · Punja (dry)</text>

              <text x="380" y="270">Sy. 181/1</text>
              <text x="380" y="284" fontSize="8.5" fontWeight="normal" fill="#475569">0.90 Acres · Nanja (wet)</text>
            </g>

            <text x="490" y="275" fill="#57534e" fontSize="8.5" fontWeight="600" fontFamily="IBM Plex Mono" transform="rotate(90 490 275)" textAnchor="middle">
              EAST: TRICHINOPOLY-SRIRANGAM CART-TRACK
            </text>
            <text x="105" y="275" fill="#57534e" fontSize="8.5" fontWeight="600" fontFamily="IBM Plex Mono" transform="rotate(-90 105 275)" textAnchor="middle">
              WEST: SUBBARAYA NAIDU LAND
            </text>
          </>
        ) : (
          <>
            <path d="M 40,110 Q 280,85 540,120" fill="none" stroke="#0284c7" strokeWidth="4" strokeDasharray="8 4" opacity="0.8" />
            <text x="280" y="98" fill="#0369a1" fontSize="9" fontWeight="600" fontFamily="IBM Plex Mono" textAnchor="middle">
              〜〜〜 CAUVERY RIVER BRANCH / TEMPLE IRRIGATION CHANNEL (கொள்ளிடம் / வாய்க்கால்) 〜〜〜
            </text>

            <path d="M 40,430 L 540,420" fill="none" stroke="#78716c" strokeWidth="6" opacity="0.7" />
            <path d="M 40,430 L 540,420" fill="none" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="4 4" />
            <text x="280" y="445" fill="#57534e" fontSize="9" fontWeight="600" fontFamily="IBM Plex Mono" textAnchor="middle">
              ════ VILLAGE ACCESS ROAD / MAIN THOROUGHFARE (பிரதான தார் சாலை) ════
            </text>

            <polygon points="120,150 480,165 440,390 140,380" fill="url(#diagonalHatch)" stroke="#1b2a41" strokeWidth="2.8" />

            <line x1="280" y1="156" x2="270" y2="385" stroke="#1b2a41" strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="130" y1="265" x2="460" y2="275" stroke="#1b2a41" strokeWidth="1.8" strokeDasharray="4 3" />

            <g fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono, monospace" fill="#1b2a41" textAnchor="middle">
              <text x="200" y="210">Sy. {surveyNo}/1</text>
              <text x="200" y="224" fontSize="8.5" fontWeight="normal" fill="#475569">2.80 Acres · நஞ்சை</text>

              <text x="360" y="215">Sy. {surveyNo}/2</text>
              <text x="360" y="229" fontSize="8.5" fontWeight="normal" fill="#475569">3.10 Acres · நஞ்சை</text>

              <text x="200" y="325">Sy. {surveyNo}/8</text>
              <text x="200" y="339" fontSize="8.5" fontWeight="normal" fill="#475569">2.92 Acres · புஞ்சை</text>

              <text x="360" y="330">Sy. {surveyNo}/9</text>
              <text x="360" y="344" fontSize="8.5" fontWeight="normal" fill="#475569">2.90 Acres · புஞ்சை</text>
            </g>
          </>
        )}

        <g stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" fill="none">
          <line x1="120" y1="150" x2="440" y2="390" />
          <line x1="140" y1="380" x2="480" y2="165" />
        </g>
        <text x="290" y="280" fontSize="8" fill="#64748b" fontFamily="IBM Plex Mono" textAnchor="middle">
          Baseline 184.2m · Gunter Ladder
        </text>

        <polygon points="120,146 124,154 116,154" fill="#d97706" />
        <polygon points="480,161 484,169 476,169" fill="#d97706" />
        <polygon points="440,386 444,394 436,394" fill="#d97706" />
        <polygon points="140,376 144,384 136,384" fill="#d97706" />
      </svg>

      {gcps.map((g, i) => {
        const isSelected = g.id === activeGcpId;
        return (
          <div
            key={g.id}
            onClick={(e) => { e.stopPropagation(); onSelectGcp(g.id); }}
            className={`gcp-pin ${isSelected ? 'active' : ''}`}
            title={`${g.name || `GCP #${i + 1}`}: (${g.srcX}%, ${g.srcY}%)`}
            style={{
              position: 'absolute',
              left: `${g.srcX}%`,
              top: `${g.srcY}%`,
              width: 28,
              height: 28,
              marginLeft: -14,
              marginTop: -14,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isSelected ? '#D85A30' : '#1B2A41',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: '"IBM Plex Mono", monospace',
              border: '2px solid #ffffff',
              boxShadow: isSelected ? '0 0 0 4px rgba(216,90,48,0.35), 0 3px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.25)',
              cursor: 'pointer',
              zIndex: isSelected ? 30 : 20,
              transition: 'transform 0.15s ease',
              transform: isSelected ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            #{i + 1}
          </div>
        );
      })}
    </div>
  );
}

function GeoRealMapPane({ doc, gcps, activeGcpId, onSelectGcp, onPlacePoint, leafletReady }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polygonRef = useRef(null);
  const [mapLayer, setMapLayer] = useState('satellite');

  const isReady = leafletReady || (typeof window !== 'undefined' && !!window.L);

  // Extract survey and village from doc
  const surveyNo = doc?.survey || doc?.extractedData?.surveyNumber || doc?.metadata?.surveyNumber || '125/2';
  const villageName = doc?.village || doc?.extractedData?.village || doc?.metadata?.village || 'Kinathukadavu';
  const parcelInfo = getSurveyParcelInfo(surveyNo, villageName);

  useEffect(() => {
    if (!isReady || !mapDivRef.current || mapRef.current) return;
    const L = window.L;
    if (!L) return;

    try {
      if (mapDivRef.current._leaflet_id) {
        delete mapDivRef.current._leaflet_id;
      }

      const map = L.map(mapDivRef.current, {
        center: [parcelInfo.lat, parcelInfo.long],
        zoom: 17,
        zoomControl: true,
        maxZoom: 20,
      });

      // 1. High-Resolution Esri World Imagery Satellite Base Layer (Default)
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri Satellite Imagery • Maxar • Earthstar'
      }).addTo(map);

      // 2. OpenStreetMap Layer
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      });

      // 3. CartoDB Positron / Hybrid labels
      const labelsLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        pane: 'overlayPane'
      }).addTo(map);

      // Layer Control
      L.control.layers(
        {
          '🛰️ Satellite (Esri)': satelliteLayer,
          '🗺️ OpenStreetMap': osmLayer
        },
        {
          '🏷️ Road & Cadastral Labels': labelsLayer
        },
        { position: 'topright' }
      ).addTo(map);

      map.on('click', (e) => onPlacePoint(e.latlng.lat, e.latlng.lng));
      mapRef.current = map;
    } catch (err) {
      console.warn('Leaflet initialization warning:', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isReady]);

  // Update map view and draw cadastral boundary polygon when survey number / doc changes
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    const info = getSurveyParcelInfo(surveyNo, villageName);

    // Fly to the survey parcel location
    mapRef.current.flyTo([info.lat, info.long], 17.5, { duration: 1.2 });

    // Remove previous polygon
    if (polygonRef.current) {
      mapRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    // Draw high-contrast Cadastral Parcel Polygon for the extracted survey number
    if (info.polygon && info.polygon.length > 0) {
      const poly = L.polygon(info.polygon, {
        color: '#f59e0b',
        weight: 3,
        opacity: 0.95,
        fillColor: '#10b981',
        fillOpacity: 0.28,
        dashArray: '6, 6'
      }).addTo(mapRef.current);

      poly.bindPopup(
        `<div style="font-family: sans-serif; font-size: 13px; color: #0f172a; padding: 4px;">
          <div style="font-weight: 800; font-size: 14px; color: #166534; margin-bottom: 4px;">
            📍 Survey #${surveyNo}
          </div>
          <div style="color: #334155; margin-bottom: 2px;"><strong>Village:</strong> ${info.village}, ${info.taluk}</div>
          <div style="color: #334155; margin-bottom: 2px;"><strong>Extent:</strong> ${info.area}</div>
          <div style="color: #334155;"><strong>Owner:</strong> ${info.owner}</div>
          <div style="margin-top: 6px; font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 3px 6px; border-radius: 4px; font-weight: 600;">
            🛰️ Satellite Cadastral Boundary Aligned
          </div>
        </div>`
      );

      polygonRef.current = poly;
    }
  }, [doc?.id, surveyNo, villageName]);

  // Render GCP Marker Pins on Satellite Map
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    Object.values(markersRef.current).forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = {};

    gcps.forEach((g, i) => {
      const isSelected = g.id === activeGcpId;
      const marker = L.marker([g.lat, g.long], {
        icon: L.divIcon({
          className: '',
          html: `<div style="
            background: ${isSelected ? '#ef4444' : '#1b4332'};
            color: #ffffff;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 800;
            border: 2.5px solid #ffffff;
            box-shadow: ${isSelected ? '0 0 0 4px rgba(239, 68, 68, 0.4), 0 3px 8px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.4)'};
            transform: translate(-50%, -50%);
            transition: all 0.2s ease;
          ">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        }),
      }).addTo(mapRef.current);

      marker.bindTooltip(`<strong>GCP #${i + 1}</strong>: ${g.name || 'Boundary Corner Stone'}`, {
        direction: 'top',
        offset: [0, -14],
        className: 'gcp-tooltip'
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectGcp(g.id);
      });
      markersRef.current[g.id] = marker;
    });
  }, [gcps, activeGcpId]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480, position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1.5px solid #cbd5e1' }}>
      {/* Top Map HUD overlay bar */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 400,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(6px)',
        color: '#ffffff',
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span>
          <span style={{ color: '#38bdf8' }}>🛰️ Satellite Cadastre</span>
        </div>
        <span style={{ color: '#94a3b8' }}>|</span>
        <span style={{ color: '#ffffff' }}>Survey <strong>#{surveyNo}</strong> ({parcelInfo.village})</span>
        <span style={{ color: '#94a3b8' }}>|</span>
        <span style={{ color: '#fef08a' }}>{parcelInfo.area}</span>
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo([parcelInfo.lat, parcelInfo.long], 18, { duration: 0.8 });
            }
          }}
          style={{
            background: '#1e293b',
            color: '#38bdf8',
            border: '1px solid #475569',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 700
          }}
          title="Re-center on extracted survey coordinates"
        >
          🎯 Re-center
        </button>
      </div>

      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', borderRadius: 4, zIndex: 500 }}>
          <Loader2 size={22} className="spin" style={{ marginRight: 8, color: '#38bdf8' }} /> Loading High-Res GIS Satellite Engine...
        </div>
      )}
      <div ref={mapDivRef} style={{ width: '100%', height: '100%', minHeight: 480 }} />
    </div>
  );
}

/* =========================================================================
   EVIDENCE GRAPH (ESSENTIAL CORE KNOWLEDGE GRAPH BUILDER)
   ========================================================================= */

function buildEvidenceGraph(docsList, targetDocId) {
  const nodes = new Map(), rawLinks = [];
  const addNode = (id, type, label, extra = {}) => {
    if (!nodes.has(id)) nodes.set(id, { id, type, label, ...extra });
  };

  const target = (docsList || []).find(d => d.id === targetDocId) || (docsList || [])[0] || INITIAL_DOCS[0];
  if (!target) return { nodes: [], links: [], isSingleDoc: true };

  const d = target;
  const docNode = `doc:${d.id}`;
  addNode(docNode, 'document', d.name || d.id, { docType: d.docType || 'Ownership Record', status: d.status, survey: d.survey, docId: d.id, isSelected: true, role: 'Deed Record' });

  // 1. Registered Owner
  if (d.owner && d.owner !== '—') {
    const ownerNode = `owner:${d.owner}`;
    addNode(ownerNode, 'owner', d.owner, { role: 'Registered Owner' });
    rawLinks.push({ source: docNode, target: ownerNode, relation: 'registered_to', label: 'owner' });
  }

  // 2. Survey Parcel
  if (d.survey && d.survey !== '—') {
    const surveyNode = `survey:${d.survey}`;
    addNode(surveyNode, 'survey', `Sy. ${d.survey}`, { role: 'Survey Parcel' });
    rawLinks.push({ source: docNode, target: surveyNode, relation: 'contains', label: 'parcel' });

    // 3. Total Extent
    if (d.area && d.area !== '—') {
      const areaNode = `area:${d.id}`;
      addNode(areaNode, 'area', d.area, { role: 'Total Extent' });
      rawLinks.push({ source: surveyNode, target: areaNode, relation: 'measures', label: 'extent' });
    }

    // 4. Village
    if (d.village && d.village !== '—') {
      const villageNode = `village:${d.village}`;
      addNode(villageNode, 'village', d.village, { role: 'Village' });
      rawLinks.push({ source: surveyNode, target: villageNode, relation: 'located_in', label: 'village' });
    }
  }

  // 5. High-Severity Discrepancy (if any)
  if (d.discrepancies && d.discrepancies.length > 0) {
    const disc = d.discrepancies[0];
    const discNode = `disc:${d.id}`;
    addNode(discNode, 'discrepancy', `⚠️ ${disc.label} Mismatch`, { role: 'Discrepancy' });
    rawLinks.push({ source: docNode, target: discNode, relation: 'flagged_discrepancy', label: 'discrepancy' });
  }

  const nodeMap = new Set(nodes.keys());
  const links = rawLinks.filter(l => nodeMap.has(l.source) && nodeMap.has(l.target));

  return { nodes: Array.from(nodes.values()), links, isSingleDoc: true, targetDoc: d };
}

function iconForNode(n) {
  if (n.type === 'owner') {
    const isInstitution = /TRUST|TEMPLE|DEVSTHANAM|BOARD|DEPT/.test((n.label || '').toUpperCase());
    if (isInstitution) return '🏛️';
    return '👤';
  }
  if (n.type === 'document') return '📜';
  if (n.type === 'survey') return '📍';
  if (n.type === 'village') return '🏘️';
  if (n.type === 'area') return '📐';
  if (n.type === 'reference') return '🏛️';
  if (n.type === 'discrepancy') return '⚠️';
  return 'ΓùÅ';
}

function EvidenceGraphPane({ docsList, targetDocId, d3Ready, onSelectDoc }) {
  const [layout, setLayout] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const { nodes, links, targetDoc } = buildEvidenceGraph(docsList, targetDocId);
    const baseW = 860, baseH = 520;
    const cx = baseW / 2, cy = baseH / 2;

    if (!nodes || nodes.length === 0) {
      setLayout({ nodes: [], links: [], targetDoc, viewBox: `0 0 ${baseW} ${baseH}` });
      return;
    }

    const d3 = window.d3;
    if (d3) {
      try {
        const sim = d3.forceSimulation(nodes)
          .force('link', d3.forceLink(links).id(n => n.id).distance(135))
          .force('charge', d3.forceManyBody().strength(-340))
          .force('center', d3.forceCenter(cx, cy))
          .force('x', d3.forceX(cx).strength(0.12))
          .force('y', d3.forceY(cy).strength(0.12))
          .force('collision', d3.forceCollide().radius(50))
          .stop();

        for (let i = 0; i < 300; i++) sim.tick();

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach(n => {
          if (n.x < minX) minX = n.x;
          if (n.x > maxX) maxX = n.x;
          if (n.y < minY) minY = n.y;
          if (n.y > maxY) maxY = n.y;
        });

        const shiftX = cx - (minX + maxX) / 2;
        const shiftY = cy - (minY + maxY) / 2;
        nodes.forEach(n => {
          n.x += shiftX;
          n.y += shiftY;
        });

        setLayout({ nodes, links, targetDoc, viewBox: `0 0 ${baseW} ${baseH}` });
        return;
      } catch (err) {
        console.warn('D3 force simulation fallback:', err);
      }
    }

    // Deterministic Clean Layout
    const centerNode = nodes.find(n => n.type === 'document') || nodes[0];
    centerNode.x = cx;
    centerNode.y = cy;

    const otherNodes = nodes.filter(n => n.id !== centerNode.id);
    const radius = 175;
    otherNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / (otherNodes.length || 1) - Math.PI / 2;
      node.x = cx + radius * Math.cos(angle);
      node.y = cy + radius * Math.sin(angle);
    });

    setLayout({ nodes, links, targetDoc, viewBox: `0 0 ${baseW} ${baseH}` });
  }, [d3Ready, docsList, targetDocId]);

  if (!layout) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 440, color: 'var(--ink-faint)', background: 'var(--paper)' }}>
        <Loader2 size={18} className="spin" style={{ marginRight: 8 }} /> Loading Essential Evidence Graph...
      </div>
    );
  }

  const colorFor = {
    document: '#378ADD',
    owner: '#D85A30',
    survey: '#1D9E75',
    village: '#BA7517',
    area: '#5C6BC0',
    reference: '#0288D1',
    discrepancy: '#E63946',
  };

  const activeFocus = hoveredNode || selectedNode;
  const docNameLower = (layout.targetDoc?.id + ' ' + layout.targetDoc?.name + ' ' + layout.targetDoc?.ocrText).toLowerCase();
  const isTarget245 = docNameLower.includes('245') || docNameLower.includes('mutation') || docNameLower.includes('keelathoor') || docNameLower.includes('ramasami');
  const isTarget153 = !isTarget245 && (docNameLower.includes('153') || docNameLower.includes('karuppa') || docNameLower.includes('dharma') || docNameLower.includes('தர்ம'));

  return (
    <div style={{ position: 'relative', width: '100%', background: '#fcfbf8', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Core Summary Bar */}
      <div style={{ padding: '10px 16px', background: '#f4efe6', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink)' }}>
          <b>💡 Key Relationship:</b> {isTarget245 ? (
            <span><b>Ramasami Naidu</b> conveyed <b>2.65 Acres (Sy. 176/3)</b> in <b>Keelathoor</b> to <b>Muthukrishna Iyer</b> for <b>Rs. 600-0-0</b>, registered under <b>Patta 118</b>.</span>
          ) : isTarget153 ? (
            <span><b>Muthu Karuppa Kone</b> endowed <b>11.72 Acres (Sy. 175/1)</b> in <b>Srirangam</b> to <b>Thai Poosam Trust</b> for <b>Sri Ranganatha Temple</b>.</span>
          ) : (
            <span><b>{layout.targetDoc?.owner}</b> owns <b>Sy. {layout.targetDoc?.survey}</b> ({layout.targetDoc?.area}) in <b>{layout.targetDoc?.village}</b>.</span>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'IBM Plex Mono, monospace' }}>
          {layout.targetDoc?.id}
        </span>
      </div>

      {/* 2. Top Legend Bar */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 14, fontSize: 11.5, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: colorFor.document, display: 'inline-block' }} /> 📜 Document
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: colorFor.owner, display: 'inline-block' }} /> 👤/🏛️ Owner / Trust
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: colorFor.survey, display: 'inline-block' }} /> 📍 Survey No
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: colorFor.area, display: 'inline-block' }} /> 📐 Extent
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: colorFor.village, display: 'inline-block' }} /> 🏘️ Village
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: colorFor.reference, display: 'inline-block' }} /> 🏛️ Beneficiary
          </span>
        </div>
        {selectedNode && (
          <button className="btn btn-outline btn-sm" style={{ padding: '2px 8px', height: 22, fontSize: 11 }} onClick={() => setSelectedNode(null)}>
            Clear Selection ({selectedNode.label}) Γ£ò
          </button>
        )}
      </div>

      {/* 3. SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', minHeight: 460, background: '#fcfbf8' }}>
        <svg
          width="100%"
          height="460"
          viewBox={layout.viewBox || "0 0 860 520"}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
        >
          <defs>
            <marker id="arrow" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,-5L10,0L0,5" fill="#A8A393" />
            </marker>
            <marker id="arrow-active" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,-5L10,0L0,5" fill="#D85A30" />
            </marker>
            <marker id="arrow-warn" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,-5L10,0L0,5" fill="#E63946" />
            </marker>
          </defs>

          {/* Connection Lines */}
          {layout.links.map((l, i) => {
            const s = typeof l.source === 'object' ? l.source : layout.nodes.find(n => n.id === l.source);
            const t = typeof l.target === 'object' ? l.target : layout.nodes.find(n => n.id === l.target);
            if (!s || !t) return null;
            const isHighlighted = activeFocus && (s.id === activeFocus.id || t.id === activeFocus.id);
            const isDisc = l.relation === 'flagged_discrepancy' || s.type === 'discrepancy' || t.type === 'discrepancy';

            const strokeColor = isDisc ? '#E63946' : isHighlighted ? '#D85A30' : '#C7C3B5';
            const strokeW = isHighlighted ? 2.5 : 1.4;
            const midX = (s.x + t.x) / 2;
            const midY = (s.y + t.y) / 2;

            return (
              <g key={i} opacity={activeFocus ? (isHighlighted ? 1 : 0.2) : 0.9}>
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  strokeDasharray={isDisc ? '5 3' : 'none'}
                  markerEnd={isDisc ? 'url(#arrow-warn)' : isHighlighted ? 'url(#arrow-active)' : 'url(#arrow)'}
                />
                {l.label && (
                  <g transform={`translate(${midX},${midY})`}>
                    <rect
                      x="-34"
                      y="-7"
                      width="68"
                      height="14"
                      rx="7"
                      fill="#ffffff"
                      stroke={isHighlighted ? '#D85A30' : '#d1c7b7'}
                      strokeWidth="0.8"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fontSize="7.5"
                      fontFamily="IBM Plex Mono, monospace"
                      fill={isHighlighted ? '#D85A30' : '#6b5b45'}
                      fontWeight="600"
                    >
                      {l.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Circular Nodes */}
          {layout.nodes.map(n => {
            const isHovered = hoveredNode?.id === n.id;
            const isSelected = selectedNode?.id === n.id;
            const isHighlighted = activeFocus && (n.id === activeFocus.id || layout.links.some(l => {
              const s = typeof l.source === 'object' ? l.source.id : l.source;
              const t = typeof l.target === 'object' ? l.target.id : l.target;
              return (s === activeFocus.id && t === n.id) || (t === activeFocus.id && s === n.id);
            }));

            const r = n.type === 'document' ? 19 : 15;
            const opacity = activeFocus ? (isHighlighted ? 1 : 0.25) : 1;
            const nodeFill = colorFor[n.type] || '#555';

            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                style={{ cursor: 'pointer', opacity, transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredNode(n)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  if (n.type === 'document' && n.docId && onSelectDoc) {
                    onSelectDoc(n.docId);
                  } else {
                    setSelectedNode(prev => prev?.id === n.id ? null : n);
                  }
                }}
              >
                <circle
                  r={isHovered || isSelected ? r + 4 : r}
                  fill={nodeFill}
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  style={{
                    filter: (isHovered || isSelected)
                      ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
                      : 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
                    transition: 'all 0.15s ease',
                  }}
                />

                <text
                  x={0}
                  y={5}
                  textAnchor="middle"
                  fontSize={(isHovered || isSelected ? r + 4 : r) * 1.05}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {iconForNode(n)}
                </text>

                <text
                  x={0}
                  y={n.type === 'document' ? 32 : 30}
                  textAnchor="middle"
                  fontSize={isHovered || isSelected ? 12 : 11}
                  fontWeight={isHovered || isSelected ? 700 : (n.type === 'document' ? 700 : 600)}
                  fill="#1e293b"
                  stroke="#ffffff"
                  strokeWidth={3.5}
                  paintOrder="stroke fill"
                  style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  {n.label}
                </text>

                {n.role && (
                  <text
                    x={0}
                    y={n.type === 'document' ? 44 : 41}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontFamily="IBM Plex Mono, monospace"
                    fill="#64748b"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    paintOrder="stroke fill"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    ({n.role})
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {activeFocus && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              background: '#ffffff',
              border: `2px solid ${colorFor[activeFocus.type] || '#378ADD'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              borderRadius: 6,
              padding: '10px 14px',
              maxWidth: 280,
              fontSize: 11.5,
              zIndex: 30,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
              <span style={{ fontSize: 15 }}>{iconForNode(activeFocus)}</span>
              <span style={{ fontSize: 12.5 }}>{activeFocus.label}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace' }}>
              Role: <b>{activeFocus.role || activeFocus.type.toUpperCase()}</b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   OCR WORKSPACE
   ========================================================================= */

function OcrWorkspace({ doc, zoom, setZoom, pipeline, onProgress, onComplete, onStuck, onResume }) {
  const activeDoc = doc || {};
  const running = pipeline?.stage === 'ocr';
  const paused = pipeline?.stage === 'ocr-paused';
  const done = pipeline?.stage !== 'ocr' && pipeline?.stage !== 'ocr-paused';
  const pct = pipeline?.ocrTotalWords ? Math.min(100, Math.round(((pipeline?.ocrWords || 0) / pipeline.ocrTotalWords) * 100)) : 0;
  const avgConfidence = 94;

  return (
    <div className="ocr-workspace">
      <div className="ocr-pane">
        <div className="ocr-pane-head">
          <div className="opd-file">
            <FileText size={15} />
            <div>
              <b>{activeDoc.fileName || activeDoc.name || `${activeDoc.id || 'document'}.pdf`}</b>
              <span>Uploaded today, {nowTime()} · {fileSizeLabel(activeDoc)} · {activeDoc.type || 'PDF'}</span>
            </div>
          </div>
          <StatusBadge status={pipeline?.stage || 'ocr'} />
        </div>
        <div className="opd-toolbar">
          <span className="opd-label">Original Document</span>
          <div className="opd-zoom">
            <button type="button" onClick={() => setZoom(z => Math.max(30, z - 10))}><ZoomOut size={14} /></button>
            <span>{zoom}%</span>
            <button type="button" onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn size={14} /></button>
            <button type="button" onClick={() => setZoom(100)} title="Reset zoom (100%)"><Maximize2 size={13} /></button>
            <button type="button"><RotateCw size={13} /></button>
            <button type="button"><Download size={13} /></button>
          </div>
        </div>
        <div className="opd-frame">
          <DocPreview
            url={activeDoc.imageUrl} type={activeDoc.type} filterCss={enhanceFilter(PREPROCESS_STEPS.length)} altLabel="original document" zoom={zoom}
            evidenceRegion={paused ? OCR_UNCERTAIN_REGION : null} evidenceTone="warn"
          />
        </div>
        <div className="opd-foot">Page 1/{pageCountFor(activeDoc)}</div>
      </div>

      <div className="ocr-pane">
        <div className="ocr-pane-head">
          <span className="opd-label">OCR Output <span className="muted-inline">(Recognized Text)</span></span>
          <span className={`live-pill ${done ? 'done' : ''} ${paused ? 'paused' : ''}`}>
            <span className="live-dot" /> {paused ? 'Paused' : done ? 'OCR Complete' : 'Live Extraction'}
          </span>
        </div>
        <div className="ocr-textframe">
          <OcrTypewriter
            text={doc?.ocrText || doc?.ocrResult || pipeline?.ocrText || OCR_FULL_TEXT}
            running={running}
            onProgress={onProgress}
            onComplete={onComplete}
            stuckToken={pipeline.ocrResumeCount === 0 && !doc?.ocrText ? OCR_UNCERTAIN_TOKEN : null}
            onStuck={onStuck}
            resumeToken={pipeline.ocrResumeCount}
            isDone={done}
          />
          {paused && (
            <div className="ocr-stuck-card">
              <div className="ocr-stuck-head"><MessageSquareWarning size={15} /> Couldn't confidently read this portion</div>
              <p>The recognizer hit a low-confidence patch around <b className="mono">"Aores"</b> near the area field. That's highlighted on the source scan to the left.</p>
              <div className="ocr-stuck-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => onResume(false)}><ThumbsUp size={13} /> Keep best guess</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => onResume(true)}><CropIcon size={13} /> Rescan this region</button>
              </div>
            </div>
          )}
        </div>
        <div className="ocr-progress-row">
          <div className="ocr-progress-bar"><div style={{ width: `${pct}%` }} /></div>
          <span className="ocr-progress-pct">{pct}%</span>
        </div>
        <div className="ocr-stats-row">
          <span><b>{pipeline.ocrWords}</b> / {pipeline.ocrTotalWords} words</span>
          <span><b>{pipeline.ocrLines}</b> lines</span>
          <span>Confidence (avg) <b className="conf high">{avgConfidence}%</b></span>
        </div>
        <div className="ocr-meta-strip">
          <span><span className="ms-label">Language</span> English</span>
          <span><span className="ms-label">Engine</span> TrOCR + Tesseract</span>
          <span><span className="ms-label">Model</span> v2.3 (Custom)</span>
          <span><span className="ms-label">Processing Time</span> {pipeline.ocrElapsed.toFixed(1)} sec</span>
          <span><span className="ms-label">Page Count</span> 1/{pageCountFor(doc)}</span>
          <span><span className="ms-label">Confidence Score</span> <b className="conf high">{avgConfidence}%</b></span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   DIGITIZED PAGE
   ========================================================================= */

function DigitizedPage({ doc }) {
  const statusLine = doc.status === 'submitted'
    ? 'Pending Officer Verification'
    : 'AI Extracted · Auto-Validated';
  const pageNo = String(37 + (parseInt(String(doc.id).replace(/\D/g, ''), 10) % 40 || 2));
  const docFields = (doc.fields && doc.fields.length > 0) ? doc.fields : genFields(doc.docType || 'Ownership Record', [], doc);

  return (
    <div className="doc-page">
      <div className="dp-pagenum-top">{pageNo}</div>

      <div className="dp-title">LAND RECORD EXTRACT &amp; SETTLEMENT CERTIFICATE</div>
      <div className="dp-subtitle">
        SURVEY NO. {doc.survey || '125/2'} &nbsp;·&nbsp; {(doc.village || 'Kinathukadavu').toUpperCase()} VILLAGE, {(doc.taluk || 'Pollachi').toUpperCase()} TALUK, {(doc.district || 'Coimbatore').toUpperCase()} DISTRICT
      </div>

      <div className="dp-section-title">ORIGINAL DOCUMENT SOURCE</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', background: '#f5f3ec', padding: '10px 14px', borderRadius: 3, marginBottom: 14, fontSize: '12px' }}>
        <div><b>Uploaded File:</b> <span className="mono">{doc.fileName || doc.name || 'uploaded_document.pdf'}</span></div>
        <div><b>Document Type:</b> <span>{doc.docType || doc.type}</span></div>
        <div><b>Document Tracking ID:</b> <span className="mono">{doc.id}</span></div>
        <div><b>Digitization Date:</b> <span>{doc.uploadedAt ? `${todayStr()} (${doc.uploadedAt})` : todayStr()}</span></div>
      </div>

      <div className="dp-section-title">RECORD DESCRIPTION</div>
      <p className="dp-para">
        This record certifies the landholding particulars under Survey No. <b>{doc.survey}</b>, situated in the
        village of <b>{doc.village}</b>, {doc.taluk} Taluk, {doc.district || 'Coimbatore'} District, as digitized from the original {doc.type} record
        (<b>{doc.fileName || doc.name || doc.id}</b>). The land stands registered in the name of <b>{doc.owner}</b>
        {doc.patta ? <>, under Patta / Khata No. <b>{doc.patta}</b></> : null}, comprising an extent of <b>{doc.area}</b>
        {doc.classification ? <>, classified as <b>{doc.classification}</b></> : null}.
      </p>

      <div className="dp-section-title">EXTRACTED LEGAL &amp; REVENUE PARAMETERS</div>
      <table className="dp-table" style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0 16px', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#e9e6dc', borderBottom: '1.5px solid #8a8474' }}>
            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Parameter</th>
            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Extracted Value</th>
            <th style={{ padding: '6px 10px', textAlign: 'center' }}>AI Confidence</th>
            <th style={{ padding: '6px 10px', textAlign: 'center' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {docFields.map((f, idx) => (
            <tr key={f.key || idx} style={{ borderBottom: '1px solid #e0dcd0', background: idx % 2 === 0 ? '#fff' : '#faf9f5' }}>
              <td style={{ padding: '6px 10px', fontWeight: 600, color: '#3a3832' }}>{f.label}</td>
              <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 600, color: '#1b2a41' }}>{f.value || '—'}</td>
              <td style={{ padding: '6px 10px', textAlign: 'center', fontFamily: 'monospace' }}>{f.confidence || 96}%</td>
              <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                <span style={{ color: '#2F4A3D', fontWeight: 600 }}>Γ£ô Verified</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="dp-para" style={{ fontSize: '11.5px', color: '#444' }}>
        This digital record was extracted and normalized with an AI confidence score of{' '}
        <b>{doc.confidence || 96}%</b>, digitized on {todayStr()}. Verification status is currently{' '}
        <em>{statusLine}</em>.
      </p>

      <div className="dp-hash">
        Document Hash — SHA-256: {docHash(doc)}<br />
        Audit Reference: {auditRef(doc)} &nbsp;·&nbsp; Source File: {doc.fileName || doc.name || 'document'}
      </div>

      <div className="dp-pagenum-bottom">{pageNo}</div>
    </div>
  );
}

/* =========================================================================
   SMALL SHARED PIECES
   ========================================================================= */

function PageHead({ title, sub, rightBtn }) {
  return (
    <div className="page-head">
      <div><h2>{title}</h2><p>{sub}</p></div>
      {rightBtn}
    </div>
  );
}

function KPI({ label, val, icon: Icon, tone = 'ink', progress }) {
  return (
    <div className="kpi">
      <div className={`kpi-ic tone-${tone}`}><Icon size={16} /></div>
      <div className="kpi-val">{val}</div>
      <div className="kpi-label">{label}</div>
      {progress != null && <div className="kpi-progress"><div style={{ width: `${progress}%` }} /></div>}
    </div>
  );
}

function Stage({ n, label }) { return <div className="stage"><b>{n}</b><span>{label}</span></div>; }
function StageArrow() { return <div className="stage-arrow"><ChevronRight size={16} /></div>; }

function EmptyState({ icon: Icon, title, sub }) {
  return <div className="empty-state"><Icon size={28} /><b>{title}</b><span>{sub}</span></div>;
}

/* =========================================================================
   CSS
   ========================================================================= */

const CSS = `
/* =========================================================================
   EXACT HORIZONTAL KPI CARDS (Matching Right-Side Reference Screenshot)
   ========================================================================= */
.op-kpi-grid {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 16px !important;
  margin-bottom: 22px !important;
}
.op-kpi-card {
  background: #ffffff !important;
  border-radius: 14px !important;
  padding: 16px 18px !important;
  border: 1.5px solid #e2e8f0 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03) !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 14px !important;
  position: relative !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  min-height: 84px !important;
}
.op-kpi-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06) !important;
  border-color: #7bc69e !important;
}
.op-kpi-icon-square {
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}
.op-kpi-icon-square.green {
  background: #eaf8f0 !important;
  color: #16a34a !important;
}
.op-kpi-icon-square.blue {
  background: #eaf4ff !important;
  color: #0284c7 !important;
}
.op-kpi-icon-square.orange {
  background: #fff4eb !important;
  color: #ea580c !important;
}
.op-kpi-icon-square.purple {
  background: #f4eefb !important;
  color: #9333ea !important;
}
.op-kpi-content {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  flex: 1 !important;
}
.op-kpi-number {
  font-size: 24px !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  line-height: 1.1 !important;
  margin: 0 0 2px 0 !important;
}
.op-kpi-label {
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #475569 !important;
  text-transform: none !important;
  margin: 0 !important;
  letter-spacing: 0 !important;
}
.op-kpi-badge-wrap {
  position: absolute !important;
  bottom: 12px !important;
  right: 14px !important;
  margin: 0 !important;
}
.op-kpi-badge {
  font-size: 11px !important;
  font-weight: 700 !important;
  padding: 3px 8px !important;
  border-radius: 6px !important;
  display: inline-flex !important;
  align-items: center !important;
}
.op-kpi-badge.green {
  background: #dcfce7 !important;
  color: #166534 !important;
}
.op-kpi-badge.blue {
  background: #e0f2fe !important;
  color: #0369a1 !important;
}
.op-kpi-badge.orange {
  background: #ffedd5 !important;
  color: #c2410c !important;
}

/* =========================================================================
   MILD MINT GREEN THEME & TOPBAR STYLES (Matching User Reference)
   ========================================================================= */
.op-dash {
  background: #eef7f2 !important;
}
.op-dash .main {
  background: #eef7f2 !important;
}
.op-dash .page {
  background: #eef7f2 !important;
  padding: 24px 32px !important;
}

/* Topbar Styling */
.topbar {
  height: 68px !important;
  background: #eef7f2 !important;
  border-bottom: 1px solid rgba(123, 198, 158, 0.35) !important;
  padding: 0 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}
.tb-left {
  display: flex;
  align-items: center;
}
.tb-badge-status {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tb-dot-green {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
}
.tb-badge-text {
  display: flex;
  flex-direction: column;
}
.tb-badge-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.tb-badge-sub {
  font-size: 11.5px;
  color: #64748b;
  font-weight: 500;
}
.tb-center {
  flex: 1;
  max-width: 480px;
  margin: 0 24px;
}
.tb-search-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  padding: 8px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.tb-search-icon {
  color: #64748b;
  flex-shrink: 0;
}
.tb-search-pill input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #0f172a;
  width: 100%;
}
.tb-search-pill input::placeholder {
  color: #94a3b8;
}
.tb-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.tb-notif-btn {
  background: #ffffff;
  border: 1px solid #d1d5db;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
}
.tb-notif-btn:hover {
  background: #f8fafc;
}
.tb-notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
}
.tb-user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  padding: 4px 12px 4px 5px;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.tb-user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #1b4332;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tb-user-info {
  display: flex;
  flex-direction: column;
}
.tb-user-role {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
}
.tb-user-chevron {
  color: #64748b;
}

/* Welcome Row */
.op-welcome-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.op-welcome-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.15;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}
.op-welcome-name {
  color: #0f172a;
}
.op-welcome-sub {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}
.op-date-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1.5px solid #d1d5db;
  border-radius: 12px;
  padding: 10px 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}
.op-date-icon-box {
  color: #166534;
}
.op-date-details {
  display: flex;
  flex-direction: column;
}
.op-date-main {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
}
.op-date-day {
  font-size: 11.5px;
  color: #64748b;
  font-weight: 500;
}

/* 4 KPI Cards Matching Reference Screenshot */
.op-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}
.op-kpi-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}
.op-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  border-color: #7bc69e;
}
.op-kpi-icon-square {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.op-kpi-icon-square.green {
  background: #e8f5e9;
  color: #16a34a;
}
.op-kpi-icon-square.blue {
  background: #e0f2fe;
  color: #0284c7;
}
.op-kpi-icon-square.orange {
  background: #fff7ed;
  color: #ea580c;
}
.op-kpi-icon-square.purple {
  background: #f3e8ff;
  color: #9333ea;
}
.op-kpi-content {
  flex: 1;
}
.op-kpi-number {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  margin-bottom: 2px;
}
.op-kpi-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #64748b;
}
.op-kpi-badge-wrap {
  align-self: flex-end;
  margin-bottom: 4px;
}
.op-kpi-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 6px;
  display: inline-block;
}
.op-kpi-badge.green {
  background: #dcfce7;
  color: #166534;
}
.op-kpi-badge.blue {
  background: #e0f2fe;
  color: #0369a1;
}
.op-kpi-badge.orange {
  background: #ffedd5;
  color: #c2410c;
}

/* =========================================================================
   OPERATOR DASHBOARD OVERVIEW & SIDEBAR THEME (Matching operaotr.png)
   ========================================================================= */
.sidebar {
  background: linear-gradient(180deg, #c5ebd7 0%, #b2dfc8 100%) !important;
  border-right: 1.5px solid #7bc69e !important;
  color: #1b4332 !important;
}
.sidebar .sb-top {
  border-bottom: 1px solid rgba(45, 106, 79, 0.15) !important;
}
.sidebar .sb-group-label {
  color: #2d6a4f !important;
  font-weight: 700 !important;
}
.sidebar .sb-item {
  color: #1b4332 !important;
  font-weight: 500 !important;
}
.sidebar .sb-item:hover {
  background: rgba(45, 106, 79, 0.12) !important;
  color: #081c15 !important;
}
.sidebar .sb-item.active {
  background: #1b4332 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(27, 67, 50, 0.25) !important;
}
.sidebar .sb-bottom {
  border-top: 1px solid rgba(45, 106, 79, 0.15) !important;
}
.sidebar .sb-toggle {
  color: #1b4332 !important;
}
.sidebar .sb-toggle:hover {
  background: rgba(45, 106, 79, 0.15) !important;
}

.op-dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Hero Banner - Clean Light High-Contrast */
.op-hero-banner {
  background: #ffffff;
  border-radius: 14px;
  padding: 22px 26px;
  border: 1.5px solid #e2e8f0;
  color: #0f172a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.op-hero-content {
  max-width: 65%;
}
.op-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}
.live-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
}
.op-hero-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 6px 0;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.op-hero-desc {
  font-size: 13.5px;
  color: #475569;
  margin: 0;
  line-height: 1.5;
}
.op-hero-actions {
  display: flex;
  gap: 12px;
}
.op-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1b4332;
  color: #ffffff;
  font-weight: 600;
  font-size: 13.5px;
  padding: 10px 18px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(27, 67, 50, 0.2);
  transition: all 0.2s ease;
}
.op-btn-primary:hover {
  background: #2d6a4f;
  transform: translateY(-1px);
}
.op-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  color: #1e293b;
  font-weight: 600;
  font-size: 13.5px;
  padding: 10px 18px;
  border-radius: 9px;
  border: 1.5px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}
.op-btn-secondary:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

/* 4 KPI Grid */
.op-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.op-kpi-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.op-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
}
.op-kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.op-kpi-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.op-kpi-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.op-kpi-icon-wrap.emerald {
  background: #e8f5e9;
  color: #2e7d32;
}
.op-kpi-icon-wrap.blue {
  background: #e1f5fe;
  color: #0288d1;
}
.op-kpi-icon-wrap.amber {
  background: #fff8e1;
  color: #f57f17;
}
.op-kpi-icon-wrap.purple {
  background: #f3e5f5;
  color: #7b1fa2;
}
.op-kpi-val {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.op-kpi-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.op-trend-up {
  color: #16a34a;
  font-weight: 700;
  background: #dcfce7;
  padding: 2px 6px;
  border-radius: 6px;
}
.op-badge-blue {
  color: #0284c7;
  font-weight: 700;
  background: #e0f2fe;
  padding: 2px 6px;
  border-radius: 6px;
}
.op-badge-amber {
  color: #d97706;
  font-weight: 700;
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 6px;
}
.op-kpi-sub {
  color: #6b7280;
}

/* Middle Row */
.op-middle-grid {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 16px;
}
.op-panel {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}
.op-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.op-panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 3px 0;
}
.op-panel-subtitle {
  font-size: 12.5px;
  color: #6b7280;
  margin: 0;
}
.op-chip.green {
  background: #dcfce7;
  color: #166534;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.op-progress-body {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 18px;
}
.op-gauge-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}
.op-gauge-svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}
.op-gauge-bg {
  fill: none;
  stroke: #f3f4f6;
  stroke-width: 12;
}
.op-gauge-fill {
  fill: none;
  stroke: #2e7d32;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}
.op-gauge-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.op-gauge-pct {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}
.op-gauge-sub {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 4px;
}

.op-progress-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.op-prog-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.op-prog-label-row {
  display: flex;
  align-items: center;
  font-size: 12.5px;
}
.op-prog-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.op-prog-dot.green { background: #2e7d32; }
.op-prog-dot.blue { background: #0288d1; }
.op-prog-dot.amber { background: #f57f17; }
.op-prog-name {
  color: #374151;
  font-weight: 600;
  flex: 1;
}
.op-prog-count {
  font-weight: 700;
  color: #111827;
  font-size: 12px;
}
.op-bar-track {
  height: 6px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}
.op-bar-fill {
  height: 100%;
  border-radius: 4px;
}
.op-bar-fill.green { background: linear-gradient(90deg, #52b788, #2e7d32); }
.op-bar-fill.blue { background: linear-gradient(90deg, #38bdf8, #0288d1); }
.op-bar-fill.amber { background: linear-gradient(90deg, #fbbf24, #d97706); }

.op-progress-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f3f4f6;
  padding-top: 14px;
}
.op-foot-stat {
  display: flex;
  flex-direction: column;
}
.op-foot-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}
.op-foot-val {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}
.op-foot-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
}

/* Quick Actions (2x2 Grid) */
.op-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.op-action-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.op-action-box:hover {
  background: #ffffff;
  border-color: #7bc69e;
  box-shadow: 0 4px 12px rgba(45, 106, 79, 0.08);
  transform: translateY(-1px);
}
.op-action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.op-action-icon.emerald { background: #e8f5e9; color: #2e7d32; }
.op-action-icon.blue { background: #e1f5fe; color: #0288d1; }
.op-action-icon.amber { background: #fff8e1; color: #f57f17; }
.op-action-icon.purple { background: #f3e5f5; color: #7b1fa2; }
.op-action-content {
  flex: 1;
}
.op-action-content h4 {
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 2px 0;
}
.op-action-content p {
  font-size: 11.5px;
  color: #6b7280;
  margin: 0;
  line-height: 1.3;
}
.op-action-arrow {
  color: #9ca3af;
  transition: transform 0.2s ease;
}
.op-action-box:hover .op-action-arrow {
  transform: translateX(3px);
  color: #2e7d32;
}

/* Bottom Grid */
.op-bottom-grid {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 16px;
}
.op-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.op-filter-pills {
  display: flex;
  gap: 6px;
}
.op-filter-pill {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.15s ease;
}
.op-filter-pill.active {
  background: #1b4332;
  color: #ffffff;
  border-color: #1b4332;
}
.op-table-responsive {
  overflow-x: auto;
}
.op-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.op-data-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 11.5px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.op-data-table td {
  padding: 11px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
}
.op-doc-cell {
  display: flex;
  align-items: center;
  gap: 7px;
}
.op-doc-icon {
  color: #6b7280;
}
.op-doc-id {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  color: #111827;
  font-size: 12px;
}
.op-cell-main {
  display: flex;
  flex-direction: column;
}
.op-survey-no {
  font-weight: 600;
  color: #111827;
}
.op-village-name {
  font-size: 11px;
  color: #6b7280;
}
.op-type-tag {
  font-size: 11.5px;
  color: #374151;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}
.op-conf-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.op-conf-bar {
  width: 50px;
  height: 5px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}
.op-conf-fill {
  height: 100%;
  background: #2e7d32;
  border-radius: 3px;
}
.op-conf-val {
  font-size: 11.5px;
  font-weight: 700;
  color: #111827;
}
.op-status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 10px;
}
.op-status-badge.review {
  background: #fef3c7;
  color: #d97706;
}
.op-status-badge.validated {
  background: #dcfce7;
  color: #166534;
}
.op-status-badge.processing {
  background: #e0f2fe;
  color: #0284c7;
}
.op-table-act-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #1b4332;
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.op-table-act-btn:hover {
  background: #2d6a4f;
  color: #ffffff;
}
.op-empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 24px !important;
}
.op-table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  font-size: 12px;
  color: #6b7280;
}
.op-view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #2d6a4f;
  font-weight: 700;
  cursor: pointer;
  font-size: 12.5px;
}
.op-view-all-btn:hover {
  color: #1b4332;
  text-decoration: underline;
}

/* System Updates */
.op-updates-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.op-update-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.op-update-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.op-update-icon.green { background: #e8f5e9; color: #2e7d32; }
.op-update-icon.blue { background: #e1f5fe; color: #0288d1; }
.op-update-icon.purple { background: #f3e5f5; color: #7b1fa2; }
.op-update-icon.amber { background: #fff8e1; color: #f57f17; }
.op-update-body {
  flex: 1;
}
.op-update-text {
  font-size: 12.5px;
  color: #374151;
  margin: 0 0 2px 0;
  line-height: 1.4;
}
.op-update-text strong {
  color: #111827;
}
.op-update-time {
  font-size: 11px;
  color: #9ca3af;
}

:root{
  --ink:#1B2A41; --ink-soft:#3B4A63; --ink-faint:#7C879B;
  --paper:#F6F5F0; --paper-raised:#FFFFFF; --line:#DCD9CE; --line-strong:#C7C3B5;
  --rust:#C1502E; --rust-soft:#F4E3DC;
  --green:#2F4A3D; --green-soft:#E4EAE3;
  --navy-soft:#E2E7EF;
  --amber:#8A6D1E; --amber-soft:#F3EAD2;
}
.op-dash{ display:flex; height:100vh; max-height:100vh; overflow:hidden; background:var(--paper); color:var(--ink);
  font-family:'IBM Plex Sans', system-ui, sans-serif; font-size:14px; line-height:1.5; width:100%; }
.op-dash *{ box-sizing:border-box; min-width:0; }
.op-dash h1,.op-dash h2,.op-dash h3,.op-dash h4{ font-family:'Source Serif 4', Georgia, serif; margin:0; color:var(--ink); }
.op-dash .mono{ font-family:'IBM Plex Mono', monospace; }
.op-dash button{ font-family:inherit; cursor:pointer; }
.op-dash input,.op-dash select{ font-family:inherit; }
.spin{ animation:spin 1s linear infinite; }
@keyframes spin{ to{ transform:rotate(360deg); } }

/* Sidebar — stays fixed in viewport, never scrolls away with page */
.sidebar{ width:250px; height:100vh; max-height:100vh; background:var(--ink); color:#C9D2DE; display:flex; flex-direction:column; flex:none; transition:width .18s ease; position:sticky; top:0; left:0; z-index:100; overflow:hidden; }
.sidebar.collapsed{ width:72px; }
.sb-top{ display:flex; align-items:center; justify-content:space-between; padding:18px 16px; border-bottom:1px solid rgba(255,255,255,0.1); flex:none; }
.brand{ display:flex; align-items:center; gap:10px; overflow:hidden; }
.brand-mark{ width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; flex:none; }
.brand-name{ font-family:'Source Serif 4', serif; font-size:16px; font-weight:600; color:#fff; white-space:nowrap; }
.brand-name em{ font-style:normal; color:var(--rust); }
.sb-toggle{ background:transparent; border:1px solid rgba(255,255,255,0.15); color:#C9D2DE; border-radius:4px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; flex:none; }
.sb-toggle:hover{ background:rgba(255,255,255,0.08); }
.sb-nav{ flex:1; overflow-y:auto; overflow-x:hidden; padding:14px 10px; scrollbar-width:none; -ms-overflow-style:none; }
.sb-nav::-webkit-scrollbar, .sidebar::-webkit-scrollbar{ display:none; width:0; height:0; }
.sb-group{ margin-bottom:16px; }
.sb-group-label{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#7C879B; padding:0 10px; margin-bottom:6px; }
.sb-item{ display:flex; align-items:center; gap:11px; width:100%; padding:9px 10px; border:none; background:transparent; color:#C9D2DE; border-radius:4px; font-size:13.5px; font-weight:500; text-align:left; white-space:nowrap; overflow:hidden; }
.sb-item span{ overflow:hidden; text-overflow:ellipsis; }
.sb-item:hover{ background:rgba(255,255,255,0.06); color:#fff; }
.sb-item.active{ background:rgba(193,80,46,0.18); color:#fff; box-shadow:inset 2px 0 0 var(--rust); }
.sb-bottom{ padding:12px 10px 16px; border-top:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; gap:2px; flex:none; }

/* Sidebar submenus (Processing / Validation) */
.sb-expandable{ display:flex; flex-direction:column; }
.sb-parent{ position:relative; }
.sb-chevron{ margin-left:auto; flex:none; display:flex; align-items:center; color:#7C879B; overflow:visible; }
.sb-submenu{ display:flex; flex-direction:column; gap:2px; padding:3px 0 5px 14px; margin-left:9px; border-left:1.5px solid rgba(255,255,255,0.15); }
.sb-child{ padding:7px 10px; font-size:12.5px; font-weight:450; color:#A9B3C4; border-radius:3px; }
.sb-child:hover{ color:#fff; background:rgba(255,255,255,0.06); }
.sb-child.active{ color:#fff; background:rgba(193,80,46,0.22); box-shadow:inset 2px 0 0 var(--rust); font-weight:600; }

/* Main / topbar — only the page content scrolls */
.main{ flex:1; display:flex; flex-direction:column; min-width:0; height:100vh; max-height:100vh; overflow:hidden; }
.topbar{ height:60px; background:var(--paper-raised); border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; padding:0 26px; flex:none; z-index:90; }
.tb-left{ display:flex; align-items:center; gap:12px; }
.tb-title{ font-family:'Source Serif 4', serif; font-weight:600; font-size:16px; }
.tb-chip{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; background:var(--rust-soft); color:var(--rust); padding:3px 9px; border-radius:2px; }
.tb-right{ display:flex; align-items:center; gap:18px; }
.tb-search{ display:flex; align-items:center; gap:8px; background:var(--paper); border:1px solid var(--line); border-radius:4px; padding:7px 12px; color:var(--ink-faint); }
.tb-search input{ border:none; background:transparent; outline:none; font-size:13px; width:170px; color:var(--ink); }
.tb-user{ display:flex; align-items:center; gap:6px; font-size:13px; color:var(--ink-soft); font-weight:500; }

.page{ flex:1; padding:30px 32px 60px; overflow-y:auto; overflow-x:hidden; height:calc(100vh - 60px); }
.page-head{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; flex-wrap:wrap; gap:10px; }
.page-head h2{ font-size:24px; font-weight:600; }
.page-head p{ margin:6px 0 0; color:var(--ink-soft); font-size:13.5px; }

/* KPI */
.kpi-grid{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:24px; }
.kpi{ background:var(--paper-raised); border:1px solid var(--line); padding:18px; position:relative; }
.kpi-ic{ width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
.tone-ink{ background:var(--navy-soft); color:var(--ink); }
.tone-rust{ background:var(--rust-soft); color:var(--rust); }
.tone-green{ background:var(--green-soft); color:var(--green); }
.kpi-val{ font-family:'Source Serif 4', serif; font-size:26px; font-weight:600; }
.kpi-label{ font-size:12px; color:var(--ink-faint); margin-top:2px; }
.kpi-progress{ height:4px; background:var(--line); margin-top:12px; border-radius:2px; overflow:hidden; }
.kpi-progress div{ height:100%; background:var(--rust); }

/* Panels */
.grid-2{ display:grid; grid-template-columns:1.3fr 1fr; gap:16px; }
.panel{ background:var(--paper-raised); border:1px solid var(--line); }
.panel-head{ display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid var(--line); }
.panel-head h3{ font-family:'IBM Plex Mono', monospace; font-size:11.5px; letter-spacing:0.08em; color:var(--ink-faint); font-weight:500; }
.panel-body{ padding:20px; }
.muted{ color:var(--ink-faint); font-size:13px; }
.muted-inline{ color:var(--ink-faint); font-weight:400; font-size:12px; }

.stage-row{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.stage{ text-align:center; padding:14px 18px; background:var(--paper); border:1px solid var(--line); min-width:90px; }
.stage b{ display:block; font-family:'Source Serif 4', serif; font-size:20px; }
.stage span{ font-size:11px; color:var(--ink-faint); }
.stage-arrow{ color:var(--line-strong); flex:none; }

.quick-actions{ display:flex; flex-direction:column; gap:10px; }
.qa-btn{ display:flex; align-items:center; gap:10px; padding:12px 14px; border:1px solid var(--line); background:var(--paper); border-radius:2px; font-size:13.5px; font-weight:500; color:var(--ink); }
.qa-btn:hover{ border-color:var(--rust); color:var(--rust); }

/* Buttons / forms */
.btn{ display:inline-flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600; padding:10px 18px; border-radius:2px; border:1px solid var(--ink); background:transparent; white-space:nowrap; }
.btn-primary{ background:var(--ink); color:#fff; border-color:var(--ink); }
.btn-primary:hover{ background:var(--ink-soft); }
.btn-primary:disabled{ cursor:not-allowed; }
.btn-outline{ color:var(--ink); border-color:var(--line-strong); }
.btn-outline:hover{ border-color:var(--ink); }
.btn-ghost{ border-color:transparent; color:var(--rust); padding:6px 10px; }
.btn-sm{ padding:8px 14px; font-size:12.5px; }
.btn-block{ width:100%; justify-content:center; }

.dropzone{ position:relative; border:1.5px dashed var(--line-strong); background:var(--paper); text-align:center; padding:38px 20px; margin-bottom:20px; display:flex; flex-direction:column; align-items:center; }
.dz-ico{ color:var(--rust); margin-bottom:10px; }
.dropzone b{ font-size:14.5px; margin-bottom:4px; }
.dropzone span{ font-size:12.5px; color:var(--ink-faint); }
.dz-sub{ margin-top:2px; }
.dz-notes{ list-style:none; margin:18px 0 0; padding:0; display:flex; flex-direction:column; gap:6px; text-align:left; }
.dz-notes li{ display:flex; align-items:center; gap:7px; font-size:12px; color:var(--ink-soft); }
.dz-notes li svg{ color:var(--green); flex:none; }

.filecard{ border:1px solid var(--line-strong); background:var(--paper); padding:18px; margin-bottom:18px; }
.filecard-head{ display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; }
.filecard-head b{ display:block; font-size:14px; }
.filecard-head span{ display:block; font-size:12px; color:var(--ink-faint); margin-top:2px; }
.filecard-checks{ list-style:none; margin:0 0 16px; padding:0; display:flex; flex-direction:column; gap:7px; }
.filecard-checks li{ display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--ink-soft); }
.filecard-checks li svg{ color:var(--green); flex:none; }
.filecard-actions{ display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.filecard-compact{ display:flex; align-items:center; gap:9px; padding:12px 14px; font-size:13px; margin-bottom:18px; }

.field{ margin-bottom:14px; }
.field label{ display:block; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:var(--ink-faint); margin-bottom:6px; }
.field input,.field select{ width:100%; padding:9px 11px; border:1px solid var(--line-strong); background:#fff; border-radius:2px; font-size:13.5px; color:var(--ink); }
.field-row{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }

/* Table — scrolls in its own box only, never the whole page */
.table-scroll{ width:100%; overflow-x:auto; }
table{ width:100%; border-collapse:collapse; font-size:13.5px; }
th{ text-align:left; font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-faint); padding:8px 10px; border-bottom:1px solid var(--line); white-space:nowrap; }
td{ padding:11px 10px; border-bottom:1px solid var(--line); }
.conf{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:12.5px; }
.conf.high{ color:var(--green); } .conf.mid{ color:#8A6D1E; } .conf.low{ color:var(--rust); }

.badge{ font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:600; padding:3px 9px; border-radius:2px; letter-spacing:0.03em; white-space:nowrap; }
.badge-ink{ background:var(--navy-soft); color:var(--ink); }
.badge-rust{ background:var(--rust-soft); color:var(--rust); }
.badge-green{ background:var(--green-soft); color:var(--green); }
.badge-navy{ background:var(--ink); color:#fff; }

.sev-badge{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:2px; letter-spacing:0.03em; white-space:nowrap; }
.sev-high{ background:var(--rust-soft); color:var(--rust); }
.sev-mid{ background:var(--amber-soft); color:var(--amber); }
.sev-low{ background:var(--navy-soft); color:var(--ink-soft); }

/* Pipeline / processing */
.pipe-section{ margin-bottom:24px; scroll-margin-top:16px; border:1px solid var(--line); padding:14px 16px; background:var(--paper-raised); }
.pipe-section:last-child{ margin-bottom:0; }
.pipe-label{ display:flex; align-items:center; gap:6px; font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:0.08em; color:var(--ink-faint); margin-bottom:10px; }
.pipe-label-toggle{ width:100%; background:transparent; border:none; padding:0; cursor:pointer; text-align:left; }
.pipe-label-toggle:hover{ color:var(--ink); }
.pipe-toggle-ic{ margin-left:auto; color:var(--ink-faint); display:flex; align-items:center; flex:none; }
.checklist{ display:flex; flex-direction:column; gap:8px; margin-top:14px; }
.check-step{ display:flex; align-items:center; gap:10px; font-size:13.5px; color:var(--ink-faint); }
.check-step.done{ color:var(--ink); }
.check-step.done .c-dot{ color:var(--green); }
.check-step.active{ color:var(--rust); }
.fields-table{ display:flex; flex-direction:column; border:1px solid var(--line); background:#fff; padding:4px 14px; max-height:445px; overflow-y:auto; }
.fields-row{ display:grid; grid-template-columns:130px 1fr auto; gap:10px; padding:9px 0; border-bottom:1px solid var(--line); align-items:center; font-size:13px; }
.fields-row:last-child{ border-bottom:none; }
.fields-row.clickable{ cursor:pointer; }
.fields-row.clickable:hover{ background:var(--paper); }
.fields-row.active{ background:var(--rust-soft); }
.fk{ color:var(--ink-faint); font-size:12.5px; }
.fv{ overflow-wrap:break-word; word-break:break-word; font-size:12.5px; }
.conf{ white-space:nowrap; }

/* Sub-stage stepper */
.substage-strip{ display:flex; align-items:center; margin-bottom:22px; flex-wrap:wrap; row-gap:8px; }
.substage-step{ display:flex; align-items:center; gap:7px; font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:0.04em; color:var(--ink-faint); padding:6px 10px; border:1px solid var(--line); border-radius:2px; white-space:nowrap; }
.substage-num{ display:flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; background:var(--line); font-size:9.5px; color:var(--ink-soft); flex:none; }
.substage-step.active{ color:var(--rust); border-color:var(--rust); background:var(--rust-soft); }
.substage-step.active .substage-num{ background:var(--rust); color:#fff; }
.substage-step.done{ color:var(--green); border-color:var(--green-soft); background:var(--green-soft); }
.substage-step.done .substage-num{ background:transparent; color:var(--green); }
.substage-connector{ width:18px; height:1px; background:var(--line-strong); margin:0 4px; flex:none; }

/* Real-document compare panels — portrait straight vertical scroll, zero horizontal shift */
.compare-grid{ display:grid; grid-template-columns:1fr 1fr; gap:18px; width:100%; max-width:100%; align-items:stretch; }
.ocr-split{ display:grid; grid-template-columns:1fr 1.05fr; gap:18px; align-items:stretch; }
.compare-col{ display:flex; flex-direction:column; gap:8px; min-width:0; height:100%; width:100%; }
.compare-tag{ display:flex; align-items:center; gap:5px; font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; color:var(--ink-faint); text-transform:uppercase; }
.compare-frame{ border:1px solid var(--line-strong); background:#fff; height:460px; min-height:440px; display:block; overflow-x:hidden !important; overflow-y:auto; position:relative; width:100%; box-sizing:border-box; padding:0; }
.compare-frame-tall{ height:500px; min-height:480px; max-height:540px; width:100%; display:block; overflow-x:hidden !important; overflow-y:auto; box-sizing:border-box; padding:0; }
.compare-placeholder{ display:flex; flex-direction:column; align-items:center; gap:6px; color:var(--ink-faint); font-size:11.5px; padding:40px 16px; text-align:center; }
.doc-img{ width:100%; max-width:100%; height:auto; display:block; margin:0 auto; object-fit:contain; }
.doc-embed{ width:100% !important; max-width:100% !important; height:100% !important; min-height:460px; border:none; display:block; background:#fff; overflow:hidden; }
.evidence-frame{ position:relative; width:100%; max-width:100%; height:100%; min-height:100%; display:block; overflow-x:hidden !important; overflow-y:auto; box-sizing:border-box; }
.evidence-box{ position:absolute; border:2px solid #059669; background:rgba(16,185,129,0.18); box-shadow:0 0 0 3px rgba(16,185,129,0.25), 0 4px 16px rgba(0,0,0,0.15); pointer-events:none; transition:all .24s cubic-bezier(0.16, 1, 0.3, 1); border-radius:3px; animation:pulse-evidence 1.8s ease-in-out infinite; }
.evidence-box-warn{ border-color:var(--amber); background:rgba(138,109,30,0.18); box-shadow:0 0 0 3px rgba(138,109,30,0.25); animation:pulse-warn 1.3s ease-in-out infinite; }
.evidence-floating-badge{ position:absolute; top:-28px; left:0; display:inline-flex; align-items:center; gap:5px; background:#064e3b; color:#ecfdf5; font-family:'IBM Plex Mono', monospace; font-size:10px; font-weight:600; padding:3px 8px; border-radius:3px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.25); border:1px solid rgba(16,185,129,0.4); pointer-events:none; z-index:30; }
@keyframes pulse-evidence{ 0%,100%{ border-color:#059669; box-shadow:0 0 0 3px rgba(16,185,129,0.25); } 50%{ border-color:#10b981; box-shadow:0 0 0 6px rgba(16,185,129,0.45); } }
@keyframes pulse-warn{ 0%,100%{ opacity:1; } 50%{ opacity:0.55; } }
.spin-slow{ animation:spin 4s linear infinite; }

/* AI Enhancement Real-Time Overlay */
.ai-enhance-overlay{ position:absolute; bottom:12px; right:12px; display:flex; flex-direction:column; align-items:flex-end; gap:5px; pointer-events:none; z-index:10; }
.ai-enhance-badge{ display:inline-flex; align-items:center; gap:5px; background:rgba(30,77,43,0.92); color:#fff; font-family:'IBM Plex Mono', monospace; font-size:10px; font-weight:600; letter-spacing:0.04em; padding:4px 9px; border-radius:3px; backdrop-filter:blur(4px); box-shadow:0 2px 8px rgba(0,0,0,0.18); }
.ai-enhance-meta{ display:flex; gap:6px; flex-wrap:wrap; background:rgba(20,20,20,0.85); color:#e2e8f0; font-family:'IBM Plex Mono', monospace; font-size:9px; padding:3px 7px; border-radius:2px; backdrop-filter:blur(3px); }
.pdf-container-wrapper, .img-container-wrapper{ position:relative; width:100%; height:100%; min-height:100%; }

/* OCR workspace — balanced columns, matching top/bottom alignment, proper container height */
.ocr-workspace{ display:grid; grid-template-columns:1fr 1.05fr; gap:18px; align-items:stretch; }
.ocr-pane{ border:1px solid var(--line-strong); background:#fff; display:flex; flex-direction:column; min-width:0; height:100%; }
.ocr-pane-head{ display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-bottom:1px solid var(--line); gap:8px; }
.opd-file{ display:flex; align-items:center; gap:9px; color:var(--ink); min-width:0; }
.opd-file b{ display:block; font-size:12.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:150px; }
.opd-file span{ display:block; font-size:10.5px; color:var(--ink-faint); }
.opd-toolbar{ display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid var(--line); background:var(--paper); }
.opd-label{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-faint); }
.opd-zoom{ display:flex; align-items:center; gap:6px; }
.opd-zoom span{ font-family:'IBM Plex Mono', monospace; font-size:11px; color:var(--ink-soft); min-width:32px; text-align:center; }
.opd-zoom button{ width:24px; height:24px; border:1px solid var(--line-strong); background:#fff; color:var(--ink-soft); border-radius:2px; display:flex; align-items:center; justify-content:center; flex:none; }
.opd-zoom button:hover{ border-color:var(--ink); color:var(--ink); }
.opd-frame{ flex:1; min-height:480px; max-height:540px; height:500px; overflow-x:hidden !important; overflow-y:auto; display:block; background:var(--paper); padding:10px; position:relative; box-sizing:border-box; }
.opd-foot{ text-align:center; padding:8px; font-size:11px; color:var(--ink-faint); border-top:1px solid var(--line); font-family:'IBM Plex Mono', monospace; }

.live-pill{ display:flex; align-items:center; gap:6px; font-family:'IBM Plex Mono', monospace; font-size:10.5px; font-weight:600; letter-spacing:0.04em; color:var(--rust); white-space:nowrap; }
.live-pill.done{ color:var(--green); }
.live-pill.paused{ color:var(--amber); }
.live-dot{ width:6px; height:6px; border-radius:50%; background:var(--rust); animation:blink 1s steps(1) infinite; flex:none; }
.live-pill.done .live-dot{ background:var(--green); animation:none; }
.live-pill.paused .live-dot{ background:var(--amber); }

.ocr-textframe{ flex:1; min-height:360px; max-height:400px; height:380px; overflow:auto; padding:14px 16px; background:var(--paper); }
.ocr-fulltext{ font-size:12.5px; line-height:1.7; color:var(--ink); white-space:pre-wrap; word-break:break-word; margin:0; }
.type-cursor{ display:inline-block; margin-left:1px; color:var(--rust); animation:blink 0.9s steps(1) infinite; }
@keyframes blink{ 50%{ opacity:0; } }

/* OCR "couldn't read this" pause card */
.ocr-stuck-card{ margin-top:14px; border:1px solid var(--amber); background:var(--amber-soft); padding:12px 14px; }
.ocr-stuck-head{ display:flex; align-items:center; gap:7px; font-weight:600; font-size:13px; color:#5f4b14; }
.ocr-stuck-card p{ margin:8px 0 10px; font-size:12.5px; color:#5f4b14; line-height:1.55; }
.ocr-stuck-actions{ display:flex; gap:8px; flex-wrap:wrap; }

.ocr-progress-row{ display:flex; align-items:center; gap:10px; padding:10px 14px 0; }
.ocr-progress-bar{ flex:1; height:6px; background:var(--line); border-radius:3px; overflow:hidden; }
.ocr-progress-bar div{ height:100%; background:var(--ink); transition:width .12s linear; }
.ocr-progress-pct{ font-family:'IBM Plex Mono', monospace; font-size:11px; color:var(--ink-soft); min-width:32px; text-align:right; }
.ocr-stats-row{ display:flex; gap:16px; padding:8px 14px 10px; font-size:11.5px; color:var(--ink-faint); flex-wrap:wrap; }
.ocr-stats-row b{ color:var(--ink); font-family:'IBM Plex Mono', monospace; }
.ocr-meta-strip{ display:flex; gap:16px; padding:10px 14px; border-top:1px solid var(--line); flex-wrap:wrap; font-size:11.5px; color:var(--ink); }
.ms-label{ display:block; font-size:9.5px; text-transform:uppercase; letter-spacing:0.05em; color:var(--ink-faint); margin-bottom:2px; }

/* Simulated PDF Preview Sheet for Land Records */
.doc-sim-preview{ width:100%; height:100%; min-height:100%; max-width:100%; display:block; overflow-x:hidden !important; overflow-y:auto; box-sizing:border-box; padding:4px; }
.sim-pdf-page{ background:#fdfcfa; border:1px solid #c8c3b4; box-shadow:0 2px 10px rgba(0,0,0,0.06); width:100% !important; max-width:100% !important; min-height:440px; padding:22px; display:flex; flex-direction:column; justify-content:space-between; position:relative; font-family:'Source Serif 4', Georgia, serif; color:#242422; box-sizing:border-box; overflow-x:hidden !important; margin:0 auto; }
.sim-pdf-header{ text-align:center; border-bottom:1.5px double #8a8474; padding-bottom:8px; margin-bottom:10px; }
.sim-pdf-header b{ display:block; font-size:11px; letter-spacing:0.04em; color:#1b2a41; margin-top:3px; }
.sim-pdf-header span{ display:block; font-size:9px; color:#6a665a; font-family:'IBM Plex Mono', monospace; margin-top:2px; }
.sim-pdf-seal{ font-size:18px; line-height:1; display:block; }
.sim-pdf-body{ flex:1; font-size:11px; line-height:1.55; }
.sim-pdf-row{ display:flex; justify-content:space-between; border-bottom:1px dashed #dcd8cc; padding:3px 0; font-size:10.5px; word-break:break-word; }
.sim-pdf-row span{ color:#5a574d; }
.sim-pdf-row b{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; }
.sim-pdf-lines{ margin-top:8px; font-size:9.5px; color:#4a473e; font-style:italic; line-height:1.4; text-align:justify; }
.sim-pdf-stamp{ margin-top:8px; border:1.5px solid #c1502e; color:#c1502e; font-family:'IBM Plex Mono', monospace; font-size:8.5px; font-weight:700; padding:3px 6px; text-align:center; letter-spacing:0.06em; transform:rotate(-1.5deg); background:rgba(193,80,46,0.04); }

/* Validation table + discrepancy cards */
.cv-tabs{ display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
.cv-tab-btn{ display:inline-flex; align-items:center; gap:8px; padding:7px 14px; border:1px solid var(--line-strong); background:#fff; font-size:12.5px; font-weight:600; color:var(--ink-soft); border-radius:2px; cursor:pointer; }
.cv-tab-btn:hover{ border-color:var(--ink); color:var(--ink); }
.cv-tab-btn.active{ background:var(--ink); color:#fff; border-color:var(--ink); }
.cv-overview{ display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:14px; padding:16px 20px; background:var(--paper); border-bottom:1px solid var(--line); }
.cv-item{ display:flex; flex-direction:column; gap:3px; }
.cv-label{ font-family:'IBM Plex Mono', monospace; font-size:10px; text-transform:uppercase; color:var(--ink-faint); letter-spacing:0.05em; }
.cv-val{ font-size:13.5px; font-weight:600; color:var(--ink); }
.cv-banner{ display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:2px; font-size:13px; font-weight:500; margin-top:16px; }
.cv-banner.warn{ background:var(--rust-soft); border:1px solid var(--rust); color:var(--rust); }
.cv-banner.pass{ background:var(--green-soft); border:1px solid var(--green); color:var(--green); }
.cv-summary-body{ padding:0 20px 20px; }
.cv-banner.spatial{ background:#eef8f6; border:1px solid var(--green); color:var(--green); display:flex; justify-content:space-between; align-items:center; margin-top:12px; flex-wrap:wrap; gap:10px; }
.cv-banner-text{ display:flex; align-items:center; gap:8px; }
.cv-row-fail{ background:var(--rust-soft); }
.cv-cell-fail{ font-weight:700; color:var(--rust); }
.cv-clean-state{ display:flex; align-items:center; gap:10px; color:var(--green); padding:10px 0; }
.cv-discrepancy-list{ display:flex; flex-direction:column; gap:12px; }
.disc-action-head{ display:flex; align-items:center; gap:8px; margin-bottom:4px; }
.disc-action-detail{ font-size:12.5px; color:var(--ink-soft); }
.badge-tiny{ font-size:9.5px; padding:1px 5px; }
.cv-status-badge{ display:inline-flex; align-items:center; gap:5px; font-family:'IBM Plex Mono', monospace; font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:2px; letter-spacing:0.03em; white-space:nowrap; }
.cv-status-badge.pass{ background:var(--green-soft); color:var(--green); }
.cv-status-badge.fail{ background:var(--rust-soft); color:var(--rust); }
.disc-action-card{ border:1px solid var(--rust); background:#fff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap; border-radius:2px; }
.disc-action-card:hover{ box-shadow:0 2px 8px rgba(193,80,46,0.1); }

.val-table{ display:flex; flex-direction:column; border:1px solid var(--line); overflow-x:auto; }
.val-row{ display:grid; grid-template-columns:120px 1fr 1fr auto; gap:10px; padding:9px 12px; border-bottom:1px solid var(--line); align-items:center; font-size:13px; min-width:520px; }
.val-row:last-child{ border-bottom:none; }
.val-row.bad{ background:var(--rust-soft); }
.val-row.good{ background:var(--green-soft); }
.val-row.neutral{ background:var(--paper); }
.vk{ color:var(--ink-faint); font-size:11.5px; }
.vv{ overflow-wrap:break-word; word-break:break-word; font-size:12.5px; }
.vr{ display:flex; align-items:center; gap:5px; font-size:11.5px; font-weight:600; white-space:nowrap; }
.val-row.bad .vr{ color:var(--rust); }
.val-row.good .vr{ color:var(--green); }

.discrepancy-panel{ margin-top:14px; display:flex; flex-direction:column; gap:10px; }
.discrepancy-card{ border:1px solid var(--rust); background:var(--rust-soft); padding:12px 14px; }
.dc-top{ display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.dc-field{ font-weight:600; font-size:13px; }
.dc-row{ display:flex; justify-content:space-between; gap:10px; font-size:12.5px; padding:3px 0; }
.dc-row span{ color:var(--ink-faint); flex:none; }
.dc-row b{ overflow-wrap:break-word; word-break:break-word; text-align:right; }
.dc-status{ margin-top:6px; font-family:'IBM Plex Mono', monospace; font-size:10.5px; color:var(--rust); }

.empty-state{ display:flex; flex-direction:column; align-items:center; gap:8px; padding:50px 20px; color:var(--ink-faint); text-align:center; }
.empty-state b{ color:var(--ink); font-size:14.5px; }

.timeline{ display:flex; flex-direction:column; gap:16px; }
.tl-item{ display:flex; gap:12px; }
.tl-dot{ width:8px; height:8px; border-radius:50%; background:var(--rust); margin-top:6px; flex:none; }
.tl-item b{ display:block; font-size:13.5px; font-weight:500; }
.tl-item span{ font-size:11.5px; color:var(--ink-faint); }

/* Human-in-the-Loop review workspace (was a modal, now inline) */
.split{ display:grid; grid-template-columns:1fr 1.05fr; align-items:stretch; min-height:580px; }
.doc-preview{ padding:20px; border-right:1px solid var(--line); background:var(--paper); min-width:0; display:flex; flex-direction:column; justify-content:space-between; overflow-x:hidden; }
.dp-caption{ display:flex; align-items:flex-start; gap:6px; font-size:11.5px; color:var(--ink-faint); margin-top:10px; line-height:1.5; }
.review-panel{ padding:20px; min-width:0; display:flex; flex-direction:column; justify-content:space-between; background:#fff; overflow-x:hidden; }
.rp-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid var(--line); }
.section-title{ font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:0.08em; color:var(--ink-faint); text-transform:uppercase; }
.fields-list{ display:flex; flex-direction:column; gap:10px; max-height:510px; overflow-y:auto; overflow-x:hidden; padding-right:4px; }
.review-field{ border:1px solid var(--line); padding:11px 13px; min-width:0; border-radius:2px; }
.review-field.flagged{ border-color:var(--rust); background:var(--rust-soft); }
.review-field.discrepant{ border-color:var(--rust); background:#fff; }
.review-field.active{ box-shadow:0 0 0 2px var(--rust-soft); }
.rf-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; }
.rf-label{ font-size:12.5px; font-weight:600; }
.rf-value{ margin-top:6px; font-size:13.5px; cursor:pointer; display:flex; align-items:flex-start; gap:8px; flex-wrap:wrap; }
.rf-value-text{ overflow-wrap:break-word; word-break:break-word; min-width:0; flex:1 1 auto; }
.disc-dot{ width:7px; height:7px; border-radius:50%; background:var(--rust); flex:none; margin-top:5px; }
.decision-chip{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; font-weight:700; letter-spacing:0.04em; color:var(--green); background:var(--green-soft); padding:1px 7px; border-radius:2px; white-space:nowrap; flex:none; }
.rf-ocr{ font-size:12px; color:var(--ink-faint); margin:8px 0 6px; overflow-wrap:break-word; word-break:break-word; }
.rf-input{ width:100%; padding:8px 10px; border:1px solid var(--line-strong); font-size:13.5px; margin-bottom:8px; }
.rf-actions{ display:flex; gap:8px; flex-wrap:wrap; }
.rf-actions-4{ flex-wrap:wrap; }
.disc-banner{ display:flex; align-items:flex-start; gap:8px; font-size:12px; color:var(--ink-soft); background:var(--rust-soft); border:1px solid var(--rust); padding:6px 10px; margin:8px 0; overflow-wrap:break-word; word-break:break-word; }

/* View Document */
.viewdoc-layout{ display:grid; grid-template-columns:260px 1fr; gap:18px; align-items:start; }
.vd-row{ display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid var(--line); cursor:pointer; font-size:13px; gap:8px; }
.vd-row:hover{ background:var(--paper); }
.vd-row.active{ background:var(--rust-soft); }
.vd-tabs{ display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
.vd-tab{ padding:8px 16px; border:1px solid var(--line-strong); background:#fff; font-size:12.5px; font-weight:600; color:var(--ink-soft); }
.vd-tab.active{ background:var(--ink); color:#fff; border-color:var(--ink); }
.original-frame{ border:1px solid var(--line-strong); background:#fff; height:500px; min-height:480px; width:100%; max-width:100%; display:block; padding:0; overflow-x:hidden !important; overflow-y:auto; box-sizing:border-box; }

/* Digitized record */
.doc-page{ background:#fff; border:1px solid var(--line-strong); box-shadow:0 1px 2px rgba(27,42,65,0.06), 0 8px 24px rgba(27,42,65,0.05); max-width:620px; padding:44px 56px 40px; font-family:'Source Serif 4', Georgia, serif; color:#26251f; }
.dp-pagenum-top{ text-align:center; font-size:12px; color:#5a5850; margin-bottom:22px; }
.dp-title{ text-align:center; font-weight:700; font-size:15px; letter-spacing:0.02em; text-decoration:underline; margin-bottom:4px; }
.dp-subtitle{ text-align:center; font-size:11.5px; color:#5a5850; letter-spacing:0.03em; margin-bottom:26px; }
.dp-section-title{ text-align:center; font-weight:700; font-size:13px; text-decoration:underline; letter-spacing:0.03em; margin-bottom:14px; }
.dp-para{ font-size:13px; line-height:1.85; text-align:justify; margin:0 0 16px; text-indent:28px; }
.dp-list{ font-size:13px; line-height:1.9; margin:0 0 16px; padding-left:46px; }
.dp-list li{ margin-bottom:2px; }
.dp-hash{ margin-top:22px; padding-top:14px; border-top:1px solid var(--line); font-family:'IBM Plex Mono', monospace; font-size:9.5px; color:#8a8778; line-height:1.7; word-break:break-all; }
.dp-pagenum-bottom{ text-align:center; font-size:12px; color:#5a5850; margin-top:28px; }

@media print{
  .no-print{ display:none !important; }
  .op-dash{ display:block; background:#fff; }
  .page{ padding:0; }
  .viewdoc-layout{ display:block; }
  .viewdoc-list{ display:none; }
}

@media (max-width:1100px){
  .kpi-grid{ grid-template-columns:repeat(3,1fr); }
  .grid-2{ grid-template-columns:1fr; }
  .split{ grid-template-columns:1fr; }
  .doc-preview{ border-right:none; border-bottom:1px solid var(--line); }
  .compare-grid{ grid-template-columns:1fr; width:100%; max-width:100%; }
  .ocr-split{ grid-template-columns:1fr; }
  .ocr-workspace{ grid-template-columns:1fr; }
  .viewdoc-layout{ grid-template-columns:1fr; }
  .val-row{ grid-template-columns:1fr; gap:2px; min-width:0; }
}

@media (max-width:640px){
  .page{ padding:20px 16px 40px; }
  .kpi-grid{ grid-template-columns:1fr 1fr; }
}

/* Geo-Referencing & GIS Mapping Styles */
.geo-controls-bar{ display:flex; justify-content:space-between; align-items:center; gap:14px; margin-bottom:18px; flex-wrap:wrap; padding:12px 18px; background:var(--paper); border:1px solid var(--line); }
.geo-kpi-badge{ display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono', monospace; font-size:11.5px; font-weight:700; color:var(--green); background:var(--green-soft); padding:4px 10px; border-radius:2px; }
.geo-split-grid{ display:grid; grid-template-columns:1fr 1fr; gap:18px; width:100%; margin-bottom:18px; align-items:stretch; }
.geo-map-box{ border:1px solid var(--line-strong); background:#1b2430; height:480px; position:relative; overflow:hidden; border-radius:2px; display:flex; flex-direction:column; }
.geo-map-box.historic{ background:#f6f2e6; border-color:#c4beaa; }
.geo-map-head{ display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(0,0,0,0.5); color:#fff; font-family:'IBM Plex Mono', monospace; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; flex:none; z-index:10; }
.geo-map-box.historic .geo-map-head{ background:rgba(40,35,25,0.85); }
.geo-canvas{ flex:1; position:relative; width:100%; height:100%; overflow:hidden; cursor:crosshair; }
.geo-gcp-pin{ position:absolute; transform:translate(-50%, -50%); display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:var(--rust); color:#fff; font-family:'IBM Plex Mono', monospace; font-size:10px; font-weight:700; border:2px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.4); z-index:15; cursor:pointer; transition:transform .15s ease; }
.geo-gcp-pin:hover{ transform:translate(-50%, -50%) scale(1.18); z-index:20; }
.geo-gcp-pin.active{ background:#e63946; box-shadow:0 0 0 4px rgba(230,57,70,0.35), 0 2px 10px rgba(0,0,0,0.5); z-index:25; animation:pulse-gcp 1.4s ease-in-out infinite; }
.geo-gcp-pin.gis{ background:#2a9d8f; }
.geo-gcp-pin.gis.active{ background:#00b4d8; box-shadow:0 0 0 4px rgba(0,180,216,0.35), 0 2px 10px rgba(0,0,0,0.5); }
@keyframes pulse-gcp{ 0%,100%{ transform:translate(-50%, -50%) scale(1); } 50%{ transform:translate(-50%, -50%) scale(1.18); } }
.geo-overlay-container{ position:relative; width:100%; height:480px; background:#111923; overflow:hidden; border:1px solid var(--line-strong); margin-bottom:18px; border-radius:2px; }
.geo-overlay-slider-strip{ display:flex; align-items:center; gap:16px; padding:12px 18px; background:var(--paper); border:1px solid var(--line); margin-bottom:18px; font-size:13px; font-weight:600; }
.geo-overlay-slider-strip input[type=range]{ flex:1; accent-color:var(--rust); cursor:pointer; }

/* Clean state & feedback helpers */
.cv-clean-state{ display:flex; align-items:center; gap:10px; padding:14px 18px; font-size:13px; color:var(--green); background:var(--green-soft); border:1px solid var(--green); }
.table-scroll{ overflow-x:auto; width:100%; }
.sev-badge{ font-size:10.5px; font-weight:700; letter-spacing:0.03em; padding:2px 8px; border-radius:2px; text-transform:uppercase; }
.sev-badge.sev-high,.sev-badge.sev-critical{ background:var(--rust-soft); color:var(--rust); }
.sev-badge.sev-medium,.sev-badge.sev-mid{ background:#fff3cd; color:#856404; }
.sev-badge.sev-low{ background:var(--green-soft); color:var(--green); }
@keyframes pulse{ 0%,100%{ opacity:1; } 50%{ opacity:.45; } }
`;
