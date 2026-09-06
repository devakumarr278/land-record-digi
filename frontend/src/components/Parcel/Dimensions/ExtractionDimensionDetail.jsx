import React, { useState } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, Eye, Sparkles,
  Download, Copy, Check, Search, Layers, RefreshCw
} from 'lucide-react';

export default function ExtractionDimensionDetail({
  parcel,
  onViewEvidence = () => {}
}) {
  const [copied, setCopied] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  const ocrConfidence = {
    overall: 88,
    tamilScript: 87.4,
    englishNumeric: 99.1,
    rubberStamp: 91.2,
    noiseFiltering: 'Bilateral Smoothing + Deskew (Applied)'
  };

  const extractedEntities = [
    {
      field: 'Survey Number',
      tamilLabel: 'புல எண்',
      extractedValue: parcel?.surveyNumber || '124/2A',
      confidence: 99.1,
      status: 'HIGH_CONFIDENCE',
      sourceDoc: 'DOC-1980-0012'
    },
    {
      field: 'Village / Taluk',
      tamilLabel: 'கிராமம் / வட்டம்',
      extractedValue: `${parcel?.village || 'Kinathukadavu'}, ${parcel?.taluk || 'Pollachi'}`,
      confidence: 94.5,
      status: 'HIGH_CONFIDENCE',
      sourceDoc: 'DOC-1980-0012'
    },
    {
      field: 'Land Extent (Area)',
      tamilLabel: 'நிலப்பரப்பு',
      extractedValue: parcel?.area || '2.40 Acres',
      confidence: 98.2,
      status: 'HIGH_CONFIDENCE',
      sourceDoc: 'DOC-1996-0188'
    },
    {
      field: 'Patta Number',
      tamilLabel: 'பட்டா எண்',
      extractedValue: parcel?.pattaNumber || 'PTA-2017-4412',
      confidence: 96.0,
      status: 'HIGH_CONFIDENCE',
      sourceDoc: 'DOC-2017-0042'
    },
    {
      field: 'Historical Grantee',
      tamilLabel: 'பழைய பட்டாதாரர்',
      extractedValue: parcel?.historicalOwner || 'Ramasamy',
      confidence: 92.4,
      status: 'VERIFIED',
      sourceDoc: 'DOC-1980-0012'
    },
    {
      field: 'Claimant / Current Entry',
      tamilLabel: 'தற்போதைய பட்டாதாரர்',
      extractedValue: parcel?.currentOwner || 'Kannan',
      confidence: 86.8,
      status: 'REVIEW',
      sourceDoc: 'DOC-2017-0042'
    }
  ];

  const handleCopyJson = () => {
    const data = {
      parcelId: parcel?.id,
      ocrConfidence,
      extractedEntities
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dimension-subview-root">
      {/* Subview Intro Bar */}
      <div className="subview-header-strip">
        <div className="subview-title-wrap">
          <Sparkles size={16} className="text-emerald" />
          <span className="subview-title">Multi-Script OCR & Entity Extraction Audit</span>
        </div>
        <div className="subview-actions-wrap">
          <button 
            className="btn-subview-secondary"
            onClick={handleCopyJson}
            title="Copy OCR JSON Provenance"
          >
            {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <button 
            className="btn-subview-primary"
            onClick={() => onViewEvidence('EV-2017-01')}
          >
            <Eye size={14} />
            <span>Inspect Scanned Deed & Bounding Boxes</span>
          </button>
        </div>
      </div>

      {/* OCR Confidence Metrics Gauges */}
      <div className="ocr-metrics-grid">
        <div className="ocr-metric-card">
          <div className="metric-header">
            <span className="metric-name">Tamil Script NLP</span>
            <span className="metric-pct high">{ocrConfidence.tamilScript}%</span>
          </div>
          <div className="metric-bar-bg">
            <div className="metric-bar-fill green" style={{ width: `${ocrConfidence.tamilScript}%` }} />
          </div>
          <span className="metric-hint">Archival Grantham & Tamil unicode lexicon</span>
        </div>

        <div className="ocr-metric-card">
          <div className="metric-header">
            <span className="metric-name">Survey Alphanumerics</span>
            <span className="metric-pct high">{ocrConfidence.englishNumeric}%</span>
          </div>
          <div className="metric-bar-bg">
            <div className="metric-bar-fill green" style={{ width: `${ocrConfidence.englishNumeric}%` }} />
          </div>
          <span className="metric-hint">Boundary coordinates & plot digits</span>
        </div>

        <div className="ocr-metric-card">
          <div className="metric-header">
            <span className="metric-name">Seals & Rubber Stamps</span>
            <span className="metric-pct high">{ocrConfidence.rubberStamp}%</span>
          </div>
          <div className="metric-bar-bg">
            <div className="metric-bar-fill green" style={{ width: `${ocrConfidence.rubberStamp}%` }} />
          </div>
          <span className="metric-hint">Sub-Registrar ink seal clarity</span>
        </div>
      </div>

      {/* Extracted Key-Value Entity Table */}
      <div className="subview-table-card">
        <div className="subview-table-header">
          <span className="table-heading">Extracted Land Record Key-Value Entities</span>
          <span className="table-subtext">Deterministic extraction mapped against Tamil Nadu Cadastral Schema</span>
        </div>

        <div className="entity-table-responsive">
          <table className="subview-data-table">
            <thead>
              <tr>
                <th>Cadastral Field</th>
                <th>Tamil Descriptor</th>
                <th>Extracted Value</th>
                <th>OCR Confidence</th>
                <th>Source Archive</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {extractedEntities.map((item, idx) => (
                <tr 
                  key={idx}
                  className={selectedField === item.field ? 'row-selected' : ''}
                  onClick={() => setSelectedField(item.field)}
                >
                  <td className="bold-cell">{item.field}</td>
                  <td className="tamil-script-cell">{item.tamilLabel}</td>
                  <td>
                    <span className="entity-val-tag mono">{item.extractedValue}</span>
                  </td>
                  <td>
                    <div className="conf-badge-cell">
                      <span className={`conf-chip ${item.confidence > 90 ? 'chip-green' : 'chip-amber'}`}>
                        {item.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="mono text-muted">{item.sourceDoc}</td>
                  <td>
                    <button 
                      className="btn-table-inspect"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewEvidence('EV-2017-01');
                      }}
                    >
                      <Eye size={12} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
