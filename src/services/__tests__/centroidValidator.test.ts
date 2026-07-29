import { describe, it, expect } from 'vitest';
import { validateCentroid, validateCentroidBatch, detectClusterOutlier } from '../centroidValidator';
import { mockMireyeResponse, POISONED_SITE } from './mockMireye';

// ── validateCentroid ──────────────────────────────────────────────────────────

describe('validateCentroid — road-snap detection', () => {

  it('flags ROAD_SNAP_LIKELY when road distance < 15m', () => {
    const data = mockMireyeResponse(39.9, -82.9, {
      nearest_major_road_distance_m: { value: 8 },
    });
    const result = validateCentroid('123 Main St, Columbus, OH 43215', data);

    const flag = result.flags.find(f => f.code === 'ROAD_SNAP_LIKELY');
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe('high');
    expect(result.overallRisk).toBe('high');
  });

  it('does NOT flag road snap when road distance is > 15m', () => {
    const data = mockMireyeResponse(39.9, -82.9, {
      nearest_major_road_distance_m: { value: 250 },
    });
    const result = validateCentroid('123 Main St, Columbus, OH 43215', data);

    expect(result.flags.find(f => f.code === 'ROAD_SNAP_LIKELY')).toBeUndefined();
  });

  it('POISONED_SITE fixture has road snap flag (8m from road)', () => {
    const result = validateCentroid('Test Site, OH 43215', POISONED_SITE);
    expect(result.flags.some(f => f.code === 'ROAD_SNAP_LIKELY')).toBe(true);
  });
});

describe('validateCentroid — flood boundary proximity', () => {

  it('flags FLOOD_BOUNDARY_PROXIMITY when confidence is medium', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      within_floodplain_polygon: { value: false, confidence: 'medium' },
    });
    const result = validateCentroid('456 River Rd, Chillicothe, OH 45601', data);

    const flag = result.flags.find(f => f.code === 'FLOOD_BOUNDARY_PROXIMITY');
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe('high');
    expect(flag!.poisonedFields).toContain('within_floodplain_polygon');
  });

  it('flags FLOOD_ZONE_UNRELIABLE when confidence is low', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      within_floodplain_polygon: { value: true, confidence: 'low' },
    });
    const result = validateCentroid('789 Creek Rd, OH 45601', data);

    const flag = result.flags.find(f => f.code === 'FLOOD_ZONE_UNRELIABLE');
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe('critical');
    expect(result.shouldBlock).toBe(true);
  });

  it('does NOT flag flood boundary when confidence is high', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      within_floodplain_polygon: { value: false, confidence: 'high' },
    });
    const result = validateCentroid('100 Clean Rd, Columbus, OH 43215', data);

    expect(result.flags.find(f => f.code === 'FLOOD_BOUNDARY_PROXIMITY')).toBeUndefined();
    expect(result.flags.find(f => f.code === 'FLOOD_ZONE_UNRELIABLE')).toBeUndefined();
  });
});

describe('validateCentroid — RTO seam proximity', () => {

  it('flags RTO_SEAM_PROXIMITY for OH PJM/MISO seam with medium transmission confidence', () => {
    // Ohio seam: lng -84.8 to -83.5, lat 39.0 to 41.5
    const data = mockMireyeResponse(40.0, -84.0, {
      nearest_transmission_line_distance_m: { value: 1000, confidence: 'medium' },
    });
    const result = validateCentroid('Seam Site, OH 43456', data);

    const flag = result.flags.find(f => f.code === 'RTO_SEAM_PROXIMITY');
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe('high');
  });

  it('does NOT flag RTO seam when transmission confidence is high', () => {
    const data = mockMireyeResponse(40.0, -84.0, {
      nearest_transmission_line_distance_m: { value: 1000, confidence: 'high' },
    });
    const result = validateCentroid('Clean Seam Site, OH 43456', data);

    expect(result.flags.find(f => f.code === 'RTO_SEAM_PROXIMITY')).toBeUndefined();
  });
});

describe('validateCentroid — address ambiguity', () => {

  it('flags ADDRESS_TOO_SHORT for very short addresses', () => {
    const data = mockMireyeResponse(39.0, -82.0);
    const result = validateCentroid('Lot 4', data);

    const flag = result.flags.find(f => f.code === 'ADDRESS_TOO_SHORT');
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe('critical');
    expect(result.shouldBlock).toBe(true);
  });

  it('flags ADDRESS_MISSING_STATE_ZIP when no state or ZIP present', () => {
    const data = mockMireyeResponse(39.0, -82.0);
    const result = validateCentroid('1234 Oak Avenue, Springfield', data);

    const flag = result.flags.find(f => f.code === 'ADDRESS_MISSING_STATE_ZIP');
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe('medium');
  });

  it('does NOT flag a well-formed address', () => {
    const data = mockMireyeResponse(39.9612, -82.9988);
    const result = validateCentroid('1234 Oak Avenue, Columbus, OH 43215', data);

    expect(result.flags.find(f => f.code?.startsWith('ADDRESS_'))).toBeUndefined();
  });

  it('does NOT flag a Nominatim-resolved address with full state name', () => {
    // Nominatim returns "Midland, Midland County, Texas" not "Midland, TX"
    // This was a false-positive bug — full state name should pass validation
    const data = mockMireyeResponse(31.9974, -102.0779);
    const result = validateCentroid('Midland, Midland County, Texas', data);

    expect(result.flags.find(f => f.code === 'ADDRESS_MISSING_STATE_ZIP')).toBeUndefined();
  });

  it('does NOT flag when full state name is in address (no abbreviation needed)', () => {
    const cases = [
      { address: 'Lubbock, Lubbock County, Texas', lat: 33.57, lng: -101.85 },
      { address: 'Columbus, Franklin County, Ohio', lat: 39.96, lng: -82.99 },
      { address: 'Charlotte, Mecklenburg County, North Carolina', lat: 35.22, lng: -80.84 },
    ];
    for (const c of cases) {
      const data = mockMireyeResponse(c.lat, c.lng);
      const result = validateCentroid(c.address, data);
      expect(result.flags.find(f => f.code === 'ADDRESS_MISSING_STATE_ZIP')).toBeUndefined();
    }
  });
});

