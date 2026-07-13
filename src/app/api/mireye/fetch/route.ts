import { NextResponse } from 'next/server';

// Global cache variable to persist across hot reloads in development
const globalForCache = global as unknown as {
  _mireyeFetchCache?: Map<string, any>;
};

if (!globalForCache._mireyeFetchCache) {
  globalForCache._mireyeFetchCache = new Map();
}
const cache = globalForCache._mireyeFetchCache;

export async function POST(req: Request) {
  try {
    const { lat, lng, fields } = await req.json();
    const token = process.env.MIREYE_API_TOKEN || process.env.NEXT_PUBLIC_MIREYE_API_TOKEN;



    if (!token) {
      return NextResponse.json({ error: 'Mireye API token is not configured on the server.' }, { status: 500 });
    }

    // Round coordinates slightly to improve cache hits for similar area lookups
    const roundedLat = typeof lat === 'number' ? lat.toFixed(4) : String(lat);
    const roundedLng = typeof lng === 'number' ? lng.toFixed(4) : String(lng);
    const sortedFields = Array.isArray(fields) ? [...fields].sort().join(',') : '';
    const cacheKey = `${roundedLat},${roundedLng},${sortedFields}`;

    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey));
    }

    const res = await fetch('https://api.mireye.com/v1/fetch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng, fields }),
    });

    if (!res.ok) {
      let detail = `Mireye API error (${res.status})`;
      try {
        const err = await res.json();
        if (err.detail) detail = err.detail;
      } catch {}
      return NextResponse.json({ error: detail }, { status: res.status });
    }

    const data = await res.json();
    
    // Save to server-side cache
    cache.set(cacheKey, data);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
