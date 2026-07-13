import type { MireyeFetchResponse, MireyeFieldValue } from '../types/mireye';
import type { FieldScore, LocationEntry, LocationResult, AlternativeSite } from '../types/atlas';
import type { UseCase } from '../types/atlas';

function val<T>(fields: Record<string, MireyeFieldValue>, key: string): T | null {
  const v = fields[key]?.value;
  return v !== undefined ? (v as T) : null;
}

function meta(fields: Record<string, MireyeFieldValue>, key: string) {
  return {
    source: fields[key]?.source ?? '',
    sourceUrl: fields[key]?.source_url ?? '',
    confidence: fields[key]?.confidence ?? 'low',
    unit: fields[key]?.unit ?? null,
  };
}

// ── Individual scoring functions ─────────────────────────────────────────────

function scoreFlood(inFloodplain: boolean | null): { score: number; interpretation: string } {
  if (inFloodplain === null)
    return { score: 45, interpretation: 'FEMA flood data unavailable — status undetermined, scored conservatively' };
  if (inFloodplain)
    return { score: 0, interpretation: 'Within a FEMA Special Flood Hazard Area — federal flood insurance required by lender' };
  return { score: 100, interpretation: 'Outside all FEMA Special Flood Hazard Areas' };
}

function scoreSlope(deg: number | null): { score: number; interpretation: string } {
  if (deg === null) return { score: 50, interpretation: 'Slope data unavailable' };
  const d = deg.toFixed(2);
  if (deg < 1) return { score: 100, interpretation: `Essentially flat terrain (${d}°) — optimal for construction` };
  if (deg < 3) return { score: 88, interpretation: `Very gentle slope (${d}°) — minimal grading required` };
  if (deg < 7) return { score: 70, interpretation: `Moderate slope (${d}°) — standard grading costs expected` };
  if (deg < 15) return { score: 42, interpretation: `Significant slope (${d}°) — substantial earthworks required` };
  return { score: 14, interpretation: `Steep terrain (${d}°) — major earthworks or likely unsuitable` };
}

function scoreTransmission(meters: number | null): { score: number; interpretation: string } {
  if (meters === null) return { score: 40, interpretation: 'Transmission line data unavailable' };
  const km = (meters / 1000).toFixed(1);
  if (meters < 300) return { score: 100, interpretation: `Nearest transmission line ${km} km — excellent grid proximity` };
  if (meters < 1000) return { score: 88, interpretation: `Nearest transmission line ${km} km — strong grid access` };
  if (meters < 3000) return { score: 70, interpretation: `Nearest transmission line ${km} km — feasible interconnect` };
  if (meters < 8000) return { score: 46, interpretation: `Nearest transmission line ${km} km — significant interconnect cost expected` };
  if (meters < 20000) return { score: 22, interpretation: `Nearest transmission line ${km} km — remote from grid infrastructure` };
  return { score: 8, interpretation: `Nearest transmission line ${km} km — major grid investment required` };
}

function scoreRoad(meters: number | null): { score: number; interpretation: string } {
  if (meters === null) return { score: 50, interpretation: 'Road access data unavailable' };
  const m = Math.round(meters);
  if (meters < 100) return { score: 100, interpretation: `Major road ${m} m away — direct arterial access` };
  if (meters < 500) return { score: 88, interpretation: `Major road ${m} m away — excellent road access` };
  if (meters < 1500) return { score: 72, interpretation: `Major road ${m} m away — good road access` };
  if (meters < 4000) return { score: 48, interpretation: `Major road ${m} m away — moderate road access` };
  return { score: 18, interpretation: `Major road ${m} m away — limited road access` };
}

function scoreRail(meters: number | null, required: boolean): { score: number; interpretation: string } {
  if (!required) return { score: 100, interpretation: 'Rail access not required for this project' };
  if (meters === null) return { score: 35, interpretation: 'Rail access data unavailable' };
  const km = (meters / 1000).toFixed(1);
  if (meters < 500) return { score: 100, interpretation: `Rail line ${km} km — adjacent rail access` };
  if (meters < 2000) return { score: 82, interpretation: `Rail line ${km} km — excellent rail proximity` };
  if (meters < 5000) return { score: 60, interpretation: `Rail line ${km} km — viable rail connection` };
  if (meters < 15000) return { score: 33, interpretation: `Rail line ${km} km — significant rail extension cost` };
  return { score: 10, interpretation: `Rail line ${km} km — remote from rail network` };
}

