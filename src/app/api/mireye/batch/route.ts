import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/services/db';

interface BatchCoordinate {
  id: string;
  lat: number;
  lng: number;
}

export async function POST(req: Request) {
  try {
    const { coordinates, fields } = await req.json() as {
      coordinates: BatchCoordinate[];
      fields: string[];
    };

    const token = process.env.MIREYE_API_TOKEN || process.env.NEXT_PUBLIC_MIREYE_API_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Mireye API token not configured.' }, { status: 500 });
    }

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return NextResponse.json({ error: 'coordinates must be a non-empty array.' }, { status: 400 });
    }

    const sortedFields = [...fields].sort().join(',');

    // Check cache for each coordinate individually so we re-use existing single-fetch hits
    const cacheResults: Record<string, unknown> = {};
    const uncachedCoords: BatchCoordinate[] = [];

    for (const coord of coordinates) {
      const key = `mireye-fetch:${coord.lat.toFixed(4)},${coord.lng.toFixed(4)},${sortedFields}`;
      const cached = await getCache(key);
      if (cached) {
        cacheResults[coord.id] = cached;
      } else {
        uncachedCoords.push(coord);
      }
    }

    // Batch uncached coordinates in chunks of 25 (Mireye limit)
    const CHUNK_SIZE = 25;
    const fetchedResults: Record<string, unknown> = {};

    for (let i = 0; i < uncachedCoords.length; i += CHUNK_SIZE) {
      const chunk = uncachedCoords.slice(i, i + CHUNK_SIZE);

      const res = await fetch('https://api.mireye.com/v1/fetch/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations: chunk.map((c) => ({ lat: c.lat, lng: c.lng })),
          fields,
        }),
      });

      if (!res.ok) {
        // Batch endpoint unavailable — fall back to parallel single fetches
        console.warn(`[Mireye Batch] Status ${res.status} — falling back to parallel single fetches`);
        const fallbacks = await Promise.all(
          chunk.map(async (coord) => {
            const singleRes = await fetch('https://api.mireye.com/v1/fetch', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ lat: coord.lat, lng: coord.lng, fields }),
            });
            if (!singleRes.ok) return [coord, null] as const;
            return [coord, await singleRes.json()] as const;
          })
        );
        for (const [coord, data] of fallbacks) {
          if (data) fetchedResults[coord.id] = data;
        }
        continue;
      }

      const batchData = await res.json() as { results: unknown[] };
      for (let j = 0; j < chunk.length; j++) {
        const coord = chunk[j];
        const result = batchData.results?.[j] ?? null;
        if (result) {
          fetchedResults[coord.id] = result;
          // Cache each result under the standard single-fetch key
          const key = `mireye-fetch:${coord.lat.toFixed(4)},${coord.lng.toFixed(4)},${sortedFields}`;
          await setCache(key, result);
        }
      }
    }

    return NextResponse.json({ results: { ...cacheResults, ...fetchedResults } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
