// src/app/api/agent/site-scan/route.ts
// Streaming Server-Sent Events (SSE) route for Atlas Acquisition Agent

import { NextResponse } from 'next/server';
import { runAcquisitionPipeline } from '../../../../agent/orchestrator';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userPrompt = body.prompt || 'Find commercial solar opportunities in Texas';

    // Load pre-enriched 70-site Texas dataset
    let datasetPath = path.join(process.cwd(), 'data/tx_statewide_matches_enriched.json');
    if (!fs.existsSync(datasetPath)) {
      datasetPath = path.join(process.cwd(), '../dollar-general-solar/data/tx_statewide_matches_enriched.json');
    }

    let enrichedDataset = [];
    if (fs.existsSync(datasetPath)) {
      const rawJson = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      enrichedDataset = rawJson.enriched || rawJson || [];
    } else {
      // Fallback sample data if file path varies
      enrichedDataset = [
        {
          geo_id: '21223.006.002.05',
          chain: 'Dollar General',
          owner: 'DOLGENCORP OF TEXAS INC #653/4956',
          state: 'TX',
          county: 'Nacogdoches County',
          lat: 31.610617,
          lon: -94.640981,
          acres: 0.643,
          mireye: {
            fields: {
              poa_irradiance_optimal_tilt_kwh_m2_yr: { value: 1950.0, source: 'NREL_PVWATTS_V8', fetched_at: '2026-07-31T09:11:58Z' },
              slope_degrees: { value: 0.66, source: 'USGS_3DEP_COG', fetched_at: '2026-07-31T13:49:31Z' },
              grading_difficulty_class: { value: 'flat', source: 'MIREYE_DERIVED', fetched_at: '2026-07-31T13:49:31Z' },
              within_floodplain_polygon: { value: false, source: 'FEMA_NFHL', fetched_at: '2026-07-31T09:11:54Z' },
              primary_building_footprint_sqm: { value: 802.9, source: 'OVERTURE_BUILDINGS', fetched_at: '2026-07-31T13:54:11Z' },
            },
          },
        },
      ];
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(data: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }

        try {
          await runAcquisitionPipeline(userPrompt, enrichedDataset, (evt) => {
            sendEvent(evt);
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
