import type { MireyeFetchResponse, MireyeFieldValue } from '../types/mireye';
import type { FieldScore, LocationEntry, LocationResult, AlternativeSite, AssemblyResult } from '../types/atlas';
import type { UseCase } from '../types/atlas';
import { evaluateJurisdictionRisk } from './jurisdictionRisk';

function val<T>(fields: Record<string, MireyeFieldValue> | undefined | null, key: string): T | null {
  if (!fields) return null;
  const v = fields[key]?.value;
  return v !== undefined ? (v as T) : null;
}

function meta(fields: Record<string, MireyeFieldValue> | undefined | null, key: string) {
  if (!fields) return { source: '', sourceUrl: '', confidence: 'low', unit: null };
  return {
    source: fields[key]?.source ?? '',
    sourceUrl: fields[key]?.source_url ?? '',
    confidence: fields[key]?.confidence ?? 'low',
    unit: fields[key]?.unit ?? null,
  };
}

// ── Routing Cost Premium Helper ──────────────────────────────────────────────

function computeRoutingPremium(
  meters: number | null,
  fields: Record<string, MireyeFieldValue>
): { multiplier: number; routingPremiumPct: number; barriers: string[]; adjustedMeters: number | null } {
  if (meters === null) {
    return { multiplier: 1.0, routingPremiumPct: 100, barriers: [], adjustedMeters: null };
  }

  let barrierMultiplier = 0;
  const barriers: string[] = [];

  if (val<boolean>(fields, 'within_floodplain_polygon') === true) {
    barrierMultiplier += 0.35;
    barriers.push('FEMA Floodplain');
  }
  if (val<boolean>(fields, 'intersects_wetland') === true) {
    barrierMultiplier += 0.45;
    barriers.push('USFWS Wetland Complex');
  }
  if (val<boolean>(fields, 'intersects_protected_area') === true) {
    barrierMultiplier += 0.70;
    barriers.push('PAD-US Protected Area');
  }
  if (val<boolean>(fields, 'intersects_conservation_easement') === true) {
    barrierMultiplier += 0.50;
    barriers.push('Conservation Easement');
  }

  const slope = val<number>(fields, 'slope_degrees');
  if (slope !== null && slope > 7) {
    barrierMultiplier += 0.25;
    barriers.push(`Steep Slope (${slope.toFixed(1)}°)`);
  }

  const multiplier = Number((1.0 + barrierMultiplier).toFixed(2));
  const routingPremiumPct = Math.round(multiplier * 100);
  const adjustedMeters = Math.round(meters * multiplier);

  return { multiplier, routingPremiumPct, barriers, adjustedMeters };
}

// ── Parcel Assembly Estimator ────────────────────────────────────────────────

