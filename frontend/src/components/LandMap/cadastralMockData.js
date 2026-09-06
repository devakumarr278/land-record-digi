/**
 * Mock Cadastral Spatial Vector Dataset
 * 
 * Provides self-contained cadastral cartography vectors:
 * - Survey Grid Lattice (UTM / Coordinate grid lines)
 * - Village Revenue Boundary
 * - Road & Pathways Network (Cart Tracks, Canal Roads)
 * - Irrigation Watercourses & Canals
 * - Triangulation Benchmark Stations (GCP / Survey Stones)
 * - Surrounding Buffer Cadastral Plots
 * - Elevation Contours
 * 
 * This completely eliminates dependency on external raster tile servers (e.g. CartoDB)
 * that show "API key required".
 */

// 1. Cadastral Survey Coordinate Grid Lines
export const CADASTRAL_GRID_GEOJSON = {
  type: "FeatureCollection",
  features: [
    // Longitude / Easting Grid Lines
    {
      type: "Feature",
      properties: { label: "76°57'05\"E" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9510, 11.0100], [76.9510, 11.0230]]
      }
    },
    {
      type: "Feature",
      properties: { label: "76°57'15\"E" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9530, 11.0100], [76.9530, 11.0230]]
      }
    },
    {
      type: "Feature",
      properties: { label: "76°57'25\"E" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9550, 11.0100], [76.9550, 11.0230]]
      }
    },
    {
      type: "Feature",
      properties: { label: "76°57'35\"E" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9570, 11.0100], [76.9570, 11.0230]]
      }
    },
    {
      type: "Feature",
      properties: { label: "76°57'45\"E" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9590, 11.0100], [76.9590, 11.0230]]
      }
    },
    {
      type: "Feature",
      properties: { label: "76°57'55\"E" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9610, 11.0100], [76.9610, 11.0230]]
      }
    },

    // Latitude / Northing Grid Lines
    {
      type: "Feature",
      properties: { label: "11°00'45\"N" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9490, 11.0110], [76.9630, 11.0110]]
      }
    },
    {
      type: "Feature",
      properties: { label: "11°01'00\"N" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9490, 11.0130], [76.9630, 11.0130]]
      }
    },
    {
      type: "Feature",
      properties: { label: "11°01'15\"N" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9490, 11.0150], [76.9630, 11.0150]]
      }
    },
    {
      type: "Feature",
      properties: { label: "11°01'30\"N" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9490, 11.0170], [76.9630, 11.0170]]
      }
    },
    {
      type: "Feature",
      properties: { label: "11°01'45\"N" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9490, 11.0190], [76.9630, 11.0190]]
      }
    },
    {
      type: "Feature",
      properties: { label: "11°02'00\"N" },
      geometry: {
        type: "LineString",
        coordinates: [[76.9490, 11.0210], [76.9630, 11.0210]]
      }
    }
  ]
};

// 2. Rural Access Roads & Field Bund Tracks
export const CADASTRAL_ROADS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    // Primary Village Arterial Road (West to East across village center)
    {
      type: "Feature",
      properties: { name: "Alangudi Main Road (ODR-42)", type: "primary" },
      geometry: {
        type: "LineString",
        coordinates: [
          [76.9495, 11.0162],
          [76.9515, 11.0166],
          [76.9535, 11.0172],
          [76.9548, 11.0175],
          [76.9566, 11.0178],
          [76.9584, 11.0182],
          [76.9605, 11.0187],
          [76.9625, 11.0192]
        ]
      }
    },
    // North-South Agricultural Field Pathway
    {
      type: "Feature",
      properties: { name: "Sy. 143/144 Field Pathway", type: "secondary" },
      geometry: {
        type: "LineString",
        coordinates: [
          [76.9552, 11.0215],
          [76.9552, 11.0194],
          [76.9548, 11.0175],
          [76.9552, 11.0157],
          [76.9557, 11.0134],
          [76.9550, 11.0112],
          [76.9546, 11.0098]
        ]
      }
    },
    // East Canal Bank Service Road
    {
      type: "Feature",
      properties: { name: "Canal Bund Track", type: "secondary" },
      geometry: {
        type: "LineString",
        coordinates: [
          [76.9570, 11.0218],
          [76.9570, 11.0197],
          [76.9566, 11.0178],
          [76.9572, 11.0161],
          [76.9578, 11.0138],
          [76.9573, 11.0116],
          [76.9568, 11.0095]
        ]
      }
    },
    // West Village Boundary Access Way
    {
      type: "Feature",
      properties: { name: "West Settlement Track", type: "track" },
      geometry: {
        type: "LineString",
        coordinates: [
          [76.9525, 11.0205],
          [76.9535, 11.0191],
          [76.9531, 11.0172],
          [76.9535, 11.0153],
          [76.9539, 11.0130],
          [76.9532, 11.0105]
        ]
      }
    }
  ]
};

