import React, { useState } from 'react';
import {
  MapPin, CheckCircle2, AlertTriangle, Layers, Maximize2,
  Compass, Crosshair, RefreshCw, Eye
} from 'lucide-react';

export default function SpatialDimensionDetail({
  parcel,
  addToast = () => {}
}) {
  const [activeLayer, setActiveLayer] = useState('fmb'); // 'fmb' | 'satellite' | 'hybrid'
  const [analyzing, setAnalyzing] = useState(false);

  const handleReanalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      if (typeof addToast === 'function') {
        addToast('Spatial topological audit re-evaluated: 0.02% variance confirmed within permissible limits.', 'success');
      }
    }, 800);
  };

  const isKinathukadavu = parcel?.id === 'LR-124/2A';

  return (
    <div className="dimension-subview-root">
      {/* Subview Intro Bar */}
      <div className="subview-header-strip">
        <div className="subview-title-wrap">
          <MapPin size={16} className="text-emerald" />
          <span className="subview-title">Field Measurement Book (FMB) & GIS Boundary Verification</span>
        </div>
        <div className="subview-actions-wrap">
          <div className="spatial-layer-toggle">
            <button 
              className={`layer-btn ${activeLayer === 'fmb' ? 'active' : ''}`}
              onClick={() => setActiveLayer('fmb')}
            >
              FMB Vector
            </button>
            <button 
              className={`layer-btn ${activeLayer === 'satellite' ? 'active' : ''}`}
              onClick={() => setActiveLayer('satellite')}
            >
              Satellite Overlay
            </button>
          </div>
          <button 
            className="btn-subview-primary"
            onClick={handleReanalyze}
            disabled={analyzing}
          >
            <RefreshCw size={14} className={analyzing ? 'animate-spin' : ''} />
            <span>{analyzing ? 'Evaluating...' : 'Re-run Spatial Topology'}</span>
          </button>
        </div>
      </div>

      {/* Spatial Content: Diagram & Metrics */}
      <div className="spatial-inspection-layout">
        {/* Left: Interactive FMB Cadastral Sketch */}
        <div className="spatial-sketch-card">
          <div className="sketch-header">
            <div className="sketch-title-row">
              <Compass size={14} className="text-emerald" />
              <span>FMB Survey Sketch — Survey {parcel?.surveyNumber || '124/2A'}</span>
            </div>
            <span className="sketch-scale-tag">Scale 1:2000 (Metric Links)</span>
          </div>

          <div className="sketch-canvas-box">
            <svg viewBox="0 0 420 280" className="fmb-vector-svg">
              {/* Grid Background */}
              <pattern id="fmb-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dcfce7" strokeWidth="0.8" />
              </pattern>
              <rect width="420" height="280" fill="url(#fmb-grid)" />

              {/* Neighboring Parcels (Muted Outline) */}
              <polygon points="40,30 180,20 160,110 30,100" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.2" strokeDasharray="4 3" />
              <text x="85" y="65" fill="#047857" fontSize="10" fontWeight="600" opacity="0.7">124/1 (1.80 Ac)</text>

              <polygon points="280,40 390,30 380,180 270,170" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.2" strokeDasharray="4 3" />
              <text x="310" y="105" fill="#047857" fontSize="10" fontWeight="600" opacity="0.7">125/A (3.10 Ac)</text>

              <polygon points="170,160 370,170 340,260 160,250" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.2" strokeDasharray="4 3" />
              <text x="230" y="220" fill="#047857" fontSize="10" fontWeight="600" opacity="0.7">124/2B (2.10 Ac)</text>

              {/* Target Parcel (Survey 124/2A - Main Highlight) */}
              <polygon
                points="170,30 280,40 270,170 160,160"
                fill={activeLayer === 'satellite' ? 'rgba(5, 150, 105, 0.25)' : '#d1fae5'}
                stroke="#059669"
                strokeWidth="2.5"
                filter="drop-shadow(0 2px 6px rgba(5, 150, 105, 0.2))"
              />

              {/* FMB Tie-Lines (Ladder Measurements) */}
              <line x1="170" y1="30" x2="270" y2="170" stroke="#047857" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <text x="210" y="95" fill="#047857" fontSize="9" fontWeight="700">142.4 m</text>

              {/* Boundary Stones (G1, G2, G3, G4) */}
              <g transform="translate(170, 30)">
                <circle r="4.5" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />
                <text x="-16" y="-6" fill="#02180d" fontSize="9" fontWeight="800">G1 (NW)</text>
              </g>
              <g transform="translate(280, 40)">
                <circle r="4.5" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />
                <text x="8" y="-4" fill="#02180d" fontSize="9" fontWeight="800">G2 (NE)</text>
              </g>
              <g transform="translate(270, 170)">
                <circle r="4.5" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />
                <text x="8" y="14" fill="#02180d" fontSize="9" fontWeight="800">G3 (SE)</text>
              </g>
              <g transform="translate(160, 160)">
                <circle r="4.5" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />
                <text x="-20" y="16" fill="#02180d" fontSize="9" fontWeight="800">G4 (SW)</text>
              </g>

              {/* Center Parcel Label */}
              <g transform="translate(220, 105)">
                <rect x="-42" y="-12" width="84" height="24" rx="12" fill="#059669" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="800">
                  {parcel?.surveyNumber || '124/2A'}
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Cadastral Measurement Metrics Table */}
        <div className="spatial-metrics-column">
          <div className="spatial-kpi-card">
            <div className="spatial-kpi-row">
              <span className="kpi-label">FMB Record Extent:</span>
              <span className="kpi-value mono font-bold">{parcel?.area || '2.40 Acres'}</span>
            </div>
            <div className="spatial-kpi-row">
              <span className="kpi-label">GIS Vector Calculated:</span>
              <span className="kpi-value mono font-bold">2.398 Acres</span>
            </div>
            <div className="spatial-kpi-row">
              <span className="kpi-label">Geometric Area Delta:</span>
              <span className="kpi-value text-emerald font-semibold">-0.002 Acres (0.02%)</span>
            </div>
          </div>

          <div className="spatial-validation-checks">
            <div className="check-item-row pass">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Boundary Stones: 4 of 4 geo-tagged DGPS points verified</span>
            </div>
            <div className="check-item-row pass">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Encroachment Assessment: 0.00 Acres detected against neighbors</span>
            </div>
            <div className="check-item-row pass">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Public Pathway Access: 12ft approach road preserved in North</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
