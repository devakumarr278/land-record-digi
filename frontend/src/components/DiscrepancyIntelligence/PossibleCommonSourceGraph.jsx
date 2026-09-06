import React, { useState } from 'react';
import { Sparkles, GitCommit, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function PossibleCommonSourceGraph({
  graphData,
  onSelectNode = () => {}
}) {
  const [selectedNodeId, setSelectedNodeId] = useState('SRC-2017-GAP');

  if (!graphData) return null;

  const { inferredSourceTitle, inferredConfidence, nodes = [], links = [] } = graphData;

  const nodePositions = {
    'SRC-1980': { x: 100, y: 110, shortLabel: '1980 Grant', year: '1980' },
    'SRC-1985': { x: 100, y: 110, shortLabel: '1985 Baseline', year: '1985' },
    'SRC-1996': { x: 290, y: 110, shortLabel: '1996 Sale Deed', year: '1996' },
    'SRC-1998-ROAD': { x: 330, y: 110, shortLabel: '1998 Road Shift', year: '1998' },
    'SRC-1999': { x: 180, y: 110, shortLabel: '1999 Sale Deed', year: '1999' },
    'SRC-2012': { x: 480, y: 110, shortLabel: '2012 Demise', year: '2012' },
    'SRC-2017-GAP': { x: 670, y: 110, shortLabel: '2017 SRO Gap', year: '2017' },
    'SRC-2008-DEED': { x: 570, y: 110, shortLabel: '2008 Area Variance', year: '2008' },
    'SRC-2021-INGEST': { x: 520, y: 110, shortLabel: '2021 Portal Ingestion', year: '2021' }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[nodes.length - 1];

  return (
    <div className="minimal-graph-card">
      {/* Sleek Minimalist Top Header */}
      <div className="minimal-graph-header">
        <div className="mgh-left">
          <Sparkles size={15} className="text-emerald" />
          <span className="mgh-title">Possible Common Source Topology</span>
          <span className="mgh-badge green">{inferredConfidence || '89% Inferred Confidence'}</span>
        </div>
        <span className="mgh-hint">Click any node to inspect archival proofs</span>
      </div>

      {/* Clean SVG Canvas */}
      <div className="minimal-svg-box">
        <svg viewBox="0 0 780 200" className="minimal-graph-svg">
          <defs>
            <marker id="m-arrow-green" markerWidth="6" markerHeight="6" refX="15" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#059669" />
            </marker>
            <marker id="m-arrow-amber" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#d97706" />
            </marker>
          </defs>

          {/* Clean Subtle Axis Line */}
          <line x1="50" y1="110" x2="730" y2="110" stroke="#e2f4ea" strokeWidth="2" strokeDasharray="4 4" />

          {/* Links */}
          {links.map((link, idx) => {
            const start = nodePositions[link.from] || { x: 100 + idx * 180, y: 110 };
            const end = nodePositions[link.to] || { x: 280 + idx * 180, y: 110 };
            const isInferred = link.type === 'INFERRED_GAP' || link.type === 'DISCREPANT_LINK';

            return (
              <g key={`l-${idx}`}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={isInferred ? '#d97706' : '#059669'}
                  strokeWidth={isInferred ? 2 : 1.8}
                  strokeDasharray={isInferred ? '5 4' : 'none'}
                  markerEnd={isInferred ? 'url(#m-arrow-amber)' : 'url(#m-arrow-green)'}
                />
                {/* Compact Micro-label */}
                <text
                  x={(start.x + end.x) / 2}
                  y={110 - 10}
                  textAnchor="middle"
                  fill={isInferred ? '#b45309' : '#047857'}
                  fontSize="9"
                  fontWeight="700"
                >
                  {isInferred ? '⚠ Lineage Severance' : '✓ Verified Chain'}
                </text>
              </g>
            );
          })}

          {/* Minimalist Rounded Pill Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 100, y: 110, shortLabel: node.label, year: node.year };
            const isSelected = selectedNodeId === node.id;
            const isHighlight = node.isHighlight || node.type === 'POSSIBLE_COMMON_SOURCE';

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  onSelectNode(node);
                }}
              >
                {/* Highlight Aura */}
                {isHighlight && (
                  <circle r="30" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.9" />
                )}

                {/* Node Pill */}
                <rect
                  x="-52"
                  y="-22"
                  width="104"
                  height="44"
                  rx="22"
                  fill={isHighlight ? '#fef3c7' : isSelected ? '#d1fae5' : '#ffffff'}
                  stroke={isHighlight ? '#d97706' : isSelected ? '#047857' : '#c2ddcb'}
                  strokeWidth={isSelected || isHighlight ? 2 : 1.2}
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
                />

                {/* Year Pill Tag */}
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  fill={isHighlight ? '#b45309' : '#047857'}
                  fontSize="10.5"
                  fontWeight="800"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {pos.year || node.year || 'DOC'}
                </text>

                {/* Short Descriptor */}
                <text
                  x="0"
                  y="10"
                  textAnchor="middle"
                  fill="#02180d"
                  fontSize="8.5"
                  fontWeight="700"
                >
                  {pos.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Focused Node Summary Drawer */}
      {selectedNode && (
        <div className="minimal-node-footer">
          <div className="mnf-left">
            <span className="mnf-id mono">{selectedNode.id}</span>
            <span className="mnf-title">{selectedNode.label}</span>
            <span className={`mnf-status ${selectedNode.type === 'POSSIBLE_COMMON_SOURCE' ? 'amber' : 'green'}`}>
              {selectedNode.type === 'POSSIBLE_COMMON_SOURCE' ? 'Inferred Possible Origin' : selectedNode.status}
            </span>
          </div>
          <span className="mnf-desc">{selectedNode.sub}</span>
        </div>
      )}
    </div>
  );
}