// 3. Irrigation Waterways & Agricultural Feeder Canals
export const CADASTRAL_WATERWAYS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    // Alangudi Main Irrigation Feeder Canal
    {
      type: "Feature",
      properties: { name: "Alangudi Main Irrigation Canal (PWD)", width: 6 },
      geometry: {
        type: "LineString",
        coordinates: [
          [76.9490, 11.0215],
          [76.9515, 11.0212],
          [76.9540, 11.0208],
          [76.9565, 11.0205],
          [76.9590, 11.0202],
          [76.9615, 11.0200],
          [76.9635, 11.0198]
        ]
      }
    },
    // South Branch Irrigation Distributor Canal
    {
      type: "Feature",
      properties: { name: "South Field Distributor Canal", width: 4 },
      geometry: {
        type: "LineString",
        coordinates: [
          [76.9490, 11.0105],
          [76.9515, 11.0108],
          [76.9542, 11.0110],
          [76.9570, 11.0114],
          [76.9600, 11.0118],
          [76.9630, 11.0122]
        ]
      }
    }
  ]
};

// 4. Village Revenue Boundary
export const CADASTRAL_VILLAGE_BOUNDARY_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        villageName: "Alangudi Village (Village Code: 629001)",
        taluk: "Coimbatore South",
        district: "Coimbatore"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9500, 11.0225],
            [76.9620, 11.0225],
            [76.9625, 11.0100],
            [76.9500, 11.0100],
            [76.9500, 11.0225]
          ]
        ]
      }
    }
  ]
};

// 5. Geodetic Benchmark Stations (Triangulation Marks / Survey Ground Control Points)
export const CADASTRAL_BENCHMARKS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "BM-01", code: "▲ BM-01", elevation: "412.5m MSL", type: "Geodetic Benchmark" },
      geometry: { type: "Point", coordinates: [76.9548, 11.0175] }
    },
    {
      type: "Feature",
      properties: { id: "BM-02", code: "▲ BM-02", elevation: "414.2m MSL", type: "Geodetic Benchmark" },
      geometry: { type: "Point", coordinates: [76.9588, 11.0201] }
    },
    {
      type: "Feature",
      properties: { id: "GCP-104", code: "◈ GCP-104", elevation: "411.8m MSL", type: "Ground Control Point" },
      geometry: { type: "Point", coordinates: [76.9535, 11.0153] }
    },
    {
      type: "Feature",
      properties: { id: "GCP-108", code: "◈ GCP-108", elevation: "415.0m MSL", type: "Ground Control Point" },
      geometry: { type: "Point", coordinates: [76.9592, 11.0163] }
    }
  ]
};

// 6. Surrounding Buffer Cadastral Parcels (Populates context when zooming out)
export const CADASTRAL_SURROUNDING_PARCELS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    // North Adjacent Plots
    {
      type: "Feature",
      id: "PAR-144-2",
      properties: { surveyNumber: "144/2", owner: "K. R. Vellingiri", area: 2.10, classification: "Dry Agricultural (Punja)" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9535, 11.0208],
            [76.9552, 11.0211],
            [76.9552, 11.0194],
            [76.9535, 11.0191],
            [76.9535, 11.0208]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-144-4",
      properties: { surveyNumber: "144/4", owner: "Subbulakshmi Ammal", area: 2.45, classification: "Wet Agricultural (Nanja)" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9552, 11.0211],
            [76.9570, 11.0214],
            [76.9570, 11.0197],
            [76.9552, 11.0194],
            [76.9552, 11.0211]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-144-5",
      properties: { surveyNumber: "144/5", owner: "C. Nachimuthu", area: 2.30, classification: "Dry Agricultural (Punja)" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9570, 11.0214],
            [76.9588, 11.0217],
            [76.9588, 11.0201],
            [76.9570, 11.0197],
            [76.9570, 11.0214]
          ]
        ]
      }
    },
    // East Adjacent Plots
    {
      type: "Feature",
      id: "PAR-141-1",
      properties: { surveyNumber: "141/1", owner: "A. Chinnasamy", area: 3.40, classification: "Wet Agricultural (Nanja)" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9588, 11.0201],
            [76.9608, 11.0205],
            [76.9612, 11.0185],
            [76.9584, 11.0182],
            [76.9588, 11.0201]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-141-2",
      properties: { surveyNumber: "141/2", owner: "K. R. Rangasamy", area: 2.90, classification: "Dry Agricultural (Punja)" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9584, 11.0182],
            [76.9612, 11.0185],
            [76.9618, 11.0165],
            [76.9592, 11.0163],
            [76.9584, 11.0182]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-142-1",
      properties: { surveyNumber: "142/1", owner: "V. Gurusamy", area: 2.15, classification: "Homestead & Garden (Natham)" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9592, 11.0163],
            [76.9618, 11.0165],
            [76.9622, 11.0144],
            [76.9599, 11.0142],
            [76.9592, 11.0163]
          ]
        ]
      }
    },
    // South Adjacent Plots
    {
      type: "Feature",
      id: "PAR-145-1",
      properties: { surveyNumber: "145/1", owner: "R. Dharmalingam", area: 3.00, classification: "Wet Agricultural (Nanja)" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9539, 11.0130],
            [76.9557, 11.0134],
            [76.9550, 11.0112],
            [76.9532, 11.0108],
            [76.9539, 11.0130]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-145-2",
      properties: { surveyNumber: "145/2", owner: "M. Krishnasamy", area: 2.70, classification: "Dry Agricultural (Punja)" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9573, 11.0116],
            [76.9595, 11.0120],
            [76.9590, 11.0102],
            [76.9568, 11.0098],
            [76.9573, 11.0116]
          ]
        ]
      }
    }
  ]
};
