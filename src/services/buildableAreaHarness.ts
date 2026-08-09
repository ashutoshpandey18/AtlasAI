// src/services/buildableAreaHarness.ts
// Single Source of Truth for Evidence-Based Developability Assessment in Atlas AI.
// Combines verified parcel geometry (via WGS84 geodesic area calculation) and
// live/cached Mireye physical point indicators with Atlas's disclosed civil deduction model.

import type { MireyeFetchResponse, MireyeFieldValue } from '../types/mireye';

export type AgentActionVerdict =
  | 'READY_FOR_SITE_CONTROL'
  | 'NEEDS_PARCEL_ASSEMBLY'
  | 'REJECT_CONSTRAINED';

export interface ConstraintDeduction {
  code: string;
  label: string;
  constraint: string;
  source: string;
  trigger: string;
  deductionPct: number;
  deductionAcres: number;
  rationale: string;
}

export interface BuildableAreaReport {
  grossParcelAcres: number | null;
  targetRequiredAcres: number;
  estimatedNetDevelopableAcres: number | null;
  estimatedSiteEfficiencyPct: number | null;
  netBuildableAcres: number;
  buildableEfficiencyPct: number;
  totalDeductionsAcres: number;
  deductions: ConstraintDeduction[];
  verdict: AgentActionVerdict;
  verdictLabel: string;
  verdictReason: string;

  // Provenance & Disclosed Methodology Standards
  methodology: 'Atlas Civil Deduction Model';
  boundaryLabel: 'Verified Parcel Boundary' | 'Approximated Boundary Box' | 'No Verified Geometry';
  isGeometryAuthoritative: boolean;
  confidence: 'High' | 'Pre-Feasibility Model Estimate' | 'Estimated' | 'Unavailable';
  provenance: 'Live Mireye API Indicators' | 'Cached Mireye API Indicators' | 'Assessment used parcel geometry only — Mireye physical indicators available in Site Dossier' | 'No Physical Indicators';
  disclaimer: string;
  isAvailable: boolean;
}

/**
 * Calculates exact geodesic area in square meters for GeoJSON Polygon / MultiPolygon
 * coordinates on WGS84 ellipsoid, converted to US survey acres.
 * 1 acre = 4,046.8564224 square meters.
 */
