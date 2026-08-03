// src/app/api/mireye/lookup/route.ts
// Genuine Mireye /v1/lookup route for address and APN parcel ID geocoding

import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/services/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const address = String(body.address || body.query || '').trim();
    const apn = String(body.apn || '').trim();

    if (!address && !apn) {
      return NextResponse.json({ error: 'Either address or apn parameter is required' }, { status: 400 });
    }

    const reqState = String(body.state || '').trim().toUpperCase();
    const token = process.env.MIREYE_API_TOKEN || process.env.MIREYE_TOKEN || process.env.NEXT_PUBLIC_MIREYE_API_TOKEN || process.env.NEXT_PUBLIC_MIREYE_TOKEN;
    const cacheKey = `mireye-lookup-v3:${(address || apn).toLowerCase()}`;

    // Check edge cache
    const cached = await getCache(cacheKey);
    if (cached && !cached.error && typeof cached.lat === 'number' && !isNaN(cached.lat)) {
      return NextResponse.json(cached);
    }

    if (token) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const mireyePayload: Record<string, any> = {};
        if (address) {
          mireyePayload.address = address;
          mireyePayload.query = address;
        }
        if (apn) mireyePayload.apn = apn;

        const res = await fetch('https://api.mireye.com/v1/lookup', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mireyePayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          await setCache(cacheKey, data);
          return NextResponse.json(data);
        } else {
          const errText = await res.text();
          return NextResponse.json({ error: `Mireye API Lookup Error (${res.status}): ${errText}` }, { status: res.status });
        }
      } catch (err: any) {
        return NextResponse.json({ error: `Mireye API network error: ${err.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'MIREYE_API_TOKEN is not configured on the server.' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lookup failed' }, { status: 500 });
  }
}
