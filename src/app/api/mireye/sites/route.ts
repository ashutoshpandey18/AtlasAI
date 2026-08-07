// src/app/api/mireye/sites/route.ts
// Proxy for POST /v1/sites — registers a parcel polygon as a persistent Mireye Site Dossier.
// Schema verified against Mireye OpenAPI v0.14.0: SiteRegisterRequest = { polygon: GeoJSON Polygon/MultiPolygon }
// Response shape is additionalProperties: true — parsed defensively for site_id.

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { polygon, source } = body;

    if (!polygon || typeof polygon !== 'object') {
      return NextResponse.json(
        { error: 'polygon_required', message: 'A GeoJSON Polygon or MultiPolygon is required.' },
        { status: 422 }
      );
    }

    const token =
      process.env.MIREYE_API_TOKEN ||
      process.env.MIREYE_TOKEN ||
      process.env.NEXT_PUBLIC_MIREYE_API_TOKEN ||
      process.env.NEXT_PUBLIC_MIREYE_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'no_token', message: 'Mireye API token not configured.' },
        { status: 503 }
      );
    }

    // Step 5: Log the outgoing request in development mode
    const geomType = polygon.type || 'Polygon';
    const coordsLength = Array.isArray(polygon.coordinates) ? polygon.coordinates.length : 0;
    const ringLength = coordsLength > 0 && Array.isArray(polygon.coordinates[0]) ? polygon.coordinates[0].length : 0;
    const summaryCoords = `[${geomType} with ${coordsLength} parts, outer ring: ${ringLength} points]`;

    console.log(
      `[SITE REGISTER]\nSource: ${source || 'Uploaded GeoJSON'}\nGeometry Type: ${geomType}\nCoordinates: ${summaryCoords}\nEndpoint: /v1/sites\nTimestamp: ${new Date().toISOString()}`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const payload = { site: polygon };
    console.log(`[SITE REGISTER] Outgoing Raw Payload:`, JSON.stringify(payload));

    const res = await fetch('https://api.mireye.com/v1/sites', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      // Response is additionalProperties:true — site_id may appear at top level
      const siteId: string | undefined =
        data?.site_id || data?.id || data?.siteId || data?.site?.id || data?.site?.site_id;

      if (siteId) {
        console.log(`✅ SITE REGISTERED\nsite_id: ${siteId}`);
        return NextResponse.json({
          site_id: siteId,
          status: 'registered',
          registered_at: new Date().toISOString(),
          raw: data,
        });
      }

      // 200 but no site_id extractable — treat as failure
      console.warn(`[SITE REGISTER] 200 response but no site_id found in:`, JSON.stringify(data).slice(0, 200));
      return NextResponse.json(
        { error: 'no_site_id', message: 'Registration succeeded but no site_id was returned.', raw: data },
        { status: 502 }
      );
    }

    // Non-OK response
    let errDetail: any = {};
    try { errDetail = await res.json(); } catch {}
    console.error(`❌ SITE REGISTER FAILED\nStatus: ${res.status}\nDetail:`, errDetail);
    return NextResponse.json(
      { error: 'registration_failed', status: res.status, detail: errDetail },
      { status: res.status }
    );
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return NextResponse.json(
        { error: 'timeout', message: 'Site registration request timed out (15s).' },
        { status: 504 }
      );
    }
    console.error('[SITE REGISTER] Error:', err?.message);
    return NextResponse.json(
      { error: 'internal_error', message: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
