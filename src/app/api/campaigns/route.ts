import { NextResponse } from 'next/server';
import { getCampaigns, saveCampaign } from '@/services/db';
import type { ProjectWorkspace } from '@/types/atlas';

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json(campaigns);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database fetch error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ProjectWorkspace;
    if (!body.id || !body.name || !body.useCaseId) {
      return NextResponse.json({ error: 'Missing required campaign parameters' }, { status: 400 });
    }
    await saveCampaign(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database save error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
