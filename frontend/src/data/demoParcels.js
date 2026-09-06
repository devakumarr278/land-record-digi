/**
 * NILORA Intelligent Land Record Digitization and Validation System
 * Centralized Synthetic Demo Dataset (Tamil Nadu Cadastral Context)
 * 
 * Note: Clearly structured as deterministic demo data for SIH 2026 Problem Statement 26018.
 */

export const DEMO_PARCELS = [
  {
    id: 'LR-124/2A',
    slug: '124-2A',
    surveyNumber: '124/2A',
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    area: '2.40 Acres',
    areaNum: 2.40,
    classification: 'Dry Agricultural (Punja)',
    currentOwner: 'Kannan',
    historicalOwner: 'Ramasamy',
    status: 'Contradiction Detected',
    statusCode: 'CONTRADICTION',
    riskLevel: 'High Risk',
    trustScore: 62,
    activeConflicts: 2,
    evidenceCount: 3,
    firstDivergenceYear: 2017,
    lastAuditDate: '03 Sep 2026, 10:45 AM',
    coordinates: { lat: 10.8245, lng: 76.9821 },
    pattaNumber: 'PTA-2017-4412',
    isHero: true,
    summary: 'Break in mutation chain identified in 2017. ROR and historical Sub-Registrar records disagree on owner title.',
    
    dimensions: [
      {
        id: 'extraction',
        title: 'Extraction',
        status: 'VERIFIED',
        statusText: 'High Confidence',
        score: 88,
        explanation: 'OCR fields extracted with 88% average character confidence from multi-script Tamil & English archival records.',
        evidenceCount: 3,
        details: [
          'Tamil script word confidence: 87.4%',
          'Survey number numeric verification: 99.1%',
          'Document noise filtering applied: Bilateral smoothing & Deskew',
        ]
      },
      {
        id: 'identity',
        title: 'Identity',
        status: 'REVIEW',
        statusText: 'Needs Review',
        score: 72,
        explanation: 'Owner identity matches Aadhaar seeded record but alias notation "Kannan @ Ramasamy Kannan" requires manual affidavit check.',
        evidenceCount: 2,
        details: [
          'Aadhaar KYC Token: V-****-8812 (Matched)',
          'Electoral roll cross-match: 94% probabilistic match',
          'Heirship certificate linkage: Absent in digital repository'
        ]
      },
      {
        id: 'historical',
        title: 'Historical',
        status: 'CONTRADICTION',
        statusText: 'Contradiction Detected',
        score: 48,
        explanation: 'Discontinuity in mutation sequence between 2008 Inheritance deed and 2017 entry. Missing intermediate partition decree.',
        evidenceCount: 4,
        hasTimeline: true,
        details: [
          'Chain of title unbroken from 1980 to 2008 (Owner: Ramasamy)',
          '2017 entry introduces Kannan without legal deed deed reference',
          'First observed divergence point localized to 2017 Mutation Register'
        ]
      },
      {
        id: 'spatial',
        title: 'Spatial',
        status: 'VERIFIED',
        statusText: 'Verified',
        score: 95,
        explanation: 'FMB sketch boundary overlay perfectly matches current 2.40 Acre GIS cadastral polygon (Area Variance < 0.02%).',
        evidenceCount: 2,
        details: [
          'FMB Survey Polygon: 2.40 Acres',
          'Satellite GIS Cadastral Vector: 2.398 Acres',
          'Adjacent plot encroachment check: Nil'
        ]
      },
      {
        id: 'evidence',
        title: 'Evidence',
        status: 'REVIEW',
        statusText: 'Needs Review',
        score: 68,
        explanation: 'Original 1980 Settlement Register scan has minor water-mark degradation on survey sub-division column.',
        evidenceCount: 3,
        details: [
          'Primary Scan: DOC-2017-0042 (High Resolution 400 DPI)',
          'Historical Ledger: DOC-1980-0012 (Fair Quality, water stained)',
          'Provenance Hash: SHA256: 4e9c7... verified in integrity store'
        ]
      },
      {
        id: 'crossSource',
        title: 'Cross-Source',
        status: 'CONTRADICTION',
        statusText: 'Contradiction Detected',
        score: 54,
        explanation: 'Revenue Department ROR (Patta No. 4412) lists Kannan whereas Registration Department Index II still reflects Ramasamy.',
        evidenceCount: 3,
        details: [
          'Source A (Revenue Dept e-Patta): Registered to Kannan',
          'Source B (Registration Dept Index II): Title remains under Ramasamy',
          'Discrepancy Severity: Critical Title Inconsistency'
        ]
      }
    ],

    timeline: [
      {
        id: 'TL-1980',
        year: 1980,
        eventType: 'SETTLEMENT',
        eventTitle: 'Original Resettlement Record',
        owner: 'Ramasamy',
        source: 'District Resettlement Register',
        docId: 'DOC-1980-0012',
        status: 'VERIFIED',
        statusLabel: 'Verified Baseline',
        area: '2.40 Acres',
        description: 'Initial Cadastral Survey & Resettlement Register allocation for Survey 124/2A.'
      },
      {
        id: 'TL-1996',
        year: 1996,
        eventType: 'MUTATION',
        eventTitle: 'Registered Sale Deed',
        owner: 'Ramasamy',
        source: 'Sub-Registrar Index II',
        docId: 'DOC-1996-0188',
        status: 'VERIFIED',
        statusLabel: 'Verified Title',
        area: '2.40 Acres',
        description: 'Registered Sale Deed Vol 114/Pg 22 confirming 2.40 Acres clear title with boundary landmarks.'
      },
      {
        id: 'TL-2008',
        year: 2008,
        eventType: 'INHERITANCE',
        eventTitle: 'Ancestral Succession Note',
        owner: 'Ramasamy',
        source: 'Revenue Mutation Register',
        docId: 'DOC-2008-0402',
        status: 'VERIFIED',
        statusLabel: 'Verified Lineage',
        area: '2.40 Acres',
        description: 'Revenue settlement noting rightful inheritance upon ancestral succession with verified genealogical tree.'
      },
      {
        id: 'TL-2017',
        year: 2017,
        eventType: 'MUTATION',
        eventTitle: 'Disputed Mutation Entry',
        owner: 'Kannan',
        source: 'Mutation Register — 2017',
        docId: 'DOC-2017-0042',
        evidenceId: 'EV-2017-01',
        status: 'DIVERGENCE',
        statusLabel: 'First Observed Divergence',
        isDivergence: true,
        area: '2.40 Acres',
        description: 'Mutation recorded in favor of Kannan without probate or registered relinquishment deed from legal heir Ramasamy.',
        divergenceDetails: {
          year: 2017,
          expected: 'Ramasamy (or legally documented succession heir)',
          sourceA: 'Owner: Kannan (Mutation Register 2017 · Patta 4412)',
          sourceB: 'Owner: Ramasamy (Registration Index II · Settlement Ledger)',
          finding: 'Unbroken chain of title severed. Cross-source title ownership mismatch.'
        }
      },
      {
        id: 'TL-2026',
        year: 2026,
        eventType: 'CURRENT',
        eventTitle: 'Active Master Record',
        owner: 'Kannan',
        source: 'State Land Ledger (Digitized)',
        docId: 'DOC-2026-DIGI',
        status: 'CONTRADICTION',
        statusLabel: 'Flagged for Authority Review',
        area: '2.40 Acres',
        description: 'Active digital revenue record holding 2.40 Acres under flagged status awaiting Tehsildar adjudication.'
      }
    ]
  },

  {
    id: 'LR-143/2A',
    slug: '143-2A',
    surveyNumber: '143/2A',
    village: 'Anaimalai',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    area: '2.50 Acres',
    areaNum: 2.50,
    classification: 'Dry Agricultural (Punja)',
    currentOwner: 'Ramasamy Gounder',
    historicalOwner: 'Ramasamy Gounder',
    status: 'Verified',
    statusCode: 'VERIFIED',
    riskLevel: 'Low Risk',
    trustScore: 94,
    activeConflicts: 0,
    evidenceCount: 4,
    firstDivergenceYear: null,
    lastAuditDate: '01 Sep 2026, 04:12 PM',
    coordinates: { lat: 10.5821, lng: 76.9341 },
    pattaNumber: 'PTA-2024-8841',
    isHero: false,
    summary: 'Completely verified parcel. All 6 dimensions concordant with registration index.',
    
    dimensions: [
      { id: 'extraction', title: 'Extraction', status: 'VERIFIED', statusText: 'High Confidence', score: 96, explanation: 'Scanned records processed with 96% confidence. Clean Tamil font typography.', evidenceCount: 4 },
      { id: 'identity', title: 'Identity', status: 'VERIFIED', statusText: 'Verified', score: 94, explanation: 'Biometric Aadhaar seeded record verified against Patta passbook.', evidenceCount: 3 },
      { id: 'historical', title: 'Historical', status: 'VERIFIED', statusText: 'Verified', score: 95, explanation: 'Unbroken succession and mutation chain across 1974, 1998, and 2024 entries.', evidenceCount: 4, hasTimeline: true },
      { id: 'spatial', title: 'Spatial', status: 'VERIFIED', statusText: 'Verified', score: 93, explanation: 'Survey boundary matches FMB coordinates perfectly (2.50 Acres confirmed).', evidenceCount: 2 },
      { id: 'evidence', title: 'Evidence', status: 'VERIFIED', statusText: 'Verified', score: 92, explanation: 'All primary deeds and mutation orders available in certified archival repository.', evidenceCount: 4 },
      { id: 'crossSource', title: 'Cross-Source', status: 'VERIFIED', statusText: 'Verified', score: 94, explanation: 'Zero discrepancies across Revenue ROR, Registration Index II, and Survey maps.', evidenceCount: 3 }
    ],

    timeline: [
      { id: 'TL-1974', year: 1974, eventType: 'SETTLEMENT', eventTitle: 'Resettlement Deed', owner: 'Ramasamy Gounder', source: 'Settlement Officer', status: 'VERIFIED', statusLabel: 'Verified Baseline', area: '2.50 Acres' },
      { id: 'TL-1998', year: 1998, eventType: 'MUTATION', eventTitle: 'Partition Deed', owner: 'Ramasamy Gounder', source: 'Sub-Registrar Pollachi', status: 'VERIFIED', statusLabel: 'Verified Title', area: '2.50 Acres' },
      { id: 'TL-2024', year: 2024, eventType: 'CURRENT', eventTitle: 'Re-validated Patta', owner: 'Ramasamy Gounder', source: 'Digital Ledger', status: 'VERIFIED', statusLabel: 'Verified Current', area: '2.50 Acres' }
    ]
  },

  {
    id: 'LR-1021',
    slug: '1021',
    surveyNumber: '125/2',
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    area: '2.50 Acres',
    areaNum: 2.50,
    classification: 'Wet Agricultural (Nanja)',
    currentOwner: 'Ravi Kumar',
    historicalOwner: 'Ravi Kumar / Shanmugam',
    status: 'Contradiction Detected',
    statusCode: 'CONTRADICTION',
    riskLevel: 'High Risk',
    trustScore: 43,
    activeConflicts: 1,
    evidenceCount: 3,
    firstDivergenceYear: 2008,
    lastAuditDate: '02 Sep 2026, 11:20 AM',
    coordinates: { lat: 10.8290, lng: 76.9850 },
    pattaNumber: 'PTA-2018-3190',
    isHero: false,
    summary: 'Spatial and historical contradiction: Survey table states 2.50 Acres vs 2008 mutation record stating 2.10 Acres.',

    dimensions: [
      { id: 'extraction', title: 'Extraction', status: 'VERIFIED', statusText: 'High Confidence', score: 85, explanation: 'High quality extraction with minor handwritten margin notes.', evidenceCount: 3 },
      { id: 'identity', title: 'Identity', status: 'VERIFIED', statusText: 'Verified', score: 88, explanation: 'Owner identity confirmed with PAN & Aadhaar linkages.', evidenceCount: 2 },
      { id: 'historical', title: 'Historical', status: 'CONTRADICTION', statusText: 'Contradiction Detected', score: 42, explanation: 'Recorded area in Survey table conflicts with 2008 mutation record (2.50 vs 2.10 Acres).', evidenceCount: 3, hasTimeline: true },
      { id: 'spatial', title: 'Spatial', status: 'CONTRADICTION', statusText: 'Contradiction Detected', score: 38, explanation: '0.40 Acre discrepancy between GIS cadastral polygon and current Patta entry.', evidenceCount: 2 },
      { id: 'evidence', title: 'Evidence', status: 'REVIEW', statusText: 'Needs Review', score: 65, explanation: '1998 survey sketch contains unratified sub-division correction.', evidenceCount: 2 },
      { id: 'crossSource', title: 'Cross-Source', status: 'REVIEW', statusText: 'Needs Review', score: 60, explanation: 'Registration deed mentions 2.10 Acres while Revenue ledger shows 2.50 Acres.', evidenceCount: 2 }
    ],

    timeline: [
      { id: 'TL-1985', year: 1985, eventType: 'SETTLEMENT', eventTitle: 'Cadastral Resettlement', owner: 'Shanmugam', source: 'Settlement Ledger', status: 'VERIFIED', statusLabel: 'Verified Baseline', area: '2.10 Acres' },
      { id: 'TL-2008', year: 2008, eventType: 'MUTATION', eventTitle: 'Sale Deed Variance', owner: 'Ravi Kumar', source: 'Sub-Registrar Pollachi', status: 'DIVERGENCE', statusLabel: 'First Observed Divergence', isDivergence: true, area: '2.50 Acres',
        divergenceDetails: {
          year: 2008,
          expected: 'Area: 2.10 Acres (as per 1985 survey entry)',
          sourceA: 'Sale Deed Area: 2.50 Acres',
          sourceB: 'Survey Settlement Area: 2.10 Acres',
          finding: 'Unaccounted 0.40 Acre expansion into adjacent pathway.'
        }
      },
      { id: 'TL-2026', year: 2026, eventType: 'CURRENT', eventTitle: 'Digital Land Ledger', owner: 'Ravi Kumar', source: 'State Land Ledger', status: 'CONTRADICTION', statusLabel: 'Flagged', area: '2.50 Acres' }
    ]
  },

  {
    id: 'LR-1014',
    slug: '1014',
    surveyNumber: '118/3',
    village: 'Anaimalai',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    area: '1.20 Acres',
    areaNum: 1.20,
    classification: 'Garden Land (Thottam)',
    currentOwner: 'Meena R',
    historicalOwner: 'Meena R',
    status: 'Verified',
    statusCode: 'VERIFIED',
    riskLevel: 'Low Risk',
    trustScore: 98,
    activeConflicts: 0,
    evidenceCount: 3,
    firstDivergenceYear: null,
    lastAuditDate: '03 Sep 2026, 09:15 AM',
    coordinates: { lat: 10.5910, lng: 76.9410 },
    pattaNumber: 'PTA-2022-7721',
    isHero: false,
    summary: 'Completely validated garden land parcel with clear title history and matching GIS boundary.',

    dimensions: [
      { id: 'extraction', title: 'Extraction', status: 'VERIFIED', statusText: 'High Confidence', score: 98, explanation: 'Perfect optical character recognition with 98% clarity.', evidenceCount: 3 },
      { id: 'identity', title: 'Identity', status: 'VERIFIED', statusText: 'Verified', score: 97, explanation: 'Aadhaar biometric and land passbook verified.', evidenceCount: 2 },
      { id: 'historical', title: 'Historical', status: 'VERIFIED', statusText: 'Verified', score: 98, explanation: 'Clear single-family succession without encumbrance.', evidenceCount: 3, hasTimeline: true },
      { id: 'spatial', title: 'Spatial', status: 'VERIFIED', statusText: 'Verified', score: 99, explanation: 'FMB sketch boundary precisely matches current polygon.', evidenceCount: 2 },
      { id: 'evidence', title: 'Evidence', status: 'VERIFIED', statusText: 'Verified', score: 96, explanation: 'All primary revenue receipts and deeds intact in digital archive.', evidenceCount: 3 },
      { id: 'crossSource', title: 'Cross-Source', status: 'VERIFIED', statusText: 'Verified', score: 98, explanation: 'Zero contradictions across all state revenue and registration records.', evidenceCount: 2 }
    ],

    timeline: [
      { id: 'TL-1992', year: 1992, eventType: 'SETTLEMENT', eventTitle: 'Partition Register', owner: 'Meena R', source: 'Sub-Registrar Anaimalai', status: 'VERIFIED', statusLabel: 'Verified Title', area: '1.20 Acres' },
      { id: 'TL-2022', year: 2022, eventType: 'CURRENT', eventTitle: 'Digitized Patta', owner: 'Meena R', source: 'Digital Revenue Portal', status: 'VERIFIED', statusLabel: 'Verified Current', area: '1.20 Acres' }
    ]
  },

  {
    id: 'LR-1009',
    slug: '1009',
    surveyNumber: '54/2',
    village: 'Sulur',
    taluk: 'Sulur',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    area: '3.10 Acres',
    areaNum: 3.10,
    classification: 'Dry Agricultural (Punja)',
    currentOwner: 'Deepa N',
    historicalOwner: 'Deepa N',
    status: 'Verified',
    statusCode: 'VERIFIED',
    riskLevel: 'Low Risk',
    trustScore: 99,
    activeConflicts: 0,
    evidenceCount: 4,
    firstDivergenceYear: null,
    lastAuditDate: '02 Sep 2026, 03:40 PM',
    coordinates: { lat: 11.0250, lng: 77.1230 },
    pattaNumber: 'PTA-2021-9920',
    isHero: false,
    summary: 'Validated clean parcel. 3.10 Acres in Sulur taluk with unbroken provenance.',

    dimensions: [
      { id: 'extraction', title: 'Extraction', status: 'VERIFIED', statusText: 'High Confidence', score: 99, explanation: 'Clean OCR extraction from digital municipal scans.', evidenceCount: 4 },
      { id: 'identity', title: 'Identity', status: 'VERIFIED', statusText: 'Verified', score: 98, explanation: 'Verified owner identity with biometric signature.', evidenceCount: 3 },
      { id: 'historical', title: 'Historical', status: 'VERIFIED', statusText: 'Verified', score: 99, explanation: 'Full title history validated from 1982.', evidenceCount: 3, hasTimeline: true },
      { id: 'spatial', title: 'Spatial', status: 'VERIFIED', statusText: 'Verified', score: 97, explanation: 'Cadastral vector alignment confirmed with GPS benchmark.', evidenceCount: 2 },
      { id: 'evidence', title: 'Evidence', status: 'VERIFIED', statusText: 'Verified', score: 98, explanation: 'Original registered deeds preserved in District Treasury archive.', evidenceCount: 4 },
      { id: 'crossSource', title: 'Cross-Source', status: 'VERIFIED', statusText: 'Verified', score: 99, explanation: '100% agreement across Registration, Revenue, and Survey databases.', evidenceCount: 3 }
    ],

    timeline: [
      { id: 'TL-1982', year: 1982, eventType: 'SETTLEMENT', eventTitle: 'Revenue Allocation', owner: 'Deepa N', source: 'Settlement Register', status: 'VERIFIED', statusLabel: 'Verified Title', area: '3.10 Acres' },
      { id: 'TL-2021', year: 2021, eventType: 'CURRENT', eventTitle: 'Master Ledger Record', owner: 'Deepa N', source: 'Digital Ledger', status: 'VERIFIED', statusLabel: 'Verified Current', area: '3.10 Acres' }
    ]
  },

  {
    id: 'LR-1017',
    slug: '1017',
    surveyNumber: '77/1',
    village: 'Madukkarai',
    taluk: 'Sulur',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    area: '0.80 Acres',
    areaNum: 0.80,
    classification: 'Residential / Mixed (Natham)',
    currentOwner: 'Karthik S',
    historicalOwner: 'Karthikeyan S',
    status: 'Needs Review',
    statusCode: 'REVIEW',
    riskLevel: 'Medium Risk',
    trustScore: 78,
    activeConflicts: 1,
    evidenceCount: 2,
    firstDivergenceYear: 2021,
    lastAuditDate: '03 Sep 2026, 08:30 AM',
    coordinates: { lat: 10.9020, lng: 76.9610 },
    pattaNumber: 'PTA-2021-1402',
    isHero: false,
    summary: 'Minor identity variation: Owner name spelling difference ("Karthik S" vs "Karthikeyan S") between Aadhaar and older Patta.',

    dimensions: [
      { id: 'extraction', title: 'Extraction', status: 'VERIFIED', statusText: 'High Confidence', score: 91, explanation: 'Clear OCR scan extraction with minor signature bleed.', evidenceCount: 2 },
      { id: 'identity', title: 'Identity', status: 'REVIEW', statusText: 'Needs Review', score: 68, explanation: 'Spelling variance between Aadhaar ("Karthik S") and 1999 Patta ("Karthikeyan S").', evidenceCount: 2 },
      { id: 'historical', title: 'Historical', status: 'VERIFIED', statusText: 'Verified', score: 86, explanation: 'Continuous ownership by same family line confirmed.', evidenceCount: 2, hasTimeline: true },
      { id: 'spatial', title: 'Spatial', status: 'VERIFIED', statusText: 'Verified', score: 92, explanation: '0.80 Acre plot geometry fully matches municipal plan.', evidenceCount: 2 },
      { id: 'evidence', title: 'Evidence', status: 'VERIFIED', statusText: 'Verified', score: 84, explanation: 'Registered sale deed and tax receipts verified.', evidenceCount: 2 },
      { id: 'crossSource', title: 'Cross-Source', status: 'REVIEW', statusText: 'Needs Review', score: 70, explanation: 'Name discrepancy flagged between Sub-Registrar ledger and Revenue Patta.', evidenceCount: 2 }
    ],

    timeline: [
      { id: 'TL-1999', year: 1999, eventType: 'SETTLEMENT', eventTitle: 'Purchase Deed', owner: 'Karthikeyan S', source: 'Sub-Registrar Sulur', status: 'VERIFIED', statusLabel: 'Verified Title', area: '0.80 Acres' },
      { id: 'TL-2021', year: 2021, eventType: 'MUTATION', eventTitle: 'Digitization Ingestion', owner: 'Karthik S', source: 'Revenue Department', status: 'REVIEW', statusLabel: 'Name Variation', isDivergence: true, area: '0.80 Acres',
        divergenceDetails: {
          year: 2021,
          expected: 'Owner Name: Karthikeyan S',
          sourceA: 'Digital Patta: Karthik S',
          sourceB: 'Original 1999 Deed: Karthikeyan S',
          finding: 'Informal abbreviation used during online ingestion. Requires notary affidavit.'
        }
      }
    ]
  },

  {
    id: 'LR-1033',
    slug: '1033',
    surveyNumber: '92/4',
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    area: '1.75 Acres',
    areaNum: 1.75,
    classification: 'Dry Agricultural (Punja)',
    currentOwner: 'Sundaram K',
    historicalOwner: 'Sundaram K',
    status: 'Verified',
    statusCode: 'VERIFIED',
    riskLevel: 'Low Risk',
    trustScore: 91,
    activeConflicts: 0,
    evidenceCount: 3,
    firstDivergenceYear: null,
    lastAuditDate: '01 Sep 2026, 02:00 PM',
    coordinates: { lat: 10.8190, lng: 76.9740 },
    pattaNumber: 'PTA-2020-5519',
    isHero: false,
    summary: 'Validated agricultural parcel. Clean survey boundaries and valid revenue receipts.',

    dimensions: [
      { id: 'extraction', title: 'Extraction', status: 'VERIFIED', statusText: 'High Confidence', score: 92, explanation: 'Clear OCR extraction.', evidenceCount: 3 },
      { id: 'identity', title: 'Identity', status: 'VERIFIED', statusText: 'Verified', score: 90, explanation: 'Owner identity confirmed.', evidenceCount: 2 },
      { id: 'historical', title: 'Historical', status: 'VERIFIED', statusText: 'Verified', score: 91, explanation: 'Unbroken ownership title.', evidenceCount: 3, hasTimeline: true },
      { id: 'spatial', title: 'Spatial', status: 'VERIFIED', statusText: 'Verified', score: 93, explanation: 'Consistent with FMB cadastral sketch.', evidenceCount: 2 },
      { id: 'evidence', title: 'Evidence', status: 'VERIFIED', statusText: 'Verified', score: 89, explanation: 'All supporting documents validated.', evidenceCount: 3 },
      { id: 'crossSource', title: 'Cross-Source', status: 'VERIFIED', statusText: 'Verified', score: 92, explanation: 'Clean cross-source records.', evidenceCount: 2 }
    ],

    timeline: [
      { id: 'TL-1988', year: 1988, eventType: 'SETTLEMENT', eventTitle: 'Partition Deed', owner: 'Sundaram K', source: 'Settlement Register', status: 'VERIFIED', statusLabel: 'Verified Title', area: '1.75 Acres' },
      { id: 'TL-2020', year: 2020, eventType: 'CURRENT', eventTitle: 'Master Ledger Record', owner: 'Sundaram K', source: 'Digital Ledger', status: 'VERIFIED', statusLabel: 'Verified Current', area: '1.75 Acres' }
    ]
  }
];

