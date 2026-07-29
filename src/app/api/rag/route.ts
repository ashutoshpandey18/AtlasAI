import { NextResponse } from 'next/server';
import { generateRegulatoryIntelligence } from '@/services/ragService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      lat,
      lng,
      useCaseName,
      projectMw,
      distanceKm,
      voltageKv,
      barrierMultiplier,
      queueRisk,
    } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'lat and lng are required numbers' }, { status: 400 });
    }

    const result = await generateRegulatoryIntelligence({
      lat,
      lng,
      useCaseName:       String(useCaseName ?? 'Infrastructure'),
      projectMw:         Number(projectMw ?? 100),
      distanceKm:        distanceKm  != null ? Number(distanceKm)  : null,
      voltageKv:         voltageKv   != null ? Number(voltageKv)   : null,
      barrierMultiplier: Number(barrierMultiplier ?? 1.0),
      queueRisk:         String(queueRisk ?? 'Unknown'),
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'RAG service error';
    console.error('[/api/rag] Error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
