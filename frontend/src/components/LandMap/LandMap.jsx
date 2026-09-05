import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_CONFIG } from './mapConfig';
import { CADASTRAL_GEOJSON } from './cadastralData';
import { searchParcel } from './cadastralService';
import MapControls from './MapControls';
import MapModeSwitcher from './MapModeSwitcher';
import SurveySearch from './SurveySearch';
import ParcelDetails from './ParcelDetails';
import './LandMap.css';

/**
 * Safely extracts numerical [lng, lat] coordinates from any feature representation.
 * Handles Array, JSON-stringified array, or computes centroid from polygon geometry.
 */
function extractCenterCoordinates(feature) {
  if (!feature) return MAP_CONFIG.defaultCenter;
  const props = feature.properties || {};

  // 1. Direct props.center array
  if (Array.isArray(props.center) && props.center.length === 2 && typeof props.center[0] === 'number') {
    return [props.center[0], props.center[1]];
  }

  // 2. Stringified props.center
  if (typeof props.center === 'string') {
    try {
      const parsed = JSON.parse(props.center);
      if (Array.isArray(parsed) && parsed.length === 2 && typeof parsed[0] === 'number') {
        return [parsed[0], parsed[1]];
      }
    } catch (e) {}
  }

  // 3. Polygon Geometry Centroid calculation
  if (feature.geometry && feature.geometry.coordinates) {
    const geom = feature.geometry;
    let ring = null;
    if (geom.type === 'Polygon' && Array.isArray(geom.coordinates) && geom.coordinates.length > 0) {
      ring = geom.coordinates[0];
    } else if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates) && geom.coordinates[0]?.length > 0) {
      ring = geom.coordinates[0][0];
    }

    if (ring && ring.length > 0) {
      let sumLng = 0;
      let sumLat = 0;
      let count = 0;
      for (let i = 0; i < ring.length; i++) {
        const pt = ring[i];
        if (Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === 'number' && typeof pt[1] === 'number') {
          sumLng += pt[0];
          sumLat += pt[1];
          count++;
        }
      }
      if (count > 0) {
        return [Number((sumLng / count).toFixed(6)), Number((sumLat / count).toFixed(6))];
      }
    }
  }

  return MAP_CONFIG.defaultCenter;
}

/**
 * Real, Interactive 3D Cadastral GIS Map Component
 * Built with MapLibre GL JS + Open Geospatial Vector Layers + Satellite Imagery
 */
