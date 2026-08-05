import { getCache, setCache } from './db';

// In-flight request deduplication map (prevents duplicate network requests for identical parameters)
const inFlightRequests = new Map<string, Promise<any>>();

export interface MireyeFetchParams {
  lat: number;
  lng: number;
  fields: string[];
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
  const { lat, lng, fields } = params;
  const sortedFields = [...fields].sort().join(',');
  const cacheKey = `mireye-fetch-v3:${lat.toFixed(4)},${lng.toFixed(4)},${sortedFields}`;

  // 1. In-flight Deduplication Guard: reuse active Promise if identical request is currently processing
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      // 2. Check edge database cache first
      const cached = await getCache(cacheKey);
      if (cached && cached.fields) {
        return cached;
      }

      if (!token) {
        return null;
      }

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
              await setCache(cacheKey, data);
              return data;
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
  mode?: 'drive_time' | 'geodesic';
}

/**
 * Resilient Mireye Proximity API Client
 * Executes HTTP POST to https://api.mireye.com/v1/proximity with caching, deduplication, and 429 retry backoff.
 */
export async function fetchMireyeProximityResilient(
  params: MireyeProximityParams,
  token?: string
): Promise<any> {
  const { originLat, originLng, destLat, destLng, mode = 'drive_time' } = params;
  const cacheKey = `mireye-proximity-v1:${originLat.toFixed(4)},${originLng.toFixed(4)}:${destLat.toFixed(4)},${destLng.toFixed(4)}:${mode}`;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const proxPromise = (async () => {
    try {
      const cached = await getCache(cacheKey);
      if (cached && (cached.matrix || cached.duration_seconds || cached.driveTimeMinutes)) {
        return cached;
      }

      if (!token) return null;

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
              origins: [{ lat: originLat, lng: originLng }],
              destinations: [{ lat: destLat, lng: destLng }],
              mode,
              units: 'meters',
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data) {
              await setCache(cacheKey, data);
              return data;
            }
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
