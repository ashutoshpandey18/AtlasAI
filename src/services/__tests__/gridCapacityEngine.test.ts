import { describe, it, expect } from 'vitest';
import { analyzeGridCapacity, rankSitesByGridFeasibility } from '../gridCapacityEngine';
import {
  mockMireyeResponse,
  CLEAN_ERCOT_SITE,
  REMOTE_PJM_SITE,
  POISONED_SITE,
} from './mockMireye';

// ── analyzeGridCapacity ───────────────────────────────────────────────────────

describe('analyzeGridCapacity', () => {

  it('returns raw distance from Mireye with no barriers applied', () => {
    const data = mockMireyeResponse(31.5, -97.1, {
      nearest_transmission_line_distance_m: { value: 2000 },
      max_transmission_line_voltage_kv_within_radius: { value: 345 },
      slope_degrees: { value: 1.0 },
    });
    const result = analyzeGridCapacity(data, 100);

    expect(result.rawDistanceMeters).toBe(2000);
    expect(result.compositeBarrierMultiplier).toBe(1.0);
    expect(result.barriers).toHaveLength(0);
    expect(result.adjustedDistanceMeters).toBe(2000);
  });

  it('applies floodplain multiplier (1.40×) when site is in FEMA SFHA', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      nearest_transmission_line_distance_m: { value: 5000 },
      within_floodplain_polygon: { value: true },
    });
    const result = analyzeGridCapacity(data, 100);

    expect(result.compositeBarrierMultiplier).toBeCloseTo(1.4, 2);
    expect(result.barriers.some(b => b.field === 'within_floodplain_polygon')).toBe(true);
    expect(result.adjustedDistanceMeters).toBeCloseTo(5000 * 1.4, 0);
  });

  it('multiplies all active barriers together (compound, not additive)', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      nearest_transmission_line_distance_m: { value: 4000 },
      within_floodplain_polygon: { value: true },  // 1.40×
      intersects_wetland:        { value: true },  // 1.55×
    });
    const result = analyzeGridCapacity(data, 100);

    // 1.40 × 1.55 = 2.17
    expect(result.compositeBarrierMultiplier).toBeCloseTo(1.4 * 1.55, 2);
    expect(result.barriers).toHaveLength(2);
  });

  it('applies slope penalty for terrain above 5°', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      nearest_transmission_line_distance_m: { value: 3000 },
      slope_degrees: { value: 10 },  // 5° above threshold → 5 × 0.04 = 20% penalty
    });
    const result = analyzeGridCapacity(data, 100);

    // multiplier = 1.0 + (10 - 5) * 0.04 = 1.20
    expect(result.compositeBarrierMultiplier).toBeCloseTo(1.20, 2);
    expect(result.barriers.some(b => b.field === 'slope_degrees')).toBe(true);
  });

  it('flags capacity constraint when project MW exceeds voltage ceiling', () => {
    // 115 kV line → max 150 MW ceiling
    const data = mockMireyeResponse(40.1, -80.5, {
      nearest_transmission_line_distance_m: { value: 5000 },
      max_transmission_line_voltage_kv_within_radius: { value: 115 },
    });
    const result = analyzeGridCapacity(data, 500); // 500 MW > 150 MW ceiling

    expect(result.voltageCapacity.capacityConstrained).toBe(true);
    expect(result.voltageCapacity.upgradeVoltageKv).toBeGreaterThanOrEqual(230);
  });

  it('does NOT flag capacity constraint when voltage is sufficient', () => {
    const data = CLEAN_ERCOT_SITE; // 500 kV line → 2000 MW ceiling
    const result = analyzeGridCapacity(data, 100);

    expect(result.voltageCapacity.capacityConstrained).toBe(false);
    expect(result.voltageCapacity.upgradeVoltageKv).toBeNull();
  });

  it('returns ERCOT queue risk for Texas site', () => {
    const result = analyzeGridCapacity(CLEAN_ERCOT_SITE, 100);
    expect(result.queueRisk.rtoRegion).toBe('ERCOT');
    expect(result.queueRisk.estimatedQueueMonths).toBe(30);
    expect(result.queueRisk.queueRisk).toBe('Low');
  });

  it('returns severe queue risk for ISO-NE sites', () => {
    const data = mockMireyeResponse(42.5, -71.0, { // Boston area → ISO-NE
      nearest_transmission_line_distance_m: { value: 1000 },
    });
    const result = analyzeGridCapacity(data, 100);
    expect(result.queueRisk.rtoRegion).toBe('ISO-NE');
    expect(result.queueRisk.queueRisk).toBe('Severe');
  });

  it('returns null capex when distance data is missing', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      nearest_transmission_line_distance_m: { value: null },
    });
    const result = analyzeGridCapacity(data, 100);

    expect(result.rawDistanceMeters).toBeNull();
    expect(result.estimatedCapexLowUsd).toBeNull();
    expect(result.capexRangeLabel).toBe('Insufficient distance data');
  });

  it('sets engine confidence to high when 3 data points are present', () => {
    const data = mockMireyeResponse(31.5, -97.1, {
      nearest_transmission_line_distance_m: { value: 2000 },
      max_transmission_line_voltage_kv_within_radius: { value: 345 },
      slope_degrees: { value: 3.0 },
    });
    const result = analyzeGridCapacity(data, 100);
    expect(result.engineConfidence).toBe('high');
  });

  it('capex increases with distance (sanity check)', () => {
    const near = analyzeGridCapacity(mockMireyeResponse(31.5, -97.1, {
      nearest_transmission_line_distance_m: { value: 1000 },
    }), 100);
    const far = analyzeGridCapacity(mockMireyeResponse(31.5, -97.1, {
      nearest_transmission_line_distance_m: { value: 10000 },
    }), 100);

    expect(far.estimatedCapexLowUsd!).toBeGreaterThan(near.estimatedCapexLowUsd!);
  });
});

