/**
 * Environmental Permitting Lead-Time & NEPA Clearance Calculator
 *
 * Evaluates site environmental constraints (wetlands, floodplains, protected lands) against
 * federal and state environmental regulatory frameworks (USACE Section 404, FEMA NFHL, USFWS Section 7, NEPA)
 * to estimate permitting timelines (12–36 months) and required permit checklists.
 */

import type { MireyeFetchResponse, MireyeFieldValue } from '../types/mireye';

export interface RequiredPermit {
  code: string;
  agency: string;
  name: string;
  estimatedMonths: number;
  triggerCondition: string;
  isCriticalPath: boolean;
}

export interface PermittingReport {
  estimatedLeadTimeMonths: number;
  leadTimeRangeLabel: string;
  permittingCategory: 'FAST_TRACK_ELIGIBLE' | 'STANDARD_PERMITTING' | 'EXTENDED_NEPA_DELAY';
  categoryLabel: string;
  requiredPermits: RequiredPermit[];
  criticalPathAgency: string;
  clearanceRiskScore: number; // 0 - 100 (100 = fast clearance)
  permittingAdvice: string;
}

function val<T>(fields: Record<string, MireyeFieldValue>, key: string): T | null {
  const v = fields[key]?.value;
  return v !== undefined ? (v as T) : null;
}

/**
 * Calculates environmental permitting lead times and required permit matrices.
 */
export function analyzeEnvironmentalPermitting(
  data: MireyeFetchResponse,
  useCaseName: string = 'Solar Farm'
): PermittingReport {
  const fields = data.fields ?? {};
  const requiredPermits: RequiredPermit[] = [];

  const isWetland = val<boolean>(fields, 'intersects_wetland') === true;
  const isFlood = val<boolean>(fields, 'within_floodplain_polygon') === true;
  const isProtected = val<boolean>(fields, 'intersects_protected_area') === true || val<boolean>(fields, 'intersects_conservation_easement') === true;
  const slope = val<number>(fields, 'slope_degrees') ?? 0;

  // 1. USACE Section 404 Wetland Permit
  if (isWetland) {
    requiredPermits.push({
      code: 'USACE_404',
      agency: 'U.S. Army Corps of Engineers (USACE)',
      name: 'Section 404 Dredge & Fill Permit',
      estimatedMonths: 18,
      triggerCondition: 'Direct intersection with USFWS wetland boundary',
      isCriticalPath: true,
    });
  } else {
    requiredPermits.push({
      code: 'USACE_NWP',
      agency: 'U.S. Army Corps of Engineers (USACE)',
      name: 'Nationwide Permit 51 (Utility Lines)',
      estimatedMonths: 6,
      triggerCondition: 'Standard non-wetland utility discharge',
      isCriticalPath: false,
    });
  }

  // 2. FEMA Floodplain Use Permit & LOMR
  if (isFlood) {
    requiredPermits.push({
      code: 'FEMA_CLOMR',
      agency: 'FEMA & Local Floodplain Administrator',
      name: 'Conditional Letter of Map Revision (CLOMR)',
      estimatedMonths: 14,
      triggerCondition: 'Development within FEMA 100-year floodplain polygon',
      isCriticalPath: false,
    });
  }

  // 3. USFWS Section 7 Threatened & Endangered Species
  if (isProtected || isWetland) {
    requiredPermits.push({
      code: 'USFWS_SEC7',
      agency: 'U.S. Fish & Wildlife Service (USFWS)',
      name: 'Section 7 Biological Assessment & Habitat Clearance',
      estimatedMonths: 12,
      triggerCondition: 'Proximity to protected conservation area or wetland habitat',
      isCriticalPath: false,
    });
  }

  // 4. State DEC Stormwater General Permit (NPDES)
  requiredPermits.push({
    code: 'NPDES_CGP',
    agency: 'State Dept. of Environmental Conservation',
    name: 'NPDES Construction Stormwater General Permit',
    estimatedMonths: 4,
    triggerCondition: 'Ground disturbance exceeding 1 acre',
    isCriticalPath: false,
  });

  // Calculate maximum lead time (critical path)
  const maxMonths = Math.max(...requiredPermits.map((p) => p.estimatedMonths));
  const criticalPermit = requiredPermits.find((p) => p.estimatedMonths === maxMonths) || requiredPermits[0];

  let permittingCategory: PermittingReport['permittingCategory'] = 'FAST_TRACK_ELIGIBLE';
  let categoryLabel = 'FAST-TRACK PERMITTING ELIGIBLE';
  let clearanceRiskScore = 90;
  let permittingAdvice = 'Site presents minimal environmental permitting friction. Standard 4-6 month NPDES stormwater clearance expected.';

  if (isWetland && isProtected) {
    permittingCategory = 'EXTENDED_NEPA_DELAY';
    categoryLabel = 'EXTENDED NEPA EIS DELAY (30+ MO)';
    clearanceRiskScore = 35;
    permittingAdvice = 'Critical Path: Wetland and protected area intersections trigger a full USACE Individual Permit and USFWS Biological Opinion. Expect 30-36 month regulatory timeline.';
  } else if (isWetland || isFlood) {
    permittingCategory = 'STANDARD_PERMITTING';
    categoryLabel = 'STANDARD ENVIRONMENTAL PERMITTING (14-18 MO)';
    clearanceRiskScore = 65;
    permittingAdvice = `Critical Path: ${criticalPermit.name} (${criticalPermit.agency}). Complete wetland delineation and flood study early in design.`;
  }

  return {
    estimatedLeadTimeMonths: maxMonths,
    leadTimeRangeLabel: `${maxMonths - 2}–${maxMonths + 4} Months`,
    permittingCategory,
    categoryLabel,
    requiredPermits,
    criticalPathAgency: criticalPermit.agency,
    clearanceRiskScore,
    permittingAdvice,
  };
}
