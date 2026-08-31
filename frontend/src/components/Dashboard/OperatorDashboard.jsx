import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, FileText, UploadCloud, RefreshCw, PencilLine, Send,
  AlertTriangle, History, Settings as SettingsIcon, LogOut, ChevronsLeft, ChevronsRight,
  CheckCircle2, Circle, XCircle, Eye, Printer, MapPin, Sparkles, ChevronRight, ChevronDown,
  X, Search, Loader2, ScanLine, FileCheck2, ImageIcon, ZoomIn, ZoomOut, Maximize2,
  RotateCw, Download, PlayCircle, ShieldCheck, GitCompare, Crosshair, ArrowRight,
  ShieldAlert, ThumbsUp, PencilRuler, Ban, ArrowUpCircle, Compass, Users, BrainCircuit,
  MapPinned, MessageSquareWarning, CropIcon, Globe, Columns, Layers, Box, Network,
  Plus, Trash2
} from 'lucide-react';

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
      { key: 'measurements', label: 'FMB Field Ladder', value: '140m × 110m (Chains: 70 × 55)', confidence: 95 },
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
];

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

function getDocGcps(docId, geoGcpsMap) {
  if (geoGcpsMap && geoGcpsMap[docId] && geoGcpsMap[docId].length > 0) {
    return geoGcpsMap[docId];
  }
  if (INITIAL_GEO_GCPS && INITIAL_GEO_GCPS[docId] && INITIAL_GEO_GCPS[docId].length > 0) {
    return INITIAL_GEO_GCPS[docId];
  }
  const isAnaimalai = docId === 'LR-1028' || docId === 'LR-1014' || docId === 'LR-1023';
  const baseLat = isAnaimalai ? 10.5825 : 10.8242;
  const baseLng = isAnaimalai ? 76.9292 : 77.0132;
  return [
    { id: 'GCP-1', name: 'NW Boundary Stone', srcX: 24, srcY: 26, lat: parseFloat((baseLat + 0.0012).toFixed(4)), long: parseFloat((baseLng - 0.0008).toFixed(4)), error: 0.11 },
    { id: 'GCP-2', name: 'NE Field Corner Marker', srcX: 76, srcY: 24, lat: parseFloat((baseLat + 0.0016).toFixed(4)), long: parseFloat((baseLng + 0.0010).toFixed(4)), error: 0.14 },
    { id: 'GCP-3', name: 'SE Channel Tri-Junction', srcX: 78, srcY: 76, lat: parseFloat((baseLat - 0.0009).toFixed(4)), long: parseFloat((baseLng + 0.0012).toFixed(4)), error: 0.09 },
    { id: 'GCP-4', name: 'SW Pathway Boundary', srcX: 26, srcY: 78, lat: parseFloat((baseLat - 0.0014).toFixed(4)), long: parseFloat((baseLng - 0.0006).toFixed(4)), error: 0.13 },
  ];
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
  eastBoundary: 'Survey 126', westBoundary: 'Survey 124', measurements: '120 ft × 90 ft',
  geometry: 'POLYGON (4 pts)',
};

/* Reference (LRMS) records the validation stage cross-checks against,
   keyed by survey number. Deliberately mismatched for 125/2 so the
   discrepancy / human-review flow has something real to demonstrate. */
