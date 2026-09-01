const Parcel = require('../models/Parcel');

const SEED_PARCELS = [
  {
    parcelId: 'PAR-CBE-145-2',
    surveyNumber: '145/2',
    subDivision: '2',
    district: 'Coimbatore',
    taluk: 'Coimbatore North',
    village: 'Kovilpalayam',
    ownerName: 'Ramasamy Gounder',
    ownerNameTamil: 'ராமசாமி கவுண்டர்',
    fatherName: 'Marappa Gounder',
    area: 2.12, // Registry area (Acres)
    areaUnit: 'Acres',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [76.9945, 11.1412],
          [76.9962, 11.1412],
          [76.9962, 11.1428],
          [76.9945, 11.1428],
          [76.9945, 11.1412],
        ],
      ],
    },
    referenceData: {
      pattaNumber: '1042',
      landType: 'Nanjai (Wet Land)',
      marketValueEstimate: 4500000,
      boundaries: {
        north: 'East-West Main Cart Track',
        south: 'Survey No 145/3 Senthil Land',
        east: 'Kovilpalayam Water Channel',
        west: 'Survey No 144 Odai Poramboke',
      },
    },
    status: 'ACTIVE',
  },
  {
    parcelId: 'PAR-CBE-145-3',
    surveyNumber: '145/3',
    subDivision: '3',
    district: 'Coimbatore',
    taluk: 'Coimbatore North',
    village: 'Kovilpalayam',
    ownerName: 'Senthil Kumar',
    ownerNameTamil: 'செந்தில் குமார்',
    fatherName: 'Palanisamy',
    area: 1.85,
    areaUnit: 'Acres',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [76.9945, 11.1395],
          [76.9962, 11.1395],
          [76.9962, 11.1412],
          [76.9945, 11.1412],
          [76.9945, 11.1395],
        ],
      ],
    },
    referenceData: {
      pattaNumber: '1043',
      landType: 'Punjai (Dry Land)',
      marketValueEstimate: 3200000,
      boundaries: {
        north: 'Survey No 145/2 Ramasamy Land',
        south: 'Village Boundary Road',
        east: 'Agricultural Canal',
        west: 'Survey No 144',
      },
    },
    status: 'ACTIVE',
  },
  {
    parcelId: 'PAR-CBE-221-1A',
    surveyNumber: '221/1A',
    subDivision: '1A',
    district: 'Coimbatore',
    taluk: 'Coimbatore North',
    village: 'Saravanampatti',
    ownerName: 'Meenakshi Sundaram',
    ownerNameTamil: 'மீனாட்சி சுந்தரம்',
    fatherName: 'Sundaram Chettiar',
    area: 3.40,
    areaUnit: 'Acres',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [76.9980, 11.0820],
          [77.0010, 11.0820],
          [77.0010, 11.0850],
          [76.9980, 11.0850],
          [76.9980, 11.0820],
        ],
      ],
    },
    referenceData: {
      pattaNumber: '2155',
      landType: 'Commercial / Mixed Use',
      marketValueEstimate: 12000000,
      boundaries: {
        north: 'Sathy Main Road NH-209',
        south: 'Survey No 221/1B',
        east: 'IT Corridor Link Road',
        west: 'Revenue Channel',
      },
    },
    status: 'ACTIVE',
  },
  {
    parcelId: 'PAR-POL-89-4B',
    surveyNumber: '89/4B',
    subDivision: '4B',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Pollachi Rural',
    ownerName: 'Palaniswamy Chettiar',
    ownerNameTamil: 'பழனிச்சாமி செட்டியார்',
    fatherName: 'Kuppusamy Chettiar',
    area: 4.20,
    areaUnit: 'Acres',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.0050, 10.6600],
          [77.0090, 10.6600],
          [77.0090, 10.6640],
          [77.0050, 10.6640],
          [77.0050, 10.6600],
        ],
      ],
    },
    referenceData: {
      pattaNumber: '8904',
      landType: 'Coconut Plantation / Agricultural',
      marketValueEstimate: 7500000,
      boundaries: {
        north: 'Aliyar Feeder Canal',
        south: 'Private Coconut Grove',
        east: 'Survey No 89/5',
        west: 'Tar Road',
      },
    },
    status: 'ACTIVE',
  },
  {
    parcelId: 'PAR-POL-125-2',
    surveyNumber: '125/2',
    subDivision: '2A',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Kinathukadavu',
    ownerName: 'MURUGAN KUMAR',
    ownerNameTamil: 'முருகன் குமார்',
    fatherName: 'Palanisamy',
    area: 1.80, // Canonical registry area: 1.80 Acres
    areaUnit: 'Acres',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.0110, 10.8230],
          [77.0150, 10.8230],
          [77.0150, 10.8260],
          [77.0110, 10.8260],
          [77.0110, 10.8230],
        ],
      ],
    },
    referenceData: {
      pattaNumber: '458',
      landType: 'Agricultural (Dry)',
      marketValueEstimate: 5200000,
      boundaries: {
        north: 'Survey No 125/1 Cart Track',
        south: 'Survey No 125/3 Murugan Land',
        east: 'Pollachi Main Road',
        west: 'Odai Water Body',
      },
    },
    status: 'ACTIVE',
  },
  {
    parcelId: 'PAR-POL-118-3',
    surveyNumber: '118/3',
    subDivision: '3',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Anaimalai',
    ownerName: 'TN Revenue Dept',
    ownerNameTamil: 'வருவாய்த்துறை',
    fatherName: 'Government of Tamil Nadu',
    area: 8.20,
    areaUnit: 'Acres',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [76.9270, 10.5810],
          [76.9310, 10.5810],
          [76.9310, 10.5840],
          [76.9270, 10.5840],
          [76.9270, 10.5810],
        ],
      ],
    },
    referenceData: {
      pattaNumber: '1183',
      landType: 'Forest / River Buffer Reserve',
      marketValueEstimate: 9800000,
      boundaries: {
        north: 'Aliyar River Bank',
        south: 'Anaimalai Reserve Forest',
        east: 'Canal Road',
        west: 'Public Pathway',
      },
    },
    status: 'ACTIVE',
  },
  {
    parcelId: 'PAR-SUL-54-2',
    surveyNumber: '54/2',
    subDivision: '2',
    district: 'Coimbatore',
    taluk: 'Sulur',
    village: 'Sulur',
    ownerName: 'Karthik Subramanian',
    ownerNameTamil: 'கார்த்திக் சுப்பிரமணியன்',
    fatherName: 'Subramanian',
    area: 3.10,
    areaUnit: 'Acres',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.1230, 11.0230],
          [77.1270, 11.0230],
          [77.1270, 11.0260],
          [77.1230, 11.0260],
          [77.1230, 11.0230],
        ],
      ],
    },
    referenceData: {
      pattaNumber: '518',
      landType: 'Agricultural (Dry)',
      marketValueEstimate: 6400000,
      boundaries: {
        north: 'Sulur Lake Channel',
        south: 'Survey No 54/3',
        east: 'Trichy Road NH-81',
        west: 'Private Land',
      },
    },
    status: 'ACTIVE',
  },
];

const seedParcels = async () => {
  console.log('[Seed] Seeding Cadastral Reference Parcels (Tamil Nadu / Coimbatore)...');
  for (const parcelData of SEED_PARCELS) {
    const existing = await Parcel.findOne({ surveyNumber: parcelData.surveyNumber, village: parcelData.village });
    if (existing) {
      Object.assign(existing, parcelData);
      await existing.save();
    } else {
      const parcel = new Parcel(parcelData);
      await parcel.save();
    }
  }
  console.log(`[Seed] Successfully seeded ${SEED_PARCELS.length} reference parcels with GeoJSON polygons.`);
};

module.exports = { seedParcels, SEED_PARCELS };
