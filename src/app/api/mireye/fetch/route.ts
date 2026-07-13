import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/services/db';

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
    const cacheKey = `mireye-fetch:${roundedLat},${roundedLng},${sortedFields}`;

    // Read from Turso persistent edge cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`[Turso Cache Hit] Mireye Fetch: ${cacheKey}`);
      return NextResponse.json(cachedData);
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
    
    // Save to Turso persistent edge cache
    await setCache(cacheKey, data);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
