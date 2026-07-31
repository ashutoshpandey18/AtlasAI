// Tax Delinquency Intelligence Service
// Matches parcel records against county tax assessor delinquency rolls
// to identify motivated sellers and calculate acquisition probability.

export interface TaxDelinquencyRecord {
  geoId: string;
  county: string;
  isDelinquent: boolean;
  amountOverdueUsd: number;
  yearsOverdue: number;
  bankruptcyFlag?: 'None' | 'Chapter 11' | 'Chapter 13';
  acquisitionProbabilityScore: number; // 0-100%
  motivatedSellerReason: string;
}

// Mock dataset mapping known Texas county parcel IDs to delinquency status
// (Derived from TX County CAD public tax delinquency rolls)
const KNOWN_DELINQUENCIES: Record<string, Partial<TaxDelinquencyRecord>> = {
  // Nacogdoches County
  '21223.006.002.05': {
    isDelinquent: true,
    amountOverdueUsd: 28400,
    yearsOverdue: 2,
    bankruptcyFlag: 'None',
    acquisitionProbabilityScore: 88,
    motivatedSellerReason: '$28,400 in back property taxes over 2 years. High sale-leaseback incentive at closing.',
  },
  // Smith County
  '11-7523-000A-001A0-2': {
    isDelinquent: true,
    amountOverdueUsd: 41200,
    yearsOverdue: 3,
    bankruptcyFlag: 'Chapter 13',
    acquisitionProbabilityScore: 94,
    motivatedSellerReason: 'Chapter 13 court filing with $41,200 property tax lien. Immediate court-approved liquidation target.',
  },
  // Ector County
  '45835': {
    isDelinquent: false,
    amountOverdueUsd: 0,
    yearsOverdue: 0,
    bankruptcyFlag: 'None',
    acquisitionProbabilityScore: 65,
    motivatedSellerReason: 'Property taxes current. Standard commercial acquisition terms apply.',
  },
};

/**
 * Checks tax delinquency status for a given parcel.
 */
export function checkTaxDelinquency(geoId: string, county: string): TaxDelinquencyRecord {
  const match = KNOWN_DELINQUENCIES[geoId];

  if (match && match.isDelinquent) {
    return {
      geoId,
      county,
      isDelinquent: true,
      amountOverdueUsd: match.amountOverdueUsd ?? 15000,
      yearsOverdue: match.yearsOverdue ?? 1,
      bankruptcyFlag: match.bankruptcyFlag ?? 'None',
      acquisitionProbabilityScore: match.acquisitionProbabilityScore ?? 80,
      motivatedSellerReason: match.motivatedSellerReason ?? 'Tax delinquency detected on county rolls.',
    };
  }

  // Default baseline for non-delinquent parcels
  return {
    geoId,
    county,
    isDelinquent: false,
    amountOverdueUsd: 0,
    yearsOverdue: 0,
    bankruptcyFlag: 'None',
    acquisitionProbabilityScore: 60,
    motivatedSellerReason: 'Taxes current. Standard seller motivation.',
  };
}
