import React, { useState } from 'react';
import { Network, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function PotentialDownstreamImpactGraph({
  graphData,
  onSelectNode = () => {}
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  if (!graphData) return null;

  const { impactRadiusSummary, riskLevel, nodes = [], links = [] } = graphData;

  const nodePositions = {
    'LR-124/2A': { x: 130, y: 110, shortLabel: 'Target Parcel', tag: 'LR-124/2A' },
    'LR-1021': { x: 130, y: 110, shortLabel: 'Target Parcel', tag: 'LR-1021' },
    'LR-1017': { x: 130, y: 110, shortLabel: 'Target Parcel', tag: 'LR-1017' },
    'LR-124/2B': { x: 420, y: 45, shortLabel: 'Sub-division Plot', tag: 'LR-124/2B' },
    'MUT-2026-8812': { x: 420, y: 110, shortLabel: 'Sale Transfer', tag: 'MUT-8812' },
    'BANK-CERSAI-091': { x: 420, y: 175, shortLabel: 'SBI Crop Loan', tag: '₹14.5L Loan' },
    'SCH-TN-AGRI-402': { x: 670, y: 110, shortLabel: 'Farmer Subsidy', tag: 'PM-KISAN' },
    'LR-1022': { x: 440, y: 60, shortLabel: 'Pathway Plot', tag: 'LR-1022' },
    'PWD-ROAD-11': { x: 440, y: 160, shortLabel: 'Road Project', tag: 'PWD Corridor' }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="minimal-graph-card downstream">
      {/* Sleek Minimalist Top Header */}
      <div className="minimal-graph-header downstream-header">
        <div className="mgh-left">
          <Network size={15} className="text-amber" />
          <span className="mgh-title">Potential Downstream Impact Topology</span>
          <span className="mgh-badge amber">{riskLevel || 'Elevated Exposure'}</span>
        </div>
        <span className="mgh-hint font-medium">{impactRadiusSummary || 'Potentially affected downstream records'}</span>
      </div>

      {/* Clean SVG Canvas */}
      <div className="minimal-svg-box">
        <svg viewBox="0 0 780 220" className="minimal-graph-svg">
          <defs>
            <marker id="m-arrow-amber-ds" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#d97706" />
            </marker>
          </defs>

          {/* Links */}
          {links.map((link, idx) => {
            const start = nodePositions[link.from] || { x: 130, y: 110 };
            const end = nodePositions[link.to] || { x: 420, y: 50 + idx * 60 };

            return (
              <g key={`dl-${idx}`}>
                <path
                  d={`M ${start.x + 50} ${start.y} C ${(start.x + end.x) / 2} ${start.y}, ${(start.x + end.x) / 2} ${end.y}, ${end.x - 50} ${end.y}`}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  markerEnd="url(#m-arrow-amber-ds)"
                />
              </g>
            );
          })}

          {/* Minimalist Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 130, y: 110, shortLabel: node.label, tag: node.id };
            const isSelected = selectedNodeId === node.id;
            const isOrigin = node.isOrigin || node.type === 'PRIMARY_DISCREPANT_PARCEL';

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
                {/* Outer Ring for Target Origin */}
                {isOrigin && (
                  <circle r="30" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
                )}

                {/* Node Pill */}
                <rect
                  x="-52"
                  y="-20"
                  width="104"
                  height="40"
                  rx="20"
                  fill={isOrigin ? '#fee2e2' : isSelected ? '#fef3c7' : '#ffffff'}
                  stroke={isOrigin ? '#dc2626' : isSelected ? '#d97706' : '#fcd34d'}
                  strokeWidth={isOrigin || isSelected ? 2 : 1.2}
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
                />

                {/* Top Tag */}
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fill={isOrigin ? '#991b1b' : '#92400e'}
                  fontSize="9.5"
                  fontWeight="800"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {pos.tag}
                </text>

                {/* Descriptor */}
                <text
                  x="0"
                  y="9"
                  textAnchor="middle"
                  fill="#02180d"
                  fontSize="8"
                  fontWeight="700"
                >
                  {pos.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Summary */}
      {selectedNode && (
        <div className="minimal-node-footer downstream">
          <div className="mnf-left">
            <span className="mnf-id mono">{selectedNode.id}</span>
            <span className="mnf-title">{selectedNode.label}</span>
            <span className={`mnf-status ${selectedNode.isOrigin ? 'red' : 'amber'}`}>
              {selectedNode.isOrigin ? 'Target Origin' : 'Potentially Affected'}
            </span>
          </div>
          <span className="mnf-desc">{selectedNode.riskNote || selectedNode.sub}</span>
        </div>
      )}
    </div>
  );
}
