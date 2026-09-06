import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle, ShieldAlert, CheckCircle2, Clock, ZoomIn, ZoomOut,
  RotateCcw, ArrowRight, Layers, Search, Filter, Sparkles, MapPin,
  ExternalLink, ChevronRight, Info
} from 'lucide-react';
import ConflictLegend from './ConflictLegend';
import RealConflictMap from './RealConflictMap';
import { getConflictGraph } from '../../services/parcelService';

export default function ConflictGraphView({ onSelectParcel = () => {} }) {
  const [graphData, setGraphData] = useState(() => getConflictGraph());
  const [viewMode, setViewMode] = useState('realmap'); // 'realmap' | 'graph'
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, CONTRADICTION, REVIEW, VERIFIED
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeSearch, setActiveSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);

  // Reload graph data on mount or when decisions change
  useEffect(() => {
    setGraphData(getConflictGraph());
  }, []);

  const { nodes, links, stats } = graphData;

  // Filtered nodes
  const filteredNodes = nodes.filter(node => {
    const matchesStatus = 
      selectedFilter === 'ALL' ||
      node.status === selectedFilter;
    const matchesSearch = 
      !activeSearch ||
      node.id.toLowerCase().includes(activeSearch.toLowerCase()) ||
      node.surveyNumber.toLowerCase().includes(activeSearch.toLowerCase()) ||
      node.village.toLowerCase().includes(activeSearch.toLowerCase()) ||
      node.owner.toLowerCase().includes(activeSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pan and drag handlers
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'graph-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node position helper lookup
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const getNodeColor = (status) => {
    switch (status) {
      case 'CONTRADICTION':
        return { fill: '#fee2e2', stroke: '#dc2626', text: '#991b1b', pulse: true };
      case 'REVIEW':
        return { fill: '#fef3c7', stroke: '#d97706', text: '#92400e', pulse: false };
      case 'VERIFIED':
      default:
        return { fill: '#d1fae5', stroke: '#059669', text: '#065f46', pulse: false };
    }
  };

  return (
    <div className="conflict-graph-root">
      {/* ===================================================================
          1. HEADER & KPI METRICS
          =================================================================== */}
      <div className="conflict-header-row">
        <div className="conflict-title-group">
          <div className="conflict-eyebrow">
            <span className="live-pulse-dot" />
            <span>NILORA CADASTRAL GRAPH ENGINE</span>
          </div>
          <h1 className="conflict-heading">Conflict Overview</h1>
          <p className="conflict-subheading">
            Review parcels requiring verification. Nodes map active multi-source contradictions across mutation, survey, and identity registries.
          </p>
        </div>

        {/* Compact KPI Tiles */}
        <div className="conflict-kpis">
          <div className="conflict-kpi red" onClick={() => setSelectedFilter('CONTRADICTION')}>
            <div className="kpi-icon-wrap">
              <AlertTriangle size={18} />
            </div>
            <div className="kpi-info">
              <span className="kpi-num">{stats.activeConflicts}</span>
              <span className="kpi-tag">Active Conflicts</span>
            </div>
          </div>

          <div className="conflict-kpi amber" onClick={() => setSelectedFilter('REVIEW')}>
            <div className="kpi-icon-wrap">
              <ShieldAlert size={18} />
            </div>
            <div className="kpi-info">
              <span className="kpi-num">{stats.needsReview}</span>
              <span className="kpi-tag">Needs Review</span>
            </div>
          </div>

          <div className="conflict-kpi purple" onClick={() => setSelectedFilter('ALL')}>
            <div className="kpi-icon-wrap">
              <Layers size={18} />
            </div>
            <div className="kpi-info">
              <span className="kpi-num">{nodes.length}</span>
              <span className="kpi-tag">Monitored Parcels</span>
            </div>
          </div>

          <div className="conflict-kpi green" onClick={() => setSelectedFilter('VERIFIED')}>
            <div className="kpi-icon-wrap">
              <CheckCircle2 size={18} />
            </div>
            <div className="kpi-info">
              <span className="kpi-num">{stats.recentlyResolved}</span>
              <span className="kpi-tag">Resolved / Clean</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. TOOLBAR & CONTROLS
          =================================================================== */}
      <div className="conflict-toolbar">
        {/* View Mode Switcher: Real Map vs Graph */}
        <div className="view-mode-toggle-group">
          <button 
            className={`view-mode-toggle-btn ${viewMode === 'realmap' ? 'active' : ''}`}
            onClick={() => setViewMode('realmap')}
          >
            <MapPin size={14} />
            <span>Real Cadastral Map (Square Red Zone)</span>
          </button>
          <button 
            className={`view-mode-toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setViewMode('graph')}
          >
            <Layers size={14} />
            <span>Topological Conflict Graph</span>
          </button>
        </div>

        <div className="filter-pill-group">
          <button 
            className={`filter-pill ${selectedFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('ALL')}
          >
            All ({nodes.length})
          </button>
          <button 
            className={`filter-pill red ${selectedFilter === 'CONTRADICTION' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('CONTRADICTION')}
          >
            Contradictions ({stats.activeConflicts})
          </button>
          <button 
            className={`filter-pill amber ${selectedFilter === 'REVIEW' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('REVIEW')}
          >
            Review ({stats.needsReview})
          </button>
          <button 
            className={`filter-pill green ${selectedFilter === 'VERIFIED' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('VERIFIED')}
          >
            Verified ({nodes.filter(n => n.status === 'VERIFIED').length})
          </button>
        </div>

        <div className="toolbar-search-wrap">
          <Search size={15} className="toolbar-search-icon" />
          <input
            type="text"
            placeholder="Filter survey no, owner, village..."
            value={activeSearch}
            onChange={(e) => setActiveSearch(e.target.value)}
          />
          {activeSearch && (
            <button className="clear-search-btn" onClick={() => setActiveSearch('')}>×</button>
          )}
        </div>

        {viewMode === 'graph' && (
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={() => setZoom(z => Math.min(z + 0.15, 2.0))} title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button className="zoom-btn" onClick={() => setZoom(z => Math.max(z - 0.15, 0.6))} title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <button className="zoom-btn" onClick={resetView} title="Reset View">
              <RotateCcw size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ===================================================================
          3. INTERACTIVE CONFLICT WORKSPACE (REAL MAP OR TOPOLOGICAL GRAPH)
          =================================================================== */}
      <div className="graph-workspace-layout">
        {viewMode === 'realmap' ? (
          <RealConflictMap
            selectedId="LR-124/2A"
            onSelectParcel={onSelectParcel}
          />
        ) : (
          <div 
            className="graph-canvas-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
          <svg
            ref={svgRef}
            id="graph-bg"
            className="conflict-svg-canvas"
            viewBox="0 0 900 480"
          >
            <defs>
              {/* Radial gradient for hero node pulsing glow */}
              <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#dc2626" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
              </radialGradient>
              
              <radialGradient id="amber-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </radialGradient>

              {/* Marker arrows for conflict links */}
              <marker id="arrow-critical" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
                <path d="M0,1 L7,4 L0,7 Z" fill="#dc2626" />
              </marker>
              <marker id="arrow-warning" markerWidth="8" markerHeight="8" refX="20" refY="4" orient="auto">
                <path d="M0,1 L7,4 L0,7 Z" fill="#d97706" />
              </marker>
            </defs>

            {/* Background grid pattern */}
            <g className="graph-grid-pattern" opacity="0.45">
              {Array.from({ length: 18 }).map((_, i) => (
                <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="480" stroke="#c2ddcb" strokeWidth="0.6" strokeDasharray="3 3" />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`h-${i}`} x1="0" y1={i * 50} x2="900" y2={i * 50} stroke="#c2ddcb" strokeWidth="0.6" strokeDasharray="3 3" />
              ))}
            </g>

            {/* Transform Group for Pan & Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* ==================== EDGES / LINKS ==================== */}
              <g className="graph-links-layer">
                {links.map((link, idx) => {
                  const source = nodeMap[link.source];
                  const target = nodeMap[link.target];
                  if (!source || !target) return null;

                  const isCritical = link.type === 'CONFLICT_CRITICAL';
                  const isWarning = link.type === 'CONFLICT_WARNING';

                  // Calculate midpoint for label
                  const midX = (source.x + target.x) / 2;
                  const midY = (source.y + target.y) / 2;

                  return (
                    <g key={`link-${idx}`} className={`graph-edge-group ${isCritical ? 'edge-critical' : ''}`}>
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={link.color}
                        strokeWidth={isCritical ? 2.5 : isWarning ? 2.0 : 1.4}
                        strokeDasharray={link.dashed ? '6 4' : 'none'}
                        className={isCritical ? 'animated-critical-link' : ''}
                      />
                      
                      {/* Interactive edge badge */}
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-65"
                          y="-10"
                          width="130"
                          height="20"
                          rx="10"
                          fill="#ffffff"
                          stroke={link.color}
                          strokeWidth="1.2"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill="#0f3822"
                          fontSize="9.5"
                          fontWeight="700"
                          fontFamily="Plus Jakarta Sans, sans-serif"
                        >
                          {link.relation.length > 22 ? link.relation.slice(0, 20) + '…' : link.relation}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* ==================== NODES ==================== */}
              <g className="graph-nodes-layer">
                {nodes.map(node => {
                  const isVisible = filteredNodes.some(fn => fn.id === node.id);
                  const colors = getNodeColor(node.status);
                  const isHovered = hoveredNode?.id === node.id;
                  const isHero = node.isHero;

                  return (
                    <g
                      key={node.id}
                      className={`graph-node-group ${node.status.toLowerCase()} ${isHero ? 'hero-node' : ''}`}
                      transform={`translate(${node.x}, ${node.y})`}
                      opacity={isVisible ? 1 : 0.25}
                      style={{ cursor: 'pointer', transition: 'all 0.25s ease' }}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => onSelectParcel(node.id)}
                    >
                      {/* Pulsing ring for Red Contradiction Nodes */}
                      {node.status === 'CONTRADICTION' && (
                        <>
                          <circle
                            r={node.radius + 18}
                            fill="url(#hero-glow)"
                            className="pulse-halo"
                          />
                          <circle
                            r={node.radius + 8}
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            className="spin-ring"
                          />
                        </>
                      )}

                      {/* Amber glow for Review Nodes */}
                      {node.status === 'REVIEW' && (
                        <circle
                          r={node.radius + 10}
                          fill="url(#amber-glow)"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={node.radius}
                        fill={colors.fill}
                        stroke={colors.stroke}
                        strokeWidth={isHero ? 3.5 : 2.5}
                        filter="drop-shadow(0 4px 10px rgba(0,0,0,0.12))"
                        className={isHovered ? 'node-circle-hover' : ''}
                      />

                      {/* Node Label Text */}
                      <text
                        textAnchor="middle"
                        y="-4"
                        fill={colors.text}
                        fontSize={isHero ? "12" : "10.5"}
                        fontWeight="800"
                        fontFamily="IBM Plex Mono, monospace"
                      >
                        {node.surveyNumber}
                      </text>

                      <text
                        textAnchor="middle"
                        y="10"
                        fill="#1b4931"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                      >
                        {node.village}
                      </text>

                      {/* Hero / Critical Badge */}
                      {isHero && (
                        <g transform={`translate(0, ${-node.radius - 8})`}>
                          <rect
                            x="-24"
                            y="-9"
                            width="48"
                            height="16"
                            rx="8"
                            fill="#dc2626"
                          />
                          <text
                            x="0"
                            y="2.5"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="8.5"
                            fontWeight="800"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                          >
                            HERO
                          </text>
                        </g>
                      )}

                      {/* Conflict count pill */}
                      {node.conflictsCount > 0 && (
                        <g transform={`translate(${node.radius - 6}, ${-node.radius + 6})`}>
                          <circle r="9" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="800"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                          >
                            !
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredNode && (
            <div
              className="node-hover-tooltip"
              style={{
                left: `${hoveredNode.x * zoom + pan.x}px`,
                top: `${(hoveredNode.y - hoveredNode.radius - 20) * zoom + pan.y}px`
              }}
            >
              <div className="tooltip-header">
                <span className="tooltip-id">{hoveredNode.id}</span>
                <span className={`tooltip-badge ${hoveredNode.status.toLowerCase()}`}>
                  {hoveredNode.status === 'CONTRADICTION' ? 'Contradiction' : hoveredNode.status === 'REVIEW' ? 'Needs Review' : 'Verified'}
                </span>
              </div>
              <div className="tooltip-body">
                <div className="tooltip-row">
                  <span className="t-label">Survey:</span>
                  <span className="t-val mono">{hoveredNode.surveyNumber}</span>
                </div>
                <div className="tooltip-row">
                  <span className="t-label">Location:</span>
                  <span className="t-val">{hoveredNode.village}, Coimbatore</span>
                </div>
                <div className="tooltip-row">
                  <span className="t-label">Current Owner:</span>
                  <span className="t-val bold">{hoveredNode.owner}</span>
                </div>
                <div className="tooltip-row">
                  <span className="t-label">Trust Score:</span>
                  <span className="t-val bold">{hoveredNode.riskScore}%</span>
                </div>
              </div>
              <div className="tooltip-footer">
                <span>Click node to investigate dossier →</span>
              </div>
            </div>
          )}

          {/* Floating Canvas Legend */}
          <div className="floating-legend-box">
            <ConflictLegend />
          </div>
        </div>
        )}

        {/* ===================================================================
            4. ACTIVE CONFLICTS QUEUE SIDEBAR (Intelligently Preserved)
            =================================================================== */}
        <div className="conflict-sidebar-queue">
          <div className="queue-header">
            <div className="queue-title-row">
              <AlertTriangle size={17} className="text-red" />
              <h3>Flagged Parcels Queue</h3>
            </div>
            <span className="queue-counter">{filteredNodes.length} Parcels</span>
          </div>

          <div className="queue-list">
            {filteredNodes.map(parcel => {
              const isHero = parcel.isHero;
              const isContradiction = parcel.status === 'CONTRADICTION';

              return (
                <div
                  key={parcel.id}
                  className={`queue-item ${parcel.status.toLowerCase()} ${isHero ? 'hero-item' : ''}`}
                  onClick={() => onSelectParcel(parcel.id)}
                >
                  <div className="queue-item-top">
                    <span className="queue-item-id mono">{parcel.id}</span>
                    <span className={`status-tag ${parcel.status.toLowerCase()}`}>
                      {isContradiction ? 'Contradiction' : parcel.status === 'REVIEW' ? 'Review' : 'Verified'}
                    </span>
                  </div>

                  <div className="queue-item-details">
                    <div className="detail-line">
                      <span className="d-label">Survey:</span>
                      <span className="d-val mono">{parcel.surveyNumber}</span>
                      <span className="d-divider">•</span>
                      <span className="d-val">{parcel.village}</span>
                    </div>
                    <div className="detail-line">
                      <span className="d-label">Owner:</span>
                      <span className="d-val bold">{parcel.owner}</span>
                    </div>
                  </div>

                  <div className="queue-item-action">
                    <span className="trust-meter">
                      Trust: <b>{parcel.riskScore}%</b>
                    </span>
                    <button className="btn-investigate-mini">
                      Investigate <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
