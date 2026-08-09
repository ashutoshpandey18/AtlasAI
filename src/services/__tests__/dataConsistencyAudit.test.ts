import { describe, it, expect } from 'vitest';
import { analyzeBuildableArea } from '../buildableAreaHarness';
import { evaluateSiteTechnicalFeasibility } from '../../agent/evaluator';

describe('Atlas Data Consistency & Provenance Audit Suite', () => {
  it('correctly attributes GeoJSON parcel acreage vs Site Dossier acreage', () => {
    const geoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [-97.7431, 30.2672],
          [-97.7411, 30.2672],
          [-97.7411, 30.2652],
          [-97.7431, 30.2652],
          [-97.7431, 30.2672],
        ]
      ]
    };

    const report = analyzeBuildableArea(null, 20, 100, geoJsonPolygon, false, true);

    expect(report.boundaryLabel).toBe('Verified Parcel Boundary');
    expect(report.isGeometryAuthoritative).toBe(true);
    expect(report.confidence).toBe('High');
    expect(report.grossParcelAcres).toBeGreaterThan(0);
  });

  it('correctly labels pre-feasibility model estimate when no physical indicators are present', () => {
    const report = analyzeBuildableArea(null, 20, 50, null, true, false);

    expect(report.confidence).toBe('Pre-Feasibility Model Estimate');
    expect(report.provenance).toContain('Assessment used parcel geometry only');
    expect(report.methodology).toBe('Atlas Civil Deduction Model');
  });

  it('ensures slope rejection reason strictly pairs with slope evidence', () => {
    const mockMireyeSlopeData: any = {
      fields: {
        slope_degrees: { value: 7.8 },
        within_floodplain_polygon: { value: false },
      }
    };

    const res = evaluateSiteTechnicalFeasibility('test-slope-1', 'Test Slope Site', 'Austin County', mockMireyeSlopeData);

    expect(res.hasDealKiller).toBe(true);
    const slopeFlaw = res.fatalFlaws.find(f => f.flawType === 'SLOPE');
    expect(slopeFlaw).toBeDefined();
    expect(slopeFlaw?.description).toContain('7.8°');
    
    const slopeInput = res.decisionLedger.inputsChecked.find(i => i.includes('Slope'));
    expect(slopeInput).toContain('7.8°');
  });

  it('ensures flood rejection reason strictly pairs with flood evidence', () => {
    const mockMireyeFloodData: any = {
      fields: {
        slope_degrees: { value: 1.2 },
        within_floodplain_polygon: { value: true },
      }
    };

    const res = evaluateSiteTechnicalFeasibility('test-flood-1', 'Test Flood Site', 'Harris County', mockMireyeFloodData);

    expect(res.hasDealKiller).toBe(true);
    const floodFlaw = res.fatalFlaws.find(f => f.flawType === 'FLOODPLAIN');
    expect(floodFlaw).toBeDefined();
    
    const floodInput = res.decisionLedger.inputsChecked.find(i => i.includes('Flood'));
    expect(floodInput).toContain('Zone AE');
  });
});
