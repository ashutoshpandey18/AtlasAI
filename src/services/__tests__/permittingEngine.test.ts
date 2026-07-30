import { describe, it, expect } from 'vitest';
import { analyzeEnvironmentalPermitting } from '../permittingEngine';
import { mockMireyeResponse } from './mockMireye';

describe('permittingEngine — Environmental Permitting Lead Time', () => {
  it('calculates fast-track permitting for clean site', () => {
    const data = mockMireyeResponse(39.6012, -82.9463);
    const result = analyzeEnvironmentalPermitting(data, 'Solar Farm');

    expect(result.permittingCategory).toBe('FAST_TRACK_ELIGIBLE');
    expect(result.estimatedLeadTimeMonths).toBeLessThanOrEqual(6);
    expect(result.clearanceRiskScore).toBeGreaterThanOrEqual(80);
  });

  it('detects USACE Section 404 requirement when wetland intersects', () => {
    const data = mockMireyeResponse(35.1495, -90.0490, {
      intersects_wetland: { value: true },
    });
    const result = analyzeEnvironmentalPermitting(data, 'Solar Farm');

    expect(result.permittingCategory).toBe('STANDARD_PERMITTING');
    expect(result.requiredPermits.some((p) => p.code === 'USACE_404')).toBe(true);
    expect(result.estimatedLeadTimeMonths).toBe(18);
  });
});
