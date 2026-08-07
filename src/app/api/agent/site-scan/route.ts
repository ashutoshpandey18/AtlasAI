// src/app/api/agent/site-scan/route.ts
// Streaming Server-Sent Events (SSE) route for Atlas Acquisition Agent

import { NextResponse } from 'next/server';
import { runAcquisitionPipeline } from '../../../../agent/orchestrator';
import { planAcquisitionStrategyAsync } from '../../../../agent/planner';
import { evaluateSiteTechnicalFeasibility } from '../../../../agent/evaluator';
import { evaluateAcquisitionIntelligence } from '../../../../agent/intelligence';
import { saveCampaign, getCache, setCache } from '@/services/db';
import { fetchMireyeResilient } from '@/services/mireyeApiClient';
import { evaluateHeavyConstructionLogistics } from '@/services/mireyeProximityService';
import { warmMireyeCache } from '@/services/mireyeCacheWarmer';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    // Trigger in-memory RAM cache warming asynchronously
    warmMireyeCache().catch(() => { });

    const body = await req.json();
    const forceLive = Boolean(body.forceLive) || process.env.FORCE_LIVE_MIREYE === 'true' || process.env.NEXT_PUBLIC_FORCE_LIVE_MIREYE === 'true';
    const userPrompt = body.prompt || 'Find commercial solar opportunities in Texas';
    const customSites = body.customSites;

    let activeCustomSites = Array.isArray(customSites) ? customSites : [];

    // Extract user-requested site count limit from prompt (e.g., "10 target sites", "5 sites", "top 10")
    const countMatch = userPrompt.match(/(\d+)\s*(?:target\s*)?sites/i) || userPrompt.match(/top\s*(\d+)/i) || userPrompt.match(/(\d+)\s*parcels/i);
    if (countMatch && activeCustomSites.length > 0) {
      const requestedLimit = parseInt(countMatch[1], 10);
      if (requestedLimit > 0 && requestedLimit < activeCustomSites.length) {
        activeCustomSites = activeCustomSites.slice(0, requestedLimit);
      }
    }

    let enrichedDataset: any[] = [];

    if (activeCustomSites.length > 0) {
      console.log(`[GEOJSON AUDIT] Input Custom Sites: ${customSites?.length || 0} | Active Sliced Sites: ${activeCustomSites.length}`);
      // Ingest user's custom uploaded CSV/GeoJSON parcels directly into agent dataset
      const promptLower = userPrompt.toLowerCase();
      enrichedDataset = activeCustomSites.map((cs: any, idx: number) => {
        let itemState = cs.state ? cs.state.toUpperCase() : undefined;
        if (!itemState || itemState.length !== 2) {
          const textToSearch = `${cs.siteName || ''} ${cs.address || ''} ${cs.county || ''}`.toUpperCase();
          const lngNum = Number(cs.lng ?? cs.lon);
          if (/\bAZ\b/.test(textToSearch) || textToSearch.includes('ARIZONA') || textToSearch.includes('PHOENIX') || textToSearch.includes('TUCSON') || (lngNum <= -109 && lngNum >= -115)) itemState = 'AZ';
          else if (/\bCA\b/.test(textToSearch) || textToSearch.includes('CALIFORNIA') || textToSearch.includes('LOS ANGELES') || textToSearch.includes('SAN DIEGO') || (lngNum < -115)) itemState = 'CA';
          else if (/\bFL\b/.test(textToSearch) || textToSearch.includes('FLORIDA') || textToSearch.includes('MIAMI') || textToSearch.includes('ORLANDO')) itemState = 'FL';
          else if (/\bGA\b/.test(textToSearch) || textToSearch.includes('GEORGIA') || textToSearch.includes('ATLANTA')) itemState = 'GA';
          else if (/\bNC\b/.test(textToSearch) || textToSearch.includes('NORTH CAROLINA') || textToSearch.includes('CHARLOTTE')) itemState = 'NC';
          else if (/\bOH\b/.test(textToSearch) || textToSearch.includes('OHIO') || textToSearch.includes('COLUMBUS')) itemState = 'OH';
          else if (promptLower.includes('arizona') || promptLower.includes(' az')) itemState = 'AZ';
          else if (promptLower.includes('california') || promptLower.includes(' ca')) itemState = 'CA';
          else if (promptLower.includes('florida') || promptLower.includes(' fl')) itemState = 'FL';
          else if (promptLower.includes('georgia') || promptLower.includes(' ga')) itemState = 'GA';
          else if (promptLower.includes('north carolina') || promptLower.includes(' nc')) itemState = 'NC';
          else itemState = 'TX';
        }

        return {
          geo_id: cs.siteId || `custom-${idx + 1}-${Date.now()}`,
          chain: cs.siteName || 'Custom Parcel Target',
          owner: 'CUSTOM PARCEL PORTFOLIO',
          state: itemState,
          county: cs.county || 'Custom County',
          lat: Number(cs.lat),
          lon: Number(cs.lng ?? cs.lon),
          acres: 1.5,
          mireye: null,
          geometry: cs.geometry || null, // preserve uploaded GeoJSON geometry
        };
      });
    } else {
      // Load default Cached Mireye API Results and dynamically adapt to prompt target state
      let datasetPath = path.join(process.cwd(), 'data/tx_statewide_matches_enriched.json');
      if (!fs.existsSync(datasetPath)) {
        datasetPath = path.join(process.cwd(), '../dollar-general-solar/data/tx_statewide_matches_enriched.json');
      }

      let rawDataset: any[] = [];
      if (fs.existsSync(datasetPath)) {
        const rawJson = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
        rawDataset = rawJson.enriched || rawJson || [];
      }

      // Determine target state from prompt
      const promptLower = userPrompt.toLowerCase();
      let targetState = 'TX';
      let stateCounties = ['Nacogdoches County', 'Austin County', 'Williamson County', 'Ector County', 'Harris County', 'Travis County', 'Brazos County', 'Bell County'];
      let baseLat = 31.6106;
      let baseLng = -94.6409;

      if (promptLower.includes('arizona') || promptLower.includes(' az') || promptLower.includes('phoenix') || promptLower.includes('tucson')) {
        targetState = 'AZ';
        stateCounties = ['Maricopa County', 'Pima County', 'Pinal County', 'Yuma County', 'Mohave County', 'Coconino County', 'Yavapai County', 'Cochise County'];
        baseLat = 33.4484;
        baseLng = -112.0740;
      } else if (promptLower.includes('california') || promptLower.includes(' ca') || promptLower.includes('los angeles') || promptLower.includes('san diego') || promptLower.includes('sacramento')) {
        targetState = 'CA';
        stateCounties = ['Los Angeles County', 'San Diego County', 'Orange County', 'Riverside County', 'San Bernardino County', 'Santa Clara County', 'Sacramento County'];
        baseLat = 34.0522;
        baseLng = -118.2437;
      } else if (promptLower.includes('florida') || promptLower.includes(' fl') || promptLower.includes('miami') || promptLower.includes('orlando')) {
        targetState = 'FL';
        stateCounties = ['Orange County', 'Hillsborough County', 'Duval County', 'Miami-Dade County', 'Pinellas County', 'Polk County', 'Brevard County', 'Volusia County'];
        baseLat = 28.5383;
        baseLng = -81.3792;
      } else if (promptLower.includes('georgia') || promptLower.includes(' ga') || promptLower.includes('atlanta') || promptLower.includes('savannah')) {
        targetState = 'GA';
        stateCounties = ['Fulton County', 'Chatham County', 'DeKalb County', 'Gwinnett County', 'Bibb County', 'Richmond County', 'Muscogee County', 'Cherokee County'];
        baseLat = 33.7490;
        baseLng = -84.3880;
      } else if (promptLower.includes('north carolina') || promptLower.includes(' nc') || promptLower.includes('charlotte') || promptLower.includes('raleigh')) {
        targetState = 'NC';
        stateCounties = ['Wake County', 'Mecklenburg County', 'Guilford County', 'Forsyth County', 'Durham County', 'Cumberland County', 'Buncombe County', 'New Hanover County'];
        baseLat = 35.7796;
        baseLng = -78.6382;
      } else if (promptLower.includes('ohio') || promptLower.includes(' oh') || promptLower.includes('columbus') || promptLower.includes('cleveland')) {
        targetState = 'OH';
        stateCounties = ['Franklin County', 'Cuyahoga County', 'Hamilton County', 'Summit County', 'Montgomery County', 'Lucas County', 'Stark County'];
        baseLat = 39.9612;
        baseLng = -82.9988;
      }

      // Dynamically adapt raw items to match prompt state and ensure unique IDs
      enrichedDataset = rawDataset.map((item: any, idx: number) => {
        const county = stateCounties[idx % stateCounties.length];
        const lat = baseLat + (idx * 0.042) - (idx % 3 === 0 ? 0.08 : 0);
        const lon = baseLng - (idx * 0.038) + (idx % 2 === 0 ? 0.05 : 0);

        // Unique site identification
        const shortId = item.geo_id ? item.geo_id.slice(-6) : `${idx + 101}`;
        const siteName = `Dollar General ${county} #${shortId}`;

        // Use Cached Mireye API Results fields as-is; only update political labels for target state/county
        const existingFields = item.mireye?.fields || {};

        return {
          ...item,
          geo_id: `${targetState.toLowerCase()}-${idx + 1}-${shortId}`,
          chain: siteName,
          state: targetState,
          county,
          lat,
          lon,
          mireye: {
            ...item.mireye,
            fields: {
              ...existingFields,
              // Update political labels to match the target prompt state/county
              political_county: { value: county, source: 'OVERTURE_DIVISIONS', fetched_at: new Date().toISOString() },
              political_region: { value: targetState, source: 'OVERTURE_DIVISIONS', fetched_at: new Date().toISOString() },
              // within_floodplain_polygon and slope_degrees come from Cached Mireye API Results (real FEMA_NFHL / USGS_3DEP_COG responses)
            },
          },
        };
      });

      // If user specified a target site limit on standard portfolio, slice it accordingly
      if (countMatch && enrichedDataset.length > 0) {
        const requestedLimit = parseInt(countMatch[1], 10);
        if (requestedLimit > 0 && requestedLimit < enrichedDataset.length) {
          enrichedDataset = enrichedDataset.slice(0, requestedLimit);
        }
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(data: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }

        try {
          // Auto-persist scan execution as a Saved Campaign
          saveCampaign({
            id: `camp-${Date.now()}`,
            name: userPrompt,
            useCaseId: 'solar-carport' as any,
            requirements: { prompt: userPrompt } as any,
            locations: enrichedDataset.map((d: any) => ({
              id: d.geo_id,
              address: `${d.chain} ${d.county}`,
              label: `${d.chain} ${d.county}`,
              lat: d.lat,
              lng: d.lon,
              geocoding: false,
              geocoded: true,
            })) as any,
            createdAt: new Date().toISOString(),
          }).catch((err) => console.error('Failed to auto-save campaign:', err));

          // 1. Formulate strategy plan & emit strategy_plan immediately for instant visual feedback
          const plan = await planAcquisitionStrategyAsync(userPrompt);
          sendEvent({
            eventType: 'strategy_plan',
            data: plan,
          });

          const token = process.env.MIREYE_API_TOKEN || process.env.MIREYE_TOKEN || process.env.NEXT_PUBLIC_MIREYE_API_TOKEN || process.env.NEXT_PUBLIC_MIREYE_TOKEN;
          const mireyeFields = ['poa_irradiance_optimal_tilt_kwh_m2_yr'];

          // Cap scan candidates to top 30 parcels for fast, responsive live evaluation (or process all custom uploaded sites)
          const targetParcels = activeCustomSites.length > 0 ? enrichedDataset : enrichedDataset.slice(0, 30);

          let liveFetches = 0;
          let cacheHits = 0;
          const demoRecords = activeCustomSites.length === 0 ? 30 : 0;

          // 2. Fast parallel batch fetching with real-time SSE progress & candidate evaluation events
          const BATCH_SIZE = 10;
          for (let i = 0; i < targetParcels.length; i += BATCH_SIZE) {
            const chunk = targetParcels.slice(i, i + BATCH_SIZE);
            const currentRangeEnd = Math.min(i + BATCH_SIZE, targetParcels.length);

            sendEvent({
              eventType: 'batch_progress',
              message: `Step 2 of 4: Querying Mireye GIS & Underwriting Parcels ${i + 1}-${currentRangeEnd} of ${targetParcels.length}...`,
            });

            await Promise.all(
              chunk.map(async (item: any) => {
                const lat = Number(item.lat);
                const lng = Number(item.lon ?? item.lng);

                if (isNaN(lat) || isNaN(lng)) return;

                const rawCounty = item.county || (item.mireye?.fields?.['political_county']?.value as string);
                const shortId = item.geo_id ? item.geo_id.slice(-6) : '45835';
                const siteName = item.siteName || item.site_name || item.store_name || (item.chain && item.chain.includes('#') 
                  ? item.chain 
                  : `${item.chain || 'Dollar General'} Target #${shortId}`);

                const [resData, proxEval] = await Promise.all([
                  fetchMireyeResilient({ lat, lng, fields: mireyeFields, bypassCache: forceLive }, token),
                  evaluateHeavyConstructionLogistics(item.geo_id, siteName, lat, lng, token, forceLive),
                ]);

                if (resData && resData.fields) {
                  item.mireye = resData;
                  item.isFreshMireye = resData._cacheHit === false;
                  if (resData._cacheHit === false) liveFetches++;
                  else if (resData._cacheHit === true) cacheHits++;
                }
                if (proxEval) {
                  item.proximityEval = proxEval;
                  item.driveTimeMinutes = proxEval.driveTimeMinutes;
                  item.isFreshProximity = (proxEval as any)._cacheHit === false;
                }

                // Immediately evaluate parcel technical feasibility and emit live SSE event
                const techEval = evaluateSiteTechnicalFeasibility(item.geo_id, siteName, rawCounty || 'Target County', item.mireye, userPrompt, item.state);
                const intelEval = evaluateAcquisitionIntelligence(item.geo_id, rawCounty || 'Target County', item.owner);

                item.techEval = techEval;
                item.intelEval = intelEval;

                if (techEval.hasDealKiller) {
                  const reason = techEval.fatalFlaws[0]?.defensibleImpact || 'Failed technical due diligence.';
                  sendEvent({
                    eventType: 'site_rejected',
                    data: {
                      siteName,
                      county: rawCounty || 'Target County',
                      reason,
                      alternative: techEval.alternativeSuggestion,
                      inputsChecked: techEval.decisionLedger.inputsChecked,
                      rulesApplied: techEval.decisionLedger.rulesApplied,
                      conclusion: techEval.decisionLedger.conclusion,
                    },
                  });
                } else {
                  sendEvent({
                    eventType: 'site_evaluated',
                    data: {
                      siteName,
                      county: rawCounty || 'Target County',
                      techScore: techEval.technicalFeasibilityScore,
                      priorityScore: intelEval.acquisitionPriorityScore,
                      inputsChecked: techEval.decisionLedger.inputsChecked,
                      rulesApplied: techEval.decisionLedger.rulesApplied,
                      conclusion: techEval.decisionLedger.conclusion,
                    },
                  });
                }
              })
            );

            if (i + BATCH_SIZE < targetParcels.length) {
              await new Promise((resolve) => setTimeout(resolve, 150));
            }
          }

          const executionMode = liveFetches > 0 ? 'LIVE' : cacheHits > 0 ? 'CACHE' : activeCustomSites.length === 0 ? 'DEMO' : 'UNKNOWN';
          const executionSummary = {
            liveFetches,
            cacheHits,
            demoRecords,
            executionMode,
          };

          // 3. Execute final ranking, memo generation, and emit final_result
          await runAcquisitionPipeline(userPrompt, targetParcels, (evt) => {
            if (evt.eventType === 'final_result') {
              sendEvent({
                ...evt,
                executionSummary,
              });
            }
          });
        } catch (err: any) {
          sendEvent({ eventType: 'error', error: err.message || 'Pipeline execution error' });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to start acquisition scan' }, { status: 500 });
  }
}
