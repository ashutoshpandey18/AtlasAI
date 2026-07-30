'use client';

import { useState } from 'react';
import { Zap, ShieldAlert, CheckCircle2, DollarSign, Layers, Activity, ArrowRight, Info } from 'lucide-react';
import type { GridCapacityResult, BarrierDetail } from '@/services/gridCapacityEngine';

interface Props {
  gridCapacity: GridCapacityResult;
  siteLabel?: string;
  projectMw?: number;
}

export default function CorridorVisualizer({ gridCapacity, siteLabel = 'Candidate Site', projectMw = 100 }: Props) {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const {
    rawDistanceMeters,
    adjustedDistanceMeters,
    compositeBarrierMultiplier,
    barriers,
    voltageCapacity,
    queueRisk,
    capexRangeLabel,
  } = gridCapacity;

  const rawKm = rawDistanceMeters ? (rawDistanceMeters / 1000).toFixed(2) : '0.50';
  const adjKm = adjustedDistanceMeters ? (adjustedDistanceMeters / 1000).toFixed(2) : '0.90';

  const segments = [
    {
      id: 'site',
      type: 'site',
      label: siteLabel,
      sublabel: `${projectMw} MW Interconnection Origin`,
      icon: Zap,
      accentColor: 'text-amber-600',
      badgeStyle: 'bg-amber-100 border-amber-200 text-amber-800',
      dotColor: 'bg-amber-500',
      costImpact: 'Origin Point',
    },
    ...barriers.map((b: BarrierDetail, idx: number) => ({
      id: `barrier-${idx}`,
      type: 'barrier',
      label: b.label,
      sublabel: b.rationale,
      multiplier: b.multiplier,
      field: b.field,
      icon: ShieldAlert,
      accentColor: b.multiplier >= 1.7 ? 'text-orange-600' : 'text-amber-600',
      badgeStyle: b.multiplier >= 1.7 ? 'bg-orange-100 border-orange-200 text-orange-800' : 'bg-amber-100 border-amber-200 text-amber-800',
      dotColor: b.multiplier >= 1.7 ? 'bg-orange-500' : 'bg-amber-500',
      costImpact: `+${Math.round((b.multiplier - 1) * 100)}% Cost Premium`,
    })),
    {
      id: 'substation',
      type: 'grid',
      label: `${voltageCapacity.nearestVoltageKv || 138} kV Grid Point`,
      sublabel: `${queueRisk.rtoRegion} RTO Substation Node (${queueRisk.queueRisk} Queue Risk)`,
      icon: CheckCircle2,
      accentColor: 'text-emerald-600',
      badgeStyle: 'bg-emerald-100 border-emerald-200 text-emerald-800',
      dotColor: 'bg-emerald-500',
      costImpact: capexRangeLabel,
    },
  ];

  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_4px_20px_-4px_rgba(22,20,15,0.06)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-wider">
                Corridor Cable Path Visualizer
              </h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F3EFE6] border border-[#E5DFD3] text-orange-800">
                VECTOR TRACE
              </span>
            </div>
            <p className="text-[10.5px] text-[var(--text-muted)] font-medium">
              Site Centroid → Corridor Obstacles → Substation Node
            </p>
          </div>
        </div>

        {/* Distance Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5DFD3] bg-[#FAF8F3] px-3.5 py-1 self-start sm:self-auto">
          <span className="text-[10.5px] font-medium text-[#6E6659]">
            {rawKm} km raw → <span className="font-bold text-orange-700">{adjKm} km adj</span>
          </span>
          <span className="text-[9.5px] font-black text-orange-700 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full">
            {compositeBarrierMultiplier.toFixed(2)}×
          </span>
        </div>
      </div>

      {/* Interactive Path Canvas — Warm Cream Canvas */}
      <div className="relative rounded-2xl border border-[#E5DFD3] bg-[#FAF8F3] p-5 shadow-inner overflow-hidden">
        {/* Animated Cable Trace SVG — Warm Yellow/Orange Gradient */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="warmCableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#EA580C" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            d="M 40 50 Q 200 20, 400 50 T 750 50"
            fill="none"
            stroke="url(#warmCableGrad)"
            strokeWidth="3"
            strokeDasharray="8 6"
            className="animate-[dash_20s_linear_infinite]"
          />
        </svg>

        {/* Corridor Nodes Grid — Crisp White Cards on Warm Background */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {segments.map((seg, idx) => {
            const IconComponent = seg.icon;
            const isSelected = selectedNode === idx;

            return (
              <button
                key={seg.id}
                onClick={() => setSelectedNode(isSelected ? null : idx)}
                className={`relative flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-200 bg-white shadow-sm ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20 scale-[1.02]'
                    : 'border-[#E5DFD3] hover:border-orange-300 hover:scale-[1.01]'
                }`}
              >
                <div className="relative mb-2">
                  <div className="w-9 h-9 rounded-xl border border-[#E5DFD3] bg-[#FAF8F3] flex items-center justify-center shadow-inner">
                    <IconComponent className={`w-4 h-4 ${seg.accentColor}`} />
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${seg.dotColor} border-2 border-white`} />
                </div>

                <span className="text-[11.5px] font-extrabold text-[var(--text-primary)] leading-tight mb-0.5 line-clamp-1">
                  {seg.label}
                </span>

                <span className="text-[9.5px] text-[var(--text-muted)] font-medium line-clamp-1 mb-2">
                  {seg.sublabel}
                </span>

                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${seg.badgeStyle}`}>
                  {seg.costImpact}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Segment Inspector HUD */}
      {selectedNode !== null && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 transition-all">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-[11px] font-bold text-orange-950">
                Segment Inspector: {segments[selectedNode].label}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[10px] font-bold text-orange-700 hover:text-orange-950"
            >
              Close
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
            {segments[selectedNode].sublabel} — Impact: <strong className="text-[var(--text-primary)]">{segments[selectedNode].costImpact}</strong>.
          </p>
        </div>
      )}

      {/* Realistic Summary HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[var(--border)]">
        <div className="flex items-center gap-2.5 bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-3">
          <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div>
            <div className="text-[9px] uppercase font-bold text-[#8C8273]">Capex Estimate</div>
            <div className="text-[12px] font-extrabold text-[var(--text-primary)]">{capexRangeLabel}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-3">
          <ShieldAlert className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <div>
            <div className="text-[9px] uppercase font-bold text-[#8C8273]">Corridor Barriers</div>
            <div className="text-[12px] font-extrabold text-[var(--text-primary)]">{barriers.length} Obstacles Active</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-3">
          <Activity className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div>
            <div className="text-[9px] uppercase font-bold text-[#8C8273]">Queue Risk</div>
            <div className="text-[12px] font-extrabold text-[var(--text-primary)]">
              {queueRisk.rtoRegion} · {queueRisk.queueRisk} Risk
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
