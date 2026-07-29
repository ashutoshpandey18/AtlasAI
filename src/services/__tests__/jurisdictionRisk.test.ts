import { describe, it, expect } from 'vitest';
import { getRtoRegion, evaluateJurisdictionRisk } from '../jurisdictionRisk';
import { mockMireyeResponse } from './mockMireye';

// ── getRtoRegion ──────────────────────────────────────────────────────────────

describe('getRtoRegion', () => {

  it('returns ERCOT for central Texas', () => {
    expect(getRtoRegion(30.5, -97.7)).toBe('ERCOT'); // Austin area
  });

  it('returns WECC for California', () => {
    expect(getRtoRegion(34.0, -118.2)).toBe('WECC'); // Los Angeles
  });

  it('returns WECC for Nevada', () => {
    expect(getRtoRegion(36.1, -115.1)).toBe('WECC'); // Las Vegas
  });

  it('returns MISO for upper Midwest', () => {
    expect(getRtoRegion(44.9, -93.2)).toBe('MISO'); // Minneapolis
  });

  it('returns PJM for Pennsylvania', () => {
    expect(getRtoRegion(40.4, -79.9)).toBe('PJM'); // Pittsburgh
  });

  it('returns PJM for Ohio (east)', () => {
    expect(getRtoRegion(39.9, -82.9)).toBe('PJM'); // Columbus
  });

  it('returns SPP for Kansas', () => {
    expect(getRtoRegion(39.0, -98.0)).toBe('SPP'); // Salina, KS
  });

  it('returns NYISO for New York', () => {
    expect(getRtoRegion(42.6, -73.7)).toBe('NYISO'); // Albany
  });

  it('returns ISO-NE for Massachusetts', () => {
    expect(getRtoRegion(42.3, -71.0)).toBe('ISO-NE'); // Boston
  });

  it('returns SERC for southeast (non-RTO)', () => {
    expect(getRtoRegion(33.7, -84.3)).toBe('SERC'); // Atlanta
  });
});

// ── evaluateJurisdictionRisk ──────────────────────────────────────────────────

describe('evaluateJurisdictionRisk — transmission fields', () => {

  it('returns cross-RTO risk for OH PJM/MISO seam (transmission field)', () => {
    const data = mockMireyeResponse(40.2, -84.2);
    const risk = evaluateJurisdictionRisk(
      40.2, -84.2,
      'nearest_transmission_line_distance_m',
      data.fields,
    );

    expect(risk).toBeDefined();
    expect(risk!.crossRtoBoundary).toBe(true);
    expect(risk!.rtoRegion).toBe('PJM');
    expect(risk!.lineRtoRegion).toBe('MISO');
    expect(risk!.note).toMatch(/seam/i);
  });

  it('returns no cross-RTO risk for transmission field far from seam', () => {
    const data = mockMireyeResponse(42.3, -71.0); // Boston ISO-NE — far from any seam
    const risk = evaluateJurisdictionRisk(
      42.3, -71.0,
      'nearest_transmission_line_distance_m',
      data.fields,
    );

    // May return defined result with crossRtoBoundary = false
    if (risk) {
      expect(risk.crossRtoBoundary).toBe(false);
    }
  });

  it('returns undefined for non-transmission, non-flood fields', () => {
    const data = mockMireyeResponse(39.9, -82.9);
    const risk = evaluateJurisdictionRisk(39.9, -82.9, 'slope_degrees', data.fields);
    expect(risk).toBeUndefined();
  });
});

describe('evaluateJurisdictionRisk — FEMA DFIRM vintage risk', () => {

  it('returns DFIRM vintage risk when flood confidence is medium', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      within_floodplain_polygon: { value: false, confidence: 'medium', dataset_vintage: '2018' },
    });
    const risk = evaluateJurisdictionRisk(
      39.0, -82.0,
      'within_floodplain_polygon',
      data.fields,
    );

    expect(risk).toBeDefined();
    expect(risk!.dfirmVintage).toBe('2018');
    expect(risk!.note).toMatch(/vintage/i);
  });

  it('returns DFIRM vintage risk when vintage is before 2020', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      within_floodplain_polygon: { value: false, confidence: 'high', dataset_vintage: '2016' },
    });
    const risk = evaluateJurisdictionRisk(
      39.0, -82.0,
      'within_floodplain_polygon',
      data.fields,
    );

    expect(risk).toBeDefined();
    expect(risk!.dfirmVintage).toBe('2016');
  });

  it('returns undefined for high-confidence 2023 flood data', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      within_floodplain_polygon: { value: false, confidence: 'high', dataset_vintage: '2023' },
    });
    const risk = evaluateJurisdictionRisk(
      39.0, -82.0,
      'within_floodplain_polygon',
      data.fields,
    );

    expect(risk).toBeUndefined();
  });

  it('rtoRegion is always included in any returned JurisdictionRisk', () => {
    const data = mockMireyeResponse(40.2, -84.2);
    const risk = evaluateJurisdictionRisk(
      40.2, -84.2,
      'nearest_transmission_line_distance_m',
      data.fields,
    );

    expect(risk).toBeDefined();
    expect(typeof risk!.rtoRegion).toBe('string');
    expect(risk!.rtoRegion.length).toBeGreaterThan(0);
  });
});