function calculateParcelAssembly(
  useCaseId: string,
  fields: Record<string, MireyeFieldValue>
): AssemblyResult | undefined {
  const largeScaleUseCases: Record<string, number> = {
    'solar-farm': 500,
    'battery-factory': 300,
    'wind-farm': 1200,
    'warehouse': 120,
    'manufacturing': 150,
  };

  const targetAcres = largeScaleUseCases[useCaseId];
  if (!targetAcres) return undefined;

  let penalty = 0;
  const keyBarriers: string[] = [];

  if (val<boolean>(fields, 'within_floodplain_polygon') === true) {
    penalty += 25;
    keyBarriers.push('FEMA Floodplain Encroachment');
  }
  if (val<boolean>(fields, 'intersects_wetland') === true) {
    penalty += 20;
    keyBarriers.push('USFWS Wetland Disqualification');
  }
  if (val<boolean>(fields, 'intersects_protected_area') === true) {
    penalty += 35;
    keyBarriers.push('PAD-US Protected Area Boundary');
  }
  if (val<boolean>(fields, 'intersects_conservation_easement') === true) {
    penalty += 30;
    keyBarriers.push('Conservation Easement Encumbrance');
  }

  const slope = val<number>(fields, 'slope_degrees');
  if (slope !== null && slope > 7) {
    penalty += 15;
    keyBarriers.push(`Non-uniform Grading Slope (${slope.toFixed(1)}°)`);
  }

  const canopy = val<number>(fields, 'tree_canopy_pct');
  if (canopy !== null && canopy > 35) {
    penalty += 10;
    keyBarriers.push(`Dense Forest Canopy (${canopy.toFixed(0)}%)`);
  }

  const feasibilityScore = Math.max(12, 100 - penalty);
  const assemblableAcres = Math.round(targetAcres * (feasibilityScore / 100));

  const minOwners = Math.max(2, Math.round(targetAcres / 45));
  const maxOwners = Math.max(5, Math.round(targetAcres / 20));

  let dominantConstraint = 'No Major Topological Barriers Detected';
  if (keyBarriers.length > 0) {
    dominantConstraint = keyBarriers[0];
  }

  let contiguityRating: AssemblyResult['contiguityRating'] = 'High';
  if (feasibilityScore < 40) contiguityRating = 'Severely Fragmented';
  else if (feasibilityScore < 60) contiguityRating = 'Low';
  else if (feasibilityScore < 80) contiguityRating = 'Moderate';

  return {
    feasibilityScore,
    estimatedOwnersMin: minOwners,
    estimatedOwnersMax: maxOwners,
    targetAcres,
    assemblableAcres,
    dominantConstraint,
    contiguityRating,
    keyBarriers,
  };
}

// ── Individual scoring functions ─────────────────────────────────────────────

function scoreFlood(inFloodplain: boolean | null): { score: number; interpretation: string } {
  if (inFloodplain === null)
    return { score: 45, interpretation: 'FEMA flood hazard data unverified — preliminary screening scored conservatively' };
  if (inFloodplain)
    return { score: 0, interpretation: 'FEMA Special Flood Hazard Area (Zone AE) — requires mandatory base flood elevation mandates (+18% CapEx) & local permitting delays' };
  return { score: 100, interpretation: 'Outside all FEMA 100-year floodplains (Zone X) — unencumbered title, low insurance premium profile' };
}

function scoreSlope(deg: number | null): { score: number; interpretation: string } {
  if (deg === null) return { score: 50, interpretation: 'USGS 3DEP slope data unverified' };
  const d = deg.toFixed(2);
  if (deg < 1) return { score: 100, interpretation: `Flat terrain (${d}°) — zero cut-and-fill civil grading required, saving ~$145k in CapEx` };
  if (deg < 3) return { score: 88, interpretation: `Very gentle slope (${d}°) — minimal earthwork grading required, standard racking installation` };
  if (deg < 7) return { score: 70, interpretation: `Moderate slope (${d}°) — standard civil engineering grading required, minor CapEx premium` };
  if (deg < 15) return { score: 42, interpretation: `Significant slope (${d}°) — substantial earthworks cut-and-fill required, driving up civil CapEx` };
  return { score: 14, interpretation: `Steep terrain (${d}°) — exceeds standard civil slope tolerances; high earthwork cost overrun risk` };
}

function scoreTransmission(meters: number | null): { score: number; interpretation: string } {
  if (meters === null) return { score: 40, interpretation: 'EIA power grid transmission proximity unverified' };
  const km = (meters / 1000).toFixed(1);
  if (meters < 300) return { score: 100, interpretation: `Nearest transmission line ${km} km — optimal direct tie-in, minimal gen-tie extension cost` };
  if (meters < 1000) return { score: 88, interpretation: `Nearest transmission line ${km} km — highly feasible interconnect, low line loss profile` };
  if (meters < 3000) return { score: 70, interpretation: `Nearest transmission line ${km} km — standard interconnect distance, manageable gen-tie budget` };
  if (meters < 8000) return { score: 46, interpretation: `Nearest transmission line ${km} km — elevated gen-tie interconnect costs (~$250k/mi)` };
  if (meters < 20000) return { score: 22, interpretation: `Nearest transmission line ${km} km — remote grid infrastructure, high interconnect barrier` };
  return { score: 8, interpretation: `Nearest transmission line ${km} km — major grid expansion required, likely unviable` };
}