function scoreWetland(intersects: boolean | null): { score: number; interpretation: string } {
  if (intersects === null) return { score: 60, interpretation: 'Wetland data unavailable' };
  if (intersects) return { score: 10, interpretation: 'USFWS wetland intersection — Army Corps §404 permit likely required' };
  return { score: 100, interpretation: 'No USFWS wetland intersection — §404 permitting risk low' };
}

function scoreProtected(intersects: boolean | null): { score: number; interpretation: string } {
  if (intersects === null) return { score: 70, interpretation: 'Protected area data unavailable' };
  if (intersects) return { score: 0, interpretation: 'Intersects PAD-US protected area — development likely prohibited' };
  return { score: 100, interpretation: 'No PAD-US protected area overlap — land status clear' };
}

function scoreEasement(intersects: boolean | null): { score: number; interpretation: string } {
  if (intersects === null) return { score: 70, interpretation: 'Conservation easement data unavailable' };
  if (intersects) return { score: 15, interpretation: 'Conservation easement present — development rights likely encumbered' };
  return { score: 100, interpretation: 'No conservation easement recorded — title clear on this signal' };
}

function scoreMaxVoltage(
  kv: number | null,
  voltClass: string | null
): { score: number; interpretation: string } {
  if (kv === null) {
    if (voltClass) return { score: 55, interpretation: `Highest nearby voltage: ${voltClass} kV class (numeric not published)` };
    return { score: 28, interpretation: 'No transmission voltage data within 2 km' };
  }
  if (kv >= 500) return { score: 100, interpretation: `${kv} kV transmission within 2 km — suitable for 500+ MW loads` };
  if (kv >= 345) return { score: 90, interpretation: `${kv} kV transmission within 2 km — suitable for 300+ MW loads` };
  if (kv >= 230) return { score: 76, interpretation: `${kv} kV transmission within 2 km — suitable for 100–300 MW loads` };
  if (kv >= 115) return { score: 55, interpretation: `${kv} kV transmission within 2 km — limited to smaller loads` };
  return { score: 28, interpretation: `${kv} kV sub-transmission — insufficient for large power demands` };
}

function scoreAspect(
  deg: number | null,
  cardinal: string | null
): { score: number; interpretation: string } {
  if (deg === null) return { score: 50, interpretation: 'Slope aspect data unavailable' };
  const diff = Math.abs(deg - 180);
  const dir = cardinal ?? `${deg.toFixed(0)}°`;
  if (diff <= 22.5) return { score: 100, interpretation: `South-facing slope (${dir}) — optimal solar irradiance year-round` };
  if (diff <= 45) return { score: 84, interpretation: `Near-south aspect (${dir}) — excellent solar potential` };
  if (diff <= 90) return { score: 60, interpretation: `SE/SW aspect (${dir}) — good solar potential` };
  if (diff <= 135) return { score: 32, interpretation: `E/W-facing slope (${dir}) — moderate solar potential` };
  return { score: 10, interpretation: `North-facing slope (${dir}) — poor solar candidate` };
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
): { fieldScores: FieldScore[]; totalScore: number; riskLevel: 'low' | 'medium' | 'high' | 'critical'; alternatives: AlternativeSite[] } {
  const f = data.fields;
  const failures = new Set(data.partial_failures.map((p) => p.field));
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
    fieldScores.push({
      fieldName,
      displayName,
      score: scored.score,
      rawValue,
      unit: m.unit,
      interpretation: failed
        ? `Data unavailable from ${m.source || 'source'} — ${scored.interpretation}`
        : scored.interpretation,
      source: m.source,
      sourceUrl: m.sourceUrl,
      confidence: failed ? 'low' : m.confidence,
      weight,
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
      add('nearest_gas_pipeline_distance_m', 'Gas Access', scoreGas(val<number>(f, 'nearest_gas_pipeline_distance_m')), weights['nearest_gas_pipeline_distance_m'] ?? 0);
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

  return { fieldScores, totalScore, riskLevel, alternatives };
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
  const { fieldScores, totalScore, riskLevel, alternatives } = scoreLocation(useCase, data, requirements);
  return { location, data, totalScore, fieldScores, riskLevel, error: null, alternatives };
}
