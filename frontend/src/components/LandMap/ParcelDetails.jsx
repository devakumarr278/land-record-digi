import React from 'react';

/**
 * Right-side Selected Parcel Details panel matching exact design hierarchy
 */
export default function ParcelDetails({ parcel, onRequestExtract }) {
  if (!parcel) {
    return (
      <div className="gis-info-sidebar">
        <div className="sidebar-empty-state">
          <span className="empty-icon">📍</span>
          <h4>No Parcel Selected</h4>
          <p>Click on any cadastral parcel boundary or search a survey number to inspect details.</p>
        </div>
      </div>
    );
  }

  const props = parcel.properties || parcel;

  return (
    <div className="gis-info-sidebar">
      <div>
        <div className="sidebar-heading">
          <span>Selected Parcel Details</span>
          <span className="verified-badge-pill">
            <span className="dot-badge">●</span>
            <span>{props.mutationStatus || props.status || 'Validated'}</span>
          </span>
        </div>

        <div className="sidebar-stat-list">
          <div className="sidebar-stat-row">
            <span className="data-label">Survey No</span>
            <span className="data-value accent-survey">{props.surveyNumber || props.surveyNo}</span>
          </div>

          <div className="sidebar-stat-row">
            <span className="data-label">Primary Holder</span>
            <span className="data-value">{props.owner}</span>
          </div>

          <div className="sidebar-stat-row">
            <span className="data-label">Total Extent</span>
            <span className="data-value">{props.area ? `${props.area} Acres` : props.extent}</span>
          </div>

          <div className="sidebar-stat-row">
            <span className="data-label">Coordinates</span>
            <span className="data-value mono-coords">{props.coords || (props.center ? `${props.center[1].toFixed(4)}° N, ${props.center[0].toFixed(4)}° E` : '')}</span>
          </div>

          <div className="sidebar-stat-row">
            <span className="data-label">Classification</span>
            <span className="data-value">{props.classification || 'Dry Agricultural (Punja)'}</span>
          </div>

          <div className="sidebar-stat-row">
            <span className="data-label">Soil Composition</span>
            <span className="data-value">{props.soilComposition || props.soil || 'Red Loam'}</span>
          </div>

          {props.pattaNumber && (
            <div className="sidebar-stat-row">
              <span className="data-label">Patta Number</span>
              <span className="data-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{props.pattaNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          className="btn-primary-teal" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => onRequestExtract && onRequestExtract(props)}
        >
          Request Certified Extract
        </button>
      </div>
    </div>
  );
}
