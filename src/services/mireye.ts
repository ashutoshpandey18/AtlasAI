import type { MireyeFetchResponse } from '../types/mireye';

export async function fetchFields(
  lat: number,
  lng: number,
  fields: string[]
): Promise<MireyeFetchResponse> {
  const res = await fetch('/api/mireye/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, fields }),
  });

  if (!res.ok) {
    let detail = `Mireye API error (${res.status})`;
    try {
      const err = await res.json();
      if (err.error) detail = err.error;
    } catch {}
    throw new Error(detail);
  }

  return res.json() as Promise<MireyeFetchResponse>;
}

/**
 * Fetch fields for multiple coordinates in one request using /v1/fetch/batch.
 * Returns a Map<locationId, MireyeFetchResponse>. Automatically falls back to
 * parallel single fetches if the batch endpoint is unavailable.
 */
export async function fetchFieldsBatch(
  coordinates: Array<{ id: string; lat: number; lng: number }>,
  fields: string[]
): Promise<Map<string, MireyeFetchResponse>> {
  const res = await fetch('/api/mireye/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates, fields }),
  });

  if (!res.ok) {
    // Fall back to parallel single fetches
    const results = await Promise.all(
      coordinates.map(async (coord) => {
        const data = await fetchFields(coord.lat, coord.lng, fields);
        return [coord.id, data] as const;
      })
    );
    return new Map(results);
  }

  const { results } = await res.json() as { results: Record<string, MireyeFetchResponse> };
  return new Map(Object.entries(results));
}

export async function askQuestion(
  lat: number,
  lng: number,
  question: string
): Promise<string> {
  try {
    const res = await fetch('/api/mireye/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng, question }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return (data.answer as string) || '';
  } catch {
    return '';
  }
}