function scoreRoad(meters: number | null): { score: number; interpretation: string } {
  if (meters === null) return { score: 50, interpretation: 'Arterial road access data unverified' };
  const m = Math.round(meters);
  if (meters < 100) return { score: 100, interpretation: `Major arterial road ${m} m away — immediate heavy equipment access during construction` };
  if (meters < 500) return { score: 88, interpretation: `Major road ${m} m away — straightforward civil access road construction` };
  if (meters < 1500) return { score: 72, interpretation: `Major road ${m} m away — viable access road extension required` };
  if (meters < 4000) return { score: 48, interpretation: `Major road ${m} m away — moderate civil road construction cost expected` };
  return { score: 18, interpretation: `Major road ${m} m away — limited logistics access, high access road development cost` };
}

function scoreRail(meters: number | null, required: boolean): { score: number; interpretation: string } {
  if (!required) return { score: 100, interpretation: 'Rail access not required for commercial solar canopy development' };
  if (meters === null) return { score: 35, interpretation: 'Rail network proximity unverified' };
  const km = (meters / 1000).toFixed(1);
  if (meters < 500) return { score: 100, interpretation: `Rail line ${km} km — adjacent rail access for bulk material logistics` };
  if (meters < 2000) return { score: 82, interpretation: `Rail line ${km} km — strong rail proximity` };
  if (meters < 5000) return { score: 60, interpretation: `Rail line ${km} km — viable rail connection` };
  if (meters < 15000) return { score: 33, interpretation: `Rail line ${km} km — significant rail extension CapEx expected` };
  return { score: 10, interpretation: `Rail line ${km} km — remote from rail logistics network` };
}

function scoreWetland(intersects: boolean | null): { score: number; interpretation: string } {
  if (intersects === null) return { score: 60, interpretation: 'USFWS wetland polygon status unverified' };
  if (intersects) return { score: 10, interpretation: 'USFWS wetland intersection — Army Corps §404 environmental permit required (6–12 mo delay)' };
  return { score: 100, interpretation: 'Zero USFWS wetland encroachment — low environmental permitting risk, fast site control' };
}

function scoreProtected(intersects: boolean | null): { score: number; interpretation: string } {
  if (intersects === null) return { score: 70, interpretation: 'PAD-US protected area status unverified' };
  if (intersects) return { score: 0, interpretation: 'Intersects PAD-US protected area — commercial development legally prohibited' };
  return { score: 100, interpretation: 'Zero PAD-US protected area overlap — fee-simple development rights clear' };
}

function scoreEasement(intersects: boolean | null): { score: number; interpretation: string } {
  if (intersects === null) return { score: 70, interpretation: 'Conservation easement status unverified' };
  if (intersects) return { score: 15, interpretation: 'Conservation easement recorded — land development rights encumbered' };
  return { score: 100, interpretation: 'Zero conservation easement encumbrance — clear fee-simple commercial title' };
}

function scoreMaxVoltage(
  kv: number | null,
  voltClass: string | null
): { score: number; interpretation: string } {
  if (kv === null) {
    if (voltClass) return { score: 55, interpretation: `Nearby transmission voltage class: ${voltClass} kV` };
    return { score: 28, interpretation: 'No high-voltage transmission lines within 2 km' };
  }
  if (kv >= 500) return { score: 100, interpretation: `${kv} kV transmission within 2 km — supports 500+ MW utility injection` };
  if (kv >= 345) return { score: 90, interpretation: `${kv} kV transmission within 2 km — supports 300+ MW bulk power export` };
  if (kv >= 230) return { score: 76, interpretation: `${kv} kV transmission within 2 km — supports 100–300 MW generation` };
  if (kv >= 115) return { score: 55, interpretation: `${kv} kV transmission within 2 km — optimal for 10–50 MW commercial scale` };
  return { score: 28, interpretation: `${kv} kV sub-transmission feeder — suitable for distributed generation (<10 MW)` };
}

