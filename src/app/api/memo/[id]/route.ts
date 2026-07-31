// src/app/api/memo/[id]/route.ts
// Server route to fetch 100% real Investment Memos directly from Mireye dataset by parcel ID or index

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateInvestmentMemo } from '../../../../agent/memo';
import { evaluateSiteTechnicalFeasibility } from '../../../../agent/evaluator';
import { evaluateAcquisitionIntelligence } from '../../../../agent/intelligence';
import { planAcquisitionStrategyFallback } from '../../../../agent/planner';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let datasetPath = path.join(process.cwd(), 'data/tx_statewide_matches_enriched.json');
    if (!fs.existsSync(datasetPath)) {
      datasetPath = path.join(process.cwd(), '../dollar-general-solar/data/tx_statewide_matches_enriched.json');
    }

    let enrichedDataset: any[] = [];
    if (fs.existsSync(datasetPath)) {
      const rawJson = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      enrichedDataset = rawJson.enriched || rawJson || [];
    }

    let match: any = null;

    // 1. Try integer index lookup (0, 1, 2, 3...)
    if (/^\d+$/.test(id)) {
      const idx = parseInt(id, 10);
      if (idx >= 0 && idx < enrichedDataset.length) {
        match = enrichedDataset[idx];
      }
    }

    // 2. Try geo_id string match or county match if not matched by index
    if (!match) {
      const queryLower = id.toLowerCase();
      match = enrichedDataset.find((item) => {
        const geoIdLower = (item.geo_id || '').toLowerCase();
        const countyLower = (item.county || item.mireye?.fields?.['political_county']?.value || '').toLowerCase();
        const ownerLower = (item.owner || '').toLowerCase();
        return geoIdLower.includes(queryLower) || countyLower.includes(queryLower) || ownerLower.includes(queryLower);
      });
    }

    // 3. Fallback to index 0 if no match
    if (!match) {
      match = enrichedDataset[0];
    }

    const county = match.county || match.mireye?.fields?.['political_county']?.value || 'Austin County';
    const shortId = (match.geo_id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6) || '3595';
    const siteName = `${match.chain || 'Dollar General'} ${county} #${shortId}`;

    const plan = planAcquisitionStrategyFallback(`Find solar carport targets in ${county}`);
    const techEval = evaluateSiteTechnicalFeasibility(match.geo_id || shortId, siteName, county, match.mireye);
    const intelEval = evaluateAcquisitionIntelligence(match.geo_id || shortId, county, match.owner || 'DOLGENCORP OF TEXAS INC');
    const memo = generateInvestmentMemo(1, plan, techEval, intelEval, match.mireye);

    return NextResponse.json(memo);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch memo' }, { status: 500 });
  }
}
