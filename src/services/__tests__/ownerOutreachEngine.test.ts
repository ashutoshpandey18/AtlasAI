import { describe, it, expect } from 'vitest';
import { generateLandLoi } from '../ownerOutreachEngine';
import { mockMireyeResponse } from './mockMireye';

describe('ownerOutreachEngine — Letter of Intent Generation', () => {
  it('generates a formal LOI for Solar Farm siting', () => {
    const data = mockMireyeResponse(31.9974, -102.0779);
    const result = generateLandLoi('Midland, TX 79701', data, 'Solar Farm', 100);

    expect(result.totalAcres).toBe(100);
    expect(result.estimatedAnnualLeasePerAcre).toBe(1400);
    expect(result.totalAnnualLeasePayment).toBe(140000);
    expect(result.loiText).toContain('LETTER OF INTENT TO LEASE REAL PROPERTY');
    expect(result.loiText).toContain('Midland Land Holdings LLC');
  });

  it('adjusts lease rates for Data Center siting', () => {
    const data = mockMireyeResponse(39.6012, -82.9463);
    const result = generateLandLoi('Columbus, OH 43215', data, 'Data Center', 50, 'Buckeye Infrastructure Corp');

    expect(result.estimatedAnnualLeasePerAcre).toBe(3500);
    expect(result.totalAnnualLeasePayment).toBe(175000);
    expect(result.ownerName).toBe('Buckeye Infrastructure Corp');
  });
});
