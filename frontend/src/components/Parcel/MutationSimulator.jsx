import React, { useState } from 'react';
import {
  GitBranch, Play, CheckCircle2, AlertTriangle, ShieldAlert, Lock,
  Unlock, FileText, ArrowRight, RotateCcw, Scale, User, FileSpreadsheet,
  AlertCircle, Sparkles, Check, X
} from 'lucide-react';
import VerificationDimension from './VerificationDimension';
import { runMutationSimulation } from '../../services/mutationSimulationService';
import { submitDecision } from '../../services/parcelService';

export default function MutationSimulator({
  parcel,
  onSimulationComplete = () => {},
  onDecisionSubmitted = () => {},
  addToast = () => {}
}) {
  const [proposedState, setProposedState] = useState({
    proposedOwner: 'Ravi Kumar',
    proposedArea: '2.40',
    mutationType: 'Sale Deed (கிரைய பத்திரம்)',
    deedNumber: 'DOC-2026-REG-8812',
    buyerAadhaar: '9821-4410-1290',
    sellerName: parcel?.currentOwner || 'Kannan',
    clearCaveats: false
  });

  const [simulationResult, setSimulationResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('APPROVE'); // 'APPROVE' | 'REFER'
  const [decisionReason, setDecisionReason] = useState('');
  const [expandedDim, setExpandedDim] = useState(null);

  const handleInputChange = (field, val) => {
    setProposedState(prev => ({ ...prev, [field]: val }));
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = runMutationSimulation(parcel, proposedState);
      setSimulationResult(result);
      setIsRunning(false);
      onSimulationComplete(result);
      addToast(
        result.canCommit 
          ? 'Simulation completed: All critical dimensions verified.' 
          : 'Simulation completed: Contradictions detected. Commit blocked.',
        result.canCommit ? 'success' : 'error'
      );
    }, 350);
  };

  const handleReset = () => {
    setProposedState({
      proposedOwner: 'Ravi Kumar',
      proposedArea: '2.40',
      mutationType: 'Sale Deed (கிரைய பத்திரம்)',
      deedNumber: 'DOC-2026-REG-8812',
      buyerAadhaar: '9821-4410-1290',
      sellerName: parcel?.currentOwner || 'Kannan',
      clearCaveats: false
    });
    setSimulationResult(null);
    setExpandedDim(null);
  };

  const handleOpenDecision = (type) => {
    setDecisionType(type);
    setDecisionReason(
      type === 'APPROVE'
        ? 'Verified all multi-source evidence, rectified lineage gap with certified succession deed, and confirmed GIS boundary consistency.'
        : 'Referred to District Adjudication Tribunal due to unreconciled 2017 title break and rival heir caveats.'
    );
    setDecisionModalOpen(true);
  };

  const handleConfirmDecision = (e) => {
    e.preventDefault();
    if (!decisionReason || decisionReason.trim().length < 5) {
      addToast('A mandatory justification of at least 5 characters is required.', 'error');
      return;
    }

    try {
      submitDecision(parcel.id, decisionType, decisionReason);
      setDecisionModalOpen(false);
      addToast(
        decisionType === 'APPROVE' 
          ? `Mutation successfully approved and committed to master ledger with legal provenance.` 
          : `Dispute referred to Revenue Adjudication Tribunal with recorded reasons.`,
        'success'
      );
      onDecisionSubmitted();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const currentDimensions = parcel?.dimensions || [];
  const activeDimensions = simulationResult ? simulationResult.dimensions : currentDimensions;

  return (
    <div className="mutation-simulator-root">
      {/* Simulation Workspace Header */}
      <div className="sim-header-row">
        <div className="sim-title-group">
          <div className="sim-eyebrow">
            <GitBranch size={16} className="text-emerald" />
            <span>NILORA DETERMINISTIC SIMULATION WORKBENCH</span>
          </div>
          <h2 className="sim-heading">Simulate Mutation & Impact Analysis</h2>
          <p className="sim-subheading">
            Test proposed title conveyance, sub-division, or heirship transfers against multi-source evidence prior to legal ledger commitment.
          </p>
        </div>

        <div className="sim-actions-top">
          <button className="btn-sim-reset" onClick={handleReset} title="Reset to defaults">
            <RotateCcw size={14} />
            <span>Reset Inputs</span>
          </button>
          <button 
            className={`btn-run-simulation ${isRunning ? 'running' : ''}`}
            onClick={handleRunSimulation}
            disabled={isRunning}
          >
            <Play size={15} />
            <span>{isRunning ? 'Validating Dimensions...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          SPLIT-SCREEN COMPARISON: CURRENT STATE vs PROPOSED STATE
          =================================================================== */}
      <div className="sim-comparison-grid">
        {/* LEFT: CURRENT STATE */}
        <div className="sim-state-card current-card">
          <div className="state-card-header">
            <span className="state-badge-current">CURRENT STATE (RECORDED)</span>
            <span className="state-doc-ref mono">{parcel.pattaNumber}</span>
          </div>

          <div className="state-card-body">
            <div className="sim-field-row">
              <span className="s-label">Current Owner:</span>
              <span className="s-val bold text-dark-green">{parcel.currentOwner}</span>
            </div>

            <div className="sim-field-row">
              <span className="s-label">Survey Area:</span>
              <span className="s-val mono">{parcel.area}</span>
            </div>

            <div className="sim-field-row">
              <span className="s-label">Survey Classification:</span>
              <span className="s-val">{parcel.classification}</span>
            </div>

            <div className="sim-field-row">
              <span className="s-label">Pre-existing Status:</span>
              <span className="status-pill-small red">{parcel.status}</span>
            </div>

            <div className="sim-field-row">
              <span className="s-label">Known Divergence:</span>
              <span className="s-val text-red">Year {parcel.firstDivergenceYear || 'None'} (Title Break)</span>
            </div>

            <div className="current-state-note">
              <AlertCircle size={14} className="text-amber" />
              <span>Active master record contains unreconciled 2017 divergence against Registration Index II.</span>
            </div>
          </div>
        </div>

        {/* RIGHT: PROPOSED STATE (EDITABLE FORM) */}
        <div className="sim-state-card proposed-card">
          <div className="state-card-header">
            <span className="state-badge-proposed">PROPOSED TRANSACTION (SIMULATED)</span>
            <span className="state-doc-ref">Draft Form I-A</span>
          </div>

          <div className="state-card-body">
            <div className="sim-form-grid">
              <div className="sim-form-field">
                <label>Proposed New Owner (Grantee):</label>
                <input
                  type="text"
                  value={proposedState.proposedOwner}
                  onChange={(e) => handleInputChange('proposedOwner', e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                />
              </div>

              <div className="sim-form-field">
                <label>Survey Area (Acres):</label>
                <input
                  type="text"
                  value={proposedState.proposedArea}
                  onChange={(e) => handleInputChange('proposedArea', e.target.value)}
                  placeholder="2.40"
                />
              </div>

              <div className="sim-form-field">
                <label>Mutation Type Instrument:</label>
                <select
                  value={proposedState.mutationType}
                  onChange={(e) => handleInputChange('mutationType', e.target.value)}
                >
                  <option value="Sale Deed (கிரைய பத்திரம்)">Sale Deed (கிரைய பத்திரம்)</option>
                  <option value="Inheritance & Succession (வாரிசுரிமை)">Inheritance & Succession (வாரிசுரிமை)</option>
                  <option value="Partition Deed (பாகப்பிரிவினை)">Partition Deed (பாகப்பிரிவினை)</option>
                  <option value="Settlement Gift (தான பத்திரம்)">Settlement Gift (தான பத்திரம்)</option>
                </select>
              </div>

              <div className="sim-form-field">
                <label>Deed Registration Reference:</label>
                <input
                  type="text"
                  value={proposedState.deedNumber}
                  onChange={(e) => handleInputChange('deedNumber', e.target.value)}
                  placeholder="DOC-2026-REG-8812"
                />
              </div>

              <div className="sim-form-field">
                <label>Buyer Aadhaar KYC Token:</label>
                <input
                  type="text"
                  value={proposedState.buyerAadhaar}
                  onChange={(e) => handleInputChange('buyerAadhaar', e.target.value)}
                  placeholder="9821-4410-1290"
                />
              </div>

              {/* Simulation Option: Toggle Caveat Clearance */}
              <div className="sim-form-field full-width">
                <label className="checkbox-label-card">
                  <input
                    type="checkbox"
                    checked={proposedState.clearCaveats}
                    onChange={(e) => handleInputChange('clearCaveats', e.target.checked)}
                  />
                  <span>Attach Certified Court Decree / Heirship Relinquishment (Clears 2017 Title Caveat)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          SIMULATION RESULTS & RE-VALIDATED 6 DIMENSIONS
          =================================================================== */}
      <div className="sim-results-section">
        <div className="sim-results-header">
          <div className="results-header-left">
            <h3 className="results-title">
              {simulationResult ? 'Simulation Re-Validation Profile' : 'Current Verification Profile'}
            </h3>
            <span className="results-sub">
              {simulationResult 
                ? `Recalculated across all six dimensions based on deterministic validation rules.`
                : `Run simulation to evaluate transaction impact across all dimensions.`}
            </span>
          </div>

          {simulationResult && (
            <div className={`results-status-badge ${simulationResult.canCommit ? 'clean' : 'blocked'}`}>
              {simulationResult.canCommit ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>All Critical Checks Passed</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  <span>{simulationResult.criticalConflicts.length} Contradictions Detected</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Six Reusable Verification Bars */}
        <div className="dimensions-stack">
          {activeDimensions.map(dim => (
            <VerificationDimension
              key={dim.id}
              id={dim.id}
              title={dim.title}
              status={dim.status}
              statusText={dim.statusText}
              score={dim.score}
              explanation={dim.explanation}
              evidenceCount={dim.evidenceCount}
              details={dim.details}
              simulatedDiff={dim.diff}
              isSimulated={Boolean(simulationResult)}
              isExpanded={expandedDim === dim.id}
              onToggle={() => setExpandedDim(expandedDim === dim.id ? null : dim.id)}
            />
          ))}
        </div>

        {/* ===================================================================
            COMMIT SAFETY & HUMAN DECISION CONTROL
            =================================================================== */}
        <div className="sim-commit-panel">
          <div className="commit-panel-left">
            <div className="commit-safety-badge">
              {simulationResult?.canCommit ? (
                <Unlock size={18} className="text-emerald" />
              ) : (
                <Lock size={18} className="text-red" />
              )}
              <span className="commit-safety-title">
                {simulationResult?.canCommit 
                  ? 'Commit Permitted (Subject to Human Authority Justification)' 
                  : 'Commit Safety Guard Active'}
              </span>
            </div>

            <p className="commit-explanation">
              {simulationResult?.blockingReason || 
                (simulationResult 
                  ? 'All automated checks cleared. Legal authority decision must now be recorded with justification.' 
                  : 'Run simulation above to test whether this proposed mutation is safe to commit.')}
            </p>
          </div>

          <div className="commit-panel-actions">
            {/* Disabled or Enabled Commit Action */}
            <button
              className="btn-commit-disabled"
              disabled={!simulationResult || !simulationResult.canCommit}
              onClick={() => handleOpenDecision('APPROVE')}
              title={!simulationResult?.canCommit ? simulationResult?.blockingReason || 'Run simulation first' : 'Submit human decision'}
            >
              <CheckCircle2 size={16} />
              <span>Confirm Authorized Decision</span>
            </button>

            {/* Refer to Adjudication Action */}
            <button
              className="btn-refer-adjudication"
              onClick={() => handleOpenDecision('REFER')}
            >
              <Scale size={16} />
              <span>Refer to Adjudication Tribunal</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MANDATORY HUMAN DECISION JUSTIFICATION MODAL
          =================================================================== */}
      {decisionModalOpen && (
        <div className="decision-modal-overlay" onClick={() => setDecisionModalOpen(false)}>
          <div className="decision-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="decision-modal-head">
              <div className="modal-head-title">
                <Scale size={18} className="text-emerald" />
                <h3>Mandatory Human Authority Decision</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setDecisionModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmDecision} className="decision-modal-body">
              <div className="decision-callout">
                <b>Product Principle:</b> AI ASSISTS. AI DOES NOT MAKE THE FINAL LEGAL DECISION. Every approval or tribunal referral requires an explicit, auditable officer justification.
              </div>

              <div className="decision-choice-row">
                <button
                  type="button"
                  className={`decision-choice-btn approve ${decisionType === 'APPROVE' ? 'active' : ''}`}
                  onClick={() => setDecisionType('APPROVE')}
                >
                  <CheckCircle2 size={16} />
                  <span>Approve Master Mutation</span>
                </button>

                <button
                  type="button"
                  className={`decision-choice-btn refer ${decisionType === 'REFER' ? 'active' : ''}`}
                  onClick={() => setDecisionType('REFER')}
                >
                  <AlertTriangle size={16} />
                  <span>Refer to Adjudication Tribunal</span>
                </button>
              </div>

              <div className="decision-input-field">
                <label>
                  Mandatory Legal Justification / Officer Finding:
                  <span className="required-star">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Enter detailed legal justification, archival deed citation, or court order number..."
                />
                <span className="field-hint">This justification will be permanently sealed into the Decision Provenance Audit Trail.</span>
              </div>

              <div className="decision-modal-footer">
                <button 
                  type="button" 
                  className="btn-modal-cancel"
                  onClick={() => setDecisionModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-modal-submit"
                >
                  Seal & Record Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
