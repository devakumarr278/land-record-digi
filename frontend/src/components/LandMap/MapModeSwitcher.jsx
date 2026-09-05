import React from 'react';

/**
 * Switcher between the three functional GIS map modes:
 * - Hybrid Overlay: Satellite Base + Vector Cadastral Polygons + Survey Labels
 * - Satellite Drone: Pure High-Res Aerial Satellite
 * - Cadastral Map: Survey Department Dark Cartography
 */
export default function MapModeSwitcher({ activeMode, onModeChange }) {
  const modes = [
    { id: 'hybrid', label: 'Hybrid Overlay', icon: '🌐' },
    { id: 'satellite', label: 'Satellite Drone', icon: '🛰️' },
    { id: 'cadastral', label: 'Cadastral Map', icon: '📐' }
  ];

  return (
    <div className="gis-layer-toggles" role="tablist" aria-label="GIS Map Display Modes">
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={activeMode === mode.id}
          className={`layer-btn ${activeMode === mode.id ? 'active' : ''}`}
          onClick={() => onModeChange(mode.id)}
          title={`Switch to ${mode.label}`}
        >
          <span className="layer-icon">{mode.icon}</span>
          <span className="layer-label">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

