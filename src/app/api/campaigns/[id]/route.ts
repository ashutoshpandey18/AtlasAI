import { NextResponse } from 'next/server';
import { getCampaignById, deleteCampaign } from '@/services/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await getCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    return NextResponse.json(campaign);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database retrieval error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCampaign(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Database deletion error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
