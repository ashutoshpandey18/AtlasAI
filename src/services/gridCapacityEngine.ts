// Evaluates transmission proximity, corridor barriers, voltage headroom, and RTO queue risk.

import type { MireyeFetchResponse, MireyeFieldValue } from '../types/mireye';
import { getRtoRegion } from './jurisdictionRisk';

// FERC 2023 average: $/mile for 345 kV single-circuit overhead construction

/** $/mile baseline for 345 kV single-circuit overhead construction (FERC 2023 avg) */
const BASE_COST_PER_MILE_USD = 1_850_000;

/** Miles per meter conversion */
const METERS_TO_MILES = 0.000621371;

// Barrier cost multipliers — applied to the spur corridor between site and nearest line

const BARRIER_MULTIPLIERS: Record<string, number> = {
  within_floodplain_polygon: 1.40,
  intersects_wetland: 1.55,
  intersects_protected_area: 1.90,
  intersects_conservation_easement: 1.35,
};

const SLOPE_PENALTY_PER_DEGREE_ABOVE_THRESHOLD = 0.04;
const SLOPE_THRESHOLD_DEGREES = 5;

// MW ceiling heuristics by voltage class

const VOLTAGE_CAPACITY_CEILING_MW: Array<[kv: number, maxMw: number]> = [
  [500, 2000],
  [345, 1200],
  [230, 500],
  [138, 200],
  [115, 150],
  [69, 75],
];

// Estimated queue wait in months per ISO/RTO region (source: LBNL Queued Up 2024)

const RTO_QUEUE_DEPTH_MONTHS: Record<string, number> = {
  MISO: 54,
  PJM: 48,
  ERCOT: 30,
  WECC: 42,
  SPP: 36,
  NYISO: 60,
  'ISO-NE': 66,
  SERC: 38,
};

// Types

export interface BarrierDetail {
  field: string;
  label: string;
  multiplier: number;
  rationale: string;
}

export interface VoltageCapacityCheck {
  nearestVoltageKv: number | null;
  voltageClass: string | null;
  capacityLimitMw: number | null;
  capacityConstrained: boolean;
  upgradeVoltageKv: number | null;
  note: string;
}

export interface InterconnectionQueueRisk {
  rtoRegion: string;
  estimatedQueueMonths: number;
  queueRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  note: string;
}

export interface GridCapacityResult {
  rawDistanceMeters: number | null;
  adjustedDistanceMeters: number | null;
  rawDistanceMiles: number | null;
  adjustedDistanceMiles: number | null;
  compositeBarrierMultiplier: number;
  barriers: BarrierDetail[];
  estimatedCapexLowUsd: number | null;
  estimatedCapexHighUsd: number | null;
  capexRangeLabel: string;
  voltageCapacity: VoltageCapacityCheck;
  queueRisk: InterconnectionQueueRisk;
  engineConfidence: 'high' | 'medium' | 'low';
  summary: string;
}

export interface SiteGridRanking {
  lat: number;
  lng: number;
  gridFeasibilityScore: number;
  capexRangeLabel: string;
  estimatedCapexLowUsd: number | null;
  queueRisk: InterconnectionQueueRisk['queueRisk'];
  capacityConstrained: boolean;
  barriers: string[];
}

// Utilities

function val<T>(fields: Record<string, MireyeFieldValue>, key: string): T | null {
  const v = fields[key]?.value;
  return v !== undefined ? (v as T) : null;
}