describe('validateCentroid — overall risk + shouldBlock', () => {

  it('returns clean risk for a well-formed, clean-data site', () => {
    const data = mockMireyeResponse(39.9612, -82.9988);
    const result = validateCentroid('1234 Oak Avenue, Columbus, OH 43215', data);

    expect(result.overallRisk).toBe('clean');
    expect(result.shouldBlock).toBe(false);
    expect(result.centroidConfidenceScore).toBe(100);
  });

  it('shouldBlock is true only for critical risk', () => {
    const data = mockMireyeResponse(39.0, -82.0, {
      within_floodplain_polygon: { value: true, confidence: 'low' }, // critical
    });
    const result = validateCentroid('X', data); // ADDRESS_TOO_SHORT = critical

    expect(result.shouldBlock).toBe(true);
  });

  it('centroidConfidenceScore decreases with more flags', () => {
    const clean = validateCentroid(
      '1234 Oak Ave, Columbus, OH 43215',
      mockMireyeResponse(39.9612, -82.9988),
    );
    const flagged = validateCentroid(
      'Lot 4', // ADDRESS_TOO_SHORT = critical
      mockMireyeResponse(39.0, -82.0, {
        within_floodplain_polygon: { value: true, confidence: 'low' }, // critical
        nearest_major_road_distance_m: { value: 5 },                   // high
      }),
    );

    expect(clean.centroidConfidenceScore).toBeGreaterThan(flagged.centroidConfidenceScore);
  });

  it('includes inputAddress and resolvedLat/Lng in result', () => {
    const data = mockMireyeResponse(39.9612, -82.9988);
    const result = validateCentroid('1234 Oak Ave, Columbus, OH 43215', data);

    expect(result.inputAddress).toBe('1234 Oak Ave, Columbus, OH 43215');
    expect(result.resolvedLat).toBeCloseTo(39.9612, 3);
    expect(result.resolvedLng).toBeCloseTo(-82.9988, 3);
  });
});

// ── detectClusterOutlier ──────────────────────────────────────────────────────

describe('detectClusterOutlier', () => {

  it('flags a point that is far from the cluster centroid', () => {
    // Cluster is in Ohio
    const clusterLats = [39.9, 40.0, 39.8, 40.1];
    const clusterLngs = [-82.9, -83.0, -82.8, -83.1];

    // Outlier is in California (~3000 km away)
    const flag = detectClusterOutlier(37.7, -122.4, clusterLats, clusterLngs, 50);
    expect(flag).not.toBeNull();
    expect(flag!.code).toBe('CLUSTER_OUTLIER');
    expect(flag!.severity).toBe('critical');
  });

  it('does NOT flag a point within the cluster threshold', () => {
    const clusterLats = [39.9, 40.0, 39.8, 40.1];
    const clusterLngs = [-82.9, -83.0, -82.8, -83.1];

    // 20km from cluster centroid — within 50km threshold
    const flag = detectClusterOutlier(40.15, -83.2, clusterLats, clusterLngs, 50);
    expect(flag).toBeNull();
  });

  it('returns null when fewer than 2 cluster points provided', () => {
    const flag = detectClusterOutlier(40.0, -83.0, [39.9], [-82.9], 50);
    expect(flag).toBeNull();
  });
});

// ── validateCentroidBatch ─────────────────────────────────────────────────────

describe('validateCentroidBatch', () => {

  it('splits results into clean, flagged, and blocked buckets', () => {
    // All 3 sites are in OH cluster — no cluster outlier noise, only field-level flags
    const sites = [
      // Clean (no flags from this cluster)
      { address: '1234 Oak Ave, Columbus, OH 43215', data: mockMireyeResponse(39.96, -82.99) },
      // Blocked (critical — FLOOD_ZONE_UNRELIABLE = low confidence)
      { address: 'X', data: mockMireyeResponse(39.0, -82.0, {
          within_floodplain_polygon: { value: true, confidence: 'low' },
        }),
      },
    ];

    const result = validateCentroidBatch(sites);

    // At least one site blocked (the low-confidence flood site)
    expect(result.blocked.length).toBeGreaterThanOrEqual(1);
    // Ambiguous address 'X' is in requeuAddresses
    expect(result.requeuAddresses).toContain('X');
    // Total blocked + clean + flagged = all sites
    const total = result.clean.length + result.flagged.length + result.blocked.length;
    expect(total).toBe(sites.length);
  });

  it('detects cluster outlier in batch automatically', () => {
    const ohioSites = [
      { address: '1 Main St, Columbus, OH 43215', data: mockMireyeResponse(39.9, -82.9) },
      { address: '2 Main St, Columbus, OH 43215', data: mockMireyeResponse(40.0, -83.0) },
      { address: '3 Main St, Columbus, OH 43215', data: mockMireyeResponse(39.8, -82.8) },
      // Outlier geocoded to California
      { address: '123 Main St', data: mockMireyeResponse(37.7, -122.4) },
    ];

    const result = validateCentroidBatch(ohioSites);
    const outlierBlocked = result.blocked.find(r => r.resolvedLat < 38);
    expect(outlierBlocked).toBeDefined();
  });
});