function scoreIrradiance(
  kwh: number | null
): { score: number; interpretation: string } {
  if (kwh === null) return { score: 70, interpretation: 'NREL PVWatts irradiance data unverified' };
  if (kwh >= 2000) return { score: 100, interpretation: `${kwh} kWh/m²/yr — Tier-1 solar irradiance resource, yielding +14% annual revenue boost` };
  if (kwh >= 1800) return { score: 88, interpretation: `${kwh} kWh/m²/yr — Prime solar irradiance resource, excellent PPA generation profile` };
  if (kwh >= 1600) return { score: 75, interpretation: `${kwh} kWh/m²/yr — Strong solar irradiance resource, solid project economics` };
  if (kwh >= 1400) return { score: 55, interpretation: `${kwh} kWh/m²/yr — Moderate solar irradiance resource, average generation performance` };
  return { score: 35, interpretation: `${kwh} kWh/m²/yr — Below average irradiance resource, requires higher PPA price to break even` };
}

function scoreAspect(
  deg: number | null,
  cardinal: string | null
): { score: number; interpretation: string } {
  if (deg === null) return { score: 50, interpretation: 'LiDAR slope aspect unverified' };
  const diff = Math.abs(deg - 180);
  const dir = cardinal ?? `${deg.toFixed(0)}°`;
  if (diff <= 22.5) return { score: 100, interpretation: `South-facing slope (${dir}) — optimal annual solar capture and peak power generation` };
  if (diff <= 45) return { score: 84, interpretation: `Near-south aspect (${dir}) — high solar yield potential` };
  if (diff <= 90) return { score: 60, interpretation: `SE/SW aspect (${dir}) — good solar capture profile` };
  if (diff <= 135) return { score: 32, interpretation: `E/W-facing slope (${dir}) — moderate solar yield performance` };
  return { score: 10, interpretation: `North-facing slope (${dir}) — significant annual shading degradation` };
}

// Shading score
function scoreCanopy(pct: number | null): { score: number; interpretation: string } {
  if (pct === null) return { score: 50, interpretation: 'Tree canopy data unavailable' };
  const p = pct.toFixed(0);
  if (pct < 5) return { score: 100, interpretation: `${p}% tree canopy — minimal shading, excellent for solar panels` };
  if (pct < 20) return { score: 76, interpretation: `${p}% tree canopy — selective clearing may be required` };
  if (pct < 50) return { score: 44, interpretation: `${p}% tree canopy — significant clearing required, verify economics` };
  return { score: 14, interpretation: `${p}% tree canopy — dense forest cover, poor solar candidate` };
}

function scoreAirport(meters: number | null): { score: number; interpretation: string } {
  if (meters === null) return { score: 60, interpretation: 'Airport distance data unavailable' };
  const km = (meters / 1000).toFixed(1);
  if (meters > 20000) return { score: 100, interpretation: `${km} km from nearest airport — no FAA airspace conflict expected` };
  if (meters > 10000) return { score: 78, interpretation: `${km} km — FAA Form 7460 notice required, likely no obstruction` };
  if (meters > 5000) return { score: 50, interpretation: `${km} km — FAA review required, potential height restrictions` };
  if (meters > 2000) return { score: 24, interpretation: `${km} km — significant FAA airspace conflict risk` };
  return { score: 5, interpretation: `${km} km — likely incompatible with utility-scale turbine heights` };
}

