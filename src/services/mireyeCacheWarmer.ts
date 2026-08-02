// src/services/mireyeCacheWarmer.ts
// Pre-warms in-memory RAM cache for sub-300ms agent live scans

import { setCache, getCache } from './db';
import fs from 'fs';
import path from 'path';

let isWarmerInitialized = false;

export async function warmMireyeCache(): Promise<number> {
  if (isWarmerInitialized) return 0;
  isWarmerInitialized = true;

  try {
    let enrichedPath = path.join(process.cwd(), 'data/tx_statewide_matches_enriched.json');
    if (!fs.existsSync(enrichedPath)) {
      enrichedPath = path.join(process.cwd(), '../dollar-general-solar/data/tx_statewide_matches_enriched.json');
    }

    if (!fs.existsSync(enrichedPath)) return 0;

    const rawJson = JSON.parse(fs.readFileSync(enrichedPath, 'utf8'));
    const items = Array.isArray(rawJson) ? rawJson : (rawJson.enriched || []);
    let count = 0;

    const sortedFields = [
      'poa_irradiance_optimal_tilt_kwh_m2_yr',
      'slope_degrees',
      'within_floodplain_polygon',
      'transmission_line_distance_m',
      'tree_canopy_pct',
    ].sort().join(',');

    for (const item of items) {
      if (item.lat && (item.lon || item.lng) && item.mireye) {
        const lat = Number(item.lat);
        const lng = Number(item.lon ?? item.lng);
        const key = `mireye-fetch:${lat.toFixed(4)},${lng.toFixed(4)},${sortedFields}`;

        // Check if already in memory
        const existing = await getCache(key);
        if (!existing) {
          await setCache(key, item.mireye);
          count++;
        }
      }
    }

    console.log(`[Mireye Cache Warmer] Pre-warmed ${count} portfolio candidate sites into 0ms RAM cache.`);
    return count;
  } catch (err) {
    console.error('[Mireye Cache Warmer] Initialization error:', err);
    return 0;
  }
}
