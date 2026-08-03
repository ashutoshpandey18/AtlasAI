// src/services/addressLookupService.ts
// Sub-second batch address resolution service using Mireye /v1/lookup endpoint

export interface AddressInputItem {
  id: string;
  siteName?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
}

export interface ResolvedAddressResult {
  siteId: string;
  siteName: string;
  county: string;
  state: string;
  lat: number;
  lng: number;
  resolvedAddress: string;
}

export interface BatchResolutionResponse {
  resolved: ResolvedAddressResult[];
  skippedCount: number;
}

const lookupCache = new Map<string, ResolvedAddressResult>();

/**
 * Resolves a single property address to latitude/longitude using Mireye /v1/lookup
 */
export async function resolveSingleAddress(item: AddressInputItem): Promise<ResolvedAddressResult | null> {
  const fullAddress = [item.address, item.city, item.state, item.zip].filter(Boolean).join(', ');
  const cacheKey = fullAddress.toLowerCase().trim();

  if (lookupCache.has(cacheKey)) {
    return lookupCache.get(cacheKey)!;
  }

  try {
    const res = await fetch('/api/mireye/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: fullAddress,
        city: item.city,
        state: item.state,
        zip: item.zip,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number' && !isNaN(data.lat) && !isNaN(data.lng)) {
        const result: ResolvedAddressResult = {
          siteId: item.id,
          siteName: item.siteName || data.address || item.address,
          county: data.county || item.county || 'Custom County',
          state: (data.state || item.state || 'TX').toUpperCase(),
          lat: data.lat,
          lng: data.lng,
          resolvedAddress: data.address || fullAddress,
        };
        lookupCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // Network fallback handled gracefully
  }

  return null;
}

/**
 * Executes chunked parallel batch resolution across an address list
 */
export async function resolveBatchAddresses(
  items: AddressInputItem[],
  onProgress?: (current: number, total: number) => void
): Promise<BatchResolutionResponse> {
  const resolved: ResolvedAddressResult[] = [];
  let skippedCount = 0;
  const total = items.length;

  const BATCH_SIZE = 10;
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    const chunkResults = await Promise.all(chunk.map((item) => resolveSingleAddress(item)));

    for (const res of chunkResults) {
      if (res) {
        resolved.push(res);
      } else {
        skippedCount++;
      }
    }

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, total), total);
    }
  }

  return { resolved, skippedCount };
}
