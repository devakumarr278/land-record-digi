/**
 * Map Configuration for Intelligent Land Record Digitization & Validation System
 * 
 * Configures open-source base maps, satellite raster layers,
 * and vector cadastral cartography without 3rd-party API key requirements.
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

  // Map tile providers (Satellite & Cadastral Topo - No API Key Required)
  sources: {
    // Satellite imagery provider (Esri World Imagery) - used for Hybrid & Satellite modes
    satellite: {
      type: 'raster',
      tiles: [
        import.meta.env.VITE_SATELLITE_TILE_URL || 
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '© Esri, Maxar, Earthstar Geographics',
      maxzoom: 19
    },

    // Cadastral Topographic Survey Base (Esri World Topo Map) - 100% Free, No API Key Required
    cadastralTopo: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '© Esri, HERE, Garmin, Intermap',
      maxzoom: 19
    },

    // OpenStreetMap base tiles for fallback reference
    osm: {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19
    }
  },

  // Color theme variables for Cadastral Layers
  colors: {
    parcelBorder: '#10b981',
    parcelBorderMuted: 'rgba(16, 185, 129, 0.45)',
    parcelFillDefault: 'rgba(16, 185, 129, 0.12)',
    parcelFillHover: 'rgba(16, 185, 129, 0.25)',
    parcelFillSelected: 'rgba(16, 185, 129, 0.38)',
    parcelSelectedGlow: '#ffffff',
    cadastralGrid: 'rgba(45, 212, 191, 0.25)',
    cadastralRoadCasing: '#022417',
    cadastralRoadFill: '#0f3c27',
    cadastralRoadCenter: 'rgba(255, 255, 255, 0.6)',
    cadastralWater: '#0c2d3d',
    cadastralWaterLine: '#0284c7',
    cadastralVillageBorder: '#d97706',
    cadastralSurroundingFill: 'rgba(6, 78, 59, 0.15)',
    cadastralSurroundingLine: 'rgba(16, 185, 129, 0.45)'
  }
};
