'use client';

import { useState, useEffect } from 'react';
import { Zap, TrendingUp, DollarSign, Activity, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import type { LmpMarketData } from '@/services/liveLmpGridTracker';

interface Props {
  rtoRegion?: string;
  projectMw?: number;
}

export default function LiveLmpTrackerCard({ rtoRegion = 'PJM', projectMw = 100 }: Props) {
  const [data, setData] = useState<LmpMarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLivePrices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/energy-market?rtoRegion=${rtoRegion}&projectMw=${projectMw}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePrices();
  }, [rtoRegion, projectMw]);

  if (!data) return null;

  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_4px_20px_-4px_rgba(22,20,15,0.06)] space-y-4">
      {/* Live Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-wider">
                Live Energy Market Tracker
              </h4>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE RTO FEED
              </span>
            </div>
            <p className="text-[10.5px] text-[var(--text-muted)] font-medium">
              Locational Marginal Pricing (LMP) & Grid Congestion Spreads
            </p>
          </div>
        </div>

        <button
          onClick={fetchLivePrices}
          className="p-2 rounded-xl bg-[#FAF8F3] border border-[#E5DFD3] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Refresh live prices"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main LMP Metric Banner */}
      <div className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-[9.5px] uppercase font-bold tracking-wider text-[#8C8273] mb-1">
              Current LMP Electricity Price ({data.rtoRegion} Grid)
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-black text-[var(--text-primary)] leading-none">
                ${data.currentLmpUsdPerMwh}
              </span>
              <span className="text-[12px] font-bold text-[#6E6659]">/ MWh</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                +3.8% Peak Spread
              </span>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 border-[#E5DFD3] pt-2 sm:pt-0">
            <div className="text-[9.5px] uppercase font-bold text-[#8C8273] mb-0.5">Peak Hour Price</div>
            <div className="text-[14px] font-black text-orange-600">
              ${data.peakLmpUsdPerMwh} / MWh
            </div>
          </div>
        </div>

        {/* Breakdown Chips */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5DFD3]">
          <div className="bg-white border border-[#E5DFD3] rounded-xl p-2 text-center">
            <div className="text-[8.5px] font-bold uppercase text-[#8C8273]">Energy Base</div>
            <div className="text-[11px] font-extrabold text-[var(--text-primary)]">${data.energyComponentUsd}</div>
          </div>
          <div className="bg-white border border-[#E5DFD3] rounded-xl p-2 text-center">
            <div className="text-[8.5px] font-bold uppercase text-[#8C8273]">Congestion Penalty</div>
            <div className="text-[11px] font-extrabold text-orange-700">+${data.congestionComponentUsd}</div>
          </div>
          <div className="bg-white border border-[#E5DFD3] rounded-xl p-2 text-center">
            <div className="text-[8.5px] font-bold uppercase text-[#8C8273]">Line Losses</div>
            <div className="text-[11px] font-extrabold text-[#6E6659]">+${data.marginalLossComponentUsd}</div>
          </div>
        </div>
      </div>

      {/* Revenue vs Power Cost Projections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[9.5px] uppercase font-bold tracking-wider text-emerald-800 mb-1">
            Est. Solar Gen. Revenue ({projectMw} MW)
          </div>
          <div className="text-[16px] font-black text-emerald-900">
            ${(data.estimatedSolarRevenuePerMwYear / 1_000_000).toFixed(2)}M <span className="text-[10px] font-normal text-emerald-700">/ yr</span>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[9.5px] uppercase font-bold tracking-wider text-orange-800 mb-1">
            Est. Data Center Power Bill ({projectMw} MW)
          </div>
          <div className="text-[16px] font-black text-orange-900">
            ${(data.estimatedDataCenterCostPerMwYear / 1_000_000).toFixed(2)}M <span className="text-[10px] font-normal text-orange-700">/ yr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
