import React, { useState } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, Eye, ShieldCheck,
  Download, Hash, ExternalLink, Lock
} from 'lucide-react';

export default function EvidenceDimensionDetail({
  parcel,
  onViewEvidence = () => {}
}) {
  const documents = [
    {
      docId: 'DOC-1980-0012',
      evidenceId: 'EV-1980-01',
      title: 'Original Resettlement Register (1980)',
      tamilTitle: 'மறுசீரமைப்பு நிலப்பதிவேடு',
      date: '14 May 1980',
      dpi: '400 DPI (Archival Grade)',
      status: 'VERIFIED',
      hash: 'SHA256: 4e9c71b802a9f18374d284e908...',
      quality: 'Fair (Minor water staining on margin)',
      authority: 'Settlement Officer, Pollachi'
    },
    {
      docId: 'DOC-1996-0188',
      evidenceId: 'EV-1996-01',
      title: 'Registered Sale Deed Vol 114 / Pg 22',
      tamilTitle: 'பதிவு செய்யப்பட்ட கிரய பத்திரம்',
      date: '22 Aug 1996',
      dpi: '600 DPI (High Clarity)',
      status: 'VERIFIED',
      hash: 'SHA256: 8a4b992f001c34918e90bb3410...',
      quality: 'Excellent (Clear Tamil typography)',
      authority: 'Sub-Registrar Office, Pollachi'
    },
    {
      docId: 'DOC-2008-0402',
      evidenceId: 'EV-2008-01',
      title: 'Ancestral Succession Entry (2008)',
      tamilTitle: 'வாரிசு உரிமை பட்டா மாறுதல் குறிப்பு',
      date: '10 Feb 2008',
      dpi: '300 DPI (Standard Scan)',
      status: 'VERIFIED',
      hash: 'SHA256: 12f009cc78b31a890e8724aa01...',
      quality: 'Good (Legible ink seals)',
      authority: 'Taluk Revenue Office, Kinathukadavu'
    },
    {
      docId: 'DOC-2017-0042',
      evidenceId: 'EV-2017-01',
      title: 'Disputed Mutation Application & Patta 4412',
      tamilTitle: 'சர்ச்சைக்குரிய பட்டா மாறுதல் விண்ணப்பம்',
      date: '19 Nov 2017',
      dpi: '600 DPI (High Resolution)',
      status: 'CONTRADICTION',
      hash: 'SHA256: b3c881aa23f9901728dae34091...',
      quality: 'High Resolution (Contradictory Title Entry)',
      authority: 'Zonal Deputy Tehsildar'
    }
  ];

  return (
    <div className="dimension-subview-root">
      {/* Subview Intro Bar */}
      <div className="subview-header-strip">
        <div className="subview-title-wrap">
          <FileText size={16} className="text-emerald" />
          <span className="subview-title">Document Vault & Cryptographic Chain of Custody</span>
        </div>
        <div className="subview-actions-wrap">
          <div className="blockchain-badge">
            <Lock size={12} className="text-emerald" />
            <span>SHA-256 Ledger Authenticated</span>
          </div>
        </div>
      </div>

      {/* Archival Documents Grid */}
      <div className="evidence-docs-stack">
        {documents.map((doc, idx) => {
          const isCritical = doc.status === 'CONTRADICTION';

          return (
            <div 
              key={idx}
              className={`evidence-doc-row-card ${isCritical ? 'contradiction-doc' : 'verified-doc'}`}
            >
              <div className="doc-left-info">
                <div className="doc-icon-wrap">
                  <FileText size={20} className={isCritical ? 'text-red' : 'text-emerald'} />
                </div>
                <div className="doc-meta-wrap">
                  <div className="doc-title-row">
                    <span className="doc-title-main">{doc.title}</span>
                    <span className="doc-tamil-sub">{doc.tamilTitle}</span>
                    <span className={`doc-status-badge ${doc.status.toLowerCase()}`}>
                      {isCritical ? 'Disputed Record' : 'Verified Archive'}
                    </span>
                  </div>
                  <div className="doc-meta-pills">
                    <span className="pill-item mono font-bold">{doc.docId}</span>
                    <span className="pill-item">{doc.date}</span>
                    <span className="pill-item">{doc.authority}</span>
                    <span className="pill-item">{doc.dpi}</span>
                  </div>
                </div>
              </div>

              <div className="doc-right-actions">
                <div className="doc-hash-preview" title={doc.hash}>
                  <Hash size={12} />
                  <span>{doc.hash.slice(0, 22)}…</span>
                </div>
                <button 
                  className="btn-inspect-doc-action"
                  onClick={() => onViewEvidence(doc.evidenceId)}
                >
                  <Eye size={14} />
                  <span>Inspect Scanned Document</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