function formatUsd(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function getQueueRisk(months: number): InterconnectionQueueRisk['queueRisk'] {
  if (months <= 30) return 'Low';
  if (months <= 45) return 'Moderate';
  if (months <= 60) return 'High';
  return 'Severe';
}

/**
 * Analyze grid interconnection capacity and cost for a given site.
 *
 * @param data       Full Mireye /v1/fetch response for the site coordinate
 * @param projectMw  Power demand or generation capacity of the project (MW)
 */
export function analyzeGridCapacity(
  data: MireyeFetchResponse,
  projectMw: number,
): GridCapacityResult {
  const f = data.fields;
  const { lat, lng } = data;

  // 1. Extract raw Mireye distance + voltage primitives
  const rawDistanceMeters = val<number>(f, 'nearest_transmission_line_distance_m');
  const nearestVoltageKv = val<number>(f, 'max_transmission_line_voltage_kv_within_radius');
  const voltageClass = val<string>(f, 'max_transmission_line_voltage_class_within_radius');
  const slopeDegrees = val<number>(f, 'slope_degrees');

  // 2. Detect corridor barriers
  const barriers: BarrierDetail[] = [];
  const barrierMeta: Record<string, { label: string; rationale: string }> = {
    within_floodplain_polygon: {
      label: 'FEMA Special Flood Hazard Area',
      rationale:
        'Elevated conduit required; Army Corps §404 coordination adds 3–12 months to permitting.',
    },
    intersects_wetland: {
      label: 'USFWS Wetland Complex',
      rationale:
        'CWA §404/401 permits and compensatory mitigation banking required; elevated routing adds 30–55% to trench cost.',
    },
    intersects_protected_area: {
      label: 'PAD-US Protected Area',
      rationale:
        'NEPA review required; corridor may be forced around the boundary, increasing effective spur length.',
    },
    intersects_conservation_easement: {
      label: 'Conservation Easement',
      rationale:
        'Deed restriction review and possible condemnation proceedings; 25–45% cost premium typical.',
    },
  };

  let compositeMultiplier = 1.0;

  for (const [field, multiplier] of Object.entries(BARRIER_MULTIPLIERS)) {
    if (val<boolean>(f, field) === true) {
      const meta = barrierMeta[field];
      barriers.push({ field, label: meta.label, multiplier, rationale: meta.rationale });
      compositeMultiplier *= multiplier;
    }
  }

  if (slopeDegrees !== null && slopeDegrees > SLOPE_THRESHOLD_DEGREES) {
    const slopePenalty =
      1 + (slopeDegrees - SLOPE_THRESHOLD_DEGREES) * SLOPE_PENALTY_PER_DEGREE_ABOVE_THRESHOLD;
    compositeMultiplier *= slopePenalty;
    barriers.push({
      field: 'slope_degrees',
      label: `Steep Terrain (${slopeDegrees.toFixed(1)}\u00b0)`,
      multiplier: Number(slopePenalty.toFixed(3)),
      rationale: `Grades above ${SLOPE_THRESHOLD_DEGREES}\u00b0 increase pole-setting difficulty and wire sag clearance requirements.`,
    });
  }

  compositeMultiplier = Number(compositeMultiplier.toFixed(3));

  // 3. Corridor-adjusted distances
  let adjustedDistanceMeters: number | null = null;
  let rawDistanceMiles: number | null = null;
  let adjustedDistanceMiles: number | null = null;

  if (rawDistanceMeters !== null) {
    adjustedDistanceMeters = Math.round(rawDistanceMeters * compositeMultiplier);
    rawDistanceMiles = Number((rawDistanceMeters * METERS_TO_MILES).toFixed(2));
    adjustedDistanceMiles = Number((adjustedDistanceMeters * METERS_TO_MILES).toFixed(2));
  }

  // 4. Capital cost range (base to P75 contingency)
  let estimatedCapexLowUsd: number | null = null;
  let estimatedCapexHighUsd: number | null = null;
  let capexRangeLabel = 'Insufficient distance data';

  if (adjustedDistanceMiles !== null) {
    estimatedCapexLowUsd = Math.round(adjustedDistanceMiles * BASE_COST_PER_MILE_USD);
    estimatedCapexHighUsd = Math.round(estimatedCapexLowUsd * 1.35);
    capexRangeLabel = `${formatUsd(estimatedCapexLowUsd)} \u2013 ${formatUsd(estimatedCapexHighUsd)}`;
  }

  // 5. Voltage capacity check
  let capacityLimitMw: number | null = null;
  let capacityConstrained = false;
  let upgradeVoltageKv: number | null = null;
  let voltageNote: string;

  if (nearestVoltageKv !== null) {
    for (const [kv, maxMw] of VOLTAGE_CAPACITY_CEILING_MW) {
      if (nearestVoltageKv >= kv) {
        capacityLimitMw = maxMw;
        break;
      }
    }
    if (capacityLimitMw === null) capacityLimitMw = 50;

    if (projectMw > capacityLimitMw) {
      capacityConstrained = true;
      for (const [kv, maxMw] of VOLTAGE_CAPACITY_CEILING_MW) {
        if (maxMw >= projectMw) upgradeVoltageKv = kv;
      }
      voltageNote = `Nearest ${nearestVoltageKv} kV line cannot absorb ${projectMw} MW \u2014 upgrade to minimum ${upgradeVoltageKv ?? 500} kV required; LGIA and transmission upgrade agreement needed.`;
    } else {
      voltageNote = `${nearestVoltageKv} kV capacity ceiling (~${capacityLimitMw} MW) is adequate for ${projectMw} MW project.`;
    }
  } else {
    voltageNote =
      'No transmission voltage data available \u2014 site may require full greenfield transmission study.';
  }

  const voltageCapacity: VoltageCapacityCheck = {
    nearestVoltageKv,
    voltageClass,
    capacityLimitMw,
    capacityConstrained,
    upgradeVoltageKv,
    note: voltageNote,
  };

  // 6. RTO queue depth
  const rtoRegion = getRtoRegion(lat, lng);
  const estimatedQueueMonths = RTO_QUEUE_DEPTH_MONTHS[rtoRegion] ?? 42;
  const queueRiskRating = getQueueRisk(estimatedQueueMonths);

  const queueRisk: InterconnectionQueueRisk = {
    rtoRegion,
    estimatedQueueMonths,
    queueRisk: queueRiskRating,
    note: `${rtoRegion} interconnection queue is currently ~${estimatedQueueMonths} months median wait (LBNL Queued Up 2024). ${
      queueRiskRating === 'Severe' || queueRiskRating === 'High'
        ? 'Consider BESS-forward design to improve queue position.'
        : 'Queue position is manageable with early application.'
    }`,
  };

  // 7. Engine confidence
  const dataPoints = [rawDistanceMeters, nearestVoltageKv, slopeDegrees].filter(
    (v) => v !== null,
  ).length;
  const engineConfidence: GridCapacityResult['engineConfidence'] =
    dataPoints >= 3 ? 'high' : dataPoints === 2 ? 'medium' : 'low';

  // 8. Summary narrative
  const barriersText =
    barriers.length > 0
      ? `Corridor barriers include ${barriers.map((b) => b.label).join(', ')}, driving a ${compositeMultiplier.toFixed(2)}\u00d7 cost multiplier over straight-line distance.`
      : 'No major environmental barriers detected in corridor.';

  const costText =
    adjustedDistanceMiles !== null
      ? `Estimated interconnection spur capital cost: ${capexRangeLabel} (${adjustedDistanceMiles.toFixed(1)} mi corridor-adjusted).`
      : 'Interconnection cost estimate unavailable \u2014 distance data missing.';

  const summary = `${costText} ${barriersText} ${voltageCapacity.note} ${queueRisk.note}`;

  return {
    rawDistanceMeters,
    adjustedDistanceMeters,
    rawDistanceMiles,
    adjustedDistanceMiles,
    compositeBarrierMultiplier: compositeMultiplier,
    barriers,
    estimatedCapexLowUsd,
    estimatedCapexHighUsd,
    capexRangeLabel,
    voltageCapacity,
    queueRisk,
    engineConfidence,
    summary,
  };
}

/**
 * Rank multiple site candidates by grid feasibility.
 * Designed for Mireye-style agent screening workflows (1,000–10,000 site batches).
 *
 * Scoring weights:
 *   50% — Interconnection capex (inverted, normalized to $50M ceiling)
 *   30% — Voltage adequacy for project MW
 *   20% — RTO queue risk
 */
export function rankSitesByGridFeasibility(
  sites: Array<{ data: MireyeFetchResponse; projectMw: number }>,
): SiteGridRanking[] {
  const MAX_CAPEX_NORMALIZATION = 50_000_000;

  const queueScoreMap: Record<InterconnectionQueueRisk['queueRisk'], number> = {
    Low: 100,
    Moderate: 70,
    High: 40,
    Severe: 10,
  };

  const ranked: SiteGridRanking[] = sites.map(({ data, projectMw }) => {
    const result = analyzeGridCapacity(data, projectMw);

    const capexScore =
      result.estimatedCapexLowUsd !== null
        ? Math.max(0, 100 - (result.estimatedCapexLowUsd / MAX_CAPEX_NORMALIZATION) * 100)
        : 20;

    const voltageScore = result.voltageCapacity.capacityConstrained ? 10 : 100;
    const queueScore = queueScoreMap[result.queueRisk.queueRisk];

    const gridFeasibilityScore = Math.round(
      capexScore * 0.5 + voltageScore * 0.3 + queueScore * 0.2,
    );

    return {
      lat: data.lat,
      lng: data.lng,
      gridFeasibilityScore,
      capexRangeLabel: result.capexRangeLabel,
      estimatedCapexLowUsd: result.estimatedCapexLowUsd,
      queueRisk: result.queueRisk.queueRisk,
      capacityConstrained: result.voltageCapacity.capacityConstrained,
      barriers: result.barriers.map((b) => b.label),
    };
  });

  return ranked.sort((a, b) => b.gridFeasibilityScore - a.gridFeasibilityScore);
}
