/**
 * mockMireye.ts
 * Shared mock factory for MireyeFetchResponse objects used across all tests.
 */

import type { MireyeFetchResponse, MireyeFieldValue } from '../../types/mireye';

type FieldOverrides = Record<string, Partial<MireyeFieldValue> & { value: MireyeFieldValue['value'] }>;

function makeField(value: MireyeFieldValue['value'], overrides: Partial<MireyeFieldValue> = {}): MireyeFieldValue {
  return {
    value,
    unit: null,
    source: 'test-source',
    source_url: 'https://example.com',
    confidence: 'high',
    fetched_at: '2026-07-29T00:00:00Z',
    dataset_vintage: '2023',
    ttl_seconds: 3600,
    notes: null,
    ...overrides,
  };
}

/**
 * Build a complete mock MireyeFetchResponse.
 *
 * @param lat          Site latitude
 * @param lng          Site longitude
 * @param fieldValues  Key-value map of field overrides
 */
export function mockMireyeResponse(
  lat: number,
  lng: number,
  fieldValues: FieldOverrides = {},
): MireyeFetchResponse {
  // Sensible defaults — a "clean" site near Columbus, OH
  const defaults: Record<string, MireyeFieldValue> = {
    within_floodplain_polygon:           makeField(false),
    intersects_wetland:                  makeField(false),
    intersects_protected_area:           makeField(false),
    intersects_conservation_easement:    makeField(false),
    slope_degrees:                       makeField(2.1),
    elevation:                           makeField(280),
    tree_canopy_pct:                     makeField(8),
    aspect_degrees:                      makeField(182),
    aspect_cardinal:                     makeField('S'),
    nearest_transmission_line_distance_m: makeField(1200),
    max_transmission_line_voltage_kv_within_radius: makeField(345),
    max_transmission_line_voltage_class_within_radius: makeField('345kV'),
    nearest_major_road_distance_m:       makeField(250),
    nearest_rail_line_distance_m:        makeField(4500),
    nearest_airport_distance_m:          makeField(22000),
    nearest_gas_pipeline_distance_m:     makeField(3000),
  };

  const fields: Record<string, MireyeFieldValue> = { ...defaults };

  for (const [key, override] of Object.entries(fieldValues)) {
    fields[key] = makeField(override.value, override);
  }

  return {
    lat,
    lng,
    fetched_at: '2026-07-29T00:00:00Z',
    fields,
    partial_failures: [],
  };
}

// ── Pre-built scenario fixtures ───────────────────────────────────────────────

/** A heavily constrained site: flood zone + wetland + steep slope */
export const POISONED_SITE = mockMireyeResponse(39.9612, -82.9988, {
  within_floodplain_polygon: { value: true, confidence: 'high' },
  intersects_wetland:        { value: true, confidence: 'high' },
  slope_degrees:             { value: 14.2 },
  nearest_major_road_distance_m: { value: 8 }, // road-snapped!
});

/** A clean, grid-proximate site in Texas (ERCOT zone) */
export const CLEAN_ERCOT_SITE = mockMireyeResponse(31.5, -97.1, {
  nearest_transmission_line_distance_m: { value: 400 },
  max_transmission_line_voltage_kv_within_radius: { value: 500 },
  slope_degrees: { value: 1.0 },
});

/** A remote site 18km from nearest transmission line in PJM */
export const REMOTE_PJM_SITE = mockMireyeResponse(40.1, -80.5, {
  nearest_transmission_line_distance_m: { value: 18000 },
  max_transmission_line_voltage_kv_within_radius: { value: 115 },
  intersects_wetland: { value: true },
  within_floodplain_polygon: { value: true, confidence: 'medium', dataset_vintage: '2018' },
});

/** A site on the PJM/MISO seam boundary in Ohio */
export const RTO_SEAM_SITE = mockMireyeResponse(40.2, -84.2, {
  nearest_transmission_line_distance_m: { value: 800, confidence: 'medium' },
  max_transmission_line_voltage_kv_within_radius: { value: 230 },
});
