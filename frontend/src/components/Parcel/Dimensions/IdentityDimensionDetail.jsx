import React, { useState } from 'react';
import {
  UserCheck, AlertTriangle, CheckCircle2, ShieldAlert,
  Fingerprint, FileCheck, HelpCircle, Send, Check
} from 'lucide-react';

export default function IdentityDimensionDetail({
  parcel,
  addToast = () => {}
}) {
  const [noticeSent, setNoticeSent] = useState(false);
  const [kycTriggered, setKycTriggered] = useState(false);

  const handleSendNotice = () => {
    setNoticeSent(true);
    if (typeof addToast === 'function') {
      addToast('Legal Heirship affidavit requisition dispatched to Pollachi Taluk Revenue Office.', 'info');
    }
  };

  const handleTriggerKyc = () => {
    setKycTriggered(true);
    if (typeof addToast === 'function') {
      addToast('Biometric field re-verification request logged into e-Sevai workflow.', 'success');
    }
  };

  return (
    <div className="dimension-subview-root">
      {/* Subview Intro Bar */}
      <div className="subview-header-strip">
        <div className="subview-title-wrap">
          <UserCheck size={16} className="text-emerald" />
          <span className="subview-title">Owner Identity & KYC Consistency Verification</span>
        </div>
        <div className="subview-actions-wrap">
          <button 
            className={`btn-subview-secondary ${noticeSent ? 'btn-done' : ''}`}
            onClick={handleSendNotice}
            disabled={noticeSent}
          >
            {noticeSent ? <Check size={13} className="text-emerald" /> : <Send size={13} />}
            <span>{noticeSent ? 'Affidavit Dispatched' : 'Request Legal Heir Affidavit'}</span>
          </button>
          <button 
            className={`btn-subview-primary ${kycTriggered ? 'btn-done' : ''}`}
            onClick={handleTriggerKyc}
            disabled={kycTriggered}
          >
            <Fingerprint size={14} />
            <span>{kycTriggered ? 'Biometrics Scheduled' : 'Trigger Biometric Re-verification'}</span>
          </button>
        </div>
      </div>

      {/* Identity Cards Comparison Grid */}
      <div className="identity-comparison-grid">
        {/* Card 1: Registered Claimant (Kannan) */}
        <div className="identity-profile-card claimant-card">
          <div className="profile-card-header">
            <span className="profile-role-tag current">Current Claimant / Patta Holder</span>
            <span className="profile-status-badge alert">Alias Flagged</span>
          </div>
          <div className="profile-card-body">
            <div className="profile-name-row">
              <span className="profile-name">{parcel?.currentOwner || 'Kannan'}</span>
              <span className="profile-alias">Alias: "Kannan @ Ramasamy Kannan"</span>
            </div>
            
            <div className="profile-details-list">
              <div className="profile-detail-item">
                <span className="p-lbl">Aadhaar Token:</span>
                <span className="p-val mono font-semibold">V-****-8812</span>
                <span className="p-pill pill-green">Biometric Match (98.4%)</span>
              </div>
              <div className="profile-detail-item">
                <span className="p-lbl">Electoral Roll:</span>
                <span className="p-val">Sulur AC #118 / Part 42</span>
                <span className="p-pill pill-green">Verified (94.0%)</span>
              </div>
              <div className="profile-detail-item">
                <span className="p-lbl">Relationship:</span>
                <span className="p-val">Purported Son of Ramasamy</span>
                <span className="p-pill pill-amber">Uncertified Succession</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Historical Title Holder (Ramasamy) */}
        <div className="identity-profile-card historical-card">
          <div className="profile-card-header">
            <span className="profile-role-tag historical">Historical Grantee (1980 Title)</span>
            <span className="profile-status-badge verified">Verified Baseline</span>
          </div>
          <div className="profile-card-body">
            <div className="profile-name-row">
              <span className="profile-name">{parcel?.historicalOwner || 'Ramasamy'}</span>
              <span className="profile-alias">S/o Kuppusamy Gounder</span>
            </div>
            
            <div className="profile-details-list">
              <div className="profile-detail-item">
                <span className="p-lbl">Original Deed:</span>
                <span className="p-val mono">DOC-1980-0012</span>
                <span className="p-pill pill-green">Resettlement Register</span>
              </div>
              <div className="profile-detail-item">
                <span className="p-lbl">1996 Transfer:</span>
                <span className="p-val mono">DOC-1996-0188</span>
                <span className="p-pill pill-green">Registered Sale Deed</span>
              </div>
              <div className="profile-detail-item">
                <span className="p-lbl">Succession Deed:</span>
                <span className="p-val text-red bold">MISSING RECORD</span>
                <span className="p-pill pill-red">No Partition Decree</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancy Assessment Callout */}
      <div className="identity-finding-banner">
        <ShieldAlert size={18} className="text-amber" />
        <div className="finding-text-wrap">
          <span className="finding-title">Identity & Lineage Integrity Finding:</span>
          <p className="finding-desc">
            The claimant <b>Kannan</b> has validated Aadhaar biometric credentials, but the legal title transmission between deceased owner <b>Ramasamy</b> and Kannan lacks an authenticated Legal Heirship Certificate or registered Partition Deed in the District Registration Archive.
          </p>
        </div>
      </div>
    </div>
  );
}
