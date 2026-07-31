/**
 * Centroid Validation & Geocode Misalignment Detection Service
 *
 * Detects geocode match ambiguity, road-centerline snaps, boundary-proximity risks,
 * and coordinate cluster outliers to prevent spatial field poisoning.
 */

import type { MireyeFetchResponse, MireyeFieldValue } from '../types/mireye';
import { getRtoRegion } from './jurisdictionRisk';

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Maximum meters from a road centerline that strongly suggests road-snap
 * (Mireye's nearest_major_road_distance_m will be near-zero).
 */
const ROAD_SNAP_DISTANCE_THRESHOLD_M = 15;

/**
 * Boundary epsilon: if a coordinate is within this many meters of a known
 * state-change in a binary field, a small geocode error could flip the result.
 * We approximate "boundary proximity" via field confidence and value extremes.
 */
const BOUNDARY_PROXIMITY_METERS = 50;

/**
 * Ambiguous address signals — substrings that indicate the input lacks enough
 * specificity to produce a reliable geocode.
 */
const AMBIGUOUS_ADDRESS_PATTERNS: RegExp[] = [
  /^\d{1,5}\s+\w+\s+st(reet)?\.?$/i,          // "123 Main St" — no city/state
  /^\d{1,5}\s+\w+\s+ave(nue)?\.?$/i,           // "456 Oak Ave"
  /^(lot|parcel|tract)\s+\d+/i,                 // "Lot 12" — no address
  /^(corner|intersection)\s+of/i,               // "Corner of Main and Elm"
  /^(highway|hwy|route|rte)\s+\d+/i,            // "Highway 66" — no number
  /^\d{1,5}-[A-Z]/i,                            // Range addresses like "123-A"
  /\bunit\s+[a-z]?\d+\b/i,                      // "123 Main St Unit 4" — sub-unit
];

// ── Type Definitions ──────────────────────────────────────────────────────────

export type CentroidRisk = 'clean' | 'low' | 'medium' | 'high' | 'critical';

export interface CentroidFlag {
  /** Machine-readable flag code */
  code: string;
  /** Severity of this specific flag */
  severity: CentroidRisk;
  /** Human-readable description */
  message: string;
  /** Which Mireye fields are most impacted if this flag is true */
  poisonedFields: string[];
}

export interface CentroidValidation {
  /** Overall poisoning risk for this coordinate */
  overallRisk: CentroidRisk;
  /** Confidence score 0–100 (higher = more trustworthy centroid) */
  centroidConfidenceScore: number;
  /** Whether Atlas recommends blocking this coordinate from scoring */
  shouldBlock: boolean;
  /** Detected misalignment flags */
  flags: CentroidFlag[];
  /** The address string that was assessed */
  inputAddress: string;
  /** Resolved coordinate from Mireye */
  resolvedLat: number;
  resolvedLng: number;
  /** Recommended corrective action for the UI or agent */
  recommendation: string;
  /** Summary for display */
  summary: string;
}

// ── Helper: Haversine distance (meters) ──────────────────────────────────────

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function val<T>(fields: Record<string, MireyeFieldValue> | undefined | null, key: string): T | null {
  if (!fields) return null;
  const v = fields[key]?.value;
  return v !== undefined ? (v as T) : null;
}

function confidence(fields: Record<string, MireyeFieldValue> | undefined | null, key: string): string {
  if (!fields) return 'low';
  return fields[key]?.confidence ?? 'low';
}

// ── Individual Detectors ──────────────────────────────────────────────────────

/** DETECTOR 1: Road-snap detection
 *
 *  Mireye's geocoder (like most) defaults to snapping ambiguous addresses to
 *  the road centerline. If nearest_major_road_distance_m is suspiciously small
 *  (< 15 m), the coordinate is almost certainly sitting on the road, not the
 *  parcel. ALL environmental field values are for the road, not the site.
 */
function detectRoadSnap(
  fields: Record<string, MireyeFieldValue>,
): CentroidFlag | null {
  const roadDist = val<number>(fields, 'nearest_major_road_distance_m');
  if (roadDist === null) return null;

  if (roadDist < ROAD_SNAP_DISTANCE_THRESHOLD_M) {
    return {
      code: 'ROAD_SNAP_LIKELY',
      severity: 'high',
      message: `Coordinate is ${Math.round(roadDist)}m from the road centerline — almost certainly road-snapped, not parcel-centroid. Flood zone, slope, and wetland values reflect the road, not the site.`,
      poisonedFields: [
        'within_floodplain_polygon',
        'slope_degrees',
        'intersects_wetland',
        'tree_canopy_pct',
        'aspect_degrees',
      ],
    };
  }
  return null;
}

/** DETECTOR 2: Flood boundary proximity
 *
 *  If the FEMA field returns confidence = 'medium' or 'low', the coordinate
 *  is likely sitting near the edge of a DFIRM flood panel polygon. A 30-meter
 *  centroid shift could flip within_floodplain_polygon from false → true,
 *  which changes the entire project risk classification.
 */
function detectFloodBoundaryProximity(
  fields: Record<string, MireyeFieldValue>,
): CentroidFlag | null {
  const conf = confidence(fields, 'within_floodplain_polygon');
  const inFlood = val<boolean>(fields, 'within_floodplain_polygon');

  // Medium confidence near a flood field is the exact signature of boundary proximity
  if (conf === 'medium') {
    return {
      code: 'FLOOD_BOUNDARY_PROXIMITY',
      severity: 'high',
      message: `FEMA flood zone confidence is 'medium' — coordinate may be within ${BOUNDARY_PROXIMITY_METERS}m of a SFHA boundary. A geocode snap error could flip the flood classification. Value: ${inFlood ? 'IN floodplain' : 'OUTSIDE floodplain'}.`,
      poisonedFields: ['within_floodplain_polygon'],
    };
  }

  if (conf === 'low') {
    return {
      code: 'FLOOD_ZONE_UNRELIABLE',
      severity: 'critical',
      message: `FEMA flood zone confidence is 'low' — data quality is insufficient to classify this coordinate. Do not use within_floodplain_polygon in scoring without manual survey.`,
      poisonedFields: ['within_floodplain_polygon'],
    };
  }

  return null;
}

/** DETECTOR 3: RTO seam boundary risk
 *
 *  If the coordinate is within a known RTO seam zone AND the transmission
 *  field confidence is medium/low, an address geocoding error of even 100m
 *  could place the coordinate in a different RTO — completely changing the
 *  tariff, queue, and interconnection framework.
 */
function detectRtoSeamProximity(
  lat: number,
  lng: number,
  fields: Record<string, MireyeFieldValue>,
): CentroidFlag | null {
  const transmissionConf = confidence(fields, 'nearest_transmission_line_distance_m');

  // RTO seam zones — same as jurisdictionRisk.ts
  const isSeamZone =
    (lng >= -84.8 && lng <= -83.5 && lat >= 39.0 && lat <= 41.5) || // OH PJM/MISO
    (lng >= -95.0 && lng <= -93.5 && lat >= 30.0 && lat <= 34.0) || // TX/LA ERCOT edge
    (lng >= -104.5 && lng <= -103.0);                                  // WECC/SPP

  if (isSeamZone && (transmissionConf === 'medium' || transmissionConf === 'low')) {
    const rto = getRtoRegion(lat, lng);
    return {
      code: 'RTO_SEAM_PROXIMITY',
      severity: 'high',
      message: `Coordinate sits in a known RTO seam zone (${rto} boundary). Medium/low transmission confidence suggests the geocoder may have snapped near a jurisdictional boundary. Interconnection tariff classification could be wrong.`,
      poisonedFields: [
        'nearest_transmission_line_distance_m',
        'max_transmission_line_voltage_kv_within_radius',
      ],
    };
  }
  return null;
}

/** DETECTOR 4: Address ambiguity
 *
 *  Inspects the raw input address string for patterns that reliably indicate
 *  geocoding uncertainty — no city/state, intersection-only, lot-number-only.
 *  These inputs frequently produce road-snapped or best-guess coordinates.
 */
function detectAddressAmbiguity(address: string): CentroidFlag | null {
  const trimmed = address.trim();

  // Very short addresses are almost always incomplete
  if (trimmed.length < 12) {
    return {
      code: 'ADDRESS_TOO_SHORT',
      severity: 'critical',
      message: `Input address "${trimmed}" is too short to resolve to a reliable parcel centroid. Missing city, state, or ZIP. All field values are suspect.`,
      poisonedFields: ['ALL'],
    };
  }

  // Missing state or ZIP — high ambiguity
  // Nominatim returns full state names ("Texas"), not abbreviations ("TX"),
  // so we check for both forms.
  const US_STATE_NAMES = /\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|District of Columbia)\b/i;

  const hasStateOrZip =
    /\b[A-Z]{2}\s+\d{5}/.test(trimmed) || // "TX 79701" — abbrev + ZIP
    /,\s*[A-Z]{2}$/.test(trimmed)        || // ", TX" at end
    /\b\d{5}(-\d{4})?$/.test(trimmed)   || // ZIP at end
    US_STATE_NAMES.test(trimmed);           // Full state name ("Texas", "Ohio"…)

  if (!hasStateOrZip) {
    return {
      code: 'ADDRESS_MISSING_STATE_ZIP',
      severity: 'medium',
      message: `Address "${trimmed}" lacks a state or ZIP code — geocoder may match a city with the same street name in a different state. Coordinate may be hundreds of miles off.`,
      poisonedFields: ['ALL'],
    };
  }

  // Pattern-match for structurally ambiguous formats
  for (const pattern of AMBIGUOUS_ADDRESS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        code: 'ADDRESS_AMBIGUOUS_PATTERN',
        severity: 'medium',
        message: `Address "${trimmed}" matches an ambiguous format (highway/lot/intersection) that frequently produces road-centerline or mid-block snaps.`,
        poisonedFields: ['within_floodplain_polygon', 'slope_degrees', 'intersects_wetland'],
      };
    }
  }

  return null;
}

