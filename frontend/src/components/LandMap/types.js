/**
 * TypeScript / JSDoc Type Definitions for LandMap GIS Subsystem
 */

/**
 * @typedef {Object} CadastralParcel
 * @property {string} surveyNumber - e.g. "143/2A"
 * @property {string} parcelId - Unique system ID e.g. "PAR-143-2A"
 * @property {string} owner - Primary registered holder
 * @property {number} area - Extent in acres
 * @property {string} village - Revenue village
 * @property {string} district - Administrative district
 * @property {string} state - State jurisdiction
 * @property {string} classification - Land category e.g. "Dry Agricultural (Punja)"
 * @property {string} soilComposition - Soil type e.g. "Red Loam"
 * @property {string} mutationStatus - "Validated" | "Pending Survey" | "Disputed"
 * @property {number} encumbrances - Total recorded historical encumbrances
 * @property {string} confidence - Spatial match confidence score e.g. "92%"
 * @property {string} coords - Display coordinates e.g. "11.0168° N, 76.9558° E"
 * @property {[number, number]} center - Longitude, Latitude pair
 */

/**
 * @typedef {'hybrid' | 'satellite' | 'cadastral'} MapMode
 */

/**
 * @typedef {Object} SearchResult
 * @property {boolean} found
 * @property {string} [surveyNumber]
 * @property {string} [parcelId]
 * @property {string} [owner]
 * @property {number} [area]
 * @property {string} [village]
 * @property {string} [district]
 * @property {[number, number]} [center]
 * @property {object} [geometry]
 * @property {string} [error]
 */

export const MAP_MODES = {
  HYBRID: 'hybrid',
  SATELLITE: 'satellite',
  CADASTRAL: 'cadastral'
};