/**
 * CONFLICT GRAPH TOPOLOGY & RELATIONSHIPS
 */
export const CONFLICT_GRAPH_DATA = {
  nodes: [
    {
      id: 'LR-124/2A',
      label: 'LR-124/2A',
      surveyNumber: '124/2A',
      village: 'Kinathukadavu',
      owner: 'Kannan',
      status: 'CONTRADICTION',
      riskScore: 62,
      conflictsCount: 2,
      isHero: true,
      x: 340,
      y: 220,
      radius: 36,
      badgeText: 'HERO'
    },
    {
      id: 'LR-1021',
      label: 'LR-1021',
      surveyNumber: '125/2',
      village: 'Kinathukadavu',
      owner: 'Ravi Kumar',
      status: 'CONTRADICTION',
      riskScore: 43,
      conflictsCount: 1,
      x: 560,
      y: 150,
      radius: 30,
    },
    {
      id: 'LR-1017',
      label: 'LR-1017',
      surveyNumber: '77/1',
      village: 'Madukkarai',
      owner: 'Karthik S',
      status: 'REVIEW',
      riskScore: 78,
      conflictsCount: 1,
      x: 520,
      y: 330,
      radius: 26,
    },
    {
      id: 'LR-143/2A',
      label: 'LR-143/2A',
      surveyNumber: '143/2A',
      village: 'Anaimalai',
      owner: 'Ramasamy G.',
      status: 'VERIFIED',
      riskScore: 94,
      conflictsCount: 0,
      x: 160,
      y: 140,
      radius: 26,
    },
    {
      id: 'LR-1014',
      label: 'LR-1014',
      surveyNumber: '118/3',
      village: 'Anaimalai',
      owner: 'Meena R',
      status: 'VERIFIED',
      riskScore: 98,
      conflictsCount: 0,
      x: 140,
      y: 300,
      radius: 24,
    },
    {
      id: 'LR-1009',
      label: 'LR-1009',
      surveyNumber: '54/2',
      village: 'Sulur',
      owner: 'Deepa N',
      status: 'VERIFIED',
      riskScore: 99,
      conflictsCount: 0,
      x: 740,
      y: 220,
      radius: 24,
    },
    {
      id: 'LR-1033',
      label: 'LR-1033',
      surveyNumber: '92/4',
      village: 'Kinathukadavu',
      owner: 'Sundaram K',
      status: 'VERIFIED',
      riskScore: 91,
      conflictsCount: 0,
      x: 360,
      y: 380,
      radius: 22,
    }
  ],

  links: [
    {
      source: 'LR-124/2A',
      target: 'LR-1021',
      relation: 'Survey Boundary Overlap (0.40 Ac Variance)',
      type: 'CONFLICT_CRITICAL',
      color: '#dc2626',
      dashed: false
    },
    {
      source: 'LR-124/2A',
      target: 'LR-1017',
      relation: 'Cross-Source Title Discrepancy',
      type: 'CONFLICT_WARNING',
      color: '#d97706',
      dashed: true
    },
    {
      source: 'LR-124/2A',
      target: 'LR-143/2A',
      relation: 'Historical Lineage Link (Ramasamy Ancestral Land)',
      type: 'LINEAGE_NEUTRAL',
      color: '#059669',
      dashed: true
    },
    {
      source: 'LR-1021',
      target: 'LR-1009',
      relation: 'Adjacent Village Sector Reference',
      type: 'GEOGRAPHIC_NEUTRAL',
      color: '#9ca3af',
      dashed: true
    },
    {
      source: 'LR-143/2A',
      target: 'LR-1014',
      relation: 'Contiguous Survey Block',
      type: 'GEOGRAPHIC_NEUTRAL',
      color: '#9ca3af',
      dashed: false
    },
    {
      source: 'LR-124/2A',
      target: 'LR-1033',
      relation: 'Kinathukadavu Sub-Division Adjacency',
      type: 'GEOGRAPHIC_NEUTRAL',
      color: '#9ca3af',
      dashed: false
    }
  ],

  stats: {
    activeConflicts: 3,
    needsReview: 2,
    highRisk: 2,
    recentlyResolved: 14
  }
};