/** DETECTOR 5: Coordinate cluster divergence
 *
 *  If an agent submits multiple addresses that are supposed to be "nearby"
 *  (e.g., parcels in the same rural area) but one geocoded point is drastically
 *  far from the cluster median, it signals a geocoding outlier.
 *
 *  This is a batch-mode detector; returns null in single-site mode.
 */
export function detectClusterOutlier(
  lat: number,
  lng: number,
  clusterLats: number[],
  clusterLngs: number[],
  thresholdKm = 50,
): CentroidFlag | null {
  if (clusterLats.length < 2) return null;

  const medianLat = clusterLats.reduce((a, b) => a + b, 0) / clusterLats.length;
  const medianLng = clusterLngs.reduce((a, b) => a + b, 0) / clusterLngs.length;
  const distM = haversineMeters(lat, lng, medianLat, medianLng);
  const distKm = distM / 1000;

  if (distKm > thresholdKm) {
    return {
      code: 'CLUSTER_OUTLIER',
      severity: 'critical',
      message: `This coordinate is ${distKm.toFixed(0)} km from the centroid of the site batch (threshold: ${thresholdKm} km). Likely a geocoding miss — the address resolved to the wrong city or state.`,
      poisonedFields: ['ALL'],
    };
  }

  return null;
}

