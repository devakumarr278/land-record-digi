import React, { useState } from 'react';
import {
  ArrowLeft, ShieldCheck, AlertTriangle, GitCommit, Network,
  Send, FileText, CheckCircle2, RefreshCw, MapPin
} from 'lucide-react';
import PossibleCommonSourceGraph from './PossibleCommonSourceGraph';
import PotentialDownstreamImpactGraph from './PotentialDownstreamImpactGraph';
import RecommendedInvestigationPanel from './RecommendedInvestigationPanel';
import DiscrepancyLifecycleStepper from './DiscrepancyLifecycleStepper';
import DecisionModal from './DecisionModal';
import {
  dispatchInvestigationAction,
  recordOfficerDecision
} from '../../services/discrepancyIntelligenceService';

export default function DiscrepancyDetailWorkspace({
  dossier,
  onBack = () => {},
  onDossierUpdated = () => {},
  addToast = () => {}
}) {
  const [activeGraphTab, setActiveGraphTab] = useState('common_source'); // 'common_source' | 'downstream_impact'
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDecisionType, setModalDecisionType] = useState('RESOLVE');
  const [dispatchedMap, setDispatchedMap] = useState({});

  if (!dossier) return null;

  const handleOpenDecision = (type) => {
    setModalDecisionType(type);
    setModalOpen(true);
  };

  const handleDispatchAction = (actionId, targetRole) => {
    const updated = dispatchInvestigationAction(dossier.id, actionId, 'District Administrator');
    if (updated) {
      setDispatchedMap(prev => ({ ...prev, [actionId]: true }));
      onDossierUpdated(updated);
      if (typeof addToast === 'function') {
        addToast(`Directive dispatched to ${targetRole}.`, 'success');
      }
    }
  };

  const handleCommitDecision = (decisionData) => {
    const updated = recordOfficerDecision(dossier.id, {
      ...decisionData,
      officerName: 'District Administrator',
      officerRole: 'District Collector / DRO'
    });
    if (updated) {
      setModalOpen(false);
      onDossierUpdated(updated);
      if (typeof addToast === 'function') {
        addToast(`Discrepancy decision committed.`, 'success');
      }
    }
  };

  const isResolved = dossier.status === 'RESOLVED';

  return (
    <div className="clean-workspace-root">
      {/* 1. Sleek Sticky Header */}
      <div className="clean-dossier-header">
        <div className="cdh-left">
          <button className="btn-cdh-back" onClick={onBack}>
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <div className="cdh-title-row">
            <span className="cdh-id mono">{dossier.targetParcelId}</span>
            <span className="cdh-survey mono font-semibold">Survey {dossier.surveyNumber}</span>
            <span className={`cdh-badge ${dossier.severity.toLowerCase()}`}>
              {dossier.severity} (Score: {dossier.priorityScore})
            </span>
            <span className="cdh-status-badge">
              {dossier.status.replace(/_/g, ' ')}
            </span>
          </div>
          <span className="cdh-loc">{dossier.village}, {dossier.taluk} · Extent: {dossier.extent} · Exposure: {dossier.empiricalSummary?.financialExposure || '₹72L'}</span>
        </div>

        {/* Right Adjudication Actions */}
        <div className="cdh-actions">
          {!isResolved ? (
            <>
              <button className="btn-cdh-action escalate" onClick={() => handleOpenDecision('ESCALATE')}>
                <Send size={13} />
                <span>Escalate</span>
              </button>
              <button className="btn-cdh-action annotate" onClick={() => handleOpenDecision('ACCEPT_WITH_ANNOTATION')}>
                <FileText size={13} />
                <span>Annotate</span>
              </button>
              <button className="btn-cdh-action resolve" onClick={() => handleOpenDecision('RESOLVE')}>
                <CheckCircle2 size={13} />
                <span>Resolve</span>
              </button>
            </>
          ) : (
            <button className="btn-cdh-action reopen" onClick={() => handleOpenDecision('REOPEN')}>
              <RefreshCw size={13} />
              <span>Reopen</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Concise 3-Column Empirical Contradiction Cards */}
      <div className="clean-metrics-strip">
        <div className="cm-card">
          <span className="cm-lbl">Revenue e-Patta (#PTA-2017-4412)</span>
          <span className="cm-val text-emerald font-bold">Owner: {dossier.currentClaimant || 'Kannan'}</span>
          <span className="cm-sub">Ingested Nov 2017 · Active</span>
        </div>

        <div className="cm-card highlight">
          <span className="cm-lbl text-red font-bold">SRO Pollachi Index II</span>
          <span className="cm-val text-red font-bold">Title Remains: {dossier.historicalGrantee || 'Ramasamy'}</span>
          <span className="cm-sub text-red font-medium">No registered deed in SRO archive</span>
        </div>

        <div className="cm-card">
          <span className="cm-lbl">Potential Impact Radius</span>
          <span className="cm-val font-bold">4 Records · ₹72L</span>
          <span className="cm-sub">Pending transfer + bank loan</span>
        </div>
      </div>

      {/* 3. Minimalist Dual Graph Section */}
      <div className="clean-graph-section">
        <div className="cgs-tabs-bar">
          <div className="cgs-tabs-group">
            <button
              className={`cgs-tab ${activeGraphTab === 'common_source' ? 'active' : ''}`}
              onClick={() => setActiveGraphTab('common_source')}
            >
              <GitCommit size={14} />
              <span>Possible Common Source Graph</span>
            </button>
            <button
              className={`cgs-tab ${activeGraphTab === 'downstream_impact' ? 'active' : ''}`}
              onClick={() => setActiveGraphTab('downstream_impact')}
            >
              <Network size={14} />
              <span>Potential Downstream Impact Graph</span>
            </button>
          </div>
          <span className="cgs-guide">Interactive causal dependency reasoning topology</span>
        </div>

        <div className="cgs-canvas-wrapper">
          {activeGraphTab === 'common_source' ? (
            <PossibleCommonSourceGraph
              graphData={dossier.possibleCommonSourceGraph}
            />
          ) : (
            <PotentialDownstreamImpactGraph
              graphData={dossier.potentialDownstreamImpactGraph}
            />
          )}
        </div>
      </div>

      {/* 4. Actionable Directives Panel */}
      <div className="clean-directives-section">
        <h4 className="cds-heading">Recommended Human Investigation Directives</h4>
        <RecommendedInvestigationPanel
          investigations={dossier.recommendedInvestigations}
          onDispatch={handleDispatchAction}
          dispatchedMap={dispatchedMap}
        />
      </div>

      {/* 5. Compact Lifecycle Stepper */}
      <div className="clean-lifecycle-section">
        <h4 className="cds-heading">Investigation Lifecycle & Provenance Trail</h4>
        <DiscrepancyLifecycleStepper
          lifecycle={dossier.lifecycle}
        />
      </div>

      {/* 6. Decision Modal */}
      <DecisionModal
        isOpen={modalOpen}
        decisionType={modalDecisionType}
        discrepancy={dossier}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCommitDecision}
      />
    </div>
  );
}