// ── rankSitesByGridFeasibility ────────────────────────────────────────────────

describe('rankSitesByGridFeasibility', () => {

  it('ranks clean site above remote, constrained site', () => {
    const sites = [
      { data: REMOTE_PJM_SITE, projectMw: 200 },  // far, constrained, wetland
      { data: CLEAN_ERCOT_SITE, projectMw: 200 },  // close, 500kV, no barriers
    ];
    const ranked = rankSitesByGridFeasibility(sites);

    expect(ranked[0].lat).toBeCloseTo(CLEAN_ERCOT_SITE.lat, 1);
    expect(ranked[0].gridFeasibilityScore).toBeGreaterThan(ranked[1].gridFeasibilityScore);
  });

  it('scores are bounded 0–100', () => {
    const ranked = rankSitesByGridFeasibility([
      { data: CLEAN_ERCOT_SITE, projectMw: 100 },
      { data: REMOTE_PJM_SITE, projectMw: 500 },
      { data: POISONED_SITE, projectMw: 300 },
    ]);
    for (const r of ranked) {
      expect(r.gridFeasibilityScore).toBeGreaterThanOrEqual(0);
      expect(r.gridFeasibilityScore).toBeLessThanOrEqual(100);
    }
  });

  it('returns results sorted descending by gridFeasibilityScore', () => {
    const sites = [
      { data: REMOTE_PJM_SITE, projectMw: 200 },
      { data: CLEAN_ERCOT_SITE, projectMw: 100 },
      { data: POISONED_SITE, projectMw: 300 },
    ];
    const ranked = rankSitesByGridFeasibility(sites);

    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].gridFeasibilityScore).toBeGreaterThanOrEqual(ranked[i + 1].gridFeasibilityScore);
    }
  });

  it('includes barrier labels in results', () => {
    const ranked = rankSitesByGridFeasibility([{ data: REMOTE_PJM_SITE, projectMw: 100 }]);
    expect(ranked[0].barriers).toContain('USFWS Wetland Complex');
    expect(ranked[0].barriers).toContain('FEMA Special Flood Hazard Area');
  });
});
