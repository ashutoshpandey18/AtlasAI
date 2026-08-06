import { getCache, setCache } from './db';

// In-flight request deduplication map (prevents duplicate network requests for identical parameters)
const inFlightRequests = new Map<string, Promise<any>>();

export interface MireyeFetchParams {
  lat: number;
  lng: number;
  fields: string[];
  bypassCache?: boolean;
}

/**
 * Resilient Mireye API Fetch Client
 * Supports HTTP 429 Retry-After header, exponential backoff (250ms -> 500ms -> 1000ms -> 2000ms),
 * adaptive request pacing, in-flight deduplication, and edge cache fallback.
 */
export async function fetchMireyeResilient(
  params: MireyeFetchParams,
  token?: string
): Promise<any> {
  const { lat, lng, fields, bypassCache } = params;
  const sortedFields = [...fields].sort().join(',');
  const cacheKey = `mireye-fetch-v3:${lat.toFixed(4)},${lng.toFixed(4)},${sortedFields}`;

  // 1. In-flight Deduplication Guard: reuse active Promise if identical request is currently processing
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      // 2. Check edge database cache first (bypassed in LIVE_DEMO_MODE or FORCE_LIVE_MIREYE / Live Verification Mode)
      const isForceLive = Boolean(bypassCache) || process.env.FORCE_LIVE_MIREYE === 'true' || process.env.NEXT_PUBLIC_FORCE_LIVE_MIREYE === 'true';
      const isLiveDemo = process.env.LIVE_DEMO_MODE === 'true' || isForceLive;
      if (!isLiveDemo) {
        const cached = await getCache(cacheKey);
        if (cached && cached.fields) {
          console.log(`⚡ CACHE HIT\nKey: ${cacheKey}`);
          console.log(`[FETCH]\nCoordinates: ${lat}, ${lng}\nFields: ${sortedFields}\nCache Key: ${cacheKey}\nCache HIT / MISS: HIT\nLive Mireye Request Executed: NO\nCache Written: NO\n------------------------------------------------`);
          return { ...cached, _cacheHit: true };
        }
      }

      if (!token) {
        return null;
      }

      console.log(`[FETCH]\nCoordinates: ${lat}, ${lng}\nFields: ${sortedFields}\nCache Key: ${cacheKey}\nCache HIT / MISS: MISS\nLive Mireye Request Executed: YES\nCache Written: YES`);
      console.log(`🌍 LIVE MIREYE REQUEST\nEndpoint: /v1/fetch\nTimestamp: ${new Date().toISOString()}\n------------------------------------------------`);
      const startTime = Date.now();

      // 3. Execute with Exponential Backoff & 429 Retry-After compliance
      const backoffDelays = [250, 500, 1000, 2000];
      let attempt = 0;

      while (attempt <= backoffDelays.length) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const res = await fetch('https://api.mireye.com/v1/fetch', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lat, lng, fields }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data && data.fields) {
              console.log(`✅ MIREYE RESPONSE RECEIVED\nStatus: ${res.status}\nDuration: ${Date.now() - startTime}ms`);
              console.log(`💾 CACHE WRITE\nKey: ${cacheKey}\nTTL: 7776000\n------------------------------------------------`);
              await setCache(cacheKey, data);
              return { ...data, _cacheHit: false };
            }
          } else if (res.status === 429) {
            // Respect Mireye HTTP 429 Retry-After header if present
            const retryAfterHeader = res.headers.get('retry-after');
            let delayMs = backoffDelays[attempt] || 2000;
            if (retryAfterHeader) {
              const seconds = parseInt(retryAfterHeader, 10);
              if (!isNaN(seconds) && seconds > 0) {
                delayMs = seconds * 1000;
              }
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else if (res.status >= 500 && attempt < backoffDelays.length) {
            // Retry server errors with exponential backoff
            await new Promise((resolve) => setTimeout(resolve, backoffDelays[attempt]));
          } else {
            break;
          }
        } catch (e: any) {
          if (attempt >= backoffDelays.length) break;
          await new Promise((resolve) => setTimeout(resolve, backoffDelays[attempt]));
        }

        attempt++;
      }
    } finally {
      // Clean up in-flight request map once finished
      inFlightRequests.delete(cacheKey);
    }

    return null;
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export interface MireyeProximityParams {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  mode?: 'driving' | 'straightline';
  units?: 'miles' | 'km';
  bypassCache?: boolean;
}

