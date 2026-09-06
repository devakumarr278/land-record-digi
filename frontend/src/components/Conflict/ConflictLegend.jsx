import React from 'react';

export default function ConflictLegend() {
  return (
    <div className="conflict-legend">
      <div className="legend-title">Graph Legend</div>
      <div className="legend-grid">
        <div className="legend-item">
          <span className="legend-dot dot-contradiction" />
          <span className="legend-text">Contradiction (Active Discrepancy)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-review" />
          <span className="legend-text">Needs Review (Uncertain/Variance)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-verified" />
          <span className="legend-text">Verified (Concordant Records)</span>
        </div>
        <div className="legend-divider" />
        <div className="legend-item">
          <span className="legend-line line-critical" />
          <span className="legend-text">Critical Conflict Link (Overlap/Breach)</span>
        </div>
        <div className="legend-item">
          <span className="legend-line line-warning" />
          <span className="legend-text">Cross-Source Caveat</span>
        </div>
        <div className="legend-item">
          <span className="legend-line line-neutral" />
          <span className="legend-text">Lineage / Adjacency Relation</span>
        </div>
      </div>
    </div>
  );
}
