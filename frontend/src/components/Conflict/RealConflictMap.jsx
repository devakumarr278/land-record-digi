import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle, ShieldAlert, Layers, ZoomIn, ZoomOut, Crosshair,
  Maximize2, ArrowRight, Eye, CheckCircle2, Sparkles, MapPin
} from 'lucide-react';

/* =========================================================================
   REAL CADASTRAL GEOJSON WITH HIGHLIGHTED RED CONFLICT ZONES
   ========================================================================= */
const CONFLICT_PARCELS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    // HERO CONFLICT PARCEL LR-124/2A (Kinathukadavu)
    {
      type: 'Feature',
      id: 'LR-124/2A',
      properties: {
        id: 'LR-124/2A',
        survey: '124/2A',
        village: 'Kinathukadavu',
        taluk: 'Pollachi',
        district: 'Coimbatore',
        owner: 'Kannan',
        area: '2.40 Acres',
        status: 'CONTRADICTION',
        statusLabel: 'Contradiction Detected',
        conflictTitle: 'Break in Mutation Chain (2017)',
        conflictDetail: 'Mutation recorded without probate from 2008 heir Ramasamy. Cross-source disagreement with Sub-Registrar Index II.',
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.6,
        isHero: true
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.0152, 10.8258],
          [77.0188, 10.8268],
          [77.0195, 10.8242],
          [77.0160, 10.8232],
          [77.0152, 10.8258]
        ]]
      }
    },
    // CONFLICT PARCEL LR-1021 (Survey 125/2)
    {
      type: 'Feature',
      id: 'LR-1021',
      properties: {
        id: 'LR-1021',
        survey: '125/2',
        village: 'Kinathukadavu',
        taluk: 'Pollachi',
        district: 'Coimbatore',
        owner: 'Ravi Kumar',
        area: '2.50 Acres',
        status: 'CONTRADICTION',
        statusLabel: 'Spatial Variance',
        conflictTitle: 'Area Variance (2.50 vs 2.10 Ac)',
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.45,
        isHero: false
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.0188, 10.8268],
          [77.0222, 10.8278],
          [77.0230, 10.8250],
          [77.0195, 10.8242],
          [77.0188, 10.8268]
        ]]
      }
    },
    // REVIEW PARCEL LR-1017 (Survey 77/1)
    {
      type: 'Feature',
      id: 'LR-1017',
      properties: {
        id: 'LR-1017',
        survey: '77/1',
        village: 'Madukkarai',
        taluk: 'Sulur',
        district: 'Coimbatore',
        owner: 'Karthik S',
        area: '0.80 Acres',
        status: 'REVIEW',
        statusLabel: 'Needs Review',
        conflictTitle: 'Identity Spelling Variance',
        color: '#d97706',
        fillColor: '#f59e0b',
        fillOpacity: 0.4,
        isHero: false
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.0125, 10.8235],
          [77.0152, 10.8242],
          [77.0158, 10.8220],
          [77.0130, 10.8215],
          [77.0125, 10.8235]
        ]]
      }
    },
    // VERIFIED PARCEL LR-1014
    {
      type: 'Feature',
      id: 'LR-1014',
      properties: {
        id: 'LR-1014',
        survey: '118/3',
        village: 'Anaimalai',
        taluk: 'Pollachi',
        district: 'Coimbatore',
        owner: 'Meena R',
        area: '1.20 Acres',
        status: 'VERIFIED',
        statusLabel: 'Verified Title',
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.35,
        isHero: false
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.0160, 10.8232],
          [77.0195, 10.8242],
          [77.0202, 10.8218],
          [77.0168, 10.8210],
          [77.0160, 10.8232]
        ]]
      }
    },
    // VERIFIED PARCEL LR-1009
    {
      type: 'Feature',
      id: 'LR-1009',
      properties: {
        id: 'LR-1009',
        survey: '54/2',
        village: 'Sulur',
        taluk: 'Sulur',
        district: 'Coimbatore',
        owner: 'Deepa N',
        area: '3.10 Acres',
        status: 'VERIFIED',
        statusLabel: 'Verified Current',
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.35,
        isHero: false
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.0195, 10.8242],
          [77.0230, 10.8250],
          [77.0240, 10.8225],
          [77.0202, 10.8218],
          [77.0195, 10.8242]
        ]]
      }
    }
  ]
};

