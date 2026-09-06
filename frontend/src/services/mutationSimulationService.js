/**
 * NILORA Deterministic Mutation Simulation & Re-validation Engine
 * Evaluates proposed land transaction against historical chain, spatial boundary,
 * identity registries, and cross-source caveats.
 */

import { getAuditTrail } from './parcelService';

export function runMutationSimulation(parcel, proposedState = {}) {
  const {
    proposedOwner = 'Ravi',
    proposedArea = '2.40',
    mutationType = 'Sale Deed (கிரைய பத்திரம்)',
    deedNumber = 'DOC-2026-REG-8812',
    buyerAadhaar = '9821-4410-1290',
    sellerName = parcel?.currentOwner || 'Kannan',
    clearCaveats = false
  } = proposedState;

  const areaNum = parseFloat(proposedArea) || 2.40;
  const originalAreaNum = parcel?.areaNum || 2.40;
  const areaDiff = Math.abs(areaNum - originalAreaNum);

  const criticalConflicts = [];
  const warnings = [];

  // =========================================================================
  // 1. EXTRACTION DIMENSION
  // =========================================================================
  const extractionScore = deedNumber ? 92 : 65;
  const extractionStatus = deedNumber ? 'VERIFIED' : 'REVIEW';
  const extractionExplanation = deedNumber 
    ? `Simulated e-Deed extraction (${deedNumber}) verified with 92% optical confidence.`
    : 'Deed reference absent or unverified in digital registry index.';

  // =========================================================================
  // 2. IDENTITY DIMENSION
  // =========================================================================
  let identityScore = 80;
  let identityStatus = 'REVIEW';
  let identityExplanation = `Proposed buyer "${proposedOwner}" Aadhaar token validated.`;

  if (!buyerAadhaar || buyerAadhaar.length < 8) {
    identityScore = 50;
    identityStatus = 'CONTRADICTION';
    criticalConflicts.push('Buyer identity KYC token missing or invalid.');
    identityExplanation = 'Buyer Aadhaar / PAN biometric verification token absent.';
  } else if (proposedOwner.toLowerCase() === sellerName.toLowerCase()) {
    identityScore = 45;
    identityStatus = 'CONTRADICTION';
    criticalConflicts.push('Grantor (Seller) and Grantee (Buyer) cannot be identical in a Sale Deed mutation.');
    identityExplanation = 'Invalid transaction: Grantor and Grantee are the same entity.';
  } else {
    identityScore = 85;
    identityStatus = 'VERIFIED';
    identityExplanation = `Buyer "${proposedOwner}" and Grantor "${sellerName}" identity credentials verified.`;
  }

  // =========================================================================
  // 3. HISTORICAL CONTINUITY DIMENSION
  // =========================================================================
  let historicalScore = 42;
  let historicalStatus = 'CONTRADICTION';
  let historicalExplanation = '';

  // In our hero parcel LR-124/2A, the seller Kannan has an unresolved 2017 title break
  if (parcel?.id === 'LR-124/2A' && !clearCaveats) {
    historicalScore = 38;
    historicalStatus = 'CONTRADICTION';
    criticalConflicts.push('Title Break: Grantor (Kannan) possesses unresolved 2017 divergence against original title holder (Ramasamy).');
    historicalExplanation = 'Mutation blocked: Grantor holds defective title lineage originating from unverified 2017 entry.';
  } else if (clearCaveats) {
    historicalScore = 88;
    historicalStatus = 'VERIFIED';
    historicalExplanation = 'Historical title gap rectified via certified heirship settlement decree.';
  } else {
    historicalScore = 82;
    historicalStatus = 'VERIFIED';
    historicalExplanation = 'Unbroken chain of title verified from baseline settlement to current grantor.';
  }

  // =========================================================================
  // 4. SPATIAL DIMENSION
  // =========================================================================
  let spatialScore = 95;
  let spatialStatus = 'VERIFIED';
  let spatialExplanation = `Proposed area (${areaNum.toFixed(2)} Acres) matches FMB Cadastral boundary.`;

  if (areaDiff > 0.05) {
    spatialScore = 40;
    spatialStatus = 'CONTRADICTION';
    criticalConflicts.push(`Spatial Variance: Proposed area (${areaNum.toFixed(2)} Ac) exceeds surveyed FMB boundary (${originalAreaNum.toFixed(2)} Ac).`);
    spatialExplanation = `Spatial mismatch: ${areaDiff.toFixed(2)} Acre discrepancy against GIS cadastral benchmark.`;
  }

  // =========================================================================
  // 5. EVIDENCE DIMENSION
  // =========================================================================
  let evidenceScore = 75;
  let evidenceStatus = 'REVIEW';
  let evidenceExplanation = `Primary transaction deed draft ${deedNumber} logged in simulation repository.`;

  if (!deedNumber) {
    evidenceScore = 45;
    evidenceStatus = 'CONTRADICTION';
    criticalConflicts.push('Missing certified registered instrument for title conveyance.');
    evidenceExplanation = 'No registered deed document attached to proposed mutation.';
  } else {
    evidenceScore = 88;
    evidenceStatus = 'VERIFIED';
    evidenceExplanation = `All supporting deed instruments and KYC tokens present in simulation dossier.`;
  }

  // =========================================================================
  // 6. CROSS-SOURCE CONSISTENCY DIMENSION
  // =========================================================================
  let crossSourceScore = 52;
  let crossSourceStatus = 'CONTRADICTION';
  let crossSourceExplanation = '';

  if (parcel?.id === 'LR-124/2A' && !clearCaveats) {
    crossSourceScore = 46;
    crossSourceStatus = 'CONTRADICTION';
    criticalConflicts.push('Cross-Source Caveat: Sub-Registrar Book I reflects active rival caveat by heirs of Ramasamy.');
    crossSourceExplanation = 'Registration Index II and Revenue Patta remain discordant. Applying mutation would compound legal conflict.';
  } else if (clearCaveats) {
    crossSourceScore = 91;
    crossSourceStatus = 'VERIFIED';
    crossSourceExplanation = 'Revenue e-Patta and Registration Department Index II reconciled in simulation.';
  } else {
    crossSourceScore = 89;
    crossSourceStatus = 'VERIFIED';
    crossSourceExplanation = 'Synchronized agreement across Revenue Department and Sub-Registrar office records.';
  }

  // =========================================================================
  // OVERALL STATUS & COMMIT SAFETY LOGIC
  // =========================================================================
  const dimensions = [
    {
      id: 'extraction',
      title: 'Extraction',
      status: extractionStatus,
      statusText: extractionStatus === 'VERIFIED' ? 'High Confidence' : 'Needs Review',
      score: extractionScore,
      explanation: extractionExplanation,
      evidenceCount: 3,
      diff: extractionScore - (parcel?.dimensions?.find(d => d.id === 'extraction')?.score || 88)
    },
    {
      id: 'identity',
      title: 'Identity',
      status: identityStatus,
      statusText: identityStatus === 'VERIFIED' ? 'Verified' : identityStatus === 'REVIEW' ? 'Needs Review' : 'Contradiction Detected',
      score: identityScore,
      explanation: identityExplanation,
      evidenceCount: 2,
      diff: identityScore - (parcel?.dimensions?.find(d => d.id === 'identity')?.score || 72)
    },
    {
      id: 'historical',
      title: 'Historical',
      status: historicalStatus,
      statusText: historicalStatus === 'VERIFIED' ? 'Verified' : 'Contradiction Detected',
      score: historicalScore,
      explanation: historicalExplanation,
      evidenceCount: 4,
      hasTimeline: true,
      diff: historicalScore - (parcel?.dimensions?.find(d => d.id === 'historical')?.score || 48)
    },
    {
      id: 'spatial',
      title: 'Spatial',
      status: spatialStatus,
      statusText: spatialStatus === 'VERIFIED' ? 'Verified' : 'Contradiction Detected',
      score: spatialScore,
      explanation: spatialExplanation,
      evidenceCount: 2,
      diff: spatialScore - (parcel?.dimensions?.find(d => d.id === 'spatial')?.score || 95)
    },
    {
      id: 'evidence',
      title: 'Evidence',
      status: evidenceStatus,
      statusText: evidenceStatus === 'VERIFIED' ? 'Verified' : 'Needs Review',
      score: evidenceScore,
      explanation: evidenceExplanation,
      evidenceCount: 3,
      diff: evidenceScore - (parcel?.dimensions?.find(d => d.id === 'evidence')?.score || 68)
    },
    {
      id: 'crossSource',
      title: 'Cross-Source',
      status: crossSourceStatus,
      statusText: crossSourceStatus === 'VERIFIED' ? 'Verified' : 'Contradiction Detected',
      score: crossSourceScore,
      explanation: crossSourceExplanation,
      evidenceCount: 3,
      diff: crossSourceScore - (parcel?.dimensions?.find(d => d.id === 'crossSource')?.score || 54)
    }
  ];

  const hasCritical = criticalConflicts.length > 0;
  const overallScore = Math.round(
    dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length
  );

  const canCommit = !hasCritical;
  const blockingReason = hasCritical 
    ? `Commit blocked — ${criticalConflicts.length} unresolved critical contradiction${criticalConflicts.length > 1 ? 's' : ''} detected: ${criticalConflicts[0]}`
    : null;

  return {
    simulatedAt: new Date().toISOString(),
    proposedState: {
      proposedOwner,
      proposedArea: `${areaNum.toFixed(2)} Acres`,
      mutationType,
      deedNumber,
      buyerAadhaar,
      sellerName
    },
    dimensions,
    overallScore,
    overallStatus: hasCritical ? 'Contradiction Detected (Simulated)' : 'Safe for Authority Review',
    statusCode: hasCritical ? 'CONTRADICTION' : 'VERIFIED',
    criticalConflicts,
    warnings,
    canCommit,
    blockingReason,
    isSimulated: true
  };
}
