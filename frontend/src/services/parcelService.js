/**
 * NILORA Parcel & Conflict Service
 * Abstraction layer connecting the UI to demo datasets or backend APIs.
 */

import { DEMO_PARCELS, CONFLICT_GRAPH_DATA, EVIDENCE_STORE } from '../data/demoParcels';

// Local storage session key for human decisions & simulated mutations
const DECISION_STORAGE_KEY = 'nilora_parcel_decisions_v1';
const AUDIT_STORAGE_KEY = 'nilora_audit_trail_v1';

function getStoredDecisions() {
  try {
    const raw = localStorage.getItem(DECISION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveDecisions(data) {
  try {
    localStorage.setItem(DECISION_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[ParcelService] Failed to persist decisions:', e);
  }
}

function getStoredAuditTrail() {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveAuditTrail(data) {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[ParcelService] Failed to persist audit trail:', e);
  }
}

/**
 * Fetch conflict graph topology, nodes, links, and statistical KPIs.
 */
export function getConflictGraph() {
  const decisions = getStoredDecisions();
  
  // Clone nodes and update any that have been resolved via human authority decision
  const updatedNodes = CONFLICT_GRAPH_DATA.nodes.map(node => {
    const dec = decisions[node.id];
    if (dec && dec.decision === 'APPROVE') {
      return {
        ...node,
        status: 'VERIFIED',
        riskScore: 92,
        conflictsCount: 0,
        resolvedNote: dec.reason
      };
    }
    return node;
  });

  return {
    nodes: updatedNodes,
    links: CONFLICT_GRAPH_DATA.links,
    stats: {
      ...CONFLICT_GRAPH_DATA.stats,
      activeConflicts: updatedNodes.filter(n => n.status === 'CONTRADICTION').length,
      needsReview: updatedNodes.filter(n => n.status === 'REVIEW').length,
      recentlyResolved: CONFLICT_GRAPH_DATA.stats.recentlyResolved + Object.keys(decisions).length
    }
  };
}

/**
 * Fetch full parcel details by ID or Slug.
 */
export function getParcel(idOrSlug) {
  if (!idOrSlug) return null;
  const cleanId = idOrSlug.trim().replace(/\s+/g, '').toLowerCase();
  
  const parcel = DEMO_PARCELS.find(p => 
    p.id.toLowerCase().replace(/[\/\s]/g, '-') === cleanId ||
    p.id.toLowerCase() === cleanId ||
    p.slug.toLowerCase() === cleanId ||
    p.surveyNumber.toLowerCase().replace(/[\/\s]/g, '-') === cleanId
  );

  if (!parcel) {
    // Return default hero parcel as safety fallback
    return DEMO_PARCELS[0];
  }

  // Overlay any recorded human decision
  const decisions = getStoredDecisions();
  const dec = decisions[parcel.id];
  if (dec) {
    return {
      ...parcel,
      humanDecision: dec,
      status: dec.decision === 'APPROVE' ? 'Resolved / Verified' : 'Adjudication Referred',
      statusCode: dec.decision === 'APPROVE' ? 'VERIFIED' : 'REVIEW'
    };
  }

  return parcel;
}

/**
 * Fetch timeline events for a given parcel.
 */
export function getParcelTimeline(idOrSlug) {
  const parcel = getParcel(idOrSlug);
  return parcel ? parcel.timeline : [];
}

/**
 * Fetch evidence metadata by evidence ID.
 */
export function getEvidence(evidenceId = 'EV-2017-01') {
  return EVIDENCE_STORE[evidenceId] || EVIDENCE_STORE['EV-2017-01'];
}

/**
 * Record an authorized human decision with mandatory justification.
 */
export function submitDecision(parcelId, decision, reason, author = 'Tehsildar / Sub-Registrar') {
  if (!reason || reason.trim().length < 5) {
    throw new Error('A mandatory decision justification of at least 5 characters is required.');
  }

  const timestamp = new Date().toISOString();
  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const record = {
    parcelId,
    decision,
    reason: reason.trim(),
    author,
    timestamp,
    formattedTime,
    formattedDate
  };

  const decisions = getStoredDecisions();
  decisions[parcelId] = record;
  saveDecisions(decisions);

  // Append to audit trail
  const auditEntry = {
    id: `AUD-${Date.now()}`,
    time: formattedTime,
    date: formattedDate,
    parcelId,
    action: `Human Authority Decision Recorded: ${decision === 'APPROVE' ? 'Approved Master Record' : 'Referred to Revenue Adjudication'}`,
    actor: author,
    details: `Justification: "${reason.trim()}"`,
    type: decision === 'APPROVE' ? 'success' : 'warning',
    provenanceHash: `SHA256:${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`
  };

  const auditTrail = getStoredAuditTrail();
  saveAuditTrail([auditEntry, ...auditTrail]);

  return { success: true, record, auditEntry };
}

/**
 * Fetch chronological audit / decision provenance trail.
 */
export function getAuditTrail(parcelId) {
  const localLogs = getStoredAuditTrail();
  
  const defaultLogs = [
    {
      id: 'AUD-001',
      time: '10:45 AM',
      date: '03 Sep 2026',
      parcelId: 'LR-124/2A',
      action: 'Automated Multi-Source Cross-Validation Triggered',
      actor: 'NILORA Extraction Engine v2.4',
      details: 'Historical mutation register and ROR cross-referenced. Discontinuity detected at Year 2017.',
      type: 'error',
      provenanceHash: 'SHA256: 4e9c7b81f08a'
    },
    {
      id: 'AUD-002',
      time: '09:12 AM',
      date: '03 Sep 2026',
      parcelId: 'LR-124/2A',
      action: 'Cadastral GIS Vector Alignment Completed',
      actor: 'GIS Spatial Verifier',
      details: 'FMB polygon matches Satellite 2.40 Acre boundaries within 0.02% tolerance.',
      type: 'success',
      provenanceHash: 'SHA256: 8a1139ce701b'
    },
    {
      id: 'AUD-003',
      time: '04:30 PM',
      date: '02 Sep 2026',
      parcelId: 'LR-124/2A',
      action: 'Ingestion & OCR Extraction Completed',
      actor: 'Operator Anand P',
      details: 'Uploaded 400 DPI scans for Kinathukadavu Vol IX / Pg 3.',
      type: 'info',
      provenanceHash: 'SHA256: b8940ef1a520'
    }
  ];

  const filteredLocal = parcelId ? localLogs.filter(l => l.parcelId === parcelId) : localLogs;
  return [...filteredLocal, ...defaultLogs];
}