export default function RealConflictMap({
  selectedId = 'LR-124/2A',
  onSelectParcel = () => {}
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const [mapMode, setMapMode] = useState('satellite'); // 'satellite' | 'cadastral'
  const [hoveredParcel, setHoveredParcel] = useState(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered at Kinathukadavu Cadastral Survey Cluster
      const map = L.map(mapContainerRef.current, {
        center: [10.8248, 77.0180],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // Base Satellite Tile Layer (Esri World Imagery)
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      ).addTo(map);

      // CartoDB Positron for clean Cadastral Vector view
      const vectorLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      );

      mapInstanceRef.current._layers = { satellite: satelliteLayer, cadastral: vectorLayer };

      // Render Cadastral GeoJSON with Highlighted Red Conflict Zone
      renderGeojson(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map layer on mode change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInstanceRef.current._layers) return;
    const map = mapInstanceRef.current;
    const { satellite, cadastral } = map._layers;

    if (mapMode === 'satellite') {
      map.removeLayer(cadastral);
      map.addLayer(satellite);
    } else {
      map.removeLayer(satellite);
      map.addLayer(cadastral);
    }
  }, [mapMode]);

  const renderGeojson = (map) => {
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const layer = L.geoJSON(CONFLICT_PARCELS_GEOJSON, {
      style: (feature) => {
        const isConflict = feature.properties.status === 'CONTRADICTION';
        const isReview = feature.properties.status === 'REVIEW';
        const isHero = feature.properties.isHero;

        return {
          color: isConflict ? '#dc2626' : isReview ? '#d97706' : '#059669',
          weight: isHero ? 4 : isConflict ? 3 : 2,
          opacity: 1,
          fillColor: isConflict ? '#dc2626' : isReview ? '#f59e0b' : '#10b981',
          fillOpacity: isHero ? 0.65 : isConflict ? 0.5 : 0.35,
          dashArray: isConflict ? '' : isReview ? '4 4' : ''
        };
      },
      onEachFeature: (feature, layerItem) => {
        const p = feature.properties;
        const isHero = p.isHero;
        const isConflict = p.status === 'CONTRADICTION';

        // Permanent Custom Label on Hero Conflict Parcel
        if (isHero) {
          layerItem.bindTooltip(
            `<div class="map-conflict-tooltip-permanent">
              <div class="mct-badge">🔴 ACTIVE CONFLICT</div>
              <div class="mct-title">Survey ${p.survey} · ${p.area}</div>
              <div class="mct-owner">Owner: ${p.owner}</div>
              <div class="mct-issue">${p.conflictTitle}</div>
              <div class="mct-click">Click to Investigate Dossier →</div>
            </div>`,
            {
              permanent: true,
              direction: 'center',
              className: 'custom-leaflet-conflict-tooltip'
            }
          );
        } else {
          layerItem.bindTooltip(
            `<b>Survey ${p.survey}</b> (${p.village})<br/>Owner: ${p.owner}<br/>Status: ${p.statusLabel}`,
            { direction: 'top', className: 'custom-leaflet-tooltip' }
          );
        }

        layerItem.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 5, fillOpacity: 0.8 });
            setHoveredParcel(p);
          },
          mouseout: (e) => {
            layer.resetStyle(e.target);
            setHoveredParcel(null);
          },
          click: () => {
            onSelectParcel(p.id);
          }
        });
      }
    }).addTo(map);

    geojsonLayerRef.current = layer;
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([10.8248, 77.0180], 16, { duration: 0.8 });
    }
  };

  return (
    <div className="real-conflict-map-wrapper">
      {/* Real Map Square Container */}
      <div className="square-map-canvas-container">
        <div ref={mapContainerRef} className="leaflet-square-map" />

        {/* Map Top-Right Mode Switcher */}
        <div className="map-mode-floating-pills">
          <button
            className={`map-mode-pill ${mapMode === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapMode('satellite')}
          >
            Satellite Hybrid
          </button>
          <button
            className={`map-mode-pill ${mapMode === 'cadastral' ? 'active' : ''}`}
            onClick={() => setMapMode('cadastral')}
          >
            Cadastral FMB
          </button>
        </div>

        {/* Map Top-Left Legend Banner */}
        <div className="map-conflict-legend-badge">
          <span className="red-pulse-indicator" />
          <span><b>RED ZONE</b> = Active Contradiction (Survey 124/2A)</span>
        </div>

        {/* Map Floating Controls */}
        <div className="map-square-controls">
          <button
            className="map-sq-btn"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            className="map-sq-btn"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            className="map-sq-btn"
            onClick={handleRecenter}
            title="Focus Conflict Parcel"
          >
            <Crosshair size={16} />
          </button>
        </div>

        {/* Bottom Banner with Action */}
        <div 
          className="map-bottom-hero-bar"
          onClick={() => onSelectParcel('LR-124/2A')}
        >
          <div className="hero-bar-left">
            <AlertTriangle size={17} className="text-red" />
            <div className="hero-bar-text">
              <b>Flagged Conflict Area: Parcel 124/2A (Kinathukadavu)</b>
              <span>First Observed Divergence localized in Year 2017 · Break in Mutation Chain</span>
            </div>
          </div>
          <button className="btn-map-investigate-now">
            Investigate Dossier <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