export function calculateGeoJsonAreaAcres(geometry: any): number | null {
  if (!geometry || !geometry.type || !geometry.coordinates) return null;

  const EARTH_RADIUS_METERS = 6378137.0;

  function ringArea(ring: number[][]): number {
    if (!ring || ring.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const p1 = ring[i];
      const p2 = ring[i + 1];
      const lambda1 = (p1[0] * Math.PI) / 180;
      const phi1 = (p1[1] * Math.PI) / 180;
      const lambda2 = (p2[0] * Math.PI) / 180;
      const phi2 = (p2[1] * Math.PI) / 180;
      area += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
    }
    area = (area * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 2.0;
    return Math.abs(area);
  }

  function polygonArea(coords: number[][][]): number {
    if (!coords || coords.length === 0) return 0;
    let outerArea = ringArea(coords[0]);
    for (let i = 1; i < coords.length; i++) {
      outerArea -= ringArea(coords[i]); // Subtract inner hole rings
    }
    return Math.max(0, outerArea);
  }

  let totalSqMeters = 0;
  if (geometry.type === 'Polygon') {
    totalSqMeters = polygonArea(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polyCoords of geometry.coordinates) {
      totalSqMeters += polygonArea(polyCoords);
    }
  } else {
    return null;
  }

  if (totalSqMeters <= 0) return null;
  const acres = totalSqMeters / 4046.8564224;
  return Number(acres.toFixed(1));
}

function val<T>(fields: Record<string, MireyeFieldValue> | undefined | null, key: string): T | null {
  if (!fields) return null;
  const v = fields[key]?.value;
  return v !== undefined ? (v as T) : null;
}

/**
 * Single Source of Truth generator for Evidence-Based Developability Assessment in Atlas.
 */
export function analyzeBuildableArea(
  data?: MireyeFetchResponse | null,
  targetRequiredAcres: number = 50,
  totalParcelAcresFallback: number = 100,
  geometry?: any | null,
  isSyntheticBoundingBox?: boolean,
  isFreshProximity?: boolean
): BuildableAreaReport {
  const fields = data?.fields ?? {};
  const isDataPresent = Boolean(data && data.fields && Object.keys(data.fields).length > 0);

  // 1. Determine Gross Parcel Acreage & Geometry Provenance
  let grossParcelAcres: number | null = null;
  let isGeometryAuthoritative = false;
  let boundaryLabel: BuildableAreaReport['boundaryLabel'] = 'No Verified Geometry';

  const geomAcres = calculateGeoJsonAreaAcres(geometry);
  if (geomAcres !== null && geomAcres > 0) {
    grossParcelAcres = geomAcres;
    if (isSyntheticBoundingBox) {
      isGeometryAuthoritative = false;
      boundaryLabel = 'Approximated Boundary Box';
    } else {
      isGeometryAuthoritative = true;
      boundaryLabel = 'Verified Parcel Boundary';
    }
  } else if (totalParcelAcresFallback > 0) {
    grossParcelAcres = totalParcelAcresFallback;
    isGeometryAuthoritative = false;
    boundaryLabel = 'No Verified Geometry';
  }

  // 2. Handle missing geometry & missing data edge cases
  if (grossParcelAcres === null || grossParcelAcres <= 0) {
    return {
      grossParcelAcres: null,
      targetRequiredAcres,
      estimatedNetDevelopableAcres: null,
      estimatedSiteEfficiencyPct: null,
      netBuildableAcres: 0,
      buildableEfficiencyPct: 0,
      totalDeductionsAcres: 0,
      deductions: [],
      verdict: 'REJECT_CONSTRAINED',
      verdictLabel: 'UNAVAILABLE — MISSING PARCEL GEOMETRY',
      verdictReason: 'Verified parcel geometry was not returned for this candidate site.',
      methodology: 'Atlas Civil Deduction Model',
      boundaryLabel: 'No Verified Geometry',
      isGeometryAuthoritative: false,
      confidence: 'Unavailable',
      provenance: 'Assessment used parcel geometry only — Mireye physical indicators available in Site Dossier',
      disclaimer: 'Developability assessment requires verified parcel geometry and Mireye physical indicators.',
      isAvailable: false,
    };
  }

  // 3. Process Mireye Point Indicators & Apply Disclosed Atlas Model Deductions
  const deductions: ConstraintDeduction[] = [];

  // A. FEMA Floodplain Deduction (35% deduction if inside floodplain polygon point check)
  const isFlood = val<boolean>(fields, 'within_floodplain_polygon') === true;
  if (isFlood) {
    const acres = Number((grossParcelAcres * 0.35).toFixed(1));
    deductions.push({
      code: 'FEMA_FLOOD_DEDUCTION',
      label: 'FEMA Flood Zone Exclusion',
      constraint: 'Floodplain Encroachment',
      source: 'Mireye /v1/fetch (FEMA NFHL)',
      trigger: 'within_floodplain_polygon = true',
      deductionAcres: acres,
      deductionPct: 35,
      rationale: 'Unbuildable 100-year floodplain area per FEMA NFHL panel paneling',
    });
  }

  // B. USFWS Wetland Buffer Deduction (25% deduction if wetland intersects point check)
  const isWetland = val<boolean>(fields, 'intersects_wetland') === true;
  if (isWetland) {
    const acres = Number((grossParcelAcres * 0.25).toFixed(1));
    deductions.push({
      code: 'USFWS_WETLAND_BUFFER',
      label: 'Wetland 100ft Setback Buffer',
      constraint: 'Wetland Setback Buffer',
      source: 'Mireye /v1/fetch (USFWS NWI)',
      trigger: 'intersects_wetland = true',
      deductionAcres: acres,
      deductionPct: 25,
      rationale: 'Mandatory federal 100-foot buffer setback along USFWS wetland boundary',
    });
  }

  // C. Steep Slope Exclusion (20% deduction if slope > 8.0°)
  const slope = val<number>(fields, 'slope_degrees');
  if (slope !== null && slope > 8.0) {
    const acres = Number((grossParcelAcres * 0.20).toFixed(1));
    deductions.push({
      code: 'STEEP_SLOPE_DEDUCTION',
      label: `Steep Terrain Exclusion (${slope.toFixed(1)}°)`,
      constraint: 'Steep LiDAR Ground Slope',
      source: 'Mireye /v1/fetch (USGS 3DEP LiDAR)',
      trigger: `slope_degrees = ${slope.toFixed(1)}° (>8.0°)`,
      deductionAcres: acres,
      deductionPct: 20,
      rationale: 'Prohibitive earthwork grading costs for slopes exceeding 8.0° threshold',
    });
  }

  // D. Conservation Easement / Protected Area (40% deduction)
  const isProtected = val<boolean>(fields, 'intersects_protected_area') === true || val<boolean>(fields, 'intersects_conservation_easement') === true;
  if (isProtected) {
    const acres = Number((grossParcelAcres * 0.40).toFixed(1));
    deductions.push({
      code: 'PROTECTED_AREA_EASEMENT',
      label: 'Protected Area / Easement',
      constraint: 'Protected Area Reservation',
      source: 'Mireye /v1/fetch (PAD-US)',
      trigger: 'intersects_protected_area = true',
      deductionAcres: acres,
      deductionPct: 40,
      rationale: 'Legally binding conservation easement or public land reservation',
    });
  }

  // 4. Calculate Net Developable Acres & Efficiency (Strict Clamping)
  const totalDeductionsAcres = Number(
    deductions.reduce((sum, d) => sum + d.deductionAcres, 0).toFixed(1)
  );

  const estimatedNetDevelopableAcres = Number(
    Math.min(grossParcelAcres, Math.max(0, grossParcelAcres - totalDeductionsAcres)).toFixed(1)
  );

  const estimatedSiteEfficiencyPct = Number(
    Math.min(100, Math.max(0, (estimatedNetDevelopableAcres / grossParcelAcres) * 100)).toFixed(1)
  );

  // 5. Determine Verdict & Disclosures
  let verdict: AgentActionVerdict = 'READY_FOR_SITE_CONTROL';
  let verdictLabel = 'READY FOR SITE CONTROL';
  let verdictReason = `Site meets project requirement of ${targetRequiredAcres} buildable acres with ${estimatedNetDevelopableAcres} acres available (${estimatedSiteEfficiencyPct}% estimated site efficiency).`;

  if (estimatedNetDevelopableAcres <= 0) {
    verdict = 'REJECT_CONSTRAINED';
    verdictLabel = 'REJECT — SEVERE CONSTRAINTS';
    verdictReason = 'Atlas deduction model indicates no remaining estimated developable area due to severe cumulative environmental and slope constraints.';
  } else if (isFlood && isProtected) {
    verdict = 'REJECT_CONSTRAINED';
    verdictLabel = 'UNFEASIBLE — SEVERE CONSTRAINTS';
    verdictReason = `Site severely constrained by combined flood and conservation easement boundaries. Net buildable area (${estimatedNetDevelopableAcres} acres) is insufficient.`;
  } else if (estimatedNetDevelopableAcres < targetRequiredAcres * 0.5) {
    verdict = 'REJECT_CONSTRAINED';
    verdictLabel = 'REJECT — INSUFFICIENT BUILDABLE AREA';
    verdictReason = `Estimated net developable area (${estimatedNetDevelopableAcres} acres) provides less than 50% of target requirement (${targetRequiredAcres} acres).`;
  } else if (estimatedNetDevelopableAcres < targetRequiredAcres) {
    verdict = 'NEEDS_PARCEL_ASSEMBLY';
    verdictLabel = 'NEEDS PARCEL ASSEMBLY';
    verdictReason = `Estimated net developable area (${estimatedNetDevelopableAcres} acres) falls short of ${targetRequiredAcres} acres. Requires acquiring an adjacent parcel to assemble target footprint.`;
  }

  const confidence: BuildableAreaReport['confidence'] = isGeometryAuthoritative ? 'High' : 'Pre-Feasibility Model Estimate';
  const provenance: BuildableAreaReport['provenance'] = isDataPresent
    ? (isFreshProximity ? 'Live Mireye API Indicators' : 'Cached Mireye API Indicators')
    : 'Assessment used parcel geometry only — Mireye physical indicators available in Site Dossier';

  const disclaimer = "Pre-feasibility estimate derived from parcel geometry and Mireye point indicators using Atlas's disclosed deduction model. Mireye does not currently return constraint geometries required for exact parcel-wide clipping.";

  return {
    grossParcelAcres,
    targetRequiredAcres,
    estimatedNetDevelopableAcres,
    estimatedSiteEfficiencyPct,
    netBuildableAcres: estimatedNetDevelopableAcres ?? 0,
    buildableEfficiencyPct: estimatedSiteEfficiencyPct ?? 0,
    totalDeductionsAcres,
    deductions,
    verdict,
    verdictLabel,
    verdictReason,
    methodology: 'Atlas Civil Deduction Model',
    boundaryLabel,
    isGeometryAuthoritative,
    confidence,
    provenance,
    disclaimer,
    isAvailable: true,
  };
}
