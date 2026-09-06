/**
 * NILORA Discrepancy Intelligence Service
 * Deterministic service abstraction with local session persistence
 */

import { DISCREPANCY_CLUSTERS, DISCREPANCY_DOSSIERS } from '../data/discrepancyIntelligenceData';

const STORAGE_KEY = 'nilora_discrepancy_intelligence_store';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[DiscrepancyService] Failed to load cached state:', e);
  }
  return {
    clusters: DISCREPANCY_CLUSTERS,
    dossiers: DISCREPANCY_DOSSIERS
  };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[DiscrepancyService] Failed to save state:', e);
  }
}

export function getDiscrepancyClusters() {
  const state = loadState();
  return state.clusters;
}

export function getDiscrepancies(categoryFilter = 'ALL', severityFilter = 'ALL') {
  const state = loadState();
  let list = state.dossiers;

  if (categoryFilter && categoryFilter !== 'ALL') {
    list = list.filter(d => d.category.toLowerCase().includes(categoryFilter.toLowerCase()));
  }

  if (severityFilter && severityFilter !== 'ALL') {
    list = list.filter(d => d.severity.toLowerCase() === severityFilter.toLowerCase());
  }

  return list;
}

export function getDiscrepancyDossier(id) {
  const state = loadState();
  const found = state.dossiers.find(d => d.id === id || d.targetParcelId === id);
  return found || state.dossiers[0];
}

export function dispatchInvestigationAction(discrepancyId, actionId, officerName = 'District Administrator') {
  const state = loadState();
  const dossierIndex = state.dossiers.findIndex(d => d.id === discrepancyId);
  if (dossierIndex === -1) return null;

  const dossier = { ...state.dossiers[dossierIndex] };
  const actionIndex = dossier.recommendedInvestigations.findIndex(a => a.id === actionId);
  if (actionIndex !== -1) {
    dossier.recommendedInvestigations[actionIndex] = {
      ...dossier.recommendedInvestigations[actionIndex],
      status: 'DISPATCHED',
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dispatchedBy: officerName
    };
  }

  state.dossiers[dossierIndex] = dossier;
  saveState(state);
  return dossier;
}

export function recordOfficerDecision(discrepancyId, {
  decisionType, // 'RESOLVE' | 'ESCALATE' | 'ACCEPT_WITH_ANNOTATION' | 'REOPEN'
  justificationNote,
  officerName = 'District Administrator',
  officerRole = 'District Collector / DRO',
  targetAuthority = null
}) {
  const state = loadState();
  const dossierIndex = state.dossiers.findIndex(d => d.id === discrepancyId);
  if (dossierIndex === -1) return null;

  const dossier = { ...state.dossiers[dossierIndex] };
  const nowStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                 new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let newStatus = 'UNDER_INVESTIGATION';
  let stageLabel = 'Decision Recorded';
  let desc = justificationNote || 'Human officer determination recorded.';

  if (decisionType === 'RESOLVE') {
    newStatus = 'RESOLVED';
    stageLabel = 'Resolved by District Authority';
    desc = `Resolved: ${justificationNote}. Master land records ledger updated.`;
  } else if (decisionType === 'ESCALATE') {
    newStatus = 'ESCALATED';
    stageLabel = `Escalated to ${targetAuthority || 'Tehsildar'}`;
    desc = `Escalated: ${justificationNote}. Formal requisition dispatched.`;
  } else if (decisionType === 'ACCEPT_WITH_ANNOTATION') {
    newStatus = 'ACCEPTED_WITH_ANNOTATION';
    stageLabel = 'Accepted with Permanent Annotation';
    desc = `Accepted with Caveat Annotation: ${justificationNote}.`;
  } else if (decisionType === 'REOPEN') {
    newStatus = 'UNDER_INVESTIGATION';
    stageLabel = 'Reopened for Additional Field Proofs';
    desc = `Reopened: ${justificationNote}. Re-investigation scheduled.`;
  }

  dossier.status = newStatus;
  dossier.lastUpdated = nowStr;

  // Append to lifecycle
  dossier.lifecycle = [
    ...dossier.lifecycle.map(l => ({ ...l, isCurrent: false })),
    {
      stage: newStatus,
      stageLabel,
      timestamp: nowStr,
      actor: `${officerName} (${officerRole})`,
      description: desc,
      isCompleted: true,
      isCurrent: true
    }
  ];

  state.dossiers[dossierIndex] = dossier;
  saveState(state);
  return dossier;
}
