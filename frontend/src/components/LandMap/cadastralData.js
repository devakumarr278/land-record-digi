/**
 * Cadastral Survey Dataset (GeoJSON FeatureCollection)
 * 
 * Geographic Region: Coimbatore / Alangudi Agricultural Belt
 * Base Centroid: Longitude: 76.9558° E, Latitude: 11.0168° N
 * 
 * In production, this can be connected directly to:
 * - OGC WFS / WMS Server (GeoServer)
 * - State Cadastral GIS Vector Tiles (MVT / PostGIS)
 * - GET /api/v1/gis/parcels
 */

export const CADASTRAL_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "PAR-143-2A",
      properties: {
        surveyNumber: "143/2A",
        parcelId: "PAR-143-2A",
        owner: "Ramasamy Gounder",
        area: 2.50,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Validated",
        status: "Validated",
        classification: "Dry Agricultural (Punja)",
        soil: "Red Loam",
        soilComposition: "Red Loam",
        encumbrances: 12,
        confidence: "92%",
        coords: "11.0168° N, 76.9558° E",
        center: [76.9558, 11.0168],
        lastMutationDate: "2024-11-18",
        pattaNumber: "PTA-2024-8841"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9548, 11.0175],
            [76.9566, 11.0178],
            [76.9572, 11.0161],
            [76.9552, 11.0157],
            [76.9548, 11.0175]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-143-1",
      properties: {
        surveyNumber: "143/1",
        parcelId: "PAR-143-1",
        owner: "S. Arumugam",
        area: 1.90,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Validated",
        status: "Validated",
        classification: "Wet Agricultural (Nanja)",
        soil: "Clay Loam",
        soilComposition: "Clay Loam",
        encumbrances: 3,
        confidence: "94%",
        coords: "11.0182° N, 76.9545° E",
        center: [76.9544, 11.0182],
        lastMutationDate: "2023-06-12",
        pattaNumber: "PTA-2023-6520"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9535, 11.0191],
            [76.9552, 11.0194],
            [76.9548, 11.0175],
            [76.9531, 11.0172],
            [76.9535, 11.0191]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-143-2B",
      properties: {
        surveyNumber: "143/2B",
        parcelId: "PAR-143-2B",
        owner: "Velusamy Murugan",
        area: 2.15,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Validated",
        status: "Validated",
        classification: "Dry Agricultural (Punja)",
        soil: "Alluvial Loam",
        soilComposition: "Alluvial Loam",
        encumbrances: 10,
        confidence: "94%",
        coords: "11.0148° N, 76.9556° E",
        center: [76.9556, 11.0148],
        lastMutationDate: "2025-01-09",
        pattaNumber: "PTA-2025-1029"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9552, 11.0157],
            [76.9572, 11.0161],
            [76.9578, 11.0138],
            [76.9557, 11.0134],
            [76.9552, 11.0157]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-144-1",
      properties: {
        surveyNumber: "144/1",
        parcelId: "PAR-144-1",
        owner: "K. S. Narayanan",
        area: 1.85,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Validated",
        status: "Validated",
        classification: "Wet Agricultural (Nanja)",
        soil: "Clayey Loam",
        soilComposition: "Clayey Loam",
        encumbrances: 8,
        confidence: "95%",
        coords: "11.0185° N, 76.9560° E",
        center: [76.9560, 11.0185],
        lastMutationDate: "2024-04-20",
        pattaNumber: "PTA-2024-3419"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9552, 11.0194],
            [76.9570, 11.0197],
            [76.9566, 11.0178],
            [76.9548, 11.0175],
            [76.9552, 11.0194]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-144-3",
      properties: {
        surveyNumber: "144/3",
        parcelId: "PAR-144-3",
        owner: "K. Palani",
        area: 2.20,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Validated",
        status: "Validated",
        classification: "Dry Agricultural (Punja)",
        soil: "Red Soil",
        soilComposition: "Red Soil",
        encumbrances: 5,
        confidence: "96%",
        coords: "11.0192° N, 76.9578° E",
        center: [76.9578, 11.0192],
        lastMutationDate: "2023-09-14",
        pattaNumber: "PTA-2023-9912"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9570, 11.0197],
            [76.9588, 11.0201],
            [76.9584, 11.0182],
            [76.9566, 11.0178],
            [76.9570, 11.0197]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-141-3",
      properties: {
        surveyNumber: "141/3",
        parcelId: "PAR-141-3",
        owner: "Palaniswami & Brothers",
        area: 3.10,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Validated",
        status: "Validated",
        classification: "Dry Agricultural (Punja)",
        soil: "Red Soil",
        soilComposition: "Red Soil",
        encumbrances: 14,
        confidence: "91%",
        coords: "11.0178° N, 76.9582° E",
        center: [76.9582, 11.0178],
        lastMutationDate: "2022-08-30",
        pattaNumber: "PTA-2022-4109"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9566, 11.0178],
            [76.9584, 11.0182],
            [76.9592, 11.0163],
            [76.9572, 11.0161],
            [76.9566, 11.0178]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-142-2B",
      properties: {
        surveyNumber: "142/2B",
        parcelId: "PAR-142-2B",
        owner: "Meenakshi Sundaram",
        area: 1.40,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Pending Survey",
        status: "Pending Survey",
        classification: "Commercial Agricultural",
        soil: "Black Cotton Soil",
        soilComposition: "Black Cotton Soil",
        encumbrances: 6,
        confidence: "88%",
        coords: "11.0155° N, 76.9585° E",
        center: [76.9585, 11.0155],
        lastMutationDate: "2024-02-17",
        pattaNumber: "PTA-2024-1184"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9572, 11.0161],
            [76.9592, 11.0163],
            [76.9599, 11.0142],
            [76.9578, 11.0138],
            [76.9572, 11.0161]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-145-3B",
      properties: {
        surveyNumber: "145/3B",
        parcelId: "PAR-145-3B",
        owner: "Velusamy Murugan",
        area: 2.15,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Validated",
        status: "Validated",
        classification: "Dry Agricultural (Punja)",
        soil: "Alluvial Loam",
        soilComposition: "Alluvial Loam",
        encumbrances: 10,
        confidence: "94%",
        coords: "11.0138° N, 76.9554° E",
        center: [76.9554, 11.0138],
        lastMutationDate: "2024-12-05",
        pattaNumber: "PTA-2024-9023"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9557, 11.0134],
            [76.9578, 11.0138],
            [76.9573, 11.0116],
            [76.9550, 11.0112],
            [76.9557, 11.0134]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-143-4",
      properties: {
        surveyNumber: "143/4",
        parcelId: "PAR-143-4",
        owner: "Thangavelu & Sons",
        area: 1.75,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Validated",
        status: "Validated",
        classification: "Dry Agricultural (Punja)",
        soil: "Sandy Loam",
        soilComposition: "Sandy Loam",
        encumbrances: 2,
        confidence: "97%",
        coords: "11.0160° N, 76.9538° E",
        center: [76.9538, 11.0160],
        lastMutationDate: "2023-04-18",
        pattaNumber: "PTA-2023-2894"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9531, 11.0172],
            [76.9548, 11.0175],
            [76.9552, 11.0157],
            [76.9535, 11.0153],
            [76.9531, 11.0172]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "PAR-146-1A",
      properties: {
        surveyNumber: "146/1A",
        parcelId: "PAR-146-1A",
        owner: "Lakshmi Ammal",
        area: 2.80,
        areaUnit: "Acres",
        village: "Alangudi",
        taluk: "Coimbatore South",
        district: "Coimbatore",
        state: "Tamil Nadu",
        mutationStatus: "Validated",
        status: "Validated",
        classification: "Wet Agricultural (Nanja)",
        soil: "Red Soil",
        soilComposition: "Red Soil",
        encumbrances: 4,
        confidence: "93%",
        coords: "11.0142° N, 76.9535° E",
        center: [76.9535, 11.0142],
        lastMutationDate: "2024-07-22",
        pattaNumber: "PTA-2024-5182"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.9535, 11.0153],
            [76.9552, 11.0157],
            [76.9557, 11.0134],
            [76.9539, 11.0130],
            [76.9535, 11.0153]
          ]
        ]
      }
    }
  ]
};
