/**
 * NILORA Discrepancy Intelligence Engine - Synthetic Demo Dataset
 * SIH 2026 Problem Statement 26018
 * 
 * Careful Terminology Enforced:
 * - "Possible Common Source" (Not "Root Cause")
 * - "Potential Downstream Impact" (Not "These parcels are wrong")
 * - "Potentially affected records", "May require review"
 * - "Recommended Investigation" / "Suggested Investigation"
 */

export const DISCREPANCY_CLUSTERS = [
  {
    id: 'CLUSTER-MUT-124',
    name: 'Kinathukadavu 124 Series Mutation Severance',
    taluk: 'Pollachi',
    village: 'Kinathukadavu',
    discrepancyType: 'Title Lineage & Cross-Source',
    severity: 'Critical',
    priorityScore: 94,
    affectedParcelsCount: 4,
    totalAcreageExposure: '7.25 Acres',
    possibleCommonSource: '2017 Missing Succession Ratification in SRO Pollachi Index II',
    status: 'UNDER_INVESTIGATION',
    primaryDiscrepancyId: 'DISC-2026-1042',
    description: 'Inferred common upstream point where 2017 mutation entries diverged from registered Sub-Registrar title records across multiple sub-divided plots.'
  },
  {
    id: 'CLUSTER-SPATIAL-125',
    name: 'Kinathukadavu Survey 125 Boundary Geometry Shift',
    taluk: 'Pollachi',
    village: 'Kinathukadavu',
    discrepancyType: 'Boundary & Spatial Topology',
    severity: 'High',
    priorityScore: 86,
    affectedParcelsCount: 3,
    totalAcreageExposure: '4.60 Acres',
    possibleCommonSource: '1998 Unratified Local Road Survey Sketch',
    status: 'ESCALATED_TEHSILDAR',
    primaryDiscrepancyId: 'DISC-2026-2089',
    description: 'Cadastral polygon variance showing potential overlap between agricultural survey plots and the Kinathukadavu-Pollachi rural road reservation.'
  },
  {
    id: 'CLUSTER-ID-77',
    name: 'Madukkarai Informal Alias & Succession Variance',
    taluk: 'Sulur',
    village: 'Madukkarai',
    discrepancyType: 'Identity & KYC Consistency',
    severity: 'Medium',
    priorityScore: 68,
    affectedParcelsCount: 2,
    totalAcreageExposure: '1.60 Acres',
    possibleCommonSource: 'Phonetic & Abbreviated Name Transcription during 2021 Portal Ingestion',
    status: 'ACCEPTED_WITH_ANNOTATION',
    primaryDiscrepancyId: 'DISC-2026-3114',
    description: 'Owner name spelling divergence between Aadhaar digital KYC and older handwritten Patta documents.'
  }
];

