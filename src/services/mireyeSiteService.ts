// src/services/mireyeSiteService.ts
// Atlas V1.3 — Persistent Mireye Site Dossier Service
//
// Handles registration of acquisition-worthy parcels as persistent Mireye Sites
// and replaces stateless /v1/ask calls with dossier-backed /v1/ask-site calls.
//
// Design rules (enforced):
//  - ONLY register survivors (winners). Never register rejected parcels.
//  - NEVER synthesize fake polygons. Only use parcel.geometry from /v1/lookup.
//  - If no parcel geometry: registrationStatus = 'skipped', reason = 'No parcel geometry available.'
//  - Fallback: if ask-site fails, caller uses /v1/ask transparently.

export type SiteRegistrationStatus = 'registered' | 'deferred' | 'failed' | 'pending';

export interface SiteRegistrationResult {
  site_id: string | null;
  status: SiteRegistrationStatus;
  registered_at: string | null;
  skip_reason?: string;
  error?: string;
}

export interface AskSiteResult {
  answer: string;
  site_id: string;
  traceSteps?: string[];
  citations?: { fieldName: string; source: string; value: string }[];
  source: 'mireye_site_dossier';
}

/**
 * Registers an acquisition-worthy parcel as a persistent Mireye Site Dossier.
 *
 * CONTRACT:
 * - parcelGeometry MUST be a valid GeoJSON Polygon or MultiPolygon.
 * - If parcelGeometry is null/undefined, returns { status: 'deferred', site_id: null }.
 * - Never invents geometry.
 *
 * @param parcelGeometry  GeoJSON Polygon/MultiPolygon
 * @param source          Source of the geometry ('Uploaded GeoJSON' | 'Mireye /v1/lookup')
 * @returns SiteRegistrationResult
 */
export async function registerSite(
  parcelGeometry: object | null | undefined,
  source?: 'Uploaded GeoJSON' | 'Mireye /v1/lookup' | null
): Promise<SiteRegistrationResult> {
  // Enforce: no fake polygons.
  if (!parcelGeometry || typeof parcelGeometry !== 'object') {
    return {
      site_id: null,
      status: 'deferred',
      registered_at: null,
      skip_reason: 'Verified parcel geometry was not returned by Mireye Lookup.',
    };
  }

  // Validate it's a GeoJSON Polygon or MultiPolygon
  const geo = parcelGeometry as any;
  if (geo.type !== 'Polygon' && geo.type !== 'MultiPolygon') {
    return {
      site_id: null,
      status: 'deferred',
      registered_at: null,
      skip_reason: `Unsupported geometry type "${geo.type}". Only Polygon and MultiPolygon are accepted by /v1/sites.`,
    };
  }

  try {
    const res = await fetch('/api/mireye/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polygon: parcelGeometry, source: source || 'Uploaded GeoJSON' }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.site_id) {
        return {
          site_id: data.site_id,
          status: 'registered',
          registered_at: data.registered_at || new Date().toISOString(),
        };
      }
      // 200 but no site_id
      return {
        site_id: null,
        status: 'failed',
        registered_at: null,
        error: data?.error || 'Registration succeeded but no site_id returned.',
      };
    }

    // Non-OK
    let errMsg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      errMsg = errData?.message || errData?.error || errMsg;
    } catch {}
    return {
      site_id: null,
      status: 'failed',
      registered_at: null,
      error: errMsg,
    };
  } catch (err: any) {
    return {
      site_id: null,
      status: 'failed',
      registered_at: null,
      error: err?.message || 'Network error during site registration.',
    };
  }
}

/**
 * Asks a question against a registered Mireye Site Dossier.
 * Uses the persisted dossier — no re-fetch occurs.
 *
 * @param siteId   The site_id returned by registerSite()
 * @param question Plain-language question (max 2000 chars per OpenAPI schema)
 * @returns AskSiteResult or null (caller should fall back to /v1/ask)
 */
export async function askSite(
  siteId: string,
  question: string
): Promise<AskSiteResult | null> {
  if (!siteId || siteId.length < 4) return null;
  if (!question || !question.trim()) return null;

  // Enforce max 2000 chars per AskSiteRequest schema
  const trimmedQuestion = question.trim().slice(0, 2000);

  try {
    const res = await fetch('/api/mireye/ask-site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: siteId, question: trimmedQuestion }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.answer) {
        return {
          answer: data.answer,
          site_id: siteId,
          traceSteps: data.traceSteps,
          citations: data.citations,
          source: 'mireye_site_dossier',
        };
      }
    }

    // Non-OK or no answer → return null so caller falls back
    return null;
  } catch {
    return null;
  }
}
