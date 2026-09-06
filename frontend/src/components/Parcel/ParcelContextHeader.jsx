import React from 'react';
import {
  ArrowLeft, MapPin, User, ShieldAlert, CheckCircle2, AlertTriangle,
  GitBranch, FileCheck, Layers, Sparkles, Scale, Clock
} from 'lucide-react';

export default function ParcelContextHeader({
  parcel,
  activeTab = 'verification', // 'verification' | 'simulate'
  onTabChange = () => {},
  onBack = () => {}
}) {
  if (!parcel) return null;

  const isContradiction = parcel.statusCode === 'CONTRADICTION' || parcel.status.includes('Contradiction');
  const isReview = parcel.statusCode === 'REVIEW' || parcel.status.includes('Review');

  return (
    <div className="parcel-context-header-root">
      {/* Top Breadcrumb Navigation */}
      <div className="header-nav-row">
        <button className="back-link-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Conflict Overview</span>
        </button>

        <div className="header-meta-tags">
          <span className="state-badge">Government of Tamil Nadu · Land Administration</span>
          <span className="sync-pill">
            <span className="pulse-indicator" />
            Live Sync: Verified Ledger
          </span>
        </div>
      </div>

      {/* Main Context Card */}
      <div className="parcel-context-card">
        <div className="context-identity-col">
          <div className="parcel-hero-title">
            <span className="parcel-hero-id mono">Parcel {parcel.surveyNumber}</span>
            <span className={`parcel-hero-badge ${isContradiction ? 'contradiction' : isReview ? 'review' : 'verified'}`}>
              {isContradiction ? <AlertTriangle size={14} /> : isReview ? <ShieldAlert size={14} /> : <CheckCircle2 size={14} />}
              <span>{parcel.status}</span>
            </span>
          </div>

          <div className="parcel-meta-grid">
            <div className="meta-item">
              <span className="m-label">Village:</span>
              <span className="m-val bold">{parcel.village}</span>
            </div>
            <div className="meta-item">
              <span className="m-label">Survey No:</span>
              <span className="m-val mono bold">{parcel.surveyNumber}</span>
            </div>
            <div className="meta-item">
              <span className="m-label">Taluk / District:</span>
              <span className="m-val">{parcel.taluk}, {parcel.district}</span>
            </div>
            <div className="meta-item">
              <span className="m-label">Current Owner:</span>
              <span className="m-val bold text-dark-green">{parcel.currentOwner}</span>
            </div>
            <div className="meta-item">
              <span className="m-label">Registered Area:</span>
              <span className="m-val mono">{parcel.area}</span>
            </div>
          </div>
        </div>

        {/* Right Score & Tabs */}
        <div className="context-actions-col">
          <div className="trust-score-badge">
            <div className="score-number-box">
              <span className="big-score">{parcel.trustScore}%</span>
              <span className="score-sub">AI Trust Index</span>
            </div>
          </div>

          {/* Sibling Tabs Switcher: [ Verification ] [ Simulate Mutation ] */}
          <div className="workspace-tabs-group">
            <button
              className={`workspace-tab ${activeTab === 'verification' ? 'active' : ''}`}
              onClick={() => onTabChange('verification')}
            >
              <FileCheck size={16} />
              <span>Verification Profile</span>
            </button>

            <button
              className={`workspace-tab ${activeTab === 'simulate' ? 'active' : ''}`}
              onClick={() => onTabChange('simulate')}
            >
              <GitBranch size={16} />
              <span>Simulate Mutation</span>
              <span className="tab-pill-badge">Interactive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