const REFERENCE_DB = {
  '125/2': { owner: 'MURUGAN KUMAR', area: '1.8 Acres', village: 'ABC', classification: 'Agricultural', source: 'LRMS-1022' },
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
  const ref = REFERENCE_DB[survey];
  const checks = [];
  const discrepancies = [];
  if (!ref) {
    checks.push({ label: 'Reference record', result: 'NONE', note: 'No matching record found in LRMS for cross-check' });
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
const ENTITY_ALIASES = { 'MURUGAN': 'MURUGAN KUMAR', 'RAVI': 'RAVI KUMAR' };

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

/* full-page OCR text, styled like a real scanned land record extract */
const OCR_FULL_TEXT = `5
LAND RECORD EXTRACT — SURVEY DOCUMENT
KINATHUKADAVU VILLAGE, POLLACHI TALUK

RECORD DETAILS

This record pertains to Survey No. 125/2 situated in the village of
ABC, Pollachi Taluk, Coimbatore District, Tamil Nadu. The land is
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

/* Word index (within OCR_FULL_TEXT) at which the recognizer hits a patch
   it genuinely can't read — used to trigger the "pause and ask for a
   rescan of this region" flow instead of silently guessing. Tied to the
   "2.50 Aores" token, which is a real OCR misread in the source text. */
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

/* deterministic pseudo-random "evidence region" (percent box) for a field,
   so clicking a field can jump to / highlight roughly where it was read
   from on the source document */
function regionFor(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const x = 10 + (h % 55);
  const y = 8 + ((h >> 4) % 78);
  const w = 26 + ((h >> 8) % 20);
  const hgt = 6 + ((h >> 12) % 6);
  return { x, y, w, h: hgt };
}

function genFields(docType, lowKeys) {
  const schema = DOC_TYPE_FIELDS[docType] || DOC_TYPE_FIELDS['Ownership Record'];
  const low = new Set(lowKeys || []);
  return schema.map(f => {
    let value = MOCK_FIELD_VALUES[f.key] || '—';
    let confidence = 90 + Math.floor(Math.random() * 9);
    if (low.has(f.key)) {
      if (f.key === 'area') value = '2.50 Aores';
      confidence = 35 + Math.floor(Math.random() * 30);
    }
    return { key: f.key, label: f.label, value, confidence, region: regionFor(f.key) };
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

/* ---- document preview: shows the REAL uploaded file, not a mock, with an
   optional evidence highlight box for the "jump to source" interaction.
   Frames are portrait by default (documents are taller than they are
   wide), so the image is centered and never stretched sideways. ---- */
function DocPreview({ url, type, filterCss, altLabel, zoom, evidenceRegion, evidenceTone }) {
  if (!url) {
    return (
      <div className="doc-sim-preview">
        <div className="sim-pdf-page" style={{ filter: filterCss || 'none' }}>
          <div className="sim-pdf-header">
            <span className="sim-pdf-seal">🏛️</span>
            <b>GOVERNMENT OF TAMIL NADU — REVENUE DEPARTMENT</b>
            <span>LAND RECORD EXTRACT &amp; SETTLEMENT REGISTER</span>
          </div>
          <div className="sim-pdf-body">
            <div className="sim-pdf-row"><span>Survey Number:</span> <b>125/2</b></div>
            <div className="sim-pdf-row"><span>Sub-Division:</span> <b>2A</b></div>
            <div className="sim-pdf-row"><span>Registered Owner:</span> <b>RAVI KUMAR</b></div>
            <div className="sim-pdf-row"><span>Total Extent:</span> <b>2.50 Aores</b></div>
            <div className="sim-pdf-row"><span>Village / Taluk:</span> <b>ABC / Pollachi</b></div>
            <div className="sim-pdf-row"><span>Classification:</span> <b>Agricultural (Dry)</b></div>
            <div className="sim-pdf-row"><span>Patta / Khata No:</span> <b>458</b></div>
            <div className="sim-pdf-lines">
              <p>Certified that the above particulars are extracted from the permanent digitized land register maintained at the Taluk Office for Coimbatore District under the Modernization Programme.</p>
            </div>
          </div>
          <div className="sim-pdf-stamp">OFFICIAL DIGITIZED COPY · LRMS VERIFICATION</div>
          {evidenceRegion && (
            <div
              className={`evidence-box ${evidenceTone === 'warn' ? 'evidence-box-warn' : ''}`}
              style={{ left: `${evidenceRegion.x}%`, top: `${evidenceRegion.y}%`, width: `${evidenceRegion.w}%`, height: `${evidenceRegion.h}%` }}
            />
          )}
        </div>
      </div>
    );
  }

  const isPdf = type === 'PDF' || (typeof url === 'string' && url.toLowerCase().includes('pdf'));
  const pdfSrc = isPdf ? (url.includes('#') ? url : `${url}#toolbar=0&navpanes=0&view=FitH`) : url;

  return (
    <div className="evidence-frame">
      {isPdf ? (
        <iframe
          src={pdfSrc}
          title={altLabel || 'document'}
          className="doc-embed"
          style={{ filter: filterCss || 'none', width: '100%', height: '100%', minHeight: '460px', border: 'none', display: 'block' }}
        />
      ) : (
        <img
          src={url}
          alt={altLabel || 'document'}
          className="doc-img"
          style={{ filter: filterCss || 'none', width: '100%', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
        />
      )}
      {evidenceRegion && (
        <div
          className={`evidence-box ${evidenceTone === 'warn' ? 'evidence-box-warn' : ''}`}
          style={{ left: `${evidenceRegion.x}%`, top: `${evidenceRegion.y}%`, width: `${evidenceRegion.w}%`, height: `${evidenceRegion.h}%` }}
        />
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

/* Typewriter that can stop mid-stream when it reaches an unreadable
   token, instead of always running to completion. onStuck fires once,
   with the region to highlight, when that token is hit; the stream
   resumes only when the caller flips `running` back on (after the
   operator resolves or dismisses the rescan request). */
function OcrTypewriter({ text, running, onProgress, onComplete, stuckToken, onStuck, resumeToken }) {
  const [shown, setShown] = useState('');
  const doneRef = useRef(false);
  const stuckRef = useRef(false);
  const iRef = useRef(0);
  const wordsShownRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    doneRef.current = false;
    stuckRef.current = false; // always clear on (re)start, including resume-after-pause
    if (resumeToken == null || resumeToken === 0) {
      setShown(''); iRef.current = 0; wordsShownRef.current = 0;
    }
    const words = text.split(/(\s+)/);
    const totalWords = text.split(/\s+/).filter(Boolean).length;

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
  }, [running, text, resumeToken]);

  return (
    <pre className="ocr-fulltext mono">
      {shown}
      {running && <span className="type-cursor">▍</span>}
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
  const a = pseudoHex(`${doc.id}|${doc.owner || ''}|${doc.survey || ''}`);
  const b = pseudoHex(`${doc.village || ''}|${doc.id}`);
  const c = pseudoHex(`${doc.area || ''}|${doc.taluk || ''}`);
  return (a + b + c).slice(0, 64);
}
function auditRef(doc) {
  const digits = parseInt(String(doc.id).replace(/\D/g, ''), 10) || 0;
  return 'AUD-2026-' + String(10000 + (digits % 90000)).padStart(5, '0');
}
function todayStr() {
  const d = new Date();
  return String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
}
function fileSizeLabel(doc) {
  if (doc.fileSizeMb) return `${doc.fileSizeMb} MB`;
  return '1.24 MB';
}
function pageCountFor(doc) {
  if (doc.pageCount) return doc.pageCount;
  const digits = parseInt(String(doc?.id || '0').replace(/\D/g, ''), 10) || 0;
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
    setGeoGcpsByDoc(prev => ({
      ...prev,
      [geoDocId]: [...(prev[geoDocId] || []), newGcp],
    }));
    setActiveGcpId(newGcp.id);
    addToast(`Added control point ${newGcp.id} to ${geoDocId}.`, 'info');
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
  }

  function handleSaveGeoRef() {
    const list = geoGcpsByDoc[geoDocId] || [];
    const rms = Math.sqrt(list.reduce((s, g) => s + (parseFloat(g.error) || 0) ** 2, 0) / (list.length || 1));
    pushActivity(`Geo-referenced ${geoDocId} (${list.length} GCPs registered, RMS Error: ${rms.toFixed(2)}m)`);
    addToast(`Geo-referencing complete for ${geoDocId}! GIS GeoTIFF & Shapefile exported.`, 'success');
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
    setPipeline({
      docId: id, stage: 'preprocessing', preSteps: [],
      ocrRunning: false, ocrWords: 0, ocrTotalWords: 0, ocrLines: 0, ocrStartedAt: null, ocrElapsed: 0,
      ocrResumeCount: 0, ocrStuck: false,
      fields: [], valChecks: [], discrepancies: [], hasReference: false,
    });
    setZoom(100);
    setEvidenceKey(null);
    setSectionOpen({ enhance: true, ocr: false, extract: false });

    PREPROCESS_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setPipeline(p => (p && p.docId === id) ? { ...p, preSteps: [...p.preSteps, step] } : p);
      }, 350 * (i + 1));
    });

    const t1 = 350 * PREPROCESS_STEPS.length + 300;
    setTimeout(() => {
      setPipeline(p => (p && p.docId === id) ? { ...p, stage: 'preprocess-ready' } : p);
      setDocs(ds => ds.map(d => d.id === id ? { ...d, status: 'preprocess-ready' } : d));
      pushActivity(`Image enhancement complete for ${id} — ready for OCR`);
    }, t1);
  }

  /* ---- Stage 2: operator clicks "Proceed to OCR" ---- */
  function startOcr(id) {
    setPipeline(p => (p && p.docId === id) ? {
      ...p, stage: 'ocr', ocrRunning: true, ocrWords: 0,
      ocrTotalWords: OCR_FULL_TEXT.split(/\s+/).filter(Boolean).length,
      ocrLines: OCR_FULL_TEXT.split('\n').filter(l => l.trim()).length,
      ocrStartedAt: Date.now(), ocrElapsed: 0, ocrResumeCount: 0, ocrStuck: false,
    } : p);
    setDocs(ds => ds.map(d => d.id === id ? { ...d, status: 'ocr' } : d));
    pushActivity(`OCR started for ${id}`);
    /* enhancement is done — collapse it and open the OCR accordion */
    setSectionOpen(s => ({ ...s, enhance: false, ocr: true }));

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
    const doc = docs.find(d => d.id === id);
    const type = doc?.docType || 'Ownership Record';
    const forceLow = id === 'LR-1021' || id === 'LR-1023' ? ['area'] : [];
    const fields = genFields(type, forceLow);
    setPipeline(p => (p && p.docId === id) ? { ...p, stage: 'extraction', fields } : p);
    setDocs(ds => ds.map(d => d.id === id ? { ...d, status: 'extraction' } : d));
    pushActivity(`Fields extracted for ${id} (${type})`);
    /* OCR is done — collapse it and open the Text Extraction accordion */
    setSectionOpen(s => ({ ...s, ocr: false, extract: true }));
  }

  /* ---- Stage 4: Normalization & Entity Resolution ---- */
  function startNormalization(id) {
    setPipeline(p => (p && p.docId === id) ? { ...p, stage: 'normalizing', fields: normalizeFields(p.fields) } : p);
    setDocs(ds => ds.map(d => d.id === id ? { ...d, status: 'normalizing' } : d));
    pushActivity(`Normalized fields for ${id} — resolved entities & standardized formats`);
    setSectionOpen(s => ({ ...s, extract: false, normalize: true }));
  }

  /* ---- Stage 5: operator clicks "Run Validation" — navigates to the
     Validation page and compares against the reference database (LRMS),
     producing discrepancy records there. Nothing about validation is
     displayed back on the Processing page. ---- */
  function startValidation(id) {
    setPipeline(p => (p && p.docId === id) ? { ...p, stage: 'validating' } : p);
    setDocs(ds => ds.map(d => d.id === id ? { ...d, status: 'validating' } : d));
    pushActivity(`Cross-checking ${id} against reference records…`);
    /* normalization is done — collapse that accordion too */
    setSectionOpen(s => ({ ...s, extract: false, normalize: false }));

    setTimeout(() => {
      setPipeline(p => {
        if (!p || p.docId !== id) return p;
        const doc = docs.find(d => d.id === id);
        const byKey = {}; p.fields.forEach(f => { byKey[f.key] = f.value; });
        const survey = byKey.survey;
        const { checks, discrepancies, hasReference } = validateAgainstReference(p.fields, survey);
        const lowConfField = p.fields.some(f => f.confidence < 75);
        const needsReview = lowConfField || discrepancies.length > 0;
        const fieldsWithDisc = p.fields.map(f => ({
          ...f, discrepancy: discrepancies.find(d => d.field === f.key) || null,
        }));

        const finalStatus = needsReview ? 'review' : 'submitted';
        const conf = Math.min(...p.fields.map(f => f.confidence));

        setDocs(ds => ds.map(d => d.id === id ? {
          ...d,
          status: finalStatus,
          confidence: conf,
          owner: byKey.owner || byKey.buyer || byKey.newOwner || d.owner,
          survey: byKey.survey || d.survey, area: byKey.area || d.area, village: byKey.village || d.village,
          khata: byKey.patta, classification: byKey.classification,
          fields: fieldsWithDisc, ocrText: OCR_FULL_TEXT,
          discrepancies, valChecks: checks, hasReference,
        } : d));

        /* Auto-submit validated (no-discrepancy) docs */
        if (!needsReview) {
          setSubmitted(s => {
            if (s.some(r => r.id === id)) return s;
            return [...s, { id, survey: byKey.survey, village: byKey.village, confidence: conf }];
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

  function handleStartProcessing(e) {
    e.preventDefault();
    if (!selectedFile) { addToast('Please select a file first.'); return; }
    const id = 'LR-' + (1029 + Math.floor(Math.random() * 900));
    const isPdf = selectedFile.type.includes('pdf');
    const imageUrl = URL.createObjectURL(selectedFile);
    const newDoc = {
      id, type: isPdf ? 'PDF' : 'Image', docType, village: '—', taluk: '—',
      status: 'preprocessing', confidence: null, owner: '—', survey: '—', area: '—',
      imageUrl, fileName: selectedFile.name, fileSizeMb: (selectedFile.size / 1024 / 1024).toFixed(2),
    };
    setDocs(d => [newDoc, ...d]);
    pushActivity(`Uploaded ${id} (${selectedFile.name})`);
    addToast(`${id} uploaded — AI pipeline started.`);
    setActiveTab('processing');
    setSelectedFile(null);
    setUploadStep('select');
    runPipeline(id);
  }

  function openReview(doc) {
    if (!doc) return;
    const baseFields = (doc.fields && doc.fields.length > 0)
      ? doc.fields
      : genFields(doc.docType || 'Ownership Record', true);

    const discMap = {};
    (doc.discrepancies || []).forEach(d => {
      discMap[d.field] = d;
    });

    const enrichedFields = baseFields.map(f => {
      const disc = discMap[f.key] || f.discrepancy || null;
      const isResolved = (f.confidence >= 75 && !disc) || f.resolved === true;
      return {
        ...f,
        discrepancy: disc,
        resolved: isResolved,
        decision: f.decision || null,
      };
    });

    setLocalFields(enrichedFields);
    setReviewDoc(doc);
    const firstIssue = enrichedFields.find(f => !f.resolved);
    setActiveFieldKey(firstIssue ? firstIssue.key : (enrichedFields[0]?.key || null));
    if (firstIssue) setDraftValue(firstIssue.value);
  }

  /* Resolving a document is a Human-in-the-Loop process, not a popup —
     this opens the record for review AND takes the operator to the
     Human-in-the-Loop page where the actual review workspace lives. */
  function goToReview(doc) {
    openReview(doc);
    setActiveTab('review');
  }

  function advanceAfter(key) {
    const next = localFields.find(f => f.key !== key && !f.resolved);
    setActiveFieldKey(next ? next.key : null);
    if (next) setDraftValue(next.value);
  }

  function confirmField(key) {
    setLocalFields(fs => fs.map(f => f.key === key ? { ...f, resolved: true } : f));
    advanceAfter(key);
  }

  function saveCorrection(key) {
    setLocalFields(fs => fs.map(f => f.key === key ? { ...f, value: draftValue, confidence: 99, resolved: true, decision: 'CORRECTED' } : f));
    advanceAfter(key);
  }

  /* discrepant-field decisions: approve (keep AI value), correct (edit),
     reject, escalate — matches the officer verification console spec */
  function decideField(key, decision) {
    if (decision === 'correct') {
      setLocalFields(fs => fs.map(f => f.key === key ? { ...f, value: draftValue, confidence: 99, resolved: true, decision: 'CORRECTED' } : f));
    } else {
      const label = { approve: 'APPROVED', reject: 'REJECTED', escalate: 'ESCALATED' }[decision];
      setLocalFields(fs => fs.map(f => f.key === key ? { ...f, resolved: true, decision: label } : f));
    }
    advanceAfter(key);
  }

  function submitReview() {
    if (!reviewDoc) return;
    const byKey = {};
    localFields.forEach(f => { byKey[f.key] = f.value; });
    const conf = Math.max(95, ...localFields.map(f => f.confidence || 95));

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
    return (
      <>
        <PageHead title={`Good Morning, ${userName} 👋`} sub="Here's today's digitization activity." />
        <div className="kpi-grid">
          <KPI label="Uploaded Today" val={counts.uploaded} icon={UploadCloud} />
          <KPI label="In AI Pipeline" val={counts.inProgress} icon={RefreshCw} />
          <KPI label="Needs Review" val={counts.review} icon={PencilLine} tone="rust" />
          <KPI label="Submitted" val={counts.submitted} icon={Send} tone="green" />
          <KPI label="Completion" val={pct + '%'} icon={FileCheck2} progress={pct} />
        </div>
        <div className="grid-2">
          <div className="panel">
            <div className="panel-head"><h3>PROCESSING PIPELINE</h3></div>
            <div className="panel-body">
              <div className="stage-row">
                <Stage n={counts.uploaded} label="Uploaded" />
                <StageArrow />
                <Stage n={counts.inProgress} label="AI Processing" />
                <StageArrow />
                <Stage n={counts.review} label="Needs Review" />
                <StageArrow />
                <Stage n={counts.submitted} label="Submitted" />
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head"><h3>QUICK ACTIONS</h3></div>
            <div className="panel-body quick-actions">
              <button className="qa-btn" onClick={() => setActiveTab('upload')}><UploadCloud size={17} /> Upload New Record</button>
              <button className="qa-btn" onClick={() => setActiveTab('review')}><PencilLine size={17} /> Review Extraction</button>
              <button className="qa-btn" onClick={() => setActiveTab('viewdoc')}><Eye size={17} /> View a Document</button>
            </div>
          </div>
        </div>
      </>
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
    const live = pipeline;
    const liveDoc = live ? docs.find(d => d.id === live.docId) : null;
    const imageUrl = liveDoc?.imageUrl;
    const fileType = liveDoc?.type;
    const otherProcessing = docs.filter(d => ['preprocessing', 'preprocess-ready', 'ocr', 'ocr-paused', 'ocr-ready', 'extraction', 'normalizing', 'validating'].includes(d.status) && d.id !== live?.docId);
    const activeRegion = evidenceKey ? live?.fields?.find(f => f.key === evidenceKey)?.region : null;

    return (
      <>
        <PageHead title="Processing" sub="Documents currently going through the AI pipeline." />

        {live && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-head"><h3>DOCUMENT {live.docId}</h3><StatusBadge status={live.stage} /></div>
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
                  {live.stage === 'preprocessing' && live.preSteps.length < PREPROCESS_STEPS.length && <span className="muted-inline">— running…</span>}
                  {live.stage !== 'preprocessing' && <span className="muted-inline">— complete</span>}
                  <span className="pipe-toggle-ic">{sectionOpen.enhance ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                </button>
                {sectionOpen.enhance && (
                  <>
                    <div className="compare-grid">
                      <div className="compare-col">
                        <span className="compare-tag">Original scan</span>
                        <div className="compare-frame">
                          <DocPreview url={imageUrl} type={fileType} filterCss={RAW_SCAN_FILTER} altLabel="original document" />
                        </div>
                      </div>
                      <div className="compare-col">
                        <span className="compare-tag">Enhanced ({live.preSteps.length}/{PREPROCESS_STEPS.length} steps)</span>
                        <div className="compare-frame">
                          <DocPreview url={imageUrl} type={fileType} filterCss={enhanceFilter(live.preSteps.length)} altLabel="enhanced document" />
                        </div>
                      </div>
                    </div>
                    <div className="checklist">
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
                        <div className="check-step active"><div className="c-dot"><Loader2 size={14} className="spin" /></div><span>Preparing for OCR…</span></div>
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
                    <span className="muted-inline">— {live.stage === 'ocr' ? 'running…' : live.stage === 'ocr-paused' ? 'paused' : 'complete'}</span>
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
                        <span className="compare-tag"><Crosshair size={11} /> Source document {evidenceKey ? '— jumped to field' : ''}</span>
                        <div className="compare-frame compare-frame-tall">
                          <DocPreview url={imageUrl} type={fileType} filterCss={enhanceFilter(PREPROCESS_STEPS.length)} altLabel="source document" evidenceRegion={activeRegion} />
                        </div>
                      </div>
                      <div className="compare-col">
                        <span className="compare-tag">Structured fields — click a field to locate it</span>
                        <div className="fields-table">
                          {live.fields.map(f => (
                            <div key={f.key} className={`fields-row clickable ${evidenceKey === f.key ? 'active' : ''}`} onClick={() => setEvidenceKey(f.key)}>
                              <span className="fk">{f.label}</span>
                              <span className="fv mono">{f.value}</span>
                              <span className={`conf ${confClass(f.confidence)}`}>{f.confidence}% {f.confidence >= 75 ? '✓' : '⚠'}</span>
                            </div>
                          ))}
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
            <div className="panel-head"><h3>DOCUMENT {d.id}</h3><StatusBadge status={d.status} /></div>
            <div className="panel-body"><span className="muted">Working through the AI pipeline…</span></div>
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
          <thead><tr><th>Document</th><th>Type</th><th>Village</th><th>Status</th><th>Confidence</th>{withAction && <th></th>}</tr></thead>
          <tbody>
            {ds.map(d => (
              <tr key={d.id}>
                <td className="mono"><b>{d.id}</b></td><td>{d.type}</td><td>{d.village}</td><td><StatusBadge status={d.status} /></td>
                <td>{d.confidence != null ? <span className={`conf ${confClass(d.confidence)}`}>{d.confidence}%</span> : '—'}</td>
                {withAction && (
                  <td>
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
    if (!reviewDoc || reviewDoc.id !== currentDoc.id) {
      openReview(currentDoc);
    }

    return renderReviewWorkspace(list);
  }

  /* the actual resolve workspace — was a modal, now lives inline on the
     Human-in-the-Loop page since resolving IS that process. */
  function renderReviewWorkspace(reviewList = []) {
    if (!reviewDoc) return null;
    const allResolved = localFields.length > 0 && localFields.every(f => f.resolved);
    const verifiedCount = localFields.filter(f => f.resolved).length;
    const candidates = reviewList.length > 0 ? reviewList : docs.filter(d => d.status === 'review');

    return (
      <>
        <PageHead
          title={`Review Extraction · ${reviewDoc.id}`}
          sub="Confirm correct fields, resolve flagged discrepancies."
          rightBtn={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setEgDocId(reviewDoc.id); setActiveTab('evidencegraph'); }}
              >
                <Network size={14} /> Evidence Graph →
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setTwinDocId(reviewDoc.id); setActiveTab('digitaltwin'); }}
              >
                <Box size={14} /> Digital Twin →
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setSelectedValDocId(reviewDoc.id); setActiveTab('validation'); }}
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
                className={`cv-tab-btn ${reviewDoc.id === d.id ? 'active' : ''}`}
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
                  <span className="muted" style={{ fontSize: 11.5 }}>{reviewDoc.type || reviewDoc.docType} Scan · Page 1</span>
                </div>
                <div className="compare-frame compare-frame-tall" style={{ flex: 1, minHeight: 480 }}>
                  <DocPreview
                    url={reviewDoc.imageUrl} type={reviewDoc.type}
                    filterCss={enhanceFilter(PREPROCESS_STEPS.length)} altLabel="document under review"
                    evidenceRegion={localFields.find(f => f.key === activeFieldKey)?.region}
                  />
                </div>
                <span className="dp-caption"><ImageIcon size={12} /> Original document — active field region is highlighted above</span>
              </div>

              <div className="review-panel">
                <div className="rp-head">
                  <h4 className="section-title" style={{ margin: 0 }}>Extracted Information</h4>
                  <span className="muted" style={{ fontSize: 11.5 }}>
                    {verifiedCount}/{localFields.length} fields verified
                  </span>
                </div>
                <div className="fields-list">
                  {localFields.map(f => (
                    <div key={f.key} className={`review-field ${activeFieldKey === f.key ? 'active' : ''} ${f.resolved ? 'resolved' : (f.discrepancy ? 'discrepant' : 'flagged')}`}>
                      <div className="rf-top">
                        <span className="rf-label">{f.label}</span>
                        <span className={`conf ${confClass(f.confidence)}`}>{f.confidence}% {f.resolved ? '✓' : '⚠'}</span>
                      </div>

                      {activeFieldKey === f.key ? (
                        f.discrepancy ? (
                          <>
                            <div className="disc-banner">
                              <span className={`sev-badge ${sevClass(f.discrepancy.severity)}`}>{f.discrepancy.severity}</span>
                              <span>Reference ({f.discrepancy.source || 'LRMS Register'}): <b className="mono">{f.discrepancy.referenceValue}</b></span>
                            </div>
                            <div className="rf-ocr">Document value: <span className="mono">{f.value}</span></div>
                            <input className="rf-input" value={draftValue} onChange={e => setDraftValue(e.target.value)} />
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
                            <input className="rf-input" value={draftValue} onChange={e => setDraftValue(e.target.value)} />
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
              {isPipeline && d.id === activeId && <span className="badge badge-ink badge-tiny" style={{ animation: 'pulse 1.5s infinite' }}>● Current</span>}
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
              <span className={`cv-val conf ${confClass(confidenceScore)}`}>{confidenceScore}% {confidenceScore >= 75 ? '✓' : '⚠'}</span>
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
            Tolerance: ±{AREA_TOLERANCE_ACRES} Acres for area · Strict string match for titles
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
                      <td><span className={`conf ${confClass(fConf)}`}>{fConf}% {fConf >= 75 ? '✓' : '⚠'}</span></td>
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

    const currentGcps = getDocGcps(doc?.id, geoGcpsByDoc);
    const activeGcp = currentGcps.find(g => g.id === activeGcpId) || currentGcps[0];
    const rms = Math.sqrt(currentGcps.reduce((s, g) => s + (parseFloat(g.error) || 0) ** 2, 0) / (currentGcps.length || 1));

    function placeOnOldMap(x, y) {
      if (!activeGcpId) return;
      setGeoGcpsByDoc(prev => {
        const list = getDocGcps(doc.id, prev);
        const updated = list.map(g => g.id === activeGcpId ? { ...g, srcX: x, srcY: y } : g);
        return { ...prev, [doc.id]: updated };
      });
      const idx = currentGcps.findIndex(g => g.id === activeGcpId);
      addToast(`Updated GCP #${idx >= 0 ? idx + 1 : 1} scan coordinates: (${x}%, ${y}%)`, 'info');
    }

    function placeOnRealMap(lat, long) {
      if (!activeGcpId) return;
      setGeoGcpsByDoc(prev => {
        const list = getDocGcps(doc.id, prev);
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
                              ±{gcp.error} m
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
              <div className="vd-tabs no-print">
                <button className={`vd-tab ${viewTab === 'digitized' ? 'active' : ''}`} onClick={() => setViewTab('digitized')}>Digitized Record</button>
                <button className={`vd-tab ${viewTab === 'original' ? 'active' : ''}`} onClick={() => setViewTab('original')}>Original Document</button>
              </div>

              {viewTab === 'original' ? (
                <div className="original-frame">
                  <DocPreview url={doc.imageUrl} type={doc.type} filterCss={enhanceFilter(PREPROCESS_STEPS.length)} altLabel="original document" />
                </div>
              ) : (
                <DigitizedPage doc={doc} />
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

    const gcpSet = getDocGcps(doc.id, geoGcpsByDoc);
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
                  <span className={`conf ${confClass(f.confidence)}`}>{f.confidence}% {f.confidence >= 75 ? '✓' : '⚠'}</span>
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
                    <span className={`conf ${g.error <= 0.15 ? 'high' : 'mid'}`}>±{g.error}m</span>
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
    const candidateDocs = docs.filter(d => d.status !== 'validated' && d.status !== 'submitted');
    const activeId = candidateDocs.some(d => d.id === egDocId) ? egDocId : candidateDocs[0]?.id;
    const egDoc = docs.find(d => d.id === activeId);

    if (!egDoc || candidateDocs.length === 0) {
      return (
        <>
          <PageHead
            title="Evidence &amp; Knowledge Graph"
            sub="Cross-document relationships between owners, survey parcels, mutation events, and official records."
          />
          <EmptyState
            icon={CheckCircle2}
            title="No Active Records in Review"
            sub="All document relations and provenance chains have been verified and submitted."
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

  /* ---------------------------------------------------------------------
     LAYOUT
     --------------------------------------------------------------------- */

  return (
    <div className="op-dash">
      <style>{CSS}</style>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} no-print`}>
        <div className="sb-top">
          <div className="brand">
            <div className="brand-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 20V10L12 4L20 10V20" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 20V14H15V20" stroke="white" strokeWidth="1.8" />
              </svg>
            </div>
            {!collapsed && <span className="brand-name">Land<em>Intel</em></span>}
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
            <span className="tb-title">LandIntel</span>
            <span className="tb-chip">Operator</span>
          </div>
          <div className="tb-right">
            <div className="tb-search"><Search size={14} /><input placeholder="Search records…" /></div>
            <div className="tb-user"><MapPin size={13} /> {userName}</div>
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
  const imgSrc = doc?.imageUrl || (doc?.survey === '118/3' || doc?.id === 'LR-1028' ? '/cadastral_map_118_3.jpg' : '/cadastral_map_125_2.jpg');

  function handleClick(e) {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onPlacePoint(x, y);
  }

  return (
    <div
      className="compare-frame compare-frame-tall"
      ref={frameRef}
      onClick={handleClick}
      style={{
        position: 'relative',
        cursor: 'crosshair',
        height: '100%',
        minHeight: 480,
        overflow: 'hidden',
        background: '#231d15',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--line-strong)',
      }}
    >
      <img
        src={imgSrc}
        alt={`Historical Cadastral Map - Survey ${doc?.survey || '125/2'}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
          filter: enhanceFilter(PREPROCESS_STEPS.length),
        }}
      />
      {gcps.map((g, i) => (
        <div
          key={g.id}
          onClick={(e) => { e.stopPropagation(); onSelectGcp(g.id); }}
          className={`gcp-pin ${g.id === activeGcpId ? 'active' : ''}`}
          title={`${g.name || `GCP #${i + 1}`}: (${g.srcX}%, ${g.srcY}%)`}
          style={{
            position: 'absolute',
            left: `${g.srcX}%`,
            top: `${g.srcY}%`,
            width: 26,
            height: 26,
            marginLeft: -13,
            marginTop: -13,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: g.id === activeGcpId ? '#D85A30' : '#1B2A41',
            color: '#fff',
            fontSize: 11.5,
            fontWeight: 700,
            cursor: 'pointer',
            border: '2px solid #fff',
            boxShadow: g.id === activeGcpId ? '0 0 0 4px rgba(216,90,48,0.35), 0 2px 10px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: g.id === activeGcpId ? 25 : 15,
            transition: 'transform 0.15s ease',
          }}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}

function GeoRealMapPane({ doc, gcps, activeGcpId, onSelectGcp, onPlacePoint, leafletReady }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  const isReady = leafletReady || (typeof window !== 'undefined' && !!window.L);

  useEffect(() => {
    if (!isReady || !mapDivRef.current || mapRef.current) return;
    const L = window.L;
    if (!L) return;

    try {
      if (mapDivRef.current._leaflet_id) {
        delete mapDivRef.current._leaflet_id;
      }

      const isAnaimalai = doc?.id === 'LR-1028' || doc?.id === 'LR-1014' || doc?.survey === '118/3';
      const initialLat = isAnaimalai ? 10.5825 : 10.8240;
      const initialLng = isAnaimalai ? 76.9292 : 77.0130;

      const map = L.map(mapDivRef.current, {
        center: [gcps[0]?.lat || initialLat, gcps[0]?.long || initialLng],
        zoom: 17,
        zoomControl: true,
      });

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const bhuvan = L.tileLayer.wms('https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms', {
        layers: 'bhuvan:india3',
        format: 'image/png',
        transparent: false,
        attribution: '© ISRO/NRSC Bhuvan',
      });

      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
      });

      L.control.layers(
        { 'OpenStreetMap (Base)': osm, 'Bhuvan (ISRO WMS)': bhuvan, 'Satellite Hybrid': satellite },
        null,
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

  // Pan map when doc or gcps change
  useEffect(() => {
    if (!mapRef.current || !gcps || gcps.length === 0) return;
    const targetLat = gcps[0]?.lat;
    const targetLng = gcps[0]?.long;
    if (targetLat && targetLng) {
      mapRef.current.setView([targetLat, targetLng], 17, { animate: true });
    }
  }, [doc?.id]);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    Object.values(markersRef.current).forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = {};
    gcps.forEach((g, i) => {
      const marker = L.marker([g.lat, g.long], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:${g.id === activeGcpId ? '#D85A30' : '#1B2A41'};color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid #fff;box-shadow:${g.id === activeGcpId ? '0 0 0 4px rgba(216,90,48,0.35), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.3)'};transform:translate(-50%,-50%);">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(mapRef.current);
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectGcp(g.id);
      });
      markersRef.current[g.id] = marker;
    });
  }, [gcps, activeGcpId]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480, position: 'relative' }}>
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1b2430', color: '#fff', borderRadius: 4, zIndex: 5 }}>
          <Loader2 size={20} className="spin" style={{ marginRight: 8 }} /> Loading GIS Engine (Leaflet &amp; ISRO Bhuvan)...
        </div>
      )}
      <div ref={mapDivRef} style={{ width: '100%', height: '100%', minHeight: 480, borderRadius: 4, border: '1px solid var(--line-strong)' }} />
    </div>
  );
}

/* =========================================================================
   EVIDENCE GRAPH (D3.JS FORCE DIRECTED KNOWLEDGE GRAPH)
   ========================================================================= */

function buildEvidenceGraph(docsList, targetDocId) {
  const nodes = new Map(), rawLinks = [];
  const addNode = (id, type, label, extra = {}) => {
    if (!nodes.has(id)) nodes.set(id, { id, type, label, ...extra });
  };

  const target = (docsList || []).find(d => d.id === targetDocId) || (docsList || [])[0];
  if (!target) return { nodes: [], links: [], isSingleDoc: true };

  const d = target;
  const docNode = `doc:${d.id}`;
  addNode(docNode, 'document', d.id, { docType: d.docType, status: d.status, survey: d.survey, docId: d.id, isSelected: true });

  // 1. Registered Owner
  if (d.owner && d.owner !== '—') {
    const ownerNode = `owner:${d.owner}`;
    addNode(ownerNode, 'owner', d.owner);
    rawLinks.push({ source: docNode, target: ownerNode, relation: 'registered_to', label: 'registered owner' });
  }

  // 2. Survey Parcel & Village
  if (d.survey && d.survey !== '—') {
    const surveyNode = `survey:${d.survey}`;
    addNode(surveyNode, 'survey', `Sy. ${d.survey}`, { survey: d.survey });
    rawLinks.push({ source: docNode, target: surveyNode, relation: 'contains', label: 'parcel' });
    if (d.village && d.village !== '—') {
      const villageNode = `village:${d.village}`;
      addNode(villageNode, 'village', d.village);
      rawLinks.push({ source: surveyNode, target: villageNode, relation: 'located_in', label: 'village' });
    }
  }

  // 3. Extent / Area
  if (d.area && d.area !== '—') {
    const areaNode = `area:${d.id}`;
    addNode(areaNode, 'area', `Extent: ${d.area}`, { area: d.area });
    rawLinks.push({ source: docNode, target: areaNode, relation: 'measures', label: 'extent' });
  }

  // 4. Reference DB / Canonical Register
  const refDbNode = `ref:LRMS`;
  addNode(refDbNode, 'reference', 'LRMS Reference Register', { db: 'Tamil Nadu Revenue DB' });
  rawLinks.push({ source: docNode, target: refDbNode, relation: 'verified_against', label: 'verified against' });

  // 5. Transfer parties from this document's extracted fields
  (d.fields || []).forEach(f => {
    if (f.key === 'prevOwner' && f.value && f.value !== '—' && f.value !== d.owner) {
      const prevOwnerNode = `owner:${f.value}`;
      addNode(prevOwnerNode, 'owner', f.value);
      rawLinks.push({ source: prevOwnerNode, target: docNode, relation: 'transferred_from', label: 'transferor' });
    }
    if (f.key === 'newOwner' && f.value && f.value !== '—' && f.value !== d.owner) {
      const newOwnerNode = `owner:${f.value}`;
      addNode(newOwnerNode, 'owner', f.value);
      rawLinks.push({ source: docNode, target: newOwnerNode, relation: 'transferred_to', label: 'transferee' });
    }
    if (f.key === 'seller' && f.value && f.value !== '—' && f.value !== d.owner) {
      const sellerNode = `owner:${f.value}`;
      addNode(sellerNode, 'owner', f.value);
      rawLinks.push({ source: sellerNode, target: docNode, relation: 'transferred_from', label: 'vendor' });
    }
    if (f.key === 'buyer' && f.value && f.value !== '—' && f.value !== d.owner) {
      const buyerNode = `owner:${f.value}`;
      addNode(buyerNode, 'owner', f.value);
      rawLinks.push({ source: docNode, target: buyerNode, relation: 'transferred_to', label: 'purchaser' });
    }
  });

  // 6. Discrepancy flags attached to this parcel
  if (d.discrepancies && d.discrepancies.length > 0) {
    d.discrepancies.forEach(disc => {
      const discNode = `disc:${d.id}:${disc.field}`;
      addNode(discNode, 'discrepancy', `⚠️ ${disc.label} (${disc.documentValue} vs ${disc.referenceValue})`, { docId: d.id, severity: disc.severity });
      rawLinks.push({ source: docNode, target: discNode, relation: 'flagged_discrepancy', label: 'discrepancy' });
    });
  }

  const nodeMap = new Set(nodes.keys());
  const links = rawLinks.filter(l => nodeMap.has(l.source) && nodeMap.has(l.target));

  return { nodes: Array.from(nodes.values()), links, isSingleDoc: true, targetDoc: d };
}

/* ---- Entity icons — distinguishes node types beyond color; owners get
   a gender-inferred emoji, institutional "owners" (govt depts) get a
   building icon instead. ---- */
const KNOWN_OWNER_GENDER = {
  'MEENA R': 'female', 'MEENA': 'female',
  'DEEPA N': 'female', 'DEEPA': 'female',
  'KARTHIK S': 'male', 'KARTHIK': 'male',
  'RAVI KUMAR': 'male', 'RAVI': 'male',
  'MURUGAN KUMAR': 'male', 'MURUGAN': 'male',
};

function guessOwnerGender(name) {
  if (!name) return 'unknown';
  const key = name.trim().toUpperCase();
  if (KNOWN_OWNER_GENDER[key]) return KNOWN_OWNER_GENDER[key];
  const firstName = key.split(' ')[0];
  if (/[AEIOU]$/.test(firstName) && firstName.length > 2) return 'female';
  return 'male';
}

function iconForNode(n) {
  if (n.type === 'owner') {
    const isInstitution = /DEPT|DEPARTMENT|GOVT|GOVERNMENT|CORPORATION|BOARD|OFFICE/.test((n.label || '').toUpperCase());
    if (isInstitution) return '🏛️';
    return guessOwnerGender(n.label) === 'female' ? '👩' : '👨';
  }
  if (n.type === 'document') {
    const dt = (n.docType || '').toLowerCase();
    if (dt.includes('cadastral')) return '🗺️';
    if (dt.includes('mutation')) return '🔄';
    if (dt.includes('sale')) return '📝';
    return '📜';
  }
  if (n.type === 'survey') return '📍';
  if (n.type === 'village') return '🏘️';
  if (n.type === 'area') return '📐';
  if (n.type === 'reference') return '🏛️';
  if (n.type === 'discrepancy') return '⚠️';
  return '●';
}

function EvidenceGraphPane({ docsList, targetDocId, d3Ready, onSelectDoc }) {
  const [layout, setLayout] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    const { nodes, links } = buildEvidenceGraph(docsList, targetDocId);
    const baseW = 920, baseH = 600;
    const cx = baseW / 2, cy = baseH / 2;

    if (!nodes || nodes.length === 0) {
      setLayout({ nodes: [], links: [], viewBox: `0 0 ${baseW} ${baseH}` });
      return;
    }

    const d3 = window.d3;
    if (d3) {
      try {
        const sim = d3.forceSimulation(nodes)
          .force('link', d3.forceLink(links).id(n => n.id).distance(110))
          .force('charge', d3.forceManyBody().strength(-280))
          .force('center', d3.forceCenter(cx, cy))
          .force('x', d3.forceX(cx).strength(0.08))
          .force('y', d3.forceY(cy).strength(0.08))
          .force('collision', d3.forceCollide().radius(38))
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

        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;
        const pad = 80;
        const vWidth = Math.max(baseW, graphWidth + pad * 2);
        const vHeight = Math.max(baseH, graphHeight + pad * 2);

        setLayout({
          nodes,
          links,
          viewBox: `${cx - vWidth / 2} ${cy - vHeight / 2} ${vWidth} ${vHeight}`,
        });
        return;
      } catch (err) {
        console.warn('D3 force simulation fallback:', err);
      }
    }

    // Fallback radial layout
    const n = nodes.length;
    const r = Math.min(220, 60 + n * 18);
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / (n || 1);
      node.x = cx + r * Math.cos(angle);
      node.y = cy + r * Math.sin(angle);
    });

    setLayout({
      nodes,
      links,
      viewBox: `0 0 ${baseW} ${baseH}`,
    });
  }, [d3Ready, docsList, targetDocId]);

  if (!layout) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 480, color: 'var(--ink-faint)', background: 'var(--paper)' }}>
        <Loader2 size={18} className="spin" style={{ marginRight: 8 }} /> Loading Topological Graph…
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

  const activeFocus = hoveredNode || selectedFilter;

  function handleNodeClick(node) {
    if (node.type === 'document' && node.docId && onSelectDoc) {
      onSelectDoc(node.docId);
    } else {
      setSelectedFilter(prev => prev?.id === node.id ? null : node);
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', background: '#fcfbf8', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Legend & Controls Bar */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 14, fontSize: 11.5, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>📜 Document</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>👨/👩/🏛️ Owner / Party</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>📍 Survey Parcel</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>🏘️ Village</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>📐 Extent</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>🏛️ LRMS Register</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>⚠️ Discrepancy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 600 }}>
            {targetDocId ? `Isolated Parcel: ${targetDocId}` : 'Single Parcel Scope'}
          </span>
          {selectedFilter && (
            <button className="btn btn-outline btn-sm" style={{ padding: '2px 8px', height: 24, fontSize: 11 }} onClick={() => setSelectedFilter(null)}>
              Clear Selection ({selectedFilter.label}) ✕
            </button>
          )}
        </div>
      </div>

      <svg
        width="100%"
        height="580"
        viewBox={layout.viewBox || "0 0 920 600"}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
      >
        <defs>
          <marker id="arrow" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,-5L10,0L0,5" fill="#A8A393" />
          </marker>
          <marker id="arrow-warn" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,-5L10,0L0,5" fill="#E63946" />
          </marker>
        </defs>

        {/* Links */}
        {layout.links.map((l, i) => {
          const s = typeof l.source === 'object' ? l.source : layout.nodes.find(n => n.id === l.source);
          const t = typeof l.target === 'object' ? l.target : layout.nodes.find(n => n.id === l.target);
          if (!s || !t) return null;
          const isHighlighted = activeFocus && (s.id === activeFocus.id || t.id === activeFocus.id);
          const isDisc = l.relation === 'flagged_discrepancy' || s.type === 'discrepancy' || t.type === 'discrepancy';
          const isTransfer = l.relation === 'transferred_from' || l.relation === 'transferred_to';

          const strokeColor = isDisc ? '#E63946' : isHighlighted ? 'var(--rust)' : isTransfer ? '#378ADD' : '#C7C3B5';
          const strokeW = isHighlighted ? 2.5 : isTransfer ? 1.8 : 1.2;

          return (
            <line
              key={i}
              x1={s.x} y1={s.y} x2={t.x} y2={t.y}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeDasharray={isDisc ? '5 3' : isTransfer ? '6 3' : 'none'}
              opacity={activeFocus ? (isHighlighted ? 1 : 0.25) : 0.85}
              markerEnd={isDisc ? 'url(#arrow-warn)' : isTransfer ? 'url(#arrow)' : undefined}
            />
          );
        })}

        {/* Nodes */}
        {layout.nodes.map(n => {
          const isHovered = hoveredNode?.id === n.id;
          const isSelected = selectedFilter?.id === n.id;
          const isHighlighted = activeFocus && (n.id === activeFocus.id || layout.links.some(l => {
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            return (s === activeFocus.id && t === n.id) || (t === activeFocus.id && s === n.id);
          }));

          const r = n.type === 'document' ? 16 : n.type === 'discrepancy' ? 10 : 12;
          const opacity = activeFocus ? (isHighlighted ? 1 : 0.25) : 1;

          return (
            <g
              key={n.id}
              transform={`translate(${n.x},${n.y})`}
              style={{ cursor: 'pointer', opacity, transition: 'opacity 0.2s ease' }}
              onMouseEnter={() => setHoveredNode(n)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(n)}
            >
              <circle
                r={isHovered || isSelected ? r + 4 : r}
                fill={colorFor[n.type] || '#555'}
                stroke="#fff"
                strokeWidth={2}
                style={{
                  filter: (isHovered || isSelected) ? 'drop-shadow(0 3px 10px rgba(0,0,0,0.35))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))',
                  transition: 'all 0.15s ease',
                }}
              />
              {/* Centered entity icon inside node circle */}
              <text
                x={0}
                y={n.type === 'discrepancy' ? 4 : 5}
                textAnchor="middle"
                fontSize={(isHovered || isSelected ? r + 4 : r) * 1.05}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {iconForNode(n)}
              </text>
              <text
                x={0}
                y={n.type === 'document' ? 28 : n.type === 'discrepancy' ? -16 : 24}
                textAnchor="middle"
                fontSize={isHovered || isSelected ? 11.5 : (n.type === 'discrepancy' ? 9.5 : 10)}
                fontWeight={isHovered || isSelected ? 700 : (n.type === 'document' ? 600 : 500)}
                fill={n.type === 'discrepancy' ? '#E63946' : 'var(--ink)'}
                stroke="#fff"
                strokeWidth={3}
                paintOrder="stroke fill"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* =========================================================================
   OCR WORKSPACE
   ========================================================================= */

function OcrWorkspace({ doc, zoom, setZoom, pipeline, onProgress, onComplete, onStuck, onResume }) {
  const running = pipeline.stage === 'ocr';
  const paused = pipeline.stage === 'ocr-paused';
  const done = pipeline.stage !== 'ocr' && pipeline.stage !== 'ocr-paused';
  const pct = pipeline.ocrTotalWords ? Math.min(100, Math.round((pipeline.ocrWords / pipeline.ocrTotalWords) * 100)) : 0;
  const avgConfidence = 94;

  return (
    <div className="ocr-workspace">
      <div className="ocr-pane">
        <div className="ocr-pane-head">
          <div className="opd-file">
            <FileText size={15} />
            <div>
              <b>{doc?.fileName || `${doc?.id}.pdf`}</b>
              <span>Uploaded today, {nowTime()} · {fileSizeLabel(doc)} · {doc?.type}</span>
            </div>
          </div>
          <StatusBadge status={pipeline.stage} />
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
            url={doc?.imageUrl} type={doc?.type} filterCss={enhanceFilter(PREPROCESS_STEPS.length)} altLabel="original document" zoom={zoom}
            evidenceRegion={paused ? OCR_UNCERTAIN_REGION : null} evidenceTone="warn"
          />
        </div>
        <div className="opd-foot">Page 1/{pageCountFor(doc)}</div>
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
            text={OCR_FULL_TEXT}
            running={running}
            onProgress={onProgress}
            onComplete={onComplete}
            stuckToken={pipeline.ocrResumeCount === 0 ? OCR_UNCERTAIN_TOKEN : null}
            onStuck={onStuck}
            resumeToken={pipeline.ocrResumeCount}
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

  return (
    <div className="doc-page">
      <div className="dp-pagenum-top">{pageNo}</div>

      <div className="dp-title">LAND RECORD EXTRACT</div>
      <div className="dp-subtitle">SURVEY NO. {doc.survey} &nbsp;·&nbsp; {doc.village?.toUpperCase()} VILLAGE, {doc.taluk?.toUpperCase()} TALUK</div>

      <div className="dp-section-title">RECORD DESCRIPTION</div>
      <p className="dp-para">
        This record certifies the landholding particulars under Survey No. {doc.survey}, situated in the
        village of {doc.village}, {doc.taluk} Taluk, as digitized from the original {doc.type} record
        (Document {doc.id}). The land stands registered in the name of {doc.owner}
        {doc.khata ? <>, under Khata No. {doc.khata}</> : null}, comprising an extent of {doc.area}
        {doc.classification ? <>, classified as {doc.classification} land</> : null}. According to the
        digitized entry, the Processor's fields are as follows:
      </p>

      <ol className="dp-list">
        <li>Owner: {doc.owner}</li>
        <li>Survey No.: {doc.survey}</li>
        <li>Khata No.: {doc.khata || '—'}</li>
        <li>Classification: {doc.classification || '—'}</li>
        <li>Area: {doc.area}</li>
        <li>Village: {doc.village}</li>
        <li>Taluk: {doc.taluk}</li>
      </ol>

      <p className="dp-para">
        This entry was extracted from the source {doc.type} document with an AI confidence score of{' '}
        {doc.confidence}%, digitized on {todayStr()}. Its verification status is currently{' '}
        <em>{statusLine}</em>.
      </p>

      <div className="dp-hash">
        Document Hash — SHA-256: {docHash(doc)}<br />
        Audit Reference: {auditRef(doc)}
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
.evidence-box{ position:absolute; border:2px solid var(--rust); background:rgba(193,80,46,0.14); box-shadow:0 0 0 3px rgba(193,80,46,0.12); pointer-events:none; transition:all .18s ease; }
.evidence-box-warn{ border-color:var(--amber); background:rgba(138,109,30,0.16); box-shadow:0 0 0 3px rgba(138,109,30,0.14); animation:pulse-warn 1.3s ease-in-out infinite; }
@keyframes pulse-warn{ 0%,100%{ opacity:1; } 50%{ opacity:0.55; } }

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