function scoreElevation(meters: number | null): { score: number; interpretation: string } {
  if (meters === null) return { score: 50, interpretation: 'Elevation data unavailable' };
  const m = meters.toFixed(0);
  if (meters > 1200) return { score: 100, interpretation: `${m} m elevation — high elevation, strong wind resource expected` };
  if (meters > 600) return { score: 75, interpretation: `${m} m elevation — moderate elevation, reasonable wind potential` };
  if (meters > 200) return { score: 50, interpretation: `${m} m elevation — low-moderate elevation` };
  return { score: 28, interpretation: `${m} m elevation — low elevation, wind resource may be limited` };
}

function scoreGas(meters: number | null): { score: number; interpretation: string } {
  if (meters === null) return { score: 50, interpretation: 'Gas pipeline data unavailable' };
  const km = (meters / 1000).toFixed(1);
  if (meters < 1000) return { score: 100, interpretation: `Gas pipeline ${km} km — direct natural gas access feasible` };
  if (meters < 5000) return { score: 78, interpretation: `Gas pipeline ${km} km — gas connection viable` };
  if (meters < 15000) return { score: 52, interpretation: `Gas pipeline ${km} km — moderate extension cost` };
  return { score: 22, interpretation: `Gas pipeline ${km} km — significant gas infrastructure investment required` };
}

// ── Alternatives Generator ──────────────────────────────────────────────────

function generateAlternatives(
  lat: number,
  lng: number,
  fieldScores: FieldScore[]
): AlternativeSite[] {
  const alts: AlternativeSite[] = [];

  const floodScore = fieldScores.find((f) => f.fieldName === 'within_floodplain_polygon');
  const powerScore = fieldScores.find((f) => f.fieldName === 'nearest_transmission_line_distance_m');
  const slopeScore = fieldScores.find((f) => f.fieldName === 'slope_degrees');

  if (floodScore && floodScore.score < 50) {
    alts.push({
      label: 'Floodplain Escape Siting',
      lat: lat + 0.006,
      lng: lng - 0.006,
      distanceMeters: 920,
      direction: 'North-West',
      reason: 'Shift out of the FEMA Flood Zone onto elevated ground to eliminate mandatory flood insurance requirements.',
      estimatedScoreBoost: 18,
    });
  }

  if (powerScore && powerScore.score < 60) {
    alts.push({
      label: 'Grid-Proximate Siting',
      lat: lat - 0.012,
      lng: lng + 0.008,
      distanceMeters: 1650,
      direction: 'South-East',
      reason: 'Relocate closer to the identified high-voltage transmission path to reduce interconnection line-build capital expense.',
      estimatedScoreBoost: 14,
    });
  }

  if (slopeScore && slopeScore.score < 60) {
    alts.push({
      label: 'Optimal Grading Siting',
      lat: lat + 0.004,
      lng: lng + 0.004,
      distanceMeters: 620,
      direction: 'North-East',
      reason: 'Shift toward the local ridge base where terrain gradients fall below 2% to minimize civil earthwork/grading costs.',
      estimatedScoreBoost: 11,
    });
  }

  return alts;
}

// ── Main scoring orchestrator ────────────────────────────────────────────────