export const DISCREPANCY_DOSSIERS = [
  {
    id: 'DISC-2026-1042',
    clusterId: 'CLUSTER-MUT-124',
    clusterName: 'Kinathukadavu 124 Series Mutation Severance',
    title: 'Severed Title Lineage at Year 2017 Mutation Ingestion',
    targetParcelId: 'LR-124/2A',
    surveyNumber: '124/2A',
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    extent: '2.40 Acres',
    currentClaimant: 'Kannan',
    historicalGrantee: 'Ramasamy',
    pattaNumber: 'PTA-2017-4412',
    category: 'Title Lineage & Cross-Source',
    severity: 'Critical',
    priorityScore: 94,
    confidenceScore: 91,
    status: 'UNDER_INVESTIGATION', // 'DETECTED' | 'TRIAGED' | 'UNDER_INVESTIGATION' | 'ESCALATED' | 'RESOLVED' | 'ACCEPTED_WITH_ANNOTATION'
    detectedDate: '01 Sep 2026, 09:12 AM',
    lastUpdated: '03 Sep 2026, 11:30 AM',
    assignedOfficer: 'S. Subramaniam (Tahsildar, Pollachi)',
    
    // 1. WHAT is wrong? (Careful Empirical Summary)
    empiricalSummary: {
      headline: 'Multi-Source Registry Contradiction with Broken Lineage Chain',
      findings: [
        'Revenue Department e-Patta (#PTA-2017-4412) was mutated to Kannan in November 2017.',
        'Registration Department SRO Pollachi Index II contains NO registered conveyance, partition deed, or court probate decree from legal grantee Ramasamy.',
        'Chain of title is continuous from 1980 to 2008, but severs at the 2017 digital ingestion milestone.',
        'Aadhaar KYC for Kannan is biometric verified, but legal heirship link to deceased Ramasamy is missing from repository.'
      ],
      discrepancySeverity: 'High Risk to Title Marketability',
      financialExposure: '₹72.0 Lakhs Estimated Market Extent'
    },

    // 2. POSSIBLE COMMON SOURCE GRAPH (Inferred Upstream Origins)
    possibleCommonSourceGraph: {
      inferredSourceTitle: 'Possible Common Source: 2017 Unratified Revenue Ingestion without SRO Index II Link',
      inferredConfidence: '89% Algorithmic Confidence',
      reasoning: 'Analysis of 4 related survey sub-divisions in Kinathukadavu indicates they all originated from the unpartitioned ancestral holding of Ramasamy (Deed Vol 114/Pg 22, 1996). When Ramasamy passed away in 2012, informal family shares were entered in local Revenue records in 2017 without executing a registered Partition Deed.',
      nodes: [
        {
          id: 'SRC-1980',
          label: '1980 Resettlement Register',
          sub: 'DOC-1980-0012 · Ramasamy',
          type: 'ROOT_BASELINE',
          status: 'VERIFIED',
          confidence: '100%',
          year: 1980
        },
        {
          id: 'SRC-1996',
          label: '1996 Registered Sale Deed',
          sub: 'Vol 114 / Pg 22 · Pollachi SRO',
          type: 'REGISTERED_TITLE',
          status: 'VERIFIED',
          confidence: '98%',
          year: 1996
        },
        {
          id: 'SRC-2012',
          label: 'Demise of Grantee (2012)',
          sub: 'Ramasamy (Ancestral Holder)',
          type: 'TRANSITION_EVENT',
          status: 'UNRECORDED',
          confidence: '85%',
          year: 2012
        },
        {
          id: 'SRC-2017-GAP',
          label: 'Possible Common Source: 2017 Ingestion',
          sub: 'Unregistered Mutation Entry #4412',
          type: 'POSSIBLE_COMMON_SOURCE',
          status: 'INFERRED_ORIGIN',
          confidence: '89%',
          year: 2017,
          isHighlight: true
        }
      ],
      links: [
        { from: 'SRC-1980', to: 'SRC-1996', relation: 'Registered Chain of Title', type: 'CONFIRMED' },
        { from: 'SRC-1996', to: 'SRC-2012', relation: 'Continuous Family Tenure', type: 'CONFIRMED' },
        { from: 'SRC-2012', to: 'SRC-2017-GAP', relation: 'Inferred Missing Partition / Heirship Decree', type: 'INFERRED_GAP' }
      ]
    },

    // 3. POTENTIAL DOWNSTREAM IMPACT GRAPH (Potentially Affected Records)
    potentialDownstreamImpactGraph: {
      impactRadiusSummary: '4 Potentially Affected Records · 1 Pending Transaction · 1 Active Scheme',
      riskLevel: 'Elevated Downstream Exposure',
      cautionNotice: 'These records are not confirmed invalid; they are potentially affected and may require administrative review.',
      nodes: [
        {
          id: 'LR-124/2A',
          label: 'Primary Target: LR-124/2A',
          sub: '2.40 Ac · Survey 124/2A · Kannan',
          type: 'PRIMARY_DISCREPANT_PARCEL',
          status: 'FLAGGED',
          isOrigin: true
        },
        {
          id: 'LR-124/2B',
          label: 'Sub-division: LR-124/2B',
          sub: '2.10 Ac · Survey 124/2B · Marimuthu',
          type: 'POTENTIALLY_AFFECTED_PARCEL',
          status: 'MAY_REQUIRE_REVIEW',
          riskNote: 'Shares same 2017 unpartitioned parent title'
        },
        {
          id: 'LR-124/1',
          label: 'Adjacent: LR-124/1',
          sub: '1.80 Ac · Survey 124/1 · Clear Boundary',
          type: 'NEIGHBOR_PARCEL',
          status: 'UNIMPACTED',
          riskNote: 'Boundary intact, no title cross-dependence'
        },
        {
          id: 'MUT-2026-8812',
          label: 'Pending Mutation #MUT-2026-8812',
          sub: 'Commercial Sale to Rajesh Kumar',
          type: 'DOWNSTREAM_TRANSACTION',
          status: 'POTENTIALLY_BLOCKED',
          riskNote: 'Transfer blocked until root title is rectified'
        },
        {
          id: 'BANK-CERSAI-091',
          label: 'Bank Credit Facility (SBI)',
          sub: '₹14.5 Lakhs Crop Loan Mortgage',
          type: 'CREDIT_COLLATERAL',
          status: 'POTENTIAL_EXPOSURE',
          riskNote: 'Lender may require clear legal heirship certificate'
        },
        {
          id: 'SCH-TN-AGRI-402',
          label: 'PM-KISAN / TN Ryot Scheme',
          sub: 'Annual Farmer Direct Benefit Transfer',
          type: 'GOVERNMENT_SCHEME',
          status: 'MONITORED',
          riskNote: 'Beneficiary bank seeding requires verification'
        }
      ],
      links: [
        { from: 'LR-124/2A', to: 'LR-124/2B', relation: 'Derived from same 1996 Parent Deed', type: 'LINEAGE_DEPENDENCY' },
        { from: 'LR-124/2A', to: 'MUT-2026-8812', relation: 'Active Transfer Application', type: 'CRITICAL_BLOCK' },
        { from: 'LR-124/2A', to: 'BANK-CERSAI-091', relation: 'Property Pledged as Collateral', type: 'FINANCIAL_EXPOSURE' },
        { from: 'LR-124/2A', to: 'SCH-TN-AGRI-402', relation: 'Patta Number Linked to Beneficiary ID', type: 'SCHEME_LINK' }
      ]
    },

    // 4. RECOMMENDED INVESTIGATION ACTIONS (Officer Actionable Tasks)
    recommendedInvestigations: [
      {
        id: 'REC-01',
        targetRole: 'Sub-Registrar / SRO Pollachi',
        priority: 'High Priority',
        title: 'Requisition Physical Volume Register 114 / Page 22',
        description: 'Inspect physical Sub-Registrar ledger for the year 1996–2000 to verify whether any unregistered partition deed, family settlement, or power of attorney was deposited without digital indexing.',
        actionType: 'ARCHIVE_REQUISITION',
        slaDays: '2 Business Days',
        status: 'DISPATCHED',
        assignedTo: 'M. Anand (Sub-Registrar, Pollachi)'
      },
      {
        id: 'REC-02',
        targetRole: 'Tehsildar / Revenue Court',
        priority: 'Critical Priority',
        title: 'Issue Notice for Legal Heirship Affidavits',
        description: 'Summon all surviving legal heirs of deceased grantee Ramasamy to submit registered genealogical succession certificates and consent affidavits before Pollachi Taluk Revenue Court.',
        actionType: 'HEARING_SUMMONS',
        slaDays: '7 Business Days',
        status: 'PENDING_DISPATCH',
        assignedTo: 'S. Subramaniam (Tahsildar, Pollachi)'
      },
      {
        id: 'REC-03',
        targetRole: 'Surveyor / GIS Officer',
        priority: 'Medium Priority',
        title: 'DGPS Boundary Stone & Tie-Line Benchmarking',
        description: 'Conduct on-ground DGPS boundary survey on Survey 124/2A and 124/2B to re-affirm boundary stones G1–G4 against CollabLand FMB coordinates and confirm zero physical encroachment.',
        actionType: 'FIELD_SURVEY',
        slaDays: '3 Business Days',
        status: 'PENDING_DISPATCH',
        assignedTo: 'K. Prakash (Head Surveyor, Pollachi)'
      },
      {
        id: 'REC-04',
        targetRole: 'Auditor / Compliance Officer',
        priority: 'Normal Priority',
        title: 'Audit e-Sevai 2017 Ingestion Operator Logs',
        description: 'Review digital audit trail and operator credentials for Patta entry #PTA-2017-4412 created on 19 Nov 2017 to verify procedural authorization.',
        actionType: 'COMPLIANCE_AUDIT',
        slaDays: '24 Hours',
        status: 'COMPLETED',
        assignedTo: 'R. Soundararajan (Audit Officer)'
      }
    ],

    // 5. DISCREPANCY LIFECYCLE HISTORY
    lifecycle: [
      {
        stage: 'DETECTED',
        stageLabel: 'AI Ingestion Detection',
        timestamp: '01 Sep 2026, 09:12 AM',
        actor: 'NILORA Multi-Modal Ingestion Engine',
        description: 'Automated cross-source validation flagged title continuity break between Revenue e-Patta and SRO Index II.',
        isCompleted: true
      },
      {
        stage: 'TRIAGED',
        stageLabel: 'District Priority Triage',
        timestamp: '01 Sep 2026, 11:30 AM',
        actor: 'District Administrator',
        description: 'Prioritized as Critical (Score: 94) due to pending commercial mutation and credit collateral linkage.',
        isCompleted: true
      },
      {
        stage: 'UNDER_INVESTIGATION',
        stageLabel: 'Field & Archive Investigation',
        timestamp: '02 Sep 2026, 02:15 PM',
        actor: 'S. Subramaniam (Tahsildar, Pollachi)',
        description: 'Assigned to Pollachi Taluk Revenue Office. Volume register requisition dispatched to SRO Pollachi.',
        isCompleted: true,
        isCurrent: true
      },
      {
        stage: 'HEARING_SCHEDULED',
        stageLabel: 'Revenue Court Hearing',
        timestamp: 'Scheduled for 08 Sep 2026',
        actor: 'District Revenue Officer',
        description: 'Joint hearing with claimant Kannan and interested legal successors.',
        isCompleted: false
      },
      {
        stage: 'FINAL_DECISION',
        stageLabel: 'Final Human Adjudication',
        timestamp: 'Pending Hearing Outcome',
        actor: 'Competent Authority',
        description: 'Resolution decree, escalation, or conditional annotation with officer digital signature.',
        isCompleted: false
      }
    ]
  },

  {
    id: 'DISC-2026-2089',
    clusterId: 'CLUSTER-SPATIAL-125',
    clusterName: 'Kinathukadavu Survey 125 Boundary Geometry Shift',
    title: 'Spatial Polygon Expansion into Rural Road Reservation',
    targetParcelId: 'LR-1021',
    surveyNumber: '125/2',
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    extent: '2.50 Acres (Survey table states 2.10 Ac)',
    currentClaimant: 'Ravi Kumar',
    historicalGrantee: 'Shanmugam',
    pattaNumber: 'PTA-2018-3190',
    category: 'Boundary & Spatial Topology',
    severity: 'High',
    priorityScore: 86,
    confidenceScore: 88,
    status: 'ESCALATED_TEHSILDAR',
    detectedDate: '02 Sep 2026, 10:15 AM',
    lastUpdated: '03 Sep 2026, 08:45 AM',
    assignedOfficer: 'S. Subramaniam (Tahsildar, Pollachi)',
    
    empiricalSummary: {
      headline: '0.40 Acre Discrepancy Between 1985 Resettlement Ledger and 2008 Sale Deed',
      findings: [
        '1985 Cadastral Resettlement Register records Survey 125/2 extent as 2.10 Acres.',
        '2008 Registered Sale Deed to Ravi Kumar reflects 2.50 Acres.',
        'GIS Cadastral vector overlay demonstrates 0.40 Acre encroachment into adjacent public rural pathway.',
        'CollabLand digital FMB sketch contains unratified sub-division correction.'
      ],
      discrepancySeverity: 'Public Corridor Encroachment Risk',
      financialExposure: '₹34.0 Lakhs Estimated Corridor Value'
    },

    possibleCommonSourceGraph: {
      inferredSourceTitle: 'Possible Common Source: 1998 Unratified Local Survey Adjustment',
      inferredConfidence: '84% Algorithmic Confidence',
      reasoning: 'Archival notes suggest an unratified survey modification occurred in 1998 when the village panchayat widened the rural pathway, but boundaries were erroneously offset into Survey 125/2.',
      nodes: [
        { id: 'SRC-1985', label: '1985 Resettlement Record', sub: '2.10 Ac Baseline · Shanmugam', type: 'ROOT_BASELINE', status: 'VERIFIED', confidence: '100%', year: 1985 },
        { id: 'SRC-1998-ROAD', label: 'Possible Common Source: 1998 Road Offset', sub: 'Unratified Village Sketch Correction', type: 'POSSIBLE_COMMON_SOURCE', status: 'INFERRED_ORIGIN', confidence: '84%', year: 1998, isHighlight: true },
        { id: 'SRC-2008-DEED', label: '2008 Registered Sale Deed', sub: '2.50 Ac · Ravi Kumar', type: 'REGISTERED_TITLE', status: 'DISCREPANT', confidence: '78%', year: 2008 }
      ],
      links: [
        { from: 'SRC-1985', to: 'SRC-1998-ROAD', relation: '1998 Pathway Widening Offset', type: 'INFERRED_GAP' },
        { from: 'SRC-1998-ROAD', to: 'SRC-2008-DEED', relation: 'Inflated Extent Carried into Deed', type: 'DISCREPANT_LINK' }
      ]
    },

    potentialDownstreamImpactGraph: {
      impactRadiusSummary: '3 Potentially Affected Parcels · 1 Public Infrastructure Corridor',
      riskLevel: 'Moderate Infrastructure Exposure',
      cautionNotice: 'May require joint site inspection with Highways Department.',
      nodes: [
        { id: 'LR-1021', label: 'Primary Target: LR-1021', sub: '2.50 Ac (Disputed) · Ravi Kumar', type: 'PRIMARY_DISCREPANT_PARCEL', status: 'FLAGGED', isOrigin: true },
        { id: 'LR-1022', label: 'Adjacent: LR-1022 (Pathway)', sub: 'Rural Approach Pathway', type: 'POTENTIALLY_AFFECTED_PARCEL', status: 'MAY_REQUIRE_REVIEW', riskNote: '0.40 Ac encroachment into public road' },
        { id: 'PWD-ROAD-11', label: 'Panchayat Road Widening Plan', sub: 'Coimbatore District Rural Roads', type: 'INFRASTRUCTURE_PROJECT', status: 'MONITORED', riskNote: 'Right of way clearance required' }
      ],
      links: [
        { from: 'LR-1021', to: 'LR-1022', relation: 'Spatial Overlap / Encroachment', type: 'CRITICAL_BLOCK' },
        { from: 'LR-1021', to: 'PWD-ROAD-11', relation: 'Corridor Alignment Conflict', type: 'FINANCIAL_EXPOSURE' }
      ]
    },

    recommendedInvestigations: [
      {
        id: 'REC-11',
        targetRole: 'Surveyor / GIS Officer',
        priority: 'Critical Priority',
        title: 'Joint Total-Station Re-survey with PWD',
        description: 'Execute ground total-station survey along Survey 125/2 boundary to re-establish 1985 baseline stones.',
        actionType: 'FIELD_SURVEY',
        slaDays: '3 Business Days',
        status: 'DISPATCHED',
        assignedTo: 'K. Prakash (Head Surveyor)'
      },
      {
        id: 'REC-12',
        targetRole: 'Tehsildar / Revenue Court',
        priority: 'High Priority',
        title: 'Issue Notice for Boundary Rectification Deed',
        description: 'Summon Ravi Kumar for hearing regarding correction of extent from 2.50 Ac to verified 2.10 Ac.',
        actionType: 'HEARING_SUMMONS',
        slaDays: '5 Business Days',
        status: 'PENDING_DISPATCH',
        assignedTo: 'S. Subramaniam (Tahsildar)'
      }
    ],

    lifecycle: [
      { stage: 'DETECTED', stageLabel: 'AI Spatial Topology Flag', timestamp: '02 Sep 2026, 10:15 AM', actor: 'NILORA GIS Engine', description: '0.40 Acre area variance detected between satellite polygon and resettlement ledger.', isCompleted: true },
      { stage: 'TRIAGED', stageLabel: 'District Priority Triage', timestamp: '02 Sep 2026, 02:00 PM', actor: 'District Administrator', description: 'Categorized as High Priority public corridor encroachment.', isCompleted: true },
      { stage: 'UNDER_INVESTIGATION', stageLabel: 'Escalated to Tehsildar', timestamp: '03 Sep 2026, 08:45 AM', actor: 'District Administrator', description: 'Escalated to Tahsildar Pollachi for joint field verification with PWD.', isCompleted: true, isCurrent: true },
      { stage: 'HEARING_SCHEDULED', stageLabel: 'Boundary Rectification Hearing', timestamp: 'Pending Survey Report', actor: 'Tahsildar Pollachi', description: 'Hearing to formalize boundary correction.', isCompleted: false },
      { stage: 'FINAL_DECISION', stageLabel: 'Final Adjudication', timestamp: 'Pending', actor: 'Competent Authority', description: 'Formal Patta and FMB amendment decree.', isCompleted: false }
    ]
  },

  {
    id: 'DISC-2026-3114',
    clusterId: 'CLUSTER-ID-77',
    clusterName: 'Madukkarai Informal Alias & Succession Variance',
    title: 'Informal Name Abbreviation during Online Ingestion',
    targetParcelId: 'LR-1017',
    surveyNumber: '77/1',
    village: 'Madukkarai',
    taluk: 'Sulur',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    extent: '0.80 Acres',
    currentClaimant: 'Karthik S',
    historicalGrantee: 'Karthikeyan S',
    pattaNumber: 'PTA-2021-1402',
    category: 'Identity & KYC Consistency',
    severity: 'Medium',
    priorityScore: 68,
    confidenceScore: 92,
    status: 'ACCEPTED_WITH_ANNOTATION',
    detectedDate: '03 Sep 2026, 08:30 AM',
    lastUpdated: '03 Sep 2026, 01:15 PM',
    assignedOfficer: 'District Administrator',
    
    empiricalSummary: {
      headline: 'Phonetic & Abbreviated Name Variance ("Karthik S" vs "Karthikeyan S")',
      findings: [
        'Aadhaar digital identity card reads "Karthik S" (Aadhaar KYC verified).',
        'Original 1999 Registered Sale Deed reads "Karthikeyan S".',
        'Physical and electoral records confirm identical father name and residence address.',
        'Title lineage has unbroken continuous family possession since 1999.'
      ],
      discrepancySeverity: 'Low Risk / Administrative Discrepancy',
      financialExposure: '₹18.0 Lakhs Extent'
    },

    possibleCommonSourceGraph: {
      inferredSourceTitle: 'Possible Common Source: 2021 Digital Ingestion Name Truncation',
      inferredConfidence: '92% Algorithmic Confidence',
      reasoning: 'During the 2021 state-wide digitization drive, operator transcribed the Aadhaar card name instead of full registered deed name.',
      nodes: [
        { id: 'SRC-1999', label: '1999 Registered Deed', sub: 'Karthikeyan S · 0.80 Ac', type: 'REGISTERED_TITLE', status: 'VERIFIED', confidence: '100%', year: 1999 },
        { id: 'SRC-2021-INGEST', label: 'Possible Common Source: 2021 Portal Entry', sub: 'Aadhaar Name "Karthik S" Used', type: 'POSSIBLE_COMMON_SOURCE', status: 'INFERRED_ORIGIN', confidence: '92%', year: 2021, isHighlight: true }
      ],
      links: [
        { from: 'SRC-1999', to: 'SRC-2021-INGEST', relation: 'Informal Abbreviation Recorded', type: 'INFERRED_GAP' }
      ]
    },

    potentialDownstreamImpactGraph: {
      impactRadiusSummary: '1 Target Parcel · Negligible Downstream Risk',
      riskLevel: 'Low Risk',
      cautionNotice: 'May require notary name affidavit for future bank loans.',
      nodes: [
        { id: 'LR-1017', label: 'Target: LR-1017', sub: '0.80 Ac · Karthik S / Karthikeyan S', type: 'PRIMARY_DISCREPANT_PARCEL', status: 'ANNOTATED', isOrigin: true }
      ],
      links: []
    },

    recommendedInvestigations: [
      {
        id: 'REC-21',
        targetRole: 'Tehsildar / Sub-Registrar',
        priority: 'Normal Priority',
        title: 'Submit Notary One-and-Same-Person Affidavit',
        description: 'Record attested notary affidavit linking "Karthik S" and "Karthikeyan S" in the digital Patta remarks column.',
        actionType: 'AFFIDAVIT_FILING',
        slaDays: '7 Business Days',
        status: 'COMPLETED',
        assignedTo: 'District Administrator'
      }
    ],

    lifecycle: [
      { stage: 'DETECTED', stageLabel: 'AI NLP Name Mismatch', timestamp: '03 Sep 2026, 08:30 AM', actor: 'NILORA Identity Engine', description: 'Name variation detected between Aadhaar token and 1999 Patta.', isCompleted: true },
      { stage: 'TRIAGED', stageLabel: 'District Triage', timestamp: '03 Sep 2026, 10:00 AM', actor: 'District Administrator', description: 'Assessed as administrative alias discrepancy.', isCompleted: true },
      { stage: 'UNDER_INVESTIGATION', stageLabel: 'Proof Verification', timestamp: '03 Sep 2026, 11:30 AM', actor: 'District Administrator', description: 'Voter ID and Aadhaar cross-checked.', isCompleted: true },
      { stage: 'FINAL_DECISION', stageLabel: 'Accepted with Annotation', timestamp: '03 Sep 2026, 01:15 PM', actor: 'District Administrator', description: 'Approved with permanent digital annotation: "Karthik S @ Karthikeyan S verified as same person via Aadhaar & Electoral Roll."', isCompleted: true, isCurrent: true }
    ]
  }
];
