// src/app/api/mireye/ask-site/route.ts
// Proxy for POST /v1/ask-site — answers a question against a persisted Mireye Site Dossier.
// Schema verified against Mireye OpenAPI v0.14.0:
//   AskSiteRequest = { site_id: string (min:4, max:64), question: string (min:1, max:2000) }
// One Opus call over the persisted dossier. Never re-fetches the field data.

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const siteId: string = String(body.site_id || '').trim();
    const question: string = String(body.question || '').trim();

    if (!siteId || siteId.length < 4 || siteId.length > 64) {
      return NextResponse.json(
        { error: 'invalid_site_id', message: 'site_id must be 4–64 characters.' },
        { status: 422 }
      );
    }

    if (!question || question.length < 1 || question.length > 2000) {
      return NextResponse.json(
        { error: 'invalid_question', message: 'question must be 1–2000 characters.' },
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

    console.log(
      `[ASK-SITE] Querying site dossier\nsite_id: ${siteId}\nQuestion: ${question.slice(0, 80)}...\nEndpoint: POST https://api.mireye.com/v1/ask-site\nTimestamp: ${new Date().toISOString()}`
    );
    const startTime = Date.now();

    // First attempt
    const tryAskSite = async (): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s as specified by Mireye docs
      try {
        const r = await fetch('https://api.mireye.com/v1/ask-site', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ site_id: siteId, question }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return r;
      } catch (e) {
        clearTimeout(timeoutId);
        throw e;
      }
    };

    let res: Response;
    try {
      res = await tryAskSite();
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return NextResponse.json({ error: 'timeout', message: 'ask-site timed out.' }, { status: 504 });
      }
      return NextResponse.json({ error: 'network_error', message: err?.message }, { status: 502 });
    }

    if (res.ok) {
      const data = await res.json();
      const answer = data?.answer || data?.reply || '';
      if (answer) {
        console.log(`✅ ASK-SITE RESPONSE\nsite_id: ${siteId}\nDuration: ${Date.now() - startTime}ms`);
        return NextResponse.json({
          answer,
          site_id: siteId,
          traceSteps: data?.trace || data?.traceSteps || ['Queried Mireye Site Dossier'],
          citations: data?.citations || data?.fields_used || [],
          source: 'mireye_site_dossier',
          queried_at: new Date().toISOString(),
        });
      }
    }

    // Non-2xx or empty answer — return error so caller can fall back to /v1/ask
    let errDetail: any = {};
    try { errDetail = await res.json(); } catch {}
    console.warn(`[ASK-SITE] Non-OK or empty response. Status: ${res.status}. Caller should fall back to /v1/ask.`);
    return NextResponse.json(
      { error: 'ask_site_failed', status: res.status, detail: errDetail },
      { status: res.status < 400 ? 502 : res.status }
    );
  } catch (err: any) {
    console.error('[ASK-SITE] Error:', err?.message);
    return NextResponse.json(
      { error: 'internal_error', message: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
