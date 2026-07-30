import { describe, it, expect } from 'vitest';
import { analyzeBuildableArea } from '../buildableAreaHarness';
import { mockMireyeResponse } from './mockMireye';

describe('buildableAreaHarness — Net Buildable Acreage & Verdicts', () => {
  it('returns READY_FOR_SITE_CONTROL for a completely clean site', () => {
    const data = mockMireyeResponse(39.6012, -82.9463); // clean site
    const result = analyzeBuildableArea(data, 50, 100);

    expect(result.netBuildableAcres).toBe(100);
    expect(result.buildableEfficiencyPct).toBe(100);
    expect(result.deductions.length).toBe(0);
    expect(result.verdict).toBe('READY_FOR_SITE_CONTROL');
  });

  it('calculates flood zone deduction correctly', () => {
    const data = mockMireyeResponse(35.1495, -90.0490, {
      within_floodplain_polygon: { value: true },
    });
    const result = analyzeBuildableArea(data, 50, 100);

    expect(result.deductions.some((d) => d.code === 'FEMA_FLOOD_DEDUCTION')).toBe(true);
    expect(result.totalDeductionsAcres).toBe(35);
    expect(result.netBuildableAcres).toBe(65);
    expect(result.verdict).toBe('READY_FOR_SITE_CONTROL');
  });

  it('emits NEEDS_PARCEL_ASSEMBLY when net buildable acres < target acres', () => {
    const data = mockMireyeResponse(35.1495, -90.0490, {
      within_floodplain_polygon: { value: true },
    }); // 65 net buildable
    // Set target requirement to 80 acres (65 buildable is < 80 target -> needs assembly)
    const result = analyzeBuildableArea(data, 80, 100);

    expect(result.verdict).toBe('NEEDS_PARCEL_ASSEMBLY');
    expect(result.verdictLabel).toContain('PARCEL ASSEMBLY');
  });

  it('emits REJECT_CONSTRAINED when combined flood and protected easements severely limit buildable area', () => {
    const data = mockMireyeResponse(35.1495, -90.0490, {
      within_floodplain_polygon: { value: true },
      intersects_protected_area: { value: true },
    });

    const result = analyzeBuildableArea(data, 80, 100);

    expect(result.verdict).toBe('REJECT_CONSTRAINED');
  });
});
