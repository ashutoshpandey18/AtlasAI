// Computes net buildable acreage by deducting environmental, slope, and flood constraints.

import type { MireyeFetchResponse, MireyeFieldValue } from '../types/mireye';

export type AgentActionVerdict =
  | 'READY_FOR_SITE_CONTROL'
  | 'NEEDS_PARCEL_ASSEMBLY'
  | 'REJECT_CONSTRAINED';

export interface ConstraintDeduction {
  code: string;
  label: string;
  deductionAcres: number;
  deductionPct: number;
  rationale: string;
}

export interface BuildableAreaReport {
  totalParcelAcres: number;
  targetRequiredAcres: number;
  netBuildableAcres: number;
  buildableEfficiencyPct: number; // 0 - 100
  totalDeductionsAcres: number;
  deductions: ConstraintDeduction[];
  verdict: AgentActionVerdict;
  verdictLabel: string;
  verdictReason: string;
}

function val<T>(fields: Record<string, MireyeFieldValue>, key: string): T | null {
  const v = fields[key]?.value;
  return v !== undefined ? (v as T) : null;
}

/**
 * Calculates net buildable acreage and emits an AI agent action verdict for site acquisition.
 *
 * @param data               Mireye raw fetch response
 * @param targetRequiredAcres Target acreage required by project (default: 50 acres)
 * @param totalParcelAcres   Total parcel acreage (default: 100 acres)
 */
export function analyzeBuildableArea(
  data: MireyeFetchResponse,
  targetRequiredAcres: number = 50,
  totalParcelAcres: number = 100,
): BuildableAreaReport {
  const fields = data.fields ?? {};
  const deductions: ConstraintDeduction[] = [];

  // 1. FEMA Floodplain Deduction (35% deduction if inside floodplain polygon)
  const isFlood = val<boolean>(fields, 'within_floodplain_polygon') === true;
  if (isFlood) {
    const acres = Number((totalParcelAcres * 0.35).toFixed(1));
    deductions.push({
      code: 'FEMA_FLOOD_DEDUCTION',
      label: 'FEMA Flood Zone Exclusion',
      deductionAcres: acres,
      deductionPct: 35,
      rationale: 'Unbuildable 100-year floodplain area per FEMA NFHL regulations',
    });
  }

  // 2. USFWS Wetland Buffer Deduction (25% deduction if wetland intersects)
  const isWetland = val<boolean>(fields, 'intersects_wetland') === true;
  if (isWetland) {
    const acres = Number((totalParcelAcres * 0.25).toFixed(1));
    deductions.push({
      code: 'USFWS_WETLAND_BUFFER',
      label: 'Wetland 100ft Setback Buffer',
      deductionAcres: acres,
      deductionPct: 25,
      rationale: 'Mandatory federal 100-foot buffer setback along USFWS wetland boundary',
    });
  }

  // 3. Steep Slope Deduction (20% deduction if slope > 8 degrees)
  const slope = val<number>(fields, 'slope_degrees');
  if (slope !== null && slope > 8) {
    const acres = Number((totalParcelAcres * 0.20).toFixed(1));
    deductions.push({
      code: 'STEEP_SLOPE_DEDUCTION',
      label: `Steep Terrain Exclusion (${slope.toFixed(1)}°)`,
      deductionAcres: acres,
      deductionPct: 20,
      rationale: 'Severe grading costs required for slopes exceeding 8° threshold',
    });
  }

  // 4. PAD-US Protected Area / Easement (40% deduction if protected land)
  const isProtected = val<boolean>(fields, 'intersects_protected_area') === true || val<boolean>(fields, 'intersects_conservation_easement') === true;
  if (isProtected) {
    const acres = Number((totalParcelAcres * 0.40).toFixed(1));
    deductions.push({
      code: 'PROTECTED_AREA_EASEMENT',
      label: 'Protected Area / Easement',
      deductionAcres: acres,
      deductionPct: 40,
      rationale: 'Legally binding conservation easement or public land reservation',
    });
  }

  const totalDeductionsAcres = Number(
    deductions.reduce((sum, d) => sum + d.deductionAcres, 0).toFixed(1)
  );

  const netBuildableAcres = Number(
    Math.max(0, totalParcelAcres - totalDeductionsAcres).toFixed(1)
  );

  const buildableEfficiencyPct = Number(
    ((netBuildableAcres / totalParcelAcres) * 100).toFixed(1)
  );

  // 5. Compute Agent Action Verdict
  let verdict: AgentActionVerdict = 'READY_FOR_SITE_CONTROL';
  let verdictLabel = 'READY FOR SITE CONTROL';
  let verdictReason = `Site meets project requirement of ${targetRequiredAcres} buildable acres with ${netBuildableAcres} acres available (${buildableEfficiencyPct}% buildable efficiency).`;

  if (isFlood && isProtected) {
    verdict = 'REJECT_CONSTRAINED';
    verdictLabel = 'UNFEASIBLE — SEVERE CONSTRAINTS';
    verdictReason = `Site severely constrained by combined flood and conservation easement boundaries. Net buildable area (${netBuildableAcres} acres) is insufficient.`;
  } else if (netBuildableAcres < targetRequiredAcres * 0.5) {
    verdict = 'REJECT_CONSTRAINED';
    verdictLabel = 'REJECT — INSUFFICIENT BUILDABLE AREA';
    verdictReason = `Net buildable area (${netBuildableAcres} acres) provides less than 50% of target requirement (${targetRequiredAcres} acres).`;
  } else if (netBuildableAcres < targetRequiredAcres) {
    verdict = 'NEEDS_PARCEL_ASSEMBLY';
    verdictLabel = 'NEEDS PARCEL ASSEMBLY';
    verdictReason = `Net buildable area (${netBuildableAcres} acres) falls short of ${targetRequiredAcres} acres. Requires acquiring an adjacent parcel to assemble target footprint.`;
  }

  return {
    totalParcelAcres,
    targetRequiredAcres,
    netBuildableAcres,
    buildableEfficiencyPct,
    totalDeductionsAcres,
    deductions,
    verdict,
    verdictLabel,
    verdictReason,
  };
}
