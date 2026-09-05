import React from 'react';

/**
 * Minimal, professional GIS controls for MapLibre instance
 */
export default function MapControls({
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onToggle3D,
  is3D,
  onLocate,
  onToggleFullscreen,
  isFullscreen
}) {
  return (
    <div className="gis-map-controls-panel">
      {/* Zoom In / Out */}
      <div className="gis-ctrl-group">
        <button 
          className="gis-ctrl-btn" 
          onClick={onZoomIn} 
          title="Zoom In"
          aria-label="Zoom In"
        >
          +
        </button>
        <button 
          className="gis-ctrl-btn" 
          onClick={onZoomOut} 
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          −
        </button>
      </div>

      {/* 3D / 2D Toggle */}
      <div className="gis-ctrl-group">
        <button 
          className={`gis-ctrl-btn ${is3D ? 'active-3d' : ''}`} 
          onClick={onToggle3D} 
          title={is3D ? "Switch to 2D Top-Down" : "Switch to 3D Tilted Perspective"}
          aria-label="Toggle 3D Perspective"
        >
          {is3D ? '3D' : '2D'}
        </button>
      </div>

      {/* Reset North / Compass */}
      <div className="gis-ctrl-group">
        <button 
          className="gis-ctrl-btn" 
          onClick={onResetNorth} 
          title="Reset North Orientation"
          aria-label="Reset North"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill="#10b981" />
          </svg>
        </button>
        <button 
          className="gis-ctrl-btn" 
          onClick={onLocate} 
          title="Center on Cadastral Hub"
          aria-label="Center Location"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <line x1="12" y1="1" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="23" />
            <line x1="1" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="23" y2="12" />
          </svg>
        </button>
      </div>

      {/* Fullscreen Toggle */}
      <div className="gis-ctrl-group">
        <button 
          className="gis-ctrl-btn" 
          onClick={onToggleFullscreen} 
          title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen Map"}
          aria-label="Fullscreen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {isFullscreen ? (
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            ) : (
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
