import { describe, it, expect } from 'vitest';
import { getLmpMarketPrices } from '../liveLmpGridTracker';

describe('liveLmpGridTracker — Energy Market LMP Pricing', () => {
  it('calculates live LMP pricing for ERCOT region', () => {
    const data = getLmpMarketPrices('ERCOT', 100);

    expect(data.rtoRegion).toBe('ERCOT');
    expect(data.currentLmpUsdPerMwh).toBeGreaterThan(30);
    expect(data.peakLmpUsdPerMwh).toBeGreaterThan(data.currentLmpUsdPerMwh);
    expect(data.estimatedSolarRevenuePerMwYear).toBeGreaterThan(0);
  });

  it('calculates live LMP pricing for PJM region', () => {
    const data = getLmpMarketPrices('PJM', 50);

    expect(data.rtoRegion).toBe('PJM');
    expect(data.currentLmpUsdPerMwh).toBeGreaterThan(40);
    expect(data.estimatedDataCenterCostPerMwYear).toBeGreaterThan(0);
  });
});
