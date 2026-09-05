/**
 * Map Configuration for Intelligent Land Record Digitization & Validation System
 * 
 * Supports configurable open-source base maps, satellite raster layers,
 * and cadastral endpoints. Readily extensible via environment variables.
 */

export const MAP_CONFIG = {
  // Center coordinates for the prototype region (Coimbatore / Alangudi Agricultural Belt)
  defaultCenter: [76.9558, 11.0168],
  defaultZoom: 16.2,
  defaultPitch: 45,
  defaultBearing: -12,
  
  // 3D Perspective settings for zoomed-in parcel inspection
  inspectPitch: 55,
  inspectZoom: 17.5,
  inspectBearing: -18,
  inspectDuration: 2400,

  // Map tile providers
  sources: {
    // Real satellite imagery provider (Esri World Imagery / Open Aerial)
    satellite: {
      type: 'raster',
      tiles: [
        import.meta.env.VITE_SATELLITE_TILE_URL || 
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '© Esri, Maxar, Earthstar Geographics, GIS User Community',
      maxzoom: 19
    },

    // OpenStreetMap base tiles for reference / fallback
    osm: {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19
    },

    // Dark CartoDB cartography for dark cadastral mode
    darkBase: {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© CARTO, © OpenStreetMap',
      maxzoom: 19
    }
  },

  // Color theme variables for Cadastral Layers
  colors: {
    parcelBorder: '#10b981',
    parcelBorderMuted: 'rgba(16, 185, 129, 0.45)',
    parcelFillDefault: 'rgba(16, 185, 129, 0.05)',
    parcelFillHover: 'rgba(16, 185, 129, 0.18)',
    parcelFillSelected: 'rgba(16, 185, 129, 0.28)',
    parcelSelectedGlow: '#ffffff',
    cadastralBg: '#06160f',
    cadastralGrid: 'rgba(255, 255, 255, 0.08)',
    cadastralRoad: '#143828',
    cadastralWater: '#0c2436'
  }
};
