import React, { useState } from 'react';
import {
  X, ZoomIn, ZoomOut, RotateCcw, FileText, CheckCircle2, AlertTriangle,
  ShieldCheck, ExternalLink, Download, Sparkles, Hash, Calendar, MapPin
} from 'lucide-react';
import { getEvidence } from '../../services/parcelService';

export default function EvidenceViewer({
  evidenceId = 'EV-2017-01',
  isOpen = false,
  onClose = () => {}
}) {
  const [zoom, setZoom] = useState(1);
  const [activeBox, setActiveBox] = useState('box-owner');

  if (!isOpen) return null;

  const evidence = getEvidence(evidenceId);
  if (!evidence) return null;

  return (
    <div className="evidence-modal-overlay" onClick={onClose}>
      <div className="evidence-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="evidence-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-eyebrow">
              <ShieldCheck size={16} className="text-emerald" />
              <span>NILORA EVIDENCE & DECISION PROVENANCE VIEWER</span>
            </div>
            <h2 className="modal-heading">{evidence.documentTitle}</h2>
            <span className="modal-doc-ref mono">{evidence.documentId} · {evidence.source}</span>
          </div>

          <div className="modal-header-actions">
            <span className="evidence-id-pill mono">
              <Hash size={13} />
              <span>{evidence.id}</span>
            </span>
            <button className="btn-close-modal" onClick={onClose} title="Close Evidence Viewer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Split-Screen Body */}
        <div className="evidence-split-body">
          {/* ===============================================================
              LEFT: SCANNED RECORD WITH BOUNDING BOX HIGHLIGHTS
              =============================================================== */}
          <div className="evidence-document-col">
            <div className="document-toolbar">
              <span className="doc-view-label">Original Archival Scan (Page {evidence.page})</span>
              <div className="doc-zoom-buttons">
                <button className="doc-zoom-btn" onClick={() => setZoom(z => Math.min(z + 0.2, 1.8))}>
                  <ZoomIn size={14} />
                </button>
                <span className="doc-zoom-pct">{Math.round(zoom * 100)}%</span>
                <button className="doc-zoom-btn" onClick={() => setZoom(z => Math.max(z - 0.2, 0.8))}>
                  <ZoomOut size={14} />
                </button>
                <button className="doc-zoom-btn" onClick={() => setZoom(1)}>
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            <div className="scanned-document-viewport">
              <div 
                className="scanned-document-inner"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                {/* Synthetic Archival Document Graphic Representation */}
                <div className="archival-document-canvas">
                  <div className="archival-doc-header">
                    <div className="tamil-gov-emblem">தமிழ்நாடு அரசு · வருவாய்த்துறை</div>
                    <div className="doc-type-tamil">நில உரிமை மாறுதல் பதிவேடு (படிவம் VII-B)</div>
                    <div className="doc-meta-tamil">கிராமம்: கிணத்துக்கடவு | வட்டம்: பொள்ளாச்சி | மாவட்டம்: கோயம்புத்தூர்</div>
                  </div>

                  <div className="archival-table-layout">
                    <div className="arch-row arch-head">
                      <div className="arch-cell c-no">வ.எண்</div>
                      <div className="arch-cell c-survey">புல எண்</div>
                      <div className="arch-cell c-area">விஸ்தீரணம்</div>
                      <div className="arch-cell c-owner">பட்டாதாரர் பெயர்</div>
                      <div className="arch-cell c-order">ஆணை எண் & நாள்</div>
                    </div>

                    <div className="arch-row">
                      <div className="arch-cell c-no">41</div>
                      <div className="arch-cell c-survey">124/1</div>
                      <div className="arch-cell c-area">1.80 ஏக்.</div>
                      <div className="arch-cell c-owner">சுப்பிரமணியம்</div>
                      <div className="arch-cell c-order">Mu.Mu. 2017/140</div>
                    </div>

                    {/* TARGET HIGHLIGHTED ROW FOR SURVEY 124/2A */}
                    <div className="arch-row target-divergence-row">
                      <div className="arch-cell c-no">42</div>
                      
                      {/* Survey Bounding Box */}
                      <div className="arch-cell c-survey relative-cell">
                        <span>124/2A</span>
                        <div className="bounding-box-overlay survey-box">
                          <span className="box-tag">Survey 124/2A (97%)</span>
                        </div>
                      </div>

                      {/* Area Bounding Box */}
                      <div className="arch-cell c-area relative-cell">
                        <span>2.40 ஏக்.</span>
                        <div className="bounding-box-overlay area-box">
                          <span className="box-tag">2.40 Ac (94%)</span>
                        </div>
                      </div>

                      {/* Owner Bounding Box (First Observed Divergence) */}
                      <div className="arch-cell c-owner relative-cell active-highlight">
                        <span className="handwritten-font">கண்ணன் (Kannan)</span>
                        <div className="bounding-box-overlay owner-box-divergence">
                          <div className="box-header-tag">
                            <AlertTriangle size={11} />
                            <span>FIELD: Owner Name → Kannan (82% Conf)</span>
                          </div>
                        </div>
                      </div>

                      <div className="arch-cell c-order">
                        <span className="unverified-ref">Ref: Vol IX / P.3 (No Registered Deed Link)</span>
                      </div>
                    </div>

                    <div className="arch-row">
                      <div className="arch-cell c-no">43</div>
                      <div className="arch-cell c-survey">125/1</div>
                      <div className="arch-cell c-area">3.10 ஏக்.</div>
                      <div className="arch-cell c-owner">மாரிமுத்து</div>
                      <div className="arch-cell c-order">Mu.Mu. 2017/148</div>
                    </div>
                  </div>

                  <div className="archival-doc-footer">
                    <div className="doc-seal-mark">
                      <div className="seal-circle">வருவாய் ஆய்வாளர் முத்திரை</div>
                    </div>
                    <div className="doc-hash-text mono">
                      DIGITAL INGESTION SCAN HASH: {evidence.provenanceHash}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="document-caption-bar">
              <Sparkles size={14} className="text-emerald" />
              <span>Bounding boxes automatically mapped from NILORA Multi-Script OCR Line Segmentation.</span>
            </div>
          </div>

          {/* ===============================================================
              RIGHT: EXTRACTED FIELD PROVENANCE & CONTRADICTION EXPLANATION
              =============================================================== */}
          <div className="evidence-provenance-col">
            <div className="provenance-section-title">
              Extracted Field Provenance
            </div>

            {/* Field Detail Card */}
            <div className="extracted-field-card">
              <div className="field-card-row">
                <span className="p-label">Target Field:</span>
                <span className="p-val bold">{evidence.fieldName}</span>
              </div>

              <div className="field-card-row">
                <span className="p-label">Extracted Value:</span>
                <span className="p-val extracted-badge text-red mono bold">"{evidence.extractedValue}"</span>
              </div>

              <div className="field-card-row">
                <span className="p-label">Expected Ancestral Value:</span>
                <span className="p-val mono bold text-emerald">"{evidence.expectedValue}"</span>
              </div>

              <div className="field-card-row">
                <span className="p-label">Extraction Confidence:</span>
                <div className="confidence-pill-wrap">
                  <span className="conf-value">{evidence.confidence}%</span>
                  <div className="conf-mini-bar">
                    <div className="conf-mini-fill" style={{ width: `${evidence.confidence}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Contradiction Finding */}
            <div className="ai-finding-card">
              <div className="finding-header">
                <AlertTriangle size={16} className="text-red" />
                <span className="finding-title">AI Contradiction Finding</span>
              </div>
              <p className="finding-text">{evidence.finding}</p>
            </div>

            {/* Provenance Metadata Table */}
            <div className="provenance-metadata-card">
              <div className="meta-card-title">Provenance Integrity Metadata</div>
              <div className="meta-table">
                <div className="meta-row">
                  <span className="m-key">Document ID:</span>
                  <span className="m-val mono">{evidence.documentId}</span>
                </div>
                <div className="meta-row">
                  <span className="m-key">Archival Volume:</span>
                  <span className="m-val">{evidence.source}</span>
                </div>
                <div className="meta-row">
                  <span className="m-key">Ingestion Year:</span>
                  <span className="m-val">{evidence.year}</span>
                </div>
                <div className="meta-row">
                  <span className="m-key">Verification Authority:</span>
                  <span className="m-val">{evidence.metadata.recordKeeperSeal}</span>
                </div>
                <div className="meta-row">
                  <span className="m-key">Integrity Hash:</span>
                  <span className="m-val mono hash-truncate" title={evidence.provenanceHash}>
                    {evidence.provenanceHash}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="evidence-actions-row">
              <button className="btn-modal-action btn-secondary" onClick={onClose}>
                Return to Investigation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
