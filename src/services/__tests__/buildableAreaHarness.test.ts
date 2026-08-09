import { describe, it, expect } from 'vitest';
import { analyzeBuildableArea, calculateGeoJsonAreaAcres } from '../buildableAreaHarness';
import { mockMireyeResponse } from './mockMireye';

describe('buildableAreaHarness — Evidence-Based Developability Assessment', () => {
  it('calculates exact WGS84 geodesic acreage for GeoJSON Polygon geometry', () => {
    const polygonGeom = {
      type: 'Polygon',
      coordinates: [
        [
          [-102.3441, 31.8601],
          [-102.3421, 31.8601],
          [-102.3421, 31.8591],
          [-102.3441, 31.8591],
          [-102.3441, 31.8601],
        ],
      ],
    };

    const acres = calculateGeoJsonAreaAcres(polygonGeom);
    expect(acres).not.toBeNull();
    expect(acres).toBeGreaterThan(5);
    expect(acres).toBeLessThan(15);
  });

  it('calculates acreage for MultiPolygon geometry correctly', () => {
    const multiPolyGeom = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-102.3441, 31.8601],
            [-102.3421, 31.8601],
            [-102.3421, 31.8591],
            [-102.3441, 31.8591],
            [-102.3441, 31.8601],
          ],
        ],
      ],
    };

    const acres = calculateGeoJsonAreaAcres(multiPolyGeom);
    expect(acres).not.toBeNull();
    expect(acres).toBeGreaterThan(0);
  });

  it('distinguishes Verified Parcel Boundary vs Approximated Bounding Box', () => {
    const polygonGeom = {
      type: 'Polygon',
      coordinates: [
        [
          [-102.3441, 31.8601],
          [-102.3421, 31.8601],
          [-102.3421, 31.8591],
          [-102.3441, 31.8591],
          [-102.3441, 31.8601],
        ],
      ],
    };
    const data = mockMireyeResponse(31.8601, -102.3441);

    const verifiedRes = analyzeBuildableArea(data, 50, 100, polygonGeom, false, true);
    expect(verifiedRes.boundaryLabel).toBe('Verified Parcel Boundary');
    expect(verifiedRes.isGeometryAuthoritative).toBe(true);
    expect(verifiedRes.provenance).toBe('Live Mireye API Indicators');

    const approxRes = analyzeBuildableArea(data, 50, 100, polygonGeom, true, false);
    expect(approxRes.boundaryLabel).toBe('Approximated Boundary Box');
    expect(approxRes.isGeometryAuthoritative).toBe(false);
    expect(approxRes.provenance).toBe('Cached Mireye API Indicators');
  });

  it('returns READY_FOR_SITE_CONTROL for a completely unencumbered site', () => {
    const data = mockMireyeResponse(39.6012, -82.9463);
    const result = analyzeBuildableArea(data, 50, 100);

    expect(result.estimatedNetDevelopableAcres).toBe(100);
    expect(result.estimatedSiteEfficiencyPct).toBe(100);
    expect(result.deductions.length).toBe(0);
    expect(result.verdict).toBe('READY_FOR_SITE_CONTROL');
    expect(result.methodology).toBe('Atlas Civil Deduction Model');
  });

  it('calculates flood zone deduction correctly', () => {
    const data = mockMireyeResponse(35.1495, -90.0490, {
      within_floodplain_polygon: { value: true },
    });
    const result = analyzeBuildableArea(data, 50, 100);

    expect(result.deductions.some((d) => d.code === 'FEMA_FLOOD_DEDUCTION')).toBe(true);
    expect(result.totalDeductionsAcres).toBe(35);
    expect(result.estimatedNetDevelopableAcres).toBe(65);
    expect(result.verdict).toBe('READY_FOR_SITE_CONTROL');
  });

  it('calculates steep slope and wetland deductions with proper triggers', () => {
    const data = mockMireyeResponse(35.1495, -90.0490, {
      slope_degrees: { value: 9.5 },
      intersects_wetland: { value: true },
    });
    const result = analyzeBuildableArea(data, 50, 100);

    expect(result.deductions.length).toBe(2);
    expect(result.deductions.some((d) => d.code === 'STEEP_SLOPE_DEDUCTION')).toBe(true);
    expect(result.deductions.some((d) => d.code === 'USFWS_WETLAND_BUFFER')).toBe(true);
    expect(result.totalDeductionsAcres).toBe(45); // 20% + 25% = 45 acres
    expect(result.estimatedNetDevelopableAcres).toBe(55);
  });

  it('stricly clamps net developable acres and efficiency between 0 and gross area', () => {
    const data = mockMireyeResponse(35.1495, -90.0490, {
      within_floodplain_polygon: { value: true }, // 35%
      intersects_wetland: { value: true },        // 25%
      slope_degrees: { value: 12.0 },             // 20%
      intersects_protected_area: { value: true }, // 40% -> Total 120%
    });

    const result = analyzeBuildableArea(data, 50, 100);
    expect(result.totalDeductionsAcres).toBe(120);
    expect(result.estimatedNetDevelopableAcres).toBe(0);
    expect(result.estimatedSiteEfficiencyPct).toBe(0);
    expect(result.verdict).toBe('REJECT_CONSTRAINED');
  });

  it('handles missing parcel geometry gracefully without throwing', () => {
    const data = mockMireyeResponse(35.1495, -90.0490);
    const result = analyzeBuildableArea(data, 50, 0, null);

    expect(result.grossParcelAcres).toBeNull();
    expect(result.estimatedNetDevelopableAcres).toBeNull();
    expect(result.estimatedSiteEfficiencyPct).toBeNull();
    expect(result.confidence).toBe('Unavailable');
    expect(result.boundaryLabel).toBe('No Verified Geometry');
  });
});
