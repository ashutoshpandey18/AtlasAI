import { NextResponse } from 'next/server';
import { getLmpMarketPrices } from '@/services/liveLmpGridTracker';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rtoRegion = searchParams.get('rtoRegion') || 'PJM';
    const projectMw = Number(searchParams.get('projectMw') || 100);

    const data = getLmpMarketPrices(rtoRegion, projectMw);

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Energy market API error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
