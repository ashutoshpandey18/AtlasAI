import { NextResponse } from 'next/server';

const globalForCache = global as unknown as {
  _mireyeAskCache?: Map<string, any>;
};

if (!globalForCache._mireyeAskCache) {
  globalForCache._mireyeAskCache = new Map();
}
const cache = globalForCache._mireyeAskCache;

export async function POST(req: Request) {
  try {
    const { lat, lng, question } = await req.json();
    const token = process.env.MIREYE_API_TOKEN || process.env.NEXT_PUBLIC_MIREYE_API_TOKEN;



    if (!token) {
      return NextResponse.json({ error: 'Mireye API token is not configured on the server.' }, { status: 500 });
    }

    const roundedLat = typeof lat === 'number' ? lat.toFixed(4) : String(lat);
    const roundedLng = typeof lng === 'number' ? lng.toFixed(4) : String(lng);
    const cacheKey = `${roundedLat},${roundedLng},${question.trim().toLowerCase()}`;

    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey));
    }

    const res = await fetch('https://api.mireye.com/v1/ask', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng, question }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Mireye Ask request failed' }, { status: res.status });
    }

    const data = await res.json();
    
    // Save to cache
    cache.set(cacheKey, data);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
