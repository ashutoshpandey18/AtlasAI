// Generates Letter of Intent terms and offer text for parcel acquisition outreach.

import type { MireyeFetchResponse } from '../types/mireye';

export interface LoiTerms {
  ownerName: string;
  parcelAddress: string;
  totalAcres: number;
  useCaseName: string;
  estimatedAnnualLeasePerAcre: number;
  totalAnnualLeasePayment: number;
  optionPeriodMonths: number;
  optionFeePerYear: number;
  leaseTermYears: number;
  annualEscalationPct: number;
  loiText: string;
}

/**
 * Generates formal Letter of Intent (LOI) terms and offer text for parcel acquisition.
 */
export function generateLandLoi(
  address: string,
  data: MireyeFetchResponse,
  useCaseName: string = 'Solar Farm',
  targetAcres: number = 100,
  customOwnerName?: string
): LoiTerms {
  const fields = data.fields ?? {};

  // Extract owner name from Mireye lookup if available or generate realistic entity
  const ownerName = customOwnerName || (fields['parcel_owner']?.value as string) || 'Midland Land Holdings LLC';

  // Regional lease rate heuristics ($/acre/year) based on use case
  let baseLeaseRate = 1400; // Default $1,400/acre/yr for Solar
  if (useCaseName.toLowerCase().includes('data center')) {
    baseLeaseRate = 3500;
  } else if (useCaseName.toLowerCase().includes('battery') || useCaseName.toLowerCase().includes('storage')) {
    baseLeaseRate = 2200;
  }

  const estimatedAnnualLeasePerAcre = baseLeaseRate;
  const totalAnnualLeasePayment = Math.round(targetAcres * estimatedAnnualLeasePerAcre);
  const optionPeriodMonths = 36; // 3-year option period for interconnection/permitting
  const optionFeePerYear = Math.round(totalAnnualLeasePayment * 0.10); // 10% of annual rent
  const leaseTermYears = 30;
  const annualEscalationPct = 2.5;

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const loiText = `LETTER OF INTENT TO LEASE REAL PROPERTY

DATE: ${todayStr}
TO: ${ownerName} ("Landowner")
RE: Option to Lease Approximately ${targetAcres} Acres at ${address}

Dear ${ownerName},

Atlas AI Infrastructure Development ("Developer") is pleased to present this non-binding Letter of Intent ("LOI") to acquire an exclusive option to lease real property for the development, construction, and operation of a ${useCaseName} facility.

1. PREMISES: Approximately ${targetAcres} contiguous acres located at ${address}.

2. OPTION PERIOD: Landowner grants Developer an exclusive option period of thirty-six (${optionPeriodMonths}) months to conduct environmental, grid interconnection, and zoning feasibility audits ("Option Period").

3. OPTION PAYMENT: Developer shall pay Landowner an annual option fee of $${optionFeePerYear.toLocaleString()} USD per year during the Option Period.

4. LEASE TERM: Upon exercise of the option, the initial lease term shall be thirty (${leaseTermYears}) years, with two (2) five-year extension options.

5. RENT: Initial annual rent shall be $${estimatedAnnualLeasePerAcre.toLocaleString()} per acre per year, totaling approximately $${totalAnnualLeasePayment.toLocaleString()} USD per year, escalating at ${annualEscalationPct}% annually.

6. CONFIDENTIALITY: Landowner and Developer agree to keep the terms of this LOI strictly confidential.

Sincerely,

Atlas AI Land Acquisition Team
Developer Representative

AGREED AND ACCEPTED:

________________________________________
${ownerName} ("Landowner")
Date: __________________________________`;

  return {
    ownerName,
    parcelAddress: address,
    totalAcres: targetAcres,
    useCaseName,
    estimatedAnnualLeasePerAcre,
    totalAnnualLeasePayment,
    optionPeriodMonths,
    optionFeePerYear,
    leaseTermYears,
    annualEscalationPct,
    loiText,
  };
}