// ── Risk Score Aggregator ─────────────────────────────────────────────────────

const RISK_RANK: Record<CentroidRisk, number> = {
  clean: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const CONFIDENCE_DEDUCTION: Record<CentroidRisk, number> = {
  clean: 0,
  low: 10,
  medium: 20,
  high: 35,
  critical: 60,
};

function aggregateRisk(flags: CentroidFlag[]): { overallRisk: CentroidRisk; score: number } {
  if (flags.length === 0) return { overallRisk: 'clean', score: 100 };

  let maxRank = 0;
  let totalDeduction = 0;

  for (const flag of flags) {
    const rank = RISK_RANK[flag.severity];
    if (rank > maxRank) maxRank = rank;
    totalDeduction += CONFIDENCE_DEDUCTION[flag.severity];
  }

  const overallRisk = (Object.entries(RISK_RANK) as Array<[CentroidRisk, number]>).find(
    ([, v]) => v === maxRank,
  )![0];

  const score = Math.max(0, 100 - totalDeduction);
  return { overallRisk, score };
}

// ── Main Validator ────────────────────────────────────────────────────────────

/**
 * Validate a geocoded coordinate from Mireye for centroid misalignment risk.
 *
 * Call this BEFORE trusting any field values from MireyeFetchResponse.
 *
 * @param address     The raw address string that was passed to Mireye
 * @param data        The full MireyeFetchResponse for the resolved coordinate
 * @param cluster     Optional: other coordinates in the same batch (for outlier detection)
 */
export function validateCentroid(
  address: string,
  data: MireyeFetchResponse,
  cluster?: { lats: number[]; lngs: number[] },
): CentroidValidation {
  const lat = data?.lat ?? 0;
  const lng = data?.lng ?? 0;
  const fields = data?.fields ?? {};
  const flags: CentroidFlag[] = [];

  // Run all detectors
  const roadSnap = detectRoadSnap(fields);
  if (roadSnap) flags.push(roadSnap);

  const floodBoundary = detectFloodBoundaryProximity(fields);
  if (floodBoundary) flags.push(floodBoundary);

  const rtoSeam = detectRtoSeamProximity(lat, lng, fields);
  if (rtoSeam) flags.push(rtoSeam);

  const addrAmbiguity = detectAddressAmbiguity(address);
  if (addrAmbiguity) flags.push(addrAmbiguity);

  if (cluster) {
    const outlier = detectClusterOutlier(lat, lng, cluster.lats, cluster.lngs);
    if (outlier) flags.push(outlier);
  }

  const { overallRisk, score } = aggregateRisk(flags);

  const shouldBlock = overallRisk === 'critical';

  // Recommendation
  let recommendation: string;
  if (shouldBlock) {
    recommendation =
      'BLOCK: Do not use this coordinate in site scoring. Resolve the address ambiguity or cluster outlier manually before re-submitting.';
  } else if (overallRisk === 'high') {
    recommendation =
      'WARN: Field values may be partially poisoned. Manually verify the coordinate against a parcel map before making capital allocation decisions.';
  } else if (overallRisk === 'medium') {
    recommendation =
      'CAUTION: One or more fields have boundary-proximity risk. Cross-check with a county GIS portal for the FEMA or RTO classification.';
  } else {
    recommendation = 'Coordinate appears clean — proceed with standard scoring.';
  }

  // Summary
  const flagSummary =
    flags.length > 0
      ? `${flags.length} misalignment flag(s) detected: ${flags.map((f) => f.code).join(', ')}.`
      : 'No centroid misalignment flags detected.';

  const summary = `Centroid confidence: ${score}/100 (${overallRisk.toUpperCase()}). ${flagSummary} ${recommendation}`;

  return {
    overallRisk,
    centroidConfidenceScore: score,
    shouldBlock,
    flags,
    inputAddress: address,
    resolvedLat: lat,
    resolvedLng: lng,
    recommendation,
    summary,
  };
}

// ── Batch Validator ───────────────────────────────────────────────────────────

export interface BatchValidationResult {
  clean: CentroidValidation[];
  flagged: CentroidValidation[];
  blocked: CentroidValidation[];
  /** Addresses that should be re-queued with better inputs */
  requeuAddresses: string[];
}

/**
 * Validate a batch of geocoded sites (e.g., from an AI agent screening run).
 * Automatically computes the cluster centroid for outlier detection.
 */
export function validateCentroidBatch(
  sites: Array<{ address: string; data: MireyeFetchResponse }>,
): BatchValidationResult {
  const clusterLats = sites.map((s) => s.data.lat);
  const clusterLngs = sites.map((s) => s.data.lng);

  const results = sites.map(({ address, data }) =>
    validateCentroid(address, data, { lats: clusterLats, lngs: clusterLngs }),
  );

  return {
    clean: results.filter((r) => r.overallRisk === 'clean' || r.overallRisk === 'low'),
    flagged: results.filter((r) => r.overallRisk === 'medium' || r.overallRisk === 'high'),
    blocked: results.filter((r) => r.shouldBlock),
    requeuAddresses: results
      .filter((r) => r.flags.some((f) => f.code.startsWith('ADDRESS_')))
      .map((r) => r.inputAddress),
  };
}
