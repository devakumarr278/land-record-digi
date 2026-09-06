import React, { useState } from 'react';
import {
  X, CheckCircle2, AlertTriangle, Send, ShieldCheck,
  FileText, UserCheck, Lock, Check
} from 'lucide-react';

export default function DecisionModal({
  isOpen = false,
  decisionType = 'RESOLVE', // 'RESOLVE' | 'ESCALATE' | 'ACCEPT_WITH_ANNOTATION' | 'REOPEN'
  discrepancy,
  onClose = () => {},
  onSubmit = () => {}
}) {
  const [justification, setJustification] = useState('');
  const [targetAuthority, setTargetAuthority] = useState('Tehsildar (Pollachi Taluk)');
  const [priorityLevel, setPriorityLevel] = useState('High Priority');
  const [officerPin, setOfficerPin] = useState('7492');

  if (!isOpen || !discrepancy) return null;

  const getTitle = () => {
    switch (decisionType) {
      case 'RESOLVE':
        return 'Formal Resolution & Ledger Rectification';
      case 'ESCALATE':
        return 'Escalate Discrepancy to Competent Authority';
      case 'ACCEPT_WITH_ANNOTATION':
        return 'Accept Discrepancy with Permanent Annotation';
      case 'REOPEN':
        return 'Reopen Discrepancy for Re-Investigation';
      default:
        return 'Officer Adjudication Action';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!justification.trim()) return;

    onSubmit({
      decisionType,
      justificationNote: justification,
      targetAuthority: decisionType === 'ESCALATE' ? targetAuthority : null,
      priorityLevel: decisionType === 'ESCALATE' ? priorityLevel : null,
      officerPin
    });
  };

  return (
    <div className="decision-modal-backdrop" onClick={onClose}>
      <div className="decision-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-strip">
          <div className="modal-title-wrap">
            <ShieldCheck size={18} className="text-emerald" />
            <h3 className="modal-title">{getTitle()}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          {/* Target Parcel Summary Box */}
          <div className="modal-target-summary">
            <div className="summary-col">
              <span className="s-lbl">Target Parcel:</span>
              <span className="s-val mono font-bold">{discrepancy.targetParcelId}</span>
            </div>
            <div className="summary-col">
              <span className="s-lbl">Survey Number:</span>
              <span className="s-val mono">{discrepancy.surveyNumber}</span>
            </div>
            <div className="summary-col">
              <span className="s-lbl">Village & Taluk:</span>
              <span className="s-val">{discrepancy.village}, {discrepancy.taluk}</span>
            </div>
          </div>

          {/* Escalation Specific Inputs */}
          {decisionType === 'ESCALATE' && (
            <div className="modal-form-row">
              <div className="form-group flex-1">
                <label className="form-label">Assign Competent Officer / Authority:</label>
                <select
                  className="form-select"
                  value={targetAuthority}
                  onChange={(e) => setTargetAuthority(e.target.value)}
                >
                  <option value="Tehsildar (Pollachi Taluk)">S. Subramaniam (Tehsildar, Pollachi)</option>
                  <option value="Sub-Registrar (Pollachi SRO)">M. Anand (Sub-Registrar, Pollachi SRO)</option>
                  <option value="Head Surveyor (Coimbatore West)">K. Prakash (Head Surveyor, GIS Division)</option>
                  <option value="District Revenue Adjudication Tribunal">District Revenue Adjudication Tribunal (Coimbatore)</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="form-label">Escalation Priority & SLA:</label>
                <select
                  className="form-select"
                  value={priorityLevel}
                  onChange={(e) => setPriorityLevel(e.target.value)}
                >
                  <option value="Critical Priority">Critical Priority (24h Expedited SLA)</option>
                  <option value="High Priority">High Priority (3 Business Days SLA)</option>
                  <option value="Normal Priority">Normal Priority (7 Business Days SLA)</option>
                </select>
              </div>
            </div>
          )}

          {/* Justification Textarea */}
          <div className="form-group">
            <label className="form-label required">
              Mandatory Human Officer Justification Note:
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder={
                decisionType === 'RESOLVE'
                  ? 'Specify the legal basis, court decree, or physical archive document validating title rectification...'
                  : decisionType === 'ESCALATE'
                  ? 'Detail specific directives, archival registers to requisition, or field boundaries to inspect...'
                  : decisionType === 'ACCEPT_WITH_ANNOTATION'
                  ? 'Specify caveat wording to be permanently recorded in the land ledger remarks column...'
                  : 'Specify reason for reopening this discrepancy...'
              }
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>

          {/* Digital Signature Pin Stamp */}
          <div className="officer-signature-strip">
            <div className="sig-left">
              <Lock size={14} className="text-emerald" />
              <span className="sig-label">Authenticated as: <b>District Administrator (Coimbatore)</b></span>
            </div>
            <div className="sig-pin-wrap">
              <span className="pin-lbl">Digital PIN:</span>
              <input
                type="password"
                maxLength={4}
                className="pin-input"
                value={officerPin}
                onChange={(e) => setOfficerPin(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-footer-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-modal-submit ${decisionType.toLowerCase()}`}
              disabled={!justification.trim()}
            >
              {decisionType === 'RESOLVE' && <CheckCircle2 size={16} />}
              {decisionType === 'ESCALATE' && <Send size={16} />}
              {decisionType === 'ACCEPT_WITH_ANNOTATION' && <FileText size={16} />}
              {decisionType === 'REOPEN' && <CheckCircle2 size={16} />}
              <span>Commit Human Decision</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