/**
 * Resilient Mireye Proximity API Client
 * Executes HTTP POST to https://api.mireye.com/v1/proximity with official schema:
 * { op: "distance", origins: ["lat,lng"], destinations: ["lat,lng"], mode: "driving", units: "miles" }
 */
export async function fetchMireyeProximityResilient(
  params: MireyeProximityParams,
  token?: string
): Promise<any> {
  const { originLat, originLng, destLat, destLng, mode = 'driving', units = 'miles', bypassCache } = params;
  const cacheKey = `mireye-proximity-v2:${originLat.toFixed(4)},${originLng.toFixed(4)}:${destLat.toFixed(4)},${destLng.toFixed(4)}:${mode}:${units}`;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const proxPromise = (async () => {
    try {
      const isForceLive = Boolean(bypassCache) || process.env.FORCE_LIVE_MIREYE === 'true' || process.env.NEXT_PUBLIC_FORCE_LIVE_MIREYE === 'true';
      const isLiveDemo = process.env.LIVE_DEMO_MODE === 'true' || isForceLive;
      if (!isLiveDemo) {
        const cached = await getCache(cacheKey);
        if (cached && (cached.legs || cached.matrix || cached.duration_seconds || cached.driveTimeMinutes)) {
          console.log(`⚡ CACHE HIT\nKey: ${cacheKey}`);
          console.log(`[PROXIMITY]\nOrigin: ${originLat}, ${originLng}\nDestination: ${destLat}, ${destLng}\nCache HIT / MISS: HIT\nLive Mireye Request Executed: NO\nCache Written: NO\n------------------------------------------------`);
          return { ...cached, _cacheHit: true };
        }
      }

      if (!token) return null;

      console.log(`[PROXIMITY]\nOrigin: ${originLat}, ${originLng}\nDestination: ${destLat}, ${destLng}\nCache HIT / MISS: MISS\nLive Mireye Request Executed: YES\nCache Written: YES`);
      console.log(`🌍 LIVE MIREYE REQUEST\nEndpoint: /v1/proximity\nTimestamp: ${new Date().toISOString()}\n------------------------------------------------`);
      const startTime = Date.now();

      const backoffDelays = [250, 500, 1000, 2000];
      let attempt = 0;

      while (attempt <= backoffDelays.length) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const res = await fetch('https://api.mireye.com/v1/proximity', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              op: 'distance',
              origins: [`${originLat},${originLng}`],
              destinations: [`${destLat},${destLng}`],
              mode,
              units,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data) {
              console.log(`✅ MIREYE RESPONSE RECEIVED\nStatus: ${res.status}\nDuration: ${Date.now() - startTime}ms`);
              console.log(`💾 CACHE WRITE\nKey: ${cacheKey}\nTTL: 7776000\n------------------------------------------------`);
              await setCache(cacheKey, data);
              return { ...data, _cacheHit: false };
            }
          } else if (res.status === 422) {
            console.error(`❌ MIREYE API HTTP 422: Invalid proximity request schema`);
            return { error: 'invalid_request', message: 'Invalid proximity request', status: 422 };
          } else if (res.status === 429) {
            const retryAfterHeader = res.headers.get('retry-after');
            let delayMs = backoffDelays[attempt] || 2000;
            if (retryAfterHeader) {
              const seconds = parseInt(retryAfterHeader, 10);
              if (!isNaN(seconds) && seconds > 0) delayMs = seconds * 1000;
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else if (res.status >= 500 && attempt < backoffDelays.length) {
            await new Promise((resolve) => setTimeout(resolve, backoffDelays[attempt]));
          } else {
            break;
          }
        } catch (e: any) {
          if (attempt >= backoffDelays.length) break;
          await new Promise((resolve) => setTimeout(resolve, backoffDelays[attempt]));
        }
        attempt++;
      }
    } finally {
      inFlightRequests.delete(cacheKey);
    }
    return null;
  })();

  inFlightRequests.set(cacheKey, proxPromise);
  return proxPromise;
}