/**
 * EVIDENCE REPOSITORY FOR HERO PARCEL (EV-2017-01)
 */
export const EVIDENCE_STORE = {
  'EV-2017-01': {
    id: 'EV-2017-01',
    parcelId: 'LR-124/2A',
    documentId: 'DOC-2017-0042',
    documentTitle: 'Revenue Mutation Register (Form VII-B) — 2017 Ingestion',
    source: 'Kinathukadavu Taluk Revenue Office · Volume IX, Page 3',
    year: 2017,
    page: 3,
    fieldName: 'Owner Name (பட்டாதாரர் பெயர்)',
    extractedValue: 'Kannan',
    expectedValue: 'Ramasamy (or legally verified succession heir)',
    confidence: 82,
    finding: 'Discontinuity with 2008 inheritance title holder (Ramasamy). Missing registered transfer deed or probate order in state registration ledger.',
    provenanceHash: 'SHA256: 4e9c7b81f08a9942c13d8021aef77382c4482',
    timestamp: '2017-08-14T11:22:00Z',
    fileUrl: '/cadastral_map_125_2.jpg',
    boundingBoxes: [
      {
        id: 'box-owner',
        x: 32,
        y: 44,
        width: 38,
        height: 14,
        label: 'Field: Owner Name → Kannan (82% conf)',
        highlight: true,
        type: 'DIVERGENCE_FIELD'
      },
      {
        id: 'box-survey',
        x: 32,
        y: 28,
        width: 26,
        height: 12,
        label: 'Survey No: 124/2A (97% conf)',
        highlight: false,
        type: 'MATCHED_FIELD'
      },
      {
        id: 'box-area',
        x: 62,
        y: 28,
        width: 22,
        height: 12,
        label: 'Area: 2.40 Ac (94% conf)',
        highlight: false,
        type: 'MATCHED_FIELD'
      }
    ],
    metadata: {
      registrationDistrict: 'Coimbatore',
      subDistrict: 'Pollachi',
      villagePanchayat: 'Kinathukadavu',
      recordKeeperSeal: 'Verified Digitally by NILORA OCR Pipeline v2.4'
    }
  }
};
