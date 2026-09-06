import React, { useState, useEffect } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, ShieldCheck, Clock, MapPin,
  GitBranch, Eye, ArrowLeft, Layers, Sparkles
} from 'lucide-react';
import ParcelContextHeader from './ParcelContextHeader';
import VerificationDimension from './VerificationDimension';
import ParcelTimeline from './ParcelTimeline';
import EvidenceViewer from './EvidenceViewer';
import MutationSimulator from './MutationSimulator';
import DecisionProvenance from '../Audit/DecisionProvenance';
import ExtractionDimensionDetail from './Dimensions/ExtractionDimensionDetail';
import IdentityDimensionDetail from './Dimensions/IdentityDimensionDetail';
import SpatialDimensionDetail from './Dimensions/SpatialDimensionDetail';
import EvidenceDimensionDetail from './Dimensions/EvidenceDimensionDetail';
import CrossSourceDimensionDetail from './Dimensions/CrossSourceDimensionDetail';
import { getParcel, getParcelTimeline } from '../../services/parcelService';

export default function ParcelVerificationCard({
  parcelId = 'LR-124/2A',
  initialTab = 'verification',
  onBack = () => {},
  addToast = () => {}
}) {
  const [parcel, setParcel] = useState(() => getParcel(parcelId));
  const [activeTab, setActiveTab] = useState(initialTab); // 'verification' | 'simulate'
  const [expandedDim, setExpandedDim] = useState('historical'); // Historical expanded by default
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('EV-2017-01');

  useEffect(() => {
    const updated = getParcel(parcelId);
    setParcel(updated);
  }, [parcelId]);

  const handleToggleDim = (dimId) => {
    setExpandedDim(prev => prev === dimId ? null : dimId);
  };

  const handleOpenEvidence = (evId = 'EV-2017-01') => {
    setSelectedEvidenceId(evId);
    setEvidenceModalOpen(true);
  };

  const handleCloseEvidence = () => {
    setEvidenceModalOpen(false);
  };

  const handleDecisionRecorded = () => {
    const updated = getParcel(parcelId);
    setParcel(updated);
  };

  if (!parcel) {
    return (
      <div className="parcel-not-found">
        <AlertTriangle size={32} className="text-red" />
        <h2>Parcel Dossier Not Found</h2>
        <p>The requested parcel identifier could not be retrieved from the cadastral ledger.</p>
        <button className="btn-primary" onClick={onBack}>
          <ArrowLeft size={16} /> Return to Conflict Overview
        </button>
      </div>
    );
  }

  const dimensions = parcel.dimensions || [];
  const timeline = parcel.timeline || [];

  const renderDimensionContent = (dimId) => {
    switch (dimId) {
      case 'extraction':
        return (
          <ExtractionDimensionDetail
            parcel={parcel}
            onViewEvidence={handleOpenEvidence}
          />
        );
      case 'identity':
        return (
          <IdentityDimensionDetail
            parcel={parcel}
            addToast={addToast}
          />
        );
      case 'historical':
        return (
          <ParcelTimeline
            timeline={timeline}
            onViewEvidence={handleOpenEvidence}
          />
        );
      case 'spatial':
        return (
          <SpatialDimensionDetail
            parcel={parcel}
            addToast={addToast}
          />
        );
      case 'evidence':
        return (
          <EvidenceDimensionDetail
            parcel={parcel}
            onViewEvidence={handleOpenEvidence}
          />
        );
      case 'crossSource':
      case 'cross_source':
        return (
          <CrossSourceDimensionDetail
            parcel={parcel}
            addToast={addToast}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="parcel-investigation-workspace">
      {/* ===================================================================
          1. PERSISTENT CONTEXT HEADER
      =================================================================== */}
      <ParcelContextHeader
        parcel={parcel}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={onBack}
      />

      {/* ===================================================================
          2. WORKSPACE CONTENT: VERIFICATION vs SIMULATE TAB
      =================================================================== */}
      <div className="workspace-main-content">
        {activeTab === 'verification' && (
          <div className="verification-profile-view">
            <div className="section-narrative-bar">
              <div className="narrative-left">
                <ShieldCheck size={18} className="text-emerald" />
                <span className="narrative-heading">
                  Multi-Source Verification Dimensions (6 Active Audits)
                </span>
              </div>
              <span className="narrative-guide">
                Click any dimension below to inspect interactive audit tools, OCR tokens, FMB sketches, and cross-source matrices.
              </span>
            </div>

            {/* SIX VERIFICATION DIMENSIONS STACK */}
            <div className="dimensions-stack">
              {dimensions.map(dim => {
                const isExpanded = expandedDim === dim.id;

                return (
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
                    isExpanded={isExpanded}
                    onToggle={() => handleToggleDim(dim.id)}
                  >
                    {/* DEDICATED INTERACTIVE WORKBENCH FOR EVERY DIMENSION */}
                    {renderDimensionContent(dim.id)}
                  </VerificationDimension>
                );
              })}
            </div>

            {/* INTEGRITY & DECISION PROVENANCE AUDIT TRAIL */}
            <div className="workspace-audit-section">
              <DecisionProvenance parcelId={parcel.id} />
            </div>
          </div>
        )}

        {/* SIMULATE MUTATION TAB */}
        {activeTab === 'simulate' && (
          <MutationSimulator
            parcel={parcel}
            onSimulationComplete={() => {}}
            onDecisionSubmitted={handleDecisionRecorded}
            addToast={addToast}
          />
        )}
      </div>

      {/* ===================================================================
          3. EVIDENCE VIEWER MODAL (NON-DESTRUCTIVE)
          =================================================================== */}
      <EvidenceViewer
        evidenceId={selectedEvidenceId}
        isOpen={evidenceModalOpen}
        onClose={handleCloseEvidence}
      />
    </div>
  );
}