export default function LandMap({ onRequestExtract }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hoverPopupRef = useRef(null);
  const featuresRef = useRef([...CADASTRAL_GEOJSON.features]);
  const markersMapRef = useRef(new Map());

  // Map state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapMode, setMapMode] = useState('hybrid'); // 'hybrid' | 'satellite' | 'cadastral'
  const [selectedParcel, setSelectedParcel] = useState(CADASTRAL_GEOJSON.features[0]);
  const [is3D, setIs3D] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [searchError, setSearchError] = useState('');

  // Refs for callbacks to avoid stale closures
  const is3DRef = useRef(is3D);
  is3DRef.current = is3D;
  const mapModeRef = useRef(mapMode);
  mapModeRef.current = mapMode;
  const selectedParcelRef = useRef(selectedParcel);
  selectedParcelRef.current = selectedParcel;

  // 1. Highlight Selected Parcel in Map Layers & Markers
  const updateSelectedHighlight = useCallback((parcelId) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const id = parcelId || (selectedParcelRef.current ? (selectedParcelRef.current.properties?.parcelId || selectedParcelRef.current.id) : '');

    try {
      // Update fill color logic
      if (map.getLayer('cadastral-fill')) {
        map.setPaintProperty('cadastral-fill', 'fill-color', [
          'case',
          ['==', ['get', 'parcelId'], id],
          'rgba(16, 185, 129, 0.28)',
          'rgba(16, 185, 129, 0.05)'
        ]);
      }

      // Update selected highlight outline filter
      if (map.getLayer('cadastral-selected-glow')) {
        map.setFilter('cadastral-selected-glow', ['==', ['get', 'parcelId'], id]);
      }
    } catch (e) {
      console.warn('Error updating highlight styling:', e);
    }

    // Update DOM markers selected state
    document.querySelectorAll('.gis-survey-marker').forEach((el) => {
      if (el.getAttribute('data-id') === id) {
        el.classList.add('selected');
        if (mapModeRef.current === 'satellite') el.style.display = 'block';
      } else {
        el.classList.remove('selected');
        if (mapModeRef.current === 'satellite') el.style.display = 'none';
      }
    });
  }, []);

  // 2. Apply Map Mode Layer Visibility
  const applyMapMode = useCallback((mode) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const setLayerVis = (id, vis) => {
      try {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, 'visibility', vis);
        }
      } catch (err) {
        console.warn(`Layer ${id} visibility change deferred:`, err);
      }
    };

    if (mode === 'hybrid') {
      // Hybrid: Satellite imagery + vector lines, fills, labels
      setLayerVis('satellite-layer', 'visible');
      setLayerVis('dark-base-layer', 'none');
      setLayerVis('cadastral-background', 'none');
      setLayerVis('cadastral-fill', 'visible');
      setLayerVis('cadastral-lines', 'visible');
      setLayerVis('cadastral-labels', 'visible');
      setLayerVis('cadastral-selected-glow', 'visible');
      document.querySelectorAll('.gis-survey-marker').forEach(el => el.style.display = 'block');
    } else if (mode === 'satellite') {
      // Satellite: Pure high-res aerial drone imagery, show only selected plot boundary
      setLayerVis('satellite-layer', 'visible');
      setLayerVis('dark-base-layer', 'none');
      setLayerVis('cadastral-background', 'none');
      setLayerVis('cadastral-fill', 'none');
      setLayerVis('cadastral-lines', 'none');
      setLayerVis('cadastral-labels', 'none');
      setLayerVis('cadastral-selected-glow', 'visible');
      document.querySelectorAll('.gis-survey-marker').forEach(el => {
        el.style.display = el.classList.contains('selected') ? 'block' : 'none';
      });
    } else if (mode === 'cadastral') {
      // Cadastral: Cartographic dark map + vector parcel boundaries
      setLayerVis('satellite-layer', 'none');
      setLayerVis('dark-base-layer', 'visible');
      setLayerVis('cadastral-background', 'visible');
      setLayerVis('cadastral-fill', 'visible');
      setLayerVis('cadastral-lines', 'visible');
      setLayerVis('cadastral-labels', 'visible');
      setLayerVis('cadastral-selected-glow', 'visible');
      document.querySelectorAll('.gis-survey-marker').forEach(el => el.style.display = 'block');
    }
  }, []);

  // 3. Select Parcel & Execute Smooth 3D Camera Gliding
  const handleSelectParcel = useCallback((feature, options = {}) => {
    if (!feature) return;
    const props = feature.properties || feature;
    const parcelId = props.parcelId || feature.id || `PAR-${props.surveyNumber}`;
    
    // Always store full rich feature in state
    setSelectedParcel(feature);
    selectedParcelRef.current = feature;

    const map = mapInstanceRef.current;
    if (map) {
      // If feature was dynamically generated and not yet in GeoJSON source, append it
      const exists = featuresRef.current.some(f => (f.properties?.parcelId === parcelId || f.id === parcelId));
      if (!exists) {
        featuresRef.current.push(feature);
        try {
          const source = map.getSource('cadastral-source');
          if (source) {
            source.setData({
              type: 'FeatureCollection',
              features: featuresRef.current
            });
          }
        } catch (e) {
          console.warn('GeoJSON source update deferred:', e);
        }
      }

      const centerCoords = extractCenterCoordinates(feature);

      // Create interactive HTML marker if missing
      if (!markersMapRef.current.has(parcelId) && centerCoords) {
        const el = document.createElement('div');
        el.className = 'gis-survey-marker selected';
        el.innerText = props.surveyNumber || 'Plot';
        el.setAttribute('data-id', parcelId);
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          handleSelectParcel(feature);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(centerCoords)
          .addTo(map);

        markersMapRef.current.set(parcelId, marker);
      }

      updateSelectedHighlight(parcelId);

      // Perform cinematic 3D camera gliding
      const targetPitch = options.pitch !== undefined ? options.pitch : (is3DRef.current ? 58 : 0);
      const targetBearing = options.bearing !== undefined ? options.bearing : (is3DRef.current ? -22 : 0);
      const targetZoom = options.zoom || MAP_CONFIG.inspectZoom; // 17.5

      map.flyTo({
        center: centerCoords,
        zoom: targetZoom,
        pitch: targetPitch,
        bearing: targetBearing,
        duration: options.duration || 2200,
        curve: 1.42,
        speed: 1.2,
        essential: true
      });
    }
  }, [updateSelectedHighlight]);

  // 4. Initialize MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'satellite-source': MAP_CONFIG.sources.satellite,
          'dark-base-source': MAP_CONFIG.sources.darkBase,
          'cadastral-source': {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: featuresRef.current
            }
          }
        },
        layers: [
          // Background layer for Cadastral Mode
          {
            id: 'cadastral-background',
            type: 'background',
            layout: {
              visibility: 'none'
            },
            paint: {
              'background-color': '#02120a'
            }
          },
          // Dark Carto Base (used in cadastral mode for roads/water reference)
          {
            id: 'dark-base-layer',
            type: 'raster',
            source: 'dark-base-source',
            layout: {
              visibility: 'none'
            },
            paint: {
              'raster-opacity': 0.85
            }
          },
          // Satellite Raster Layer (used in hybrid & satellite modes)
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-source',
            layout: {
              visibility: 'visible'
            },
            paint: {
              'raster-opacity': 1,
              'raster-fade-duration': 200
            }
          },
          // Cadastral Polygon Fills
          {
            id: 'cadastral-fill',
            type: 'fill',
            source: 'cadastral-source',
            paint: {
              'fill-color': [
                'case',
                ['==', ['get', 'parcelId'], 'PAR-143-2A'],
                'rgba(16, 185, 129, 0.28)',
                'rgba(16, 185, 129, 0.05)'
              ],
              'fill-opacity': 1
            }
          },
          // Cadastral Polygon Boundary Lines
          {
            id: 'cadastral-lines',
            type: 'line',
            source: 'cadastral-source',
            paint: {
              'line-color': '#10b981',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14, 1.5,
                17, 2.5,
                19, 3.5
              ],
              'line-opacity': 0.95
            }
          },
          // Selected Parcel Highlight Outline
          {
            id: 'cadastral-selected-glow',
            type: 'line',
            source: 'cadastral-source',
            filter: ['==', ['get', 'parcelId'], 'PAR-143-2A'],
            paint: {
              'line-color': '#ffffff',
              'line-width': 3.5,
              'line-blur': 0,
              'line-opacity': 1
            }
          },
          // Cadastral Survey Number Text Labels attached to centroid
          {
            id: 'cadastral-labels',
            type: 'symbol',
            source: 'cadastral-source',
            layout: {
              'text-field': ['get', 'surveyNumber'],
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14, 11,
                17, 13.5,
                19, 16
              ],
              'text-anchor': 'center',
              'text-allow-overlap': true
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': 'rgba(2, 16, 11, 0.95)',
              'text-halo-width': 2.5
            }
          }
        ]
      },
      center: MAP_CONFIG.defaultCenter,
      zoom: MAP_CONFIG.defaultZoom,
      pitch: MAP_CONFIG.defaultPitch,
      bearing: MAP_CONFIG.defaultBearing,
      maxPitch: 75,
      minPitch: 0,
      pitchWithRotate: true,
      dragRotate: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Add minimal scale bar
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    // Create reusable hover popup
    hoverPopupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      className: 'gis-hover-popup'
    });

    map.on('load', () => {
      setMapLoaded(true);
      mapInstanceRef.current = map;
      map.resize();

      // HTML Markers for fast, interactive parcel pins with glow
      featuresRef.current.forEach((feature) => {
        const center = extractCenterCoordinates(feature);
        if (!center) return;

        const parcelId = feature.properties?.parcelId || feature.id;
        const el = document.createElement('div');
        el.className = 'gis-survey-marker';
        if (parcelId === 'PAR-143-2A') {
          el.classList.add('selected');
        }
        el.innerText = feature.properties?.surveyNumber || 'Plot';
        el.setAttribute('data-id', parcelId);

        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          handleSelectParcel(feature);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(center)
          .addTo(map);

        markersMapRef.current.set(parcelId, marker);
      });

      // Apply initial mode
      applyMapMode(mapModeRef.current);
    });

    // 2. Interactive Click on map canvas (polygon / line / boundary)
    map.on('click', (e) => {
      const candidateLayers = ['cadastral-fill', 'cadastral-lines', 'cadastral-selected-glow'].filter(
        id => map.getLayer(id)
      );
      
      const features = map.queryRenderedFeatures(e.point, { layers: candidateLayers });
      if (features && features.length > 0) {
        const clickedFeature = features[0];
        const parcelId = clickedFeature.properties?.parcelId || clickedFeature.id;
        
        // Find rich original feature from featuresRef
        const fullFeature = featuresRef.current.find(f => 
          (f.properties?.parcelId && f.properties.parcelId === parcelId) ||
          (f.id && f.id === parcelId) ||
          (f.properties?.surveyNumber && f.properties.surveyNumber === clickedFeature.properties?.surveyNumber)
        ) || clickedFeature;

        handleSelectParcel(fullFeature);
      }
    });

    // 3. Hover tooltip on parcel polygon
    map.on('mousemove', (e) => {
      if (mapModeRef.current === 'satellite') {
        map.getCanvas().style.cursor = '';
        if (hoverPopupRef.current) hoverPopupRef.current.remove();
        return;
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: ['cadastral-fill', 'cadastral-lines'].filter(id => map.getLayer(id))
      });

      if (features && features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';
        const feature = features[0];
        const props = feature.properties || {};

        hoverPopupRef.current
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="gis-parcel-tooltip">
              <b>Survey ${props.surveyNumber || 'Plot'}</b>
              <span>${props.area || '2.0'} Acres · ${props.owner || 'Registered Holder'}</span>
            </div>
          `)
          .addTo(map);
      } else {
        map.getCanvas().style.cursor = '';
        if (hoverPopupRef.current) hoverPopupRef.current.remove();
      }
    });

    map.on('mouseleave', () => {
      map.getCanvas().style.cursor = '';
      if (hoverPopupRef.current) hoverPopupRef.current.remove();
    });

    const resizeTimer = setTimeout(() => {
      if (map) map.resize();
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [handleSelectParcel, applyMapMode]);

  // 5. Update Layer Mode on state change
  useEffect(() => {
    if (mapLoaded) {
      applyMapMode(mapMode);
    }
  }, [mapMode, mapLoaded, applyMapMode]);

  // 6. Handle Mode Switcher User Click
  const handleModeChange = (newMode) => {
    setMapMode(newMode);
    applyMapMode(newMode);
  };

  // 7. Survey Number Search Handler with GIS Camera Sequence
  const handleSearch = async (query) => {
    setSearchError('');
    setIsSearching(true);
    setSearchStatus('Locating cadastral boundary…');

    try {
      const result = await searchParcel(query);

      setTimeout(() => {
        setSearchStatus(`Located Survey ${result.feature.properties.surveyNumber}`);
        handleSelectParcel(result.feature, {
          zoom: 17.6,
          pitch: is3DRef.current ? 58 : 0,
          bearing: is3DRef.current ? -22 : 0,
          duration: 2200
        });

        setTimeout(() => {
          setIsSearching(false);
          setSearchStatus('');
        }, 1200);
      }, 300);

    } catch (err) {
      setIsSearching(false);
      setSearchStatus('');
      setSearchError('Error querying cadastral registry. Please try again.');
    }
  };

  // Map Controls Actions
  const handleZoomIn = () => mapInstanceRef.current && mapInstanceRef.current.zoomIn({ duration: 400 });
  const handleZoomOut = () => mapInstanceRef.current && mapInstanceRef.current.zoomOut({ duration: 400 });
  
  const handleResetNorth = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.easeTo({
        bearing: 0,
        pitch: is3DRef.current ? 45 : 0,
        duration: 1000,
        essential: true
      });
    }
  };

  const handleToggle3D = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const next3D = !is3D;
    setIs3D(next3D);
    is3DRef.current = next3D;

    if (next3D) {
      map.easeTo({
        pitch: 58,
        bearing: -22,
        duration: 1200,
        essential: true
      });
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1200,
        essential: true
      });
    }
  };

  const handleLocate = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: MAP_CONFIG.defaultCenter,
      zoom: MAP_CONFIG.defaultZoom,
      pitch: is3DRef.current ? MAP_CONFIG.defaultPitch : 0,
      bearing: is3DRef.current ? MAP_CONFIG.defaultBearing : 0,
      duration: 1800,
      curve: 1.4,
      speed: 1.2,
      essential: true
    });
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.resize();
    }, 150);
  };

  return (
    <div className={`gis-interactive-wrapper ${isFullscreen ? 'fullscreen-active' : ''}`}>
      {/* Top GIS Toolbar: Search on Left, 3 Modes on Right */}
      <div className="gis-toolbar">
        <SurveySearch 
          onSearch={handleSearch}
          isSearching={isSearching}
          searchStatus={searchStatus}
          searchError={searchError}
        />

        <MapModeSwitcher 
          activeMode={mapMode}
          onModeChange={handleModeChange}
        />
      </div>

      {/* Main Display: Interactive Map Canvas on Left, Selected Details on Right */}
      <div className="gis-display-grid">
        <div className="gis-map-viewport">
          <div ref={mapContainerRef} className="gis-map-canvas-container" />

          {/* Floating Controls (+ / - / 3D / Compass / Fullscreen) */}
          <MapControls 
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetNorth={handleResetNorth}
            onToggle3D={handleToggle3D}
            is3D={is3D}
            onLocate={handleLocate}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
          />
        </div>

        {/* Right-Side Panel: Selected Parcel Details */}
        <ParcelDetails 
          parcel={selectedParcel}
          onRequestExtract={onRequestExtract}
        />
      </div>
    </div>
  );
}

