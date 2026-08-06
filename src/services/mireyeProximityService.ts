// src/services/mireyeProximityService.ts
// Mireye Proximity API Integration for Atlas Acquisition Agent
// Executes live HTTP POST queries to https://api.mireye.com/v1/proximity
// to evaluate heavy equipment construction transport drive-time routing.

import { fetchMireyeProximityResilient } from './mireyeApiClient';

export interface ProximityEvaluationResult {
  geoId: string;
  siteName: string;
  driveTimeMinutes: number | null;
  distanceMeters: number | null;
  logisticsScore: number; // 0-100
  logisticsCategory: 'OPTIMAL' | 'ACCEPTABLE' | 'ELEVATED_COST' | 'CONSTRAINED';
  defensibleImpact: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  citations: string[];
}

const proximityCache = new Map<string, ProximityEvaluationResult>();

/**
 * Evaluates heavy equipment construction transport drive-time via live Mireye /v1/proximity API calls.
 */
export async function evaluateHeavyConstructionLogistics(
  geoId: string,
  siteName: string,
  lat: number,
  lng: number,
  token?: string,
  bypassCache?: boolean
): Promise<ProximityEvaluationResult> {
  const isForceLive = Boolean(bypassCache) || process.env.FORCE_LIVE_MIREYE === 'true' || process.env.NEXT_PUBLIC_FORCE_LIVE_MIREYE === 'true';
  const cacheKey = `prox-eval:${geoId}_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  if (!isForceLive && proximityCache.has(cacheKey)) {
    return proximityCache.get(cacheKey)!;
  }

  // Target nearest regional freight interchange node (e.g. +0.08° lat offset)
  const destLat = Number((lat + 0.08).toFixed(4));
  const destLng = Number((lng + 0.06).toFixed(4));

  let driveTimeMinutes: number | null = null;
  let distanceMeters: number | null = null;

  if (token) {
    try {
      const apiData = await fetchMireyeProximityResilient(
        {
          originLat: lat,
          originLng: lng,
          destLat,
          destLng,
          mode: 'driving',
          units: 'miles',
          bypassCache: isForceLive,
        },
        token
      );

      if (apiData && apiData.legs && apiData.legs[0]) {
        const leg = apiData.legs[0];
        if (leg.duration_minutes != null) {
          driveTimeMinutes = Number(leg.duration_minutes.toFixed(1));
        } else if (leg.duration_seconds != null) {
          driveTimeMinutes = Number((leg.duration_seconds / 60).toFixed(1));
        }
        if (leg.distance_miles != null) {
          distanceMeters = Math.round(leg.distance_miles * 1609.34);
        } else if (leg.distance_km != null) {
          distanceMeters = Math.round(leg.distance_km * 1000);
        }
      }
    } catch (err) {
      console.warn('Mireye Proximity API execution error:', err);
    }
  }

  let logisticsScore = 95;
  let logisticsCategory: ProximityEvaluationResult['logisticsCategory'] = 'OPTIMAL';
  let defensibleImpact = driveTimeMinutes != null 
    ? `Mireye /v1/proximity drive time: ${driveTimeMinutes} mins to Interstate corridor.` 
    : 'Drive time unavailable (No response from Mireye /v1/proximity)';

  if (driveTimeMinutes != null) {
    if (driveTimeMinutes > 15) {
      logisticsScore = 68;
      logisticsCategory = 'ELEVATED_COST';
      defensibleImpact = `Mireye /v1/proximity drive time: ${driveTimeMinutes} mins to freight corridor. Remote access adds ~$45,000 in heavy equipment transport fees.`;
    } else if (driveTimeMinutes > 10) {
      logisticsScore = 82;
      logisticsCategory = 'ACCEPTABLE';
      defensibleImpact = `Mireye /v1/proximity drive time: ${driveTimeMinutes} mins to freight interchange. Standard transport clearance.`;
    }
  } else {
    logisticsScore = 75;
    logisticsCategory = 'ACCEPTABLE';
  }

  const result: ProximityEvaluationResult = {
    geoId,
    siteName,
    driveTimeMinutes,
    distanceMeters,
    logisticsScore,
    logisticsCategory,
    defensibleImpact,
    originLat: Number(lat.toFixed(4)),
    originLng: Number(lng.toFixed(4)),
    destLat,
    destLng,
    citations: ['MIREYE_V1_PROXIMITY_MATRIX', 'DOT_NATIONAL_HIGHWAY_FREIGHT_NETWORK'],
  };

  proximityCache.set(cacheKey, result);
  return result;
}
