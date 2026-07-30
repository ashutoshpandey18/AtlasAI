'use client';

import { useState } from 'react';
import { Zap, ShieldAlert, AlertTriangle, ArrowRight, Info, CheckCircle2, DollarSign, Layers } from 'lucide-react';
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
    estimatedCapexLowUsd,
    estimatedCapexHighUsd,
    capexRangeLabel,
  } = gridCapacity;

  const rawKm = rawDistanceMeters ? (rawDistanceMeters / 1000).toFixed(2) : '0.50';
  const adjKm = adjustedDistanceMeters ? (adjustedDistanceMeters / 1000).toFixed(2) : '0.90';

  // Build corridor segments (Site → Barriers... → Substation)
  const segments = [
    {
      id: 'site',
      type: 'site',
      label: siteLabel,
      sublabel: `${projectMw} MW Interconnection Origin`,
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
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
      color: b.multiplier >= 1.7 ? 'text-red-500' : 'text-amber-500',
      bgColor: b.multiplier >= 1.7 ? 'bg-red-500/10' : 'bg-amber-500/10',
      borderColor: b.multiplier >= 1.7 ? 'border-red-500/30' : 'border-amber-500/30',
      costImpact: `+${Math.round((b.multiplier - 1) * 100)}% Cost Premium`,
    })),
    {
      id: 'substation',
      type: 'grid',
      label: `${voltageCapacity.nearestVoltageKv || 138} kV Grid Point`,
      sublabel: `${queueRisk.rtoRegion} RTO Substation Node (${queueRisk.queueRisk} Queue Risk)`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      costImpact: capexRangeLabel,
    },
  ];

  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
          </div>
          <div>
            <h4 className="text-[12px] font-extrabold text-[var(--text-primary)]">
              Corridor Cable Path Visualizer
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">
              Site Centroid → Corridor Obstacles → Substation Node
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-soft)] border border-[var(--border)] px-2.5 py-1 rounded-full">
            {rawKm} km raw → <span className="text-[var(--accent)]">{adjKm} km adjusted</span> ({compositeBarrierMultiplier.toFixed(2)}×)
          </span>
        </div>
      </div>

      {/* SVG Path Diagram */}
      <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-5 overflow-hidden">
        {/* Animated Cable Line SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 50 60 Q 200 30, 350 60 T 650 60"
            fill="none"
            stroke="url(#cableGrad)"
            strokeWidth="3"
            strokeDasharray="6 4"
            filter="url(#glow)"
            className="animate-[dash_20s_linear_infinite]"
          />
        </svg>

        {/* Nodes Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 items-center">
          {segments.map((seg, idx) => {
            const IconComponent = seg.icon;
            const isSelected = selectedNode === idx;

            return (
              <div key={seg.id} className="flex flex-col items-center group">
                <button
                  onClick={() => setSelectedNode(isSelected ? null : idx)}
                  className={`w-full flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 ${seg.bgColor} ${seg.borderColor} ${
                    isSelected ? 'ring-2 ring-[var(--accent)] scale-[1.02]' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full ${seg.bgColor} border ${seg.borderColor} flex items-center justify-center mb-2 shadow-sm`}>
                    <IconComponent className={`w-4 h-4 ${seg.color}`} />
                  </div>
                  <span className="text-[11px] font-extrabold text-[var(--text-primary)] leading-tight mb-0.5 line-clamp-1">
                    {seg.label}
                  </span>
                  <span className="text-[9.5px] text-[var(--text-muted)] font-medium line-clamp-1">
                    {seg.sublabel}
                  </span>
                  <span className={`mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full border ${seg.bgColor} ${seg.borderColor} ${seg.color}`}>
                    {seg.costImpact}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Box */}
      {selectedNode !== null && (
        <div className="bg-[var(--bg-soft)] border border-[var(--border)] rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[11px] font-bold text-[var(--text-primary)]">
                Corridor Segment Details: {segments[selectedNode].label}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Close
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            {segments[selectedNode].sublabel} — Impact on total interconnection path: <strong className="text-[var(--text-primary)]">{segments[selectedNode].costImpact}</strong>.
          </p>
        </div>
      )}

      {/* Corridor Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl p-2.5">
          <DollarSign className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <div>
            <div className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Est. Capex Range</div>
            <div className="text-[12px] font-extrabold text-[var(--text-primary)]">{capexRangeLabel}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl p-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div>
            <div className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Active Obstacles</div>
            <div className="text-[12px] font-extrabold text-[var(--text-primary)]">{barriers.length} Corridor Barriers</div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl p-2.5">
          <Zap className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
          <div>
            <div className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Voltage Upgrade</div>
            <div className="text-[12px] font-extrabold text-[var(--text-primary)]">
              {voltageCapacity.capacityConstrained ? `Req. → ${voltageCapacity.upgradeVoltageKv} kV` : 'Voltage OK'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