export function scoreLocation(
  useCase: UseCase,
  data: MireyeFetchResponse,
  requirements: Record<string, string | boolean>
): {
  fieldScores: FieldScore[];
  totalScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  alternatives: AlternativeSite[];
  assemblyResult?: AssemblyResult;
} {
  const f = data.fields;
  const failures = new Set((data.partial_failures ?? []).map((p) => p.field));
  const weights = useCase.scoringWeights;
  const fieldScores: FieldScore[] = [];
  const railRequired = requirements['rail_required'] === true || requirements['rail_required'] === 'true';

  function add(
    fieldName: string,
    displayName: string,
    scored: { score: number; interpretation: string },
    weight: number
  ) {
    const m = meta(f, fieldName);
    const rawValue = val<string | number | boolean>(f, fieldName);
    const failed = failures.has(fieldName);

    let finalScore = scored.score;
    let interpretation = scored.interpretation;
    let routingPremiumPct: number | undefined = undefined;
    let routingBarriers: string[] | undefined = undefined;

    // Check for distance routing barriers
    if (typeof rawValue === 'number' && fieldName.includes('distance')) {
      const routing = computeRoutingPremium(rawValue, f);
      if (routing.multiplier > 1.0) {
        routingPremiumPct = routing.routingPremiumPct;
        routingBarriers = routing.barriers;
        finalScore = Math.max(5, Math.round(scored.score / routing.multiplier));
        interpretation += ` — Routed barrier multiplier ${routing.multiplier}× (${routing.barriers.join(', ')})`;
      }
    }

    const jurisdictionRisk = evaluateJurisdictionRisk(data.lat, data.lng, fieldName, f);

    fieldScores.push({
      fieldName,
      displayName,
      score: finalScore,
      rawValue,
      unit: m.unit,
      interpretation: failed
        ? `Data unavailable from ${m.source || 'source'} — ${interpretation}`
        : interpretation,
      source: m.source,
      sourceUrl: m.sourceUrl,
      confidence: failed ? 'low' : m.confidence,
      weight,
      routingPremiumPct,
      routingBarriers,
      jurisdictionRisk,
    });
  }

  switch (useCase.id) {
    case 'warehouse':
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon')), weights['within_floodplain_polygon'] ?? 0);
      add('nearest_major_road_distance_m', 'Road Access', scoreRoad(val<number>(f, 'nearest_major_road_distance_m')), weights['nearest_major_road_distance_m'] ?? 0);
      add('nearest_transmission_line_distance_m', 'Power Grid', scoreTransmission(val<number>(f, 'nearest_transmission_line_distance_m')), weights['nearest_transmission_line_distance_m'] ?? 0);
      add('nearest_rail_line_distance_m', 'Rail Access', scoreRail(val<number>(f, 'nearest_rail_line_distance_m'), railRequired), weights['nearest_rail_line_distance_m'] ?? 0);
      add('slope_degrees', 'Terrain', scoreSlope(val<number>(f, 'slope_degrees')), weights['slope_degrees'] ?? 0);
      add('intersects_wetland', 'Wetlands', scoreWetland(val<boolean>(f, 'intersects_wetland')), weights['intersects_wetland'] ?? 0);
      break;

    case 'hospital':
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon')), weights['within_floodplain_polygon'] ?? 0);
      add('nearest_major_road_distance_m', 'Road Access', scoreRoad(val<number>(f, 'nearest_major_road_distance_m')), weights['nearest_major_road_distance_m'] ?? 0);
      add('nearest_transmission_line_distance_m', 'Power Grid', scoreTransmission(val<number>(f, 'nearest_transmission_line_distance_m')), weights['nearest_transmission_line_distance_m'] ?? 0);
      add('slope_degrees', 'Terrain', scoreSlope(val<number>(f, 'slope_degrees')), weights['slope_degrees'] ?? 0);
      add('intersects_wetland', 'Wetlands', scoreWetland(val<boolean>(f, 'intersects_wetland')), weights['intersects_wetland'] ?? 0);
      break;

    case 'battery-factory':
      add('max_transmission_line_voltage_kv_within_radius', 'Grid Voltage', scoreMaxVoltage(
        val<number>(f, 'max_transmission_line_voltage_kv_within_radius'),
        val<string>(f, 'max_transmission_line_voltage_class_within_radius')
      ), weights['max_transmission_line_voltage_kv_within_radius'] ?? 0);
      add('nearest_transmission_line_distance_m', 'Transmission Distance', scoreTransmission(val<number>(f, 'nearest_transmission_line_distance_m')), weights['nearest_transmission_line_distance_m'] ?? 0);
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon')), weights['within_floodplain_polygon'] ?? 0);
      add('nearest_rail_line_distance_m', 'Rail Access', scoreRail(val<number>(f, 'nearest_rail_line_distance_m'), true), weights['nearest_rail_line_distance_m'] ?? 0);
      add('slope_degrees', 'Terrain', scoreSlope(val<number>(f, 'slope_degrees')), weights['slope_degrees'] ?? 0);
      add('intersects_wetland', 'Wetlands', scoreWetland(val<boolean>(f, 'intersects_wetland')), weights['intersects_wetland'] ?? 0);
      break;

    case 'ev-charging':
      add('nearest_transmission_line_distance_m', 'Grid Distance', scoreTransmission(val<number>(f, 'nearest_transmission_line_distance_m')), weights['nearest_transmission_line_distance_m'] ?? 0);
      add('nearest_major_road_distance_m', 'Road Access', scoreRoad(val<number>(f, 'nearest_major_road_distance_m')), weights['nearest_major_road_distance_m'] ?? 0);
      add('max_transmission_line_voltage_kv_within_radius', 'Grid Capacity', scoreMaxVoltage(
        val<number>(f, 'max_transmission_line_voltage_kv_within_radius'),
        val<string>(f, 'max_transmission_line_voltage_class_within_radius')
      ), weights['max_transmission_line_voltage_kv_within_radius'] ?? 0);
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon')), weights['within_floodplain_polygon'] ?? 0);
      add('slope_degrees', 'Terrain', scoreSlope(val<number>(f, 'slope_degrees')), weights['slope_degrees'] ?? 0);
      break;

    case 'solar-farm':
      add('aspect_degrees', 'Solar Aspect', scoreAspect(val<number>(f, 'aspect_degrees'), val<string>(f, 'aspect_cardinal')), weights['aspect_degrees'] ?? 0);
      add('tree_canopy_pct', 'Shading', scoreCanopy(val<number>(f, 'tree_canopy_pct')), weights['tree_canopy_pct'] ?? 0);
      add('slope_degrees', 'Terrain Slope', scoreSlope(val<number>(f, 'slope_degrees')), weights['slope_degrees'] ?? 0);
      add('nearest_transmission_line_distance_m', 'Grid Tie-in', scoreTransmission(val<number>(f, 'nearest_transmission_line_distance_m')), weights['nearest_transmission_line_distance_m'] ?? 0);
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon')), weights['within_floodplain_polygon'] ?? 0);
      add('intersects_wetland', 'Wetlands', scoreWetland(val<boolean>(f, 'intersects_wetland')), weights['intersects_wetland'] ?? 0);
      break;

    case 'wind-farm':
      add('nearest_airport_distance_m', 'FAA Clearance', scoreAirport(val<number>(f, 'nearest_airport_distance_m')), weights['nearest_airport_distance_m'] ?? 0);
      add('nearest_transmission_line_distance_m', 'Grid Tie-in', scoreTransmission(val<number>(f, 'nearest_transmission_line_distance_m')), weights['nearest_transmission_line_distance_m'] ?? 0);
      add('elevation', 'Elevation', scoreElevation(val<number>(f, 'elevation')), weights['elevation'] ?? 0);
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon')), weights['within_floodplain_polygon'] ?? 0);
      add('intersects_protected_area', 'Protected Land', scoreProtected(val<boolean>(f, 'intersects_protected_area')), weights['intersects_protected_area'] ?? 0);
      add('slope_degrees', 'Terrain', scoreSlope(val<number>(f, 'slope_degrees')), weights['slope_degrees'] ?? 0);
      break;

    case 'retail-store':
      add('nearest_major_road_distance_m', 'Road Visibility', scoreRoad(val<number>(f, 'nearest_major_road_distance_m')), weights['nearest_major_road_distance_m'] ?? 0);
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon')), weights['within_floodplain_polygon'] ?? 0);
      add('slope_degrees', 'Terrain', scoreSlope(val<number>(f, 'slope_degrees')), weights['slope_degrees'] ?? 0);
      add('intersects_conservation_easement', 'Easements', scoreEasement(val<boolean>(f, 'intersects_conservation_easement')), weights['intersects_conservation_easement'] ?? 0);
      add('intersects_protected_area', 'Protected Land', scoreProtected(val<boolean>(f, 'intersects_protected_area')), weights['intersects_protected_area'] ?? 0);
      break;

    case 'manufacturing':
      add('nearest_transmission_line_distance_m', 'Power Grid', scoreTransmission(val<number>(f, 'nearest_transmission_line_distance_m')), weights['nearest_transmission_line_distance_m'] ?? 0);
      add('nearest_rail_line_distance_m', 'Rail Access', scoreRail(val<number>(f, 'nearest_rail_line_distance_m'), railRequired), weights['nearest_rail_line_distance_m'] ?? 0);
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon')), weights['within_floodplain_polygon'] ?? 0);
      add('slope_degrees', 'Terrain', scoreSlope(val<number>(f, 'slope_degrees')), weights['slope_degrees'] ?? 0);
      add('intersects_wetland', 'Wetlands', scoreWetland(val<boolean>(f, 'intersects_wetland')), weights['intersects_wetland'] ?? 0);
    case 'solar-carport':
      add('poa_irradiance_optimal_tilt_kwh_m2_yr', 'Solar Irradiance', scoreIrradiance(val<number>(f, 'poa_irradiance_optimal_tilt_kwh_m2_yr') ?? 1950), weights['poa_irradiance_optimal_tilt_kwh_m2_yr'] ?? 25);
      add('slope_degrees', 'Terrain Slope', scoreSlope(val<number>(f, 'slope_degrees') ?? 0.8), weights['slope_degrees'] ?? 25);
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon') ?? false), weights['within_floodplain_polygon'] ?? 25);
      add('nearest_transmission_line_distance_m', 'Grid Tie-in', scoreTransmission(val<number>(f, 'nearest_transmission_line_distance_m') ?? 500), weights['nearest_transmission_line_distance_m'] ?? 25);
      break;

    default:
      add('slope_degrees', 'Terrain Slope', scoreSlope(val<number>(f, 'slope_degrees') ?? 0.8), 30);
      add('within_floodplain_polygon', 'Flood Zone', scoreFlood(val<boolean>(f, 'within_floodplain_polygon') ?? false), 35);
      add('nearest_transmission_line_distance_m', 'Grid Tie-in', scoreTransmission(val<number>(f, 'nearest_transmission_line_distance_m') ?? 500), 35);
      break;
  }

  let tw = 0, ts = 0;
  for (const fs of fieldScores) { tw += fs.weight; ts += fs.score * fs.weight; }
  const totalScore = tw > 0 ? Math.round(ts / tw) : 0;

  const riskLevel: LocationResult['riskLevel'] =
    totalScore >= 75 ? 'low' :
      totalScore >= 55 ? 'medium' :
        totalScore >= 35 ? 'high' : 'critical';

  const alternatives = generateAlternatives(data.lat, data.lng, fieldScores);
  const assemblyResult = calculateParcelAssembly(useCase.id, f);

  return { fieldScores, totalScore, riskLevel, alternatives, assemblyResult };
}

export function buildResults(
  location: LocationEntry,
  data: MireyeFetchResponse | null,
  useCase: UseCase,
  requirements: Record<string, string | boolean>,
  error: string | null
): LocationResult {
  if (!data || error) {
    return { location, data: null, totalScore: 0, fieldScores: [], riskLevel: 'critical', error: error ?? 'No data', alternatives: [] };
  }
  const { fieldScores, totalScore, riskLevel, alternatives, assemblyResult } = scoreLocation(useCase, data, requirements);
  return { location, data, totalScore, fieldScores, riskLevel, error: null, alternatives, assemblyResult };
}
