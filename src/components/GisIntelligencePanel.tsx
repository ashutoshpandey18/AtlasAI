'use client';

import { useMemo } from 'react';
import { AlertTriangle, ShieldCheck, Zap, MapPin, Activity, CheckCircle2, XCircle, Info } from 'lucide-react';
import type { LocationResult } from '@/types/atlas';
import { validateCentroid } from '@/services/centroidValidator';
import { analyzeGridCapacity } from '@/services/gridCapacityEngine';
import RegulatoryIntelligenceCard from './RegulatoryIntelligenceCard';
import CorridorVisualizer from './CorridorVisualizer';

interface Props {
  result: LocationResult;
  projectMw?: number;
}

export default function GisIntelligencePanel({ result, projectMw = 100 }: Props) {
  const { location, data } = result;

  // ── Run centroid validation ────────────────────────────────────────────────
  const centroidVal = useMemo(() => {
    if (!data || location.lat === null) return null;
    return validateCentroid(location.address, data);
  }, [data, location.address, location.lat]);

  // ── Run grid capacity engine ───────────────────────────────────────────────
  const gridCapacity = useMemo(() => {
    if (!data) return null;
    return analyzeGridCapacity(data, projectMw);
  }, [data, projectMw]);

  if (!data || !centroidVal || !gridCapacity) return null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const riskColor = {
    clean:    { bg: 'bg-emerald-500/10',  border: 'border-emerald-500/30', text: 'text-emerald-600',  dot: 'bg-emerald-500' },
    low:      { bg: 'bg-emerald-500/10',  border: 'border-emerald-500/30', text: 'text-emerald-600',  dot: 'bg-emerald-500' },
    medium:   { bg: 'bg-amber-500/10',    border: 'border-amber-400/30',   text: 'text-amber-600',    dot: 'bg-amber-500'   },
    high:     { bg: 'bg-orange-500/10',   border: 'border-orange-400/30',  text: 'text-orange-600',   dot: 'bg-orange-500'  },
    critical: { bg: 'bg-red-500/10',      border: 'border-red-400/30',     text: 'text-red-600',      dot: 'bg-red-500'     },
  } as const;

  const queueColor = {
    Low:      riskColor.clean,
    Moderate: riskColor.medium,
    High:     riskColor.high,
    Severe:   riskColor.critical,
  } as const;

  const centroidRisk = riskColor[centroidVal.overallRisk] ?? riskColor.medium;
  const queueRisk    = queueColor[gridCapacity.queueRisk.queueRisk as keyof typeof queueColor] ?? riskColor.medium;

  const severityIcon = {
    clean:    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-px" />,
    critical: <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-px" />,
    high:     <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-px" />,
    medium:   <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-px" />,
    low:      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-px" />,
  };

  const capexLabel = gridCapacity.estimatedCapexLowUsd !== null && gridCapacity.estimatedCapexHighUsd !== null
    ? `$${(gridCapacity.estimatedCapexLowUsd / 1_000_000).toFixed(1)}M – $${(gridCapacity.estimatedCapexHighUsd / 1_000_000).toFixed(1)}M`
    : gridCapacity.capexRangeLabel;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
        GIS Intelligence Layer — Atlas Pre-Flight Audit
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── CARD 1: Centroid Validation ─────────────────────────────────── */}
        <div className={`rounded-[22px] border p-5 shadow-sm ${centroidRisk.bg} ${centroidRisk.border}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${centroidRisk.text}`} />
              <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Centroid Validation
              </span>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${centroidRisk.bg} ${centroidRisk.border} ${centroidRisk.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${centroidRisk.dot}`} />
              {centroidVal.overallRisk === 'clean' ? 'CLEAN' : centroidVal.overallRisk.toUpperCase()}
            </span>
          </div>

          {/* Score bar */}
          <div className="mb-4">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold">Centroid Confidence</span>
              <span className={`text-[20px] font-black leading-none ${centroidRisk.text}`}>
                {centroidVal.centroidConfidenceScore}<span className="text-[11px] font-normal text-[var(--text-muted)]">/100</span>
              </span>
            </div>
            <div className="h-1.5 bg-[var(--bg-soft)] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  centroidVal.centroidConfidenceScore >= 80 ? 'bg-emerald-500' :
                  centroidVal.centroidConfidenceScore >= 55 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${centroidVal.centroidConfidenceScore}%` }}
              />
            </div>
          </div>

          {/* shouldBlock banner */}
          {centroidVal.shouldBlock && (
            <div className="flex items-center gap-2 bg-red-500/15 border border-red-400/30 rounded-xl px-3 py-2.5 mb-3">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-[11px] font-bold text-red-700">
                BLOCKED — Do not use this coordinate in scoring
              </span>
            </div>
          )}

          {/* Flags list */}
          {centroidVal.flags.length === 0 ? (
            <div className="flex items-center gap-2 text-[12px] text-emerald-600 font-semibold mt-1">
              <CheckCircle2 className="w-4 h-4" />
              No centroid misalignment detected
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {centroidVal.flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 bg-[var(--bg)]/60 border border-[var(--border)] rounded-xl px-3 py-2.5">
                  {severityIcon[flag.severity]}
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-bold text-[var(--text-primary)] uppercase tracking-wide">
                      {flag.code}
                    </div>
                    <div className="text-[10.5px] text-[var(--text-secondary)] font-medium mt-0.5 leading-snug">
                      {flag.message}
                    </div>
                    {flag.poisonedFields && flag.poisonedFields.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {flag.poisonedFields.map((f) => (
                          <span key={f} className="text-[9px] font-bold bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendation */}
          {centroidVal.recommendation && (
            <p className="mt-3 text-[10.5px] text-[var(--text-muted)] font-medium leading-snug italic border-t border-[var(--border)] pt-2.5">
              {centroidVal.recommendation}
            </p>
          )}
        </div>

        {/* ── CARD 2: Grid Capacity Engine ────────────────────────────────── */}
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Grid Capacity Engine
              </span>
            </div>
            <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2 py-0.5 rounded-full">
              {gridCapacity.queueRisk.rtoRegion}
            </span>
          </div>

          {/* Voltage + Distance stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3">
              <div className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Raw Distance</div>
              <div className="text-[16px] font-black text-[var(--text-primary)] leading-none">
                {gridCapacity.rawDistanceMeters !== null
                  ? `${(gridCapacity.rawDistanceMeters / 1000).toFixed(1)} km`
                  : '—'}
              </div>
            </div>
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3">
              <div className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Adj. Distance</div>
              <div className={`text-[16px] font-black leading-none ${
                gridCapacity.compositeBarrierMultiplier > 1.5 ? 'text-red-500' :
                gridCapacity.compositeBarrierMultiplier > 1.0 ? 'text-amber-500' : 'text-[var(--text-primary)]'
              }`}>
                {gridCapacity.adjustedDistanceMeters !== null
                  ? `${(gridCapacity.adjustedDistanceMeters / 1000).toFixed(1)} km`
                  : '—'}
              </div>
            </div>
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3">
              <div className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Voltage Class</div>
              <div className="text-[14px] font-black text-[var(--text-primary)] leading-none">
                {gridCapacity.voltageCapacity.nearestVoltageKv ? `${gridCapacity.voltageCapacity.nearestVoltageKv} kV` : '—'}
              </div>
            </div>
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3">
              <div className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Barrier ×</div>
              <div className={`text-[16px] font-black leading-none ${
                gridCapacity.compositeBarrierMultiplier >= 2.0 ? 'text-red-500' :
                gridCapacity.compositeBarrierMultiplier > 1.0 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {gridCapacity.compositeBarrierMultiplier.toFixed(2)}×
              </div>
            </div>
          </div>

          {/* Capex estimate */}
          <div className="bg-[var(--bg-soft)]/60 border border-[var(--border)] rounded-xl px-4 py-3">
            <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-muted)] mb-1">
              Est. Interconnection Capex ({projectMw} MW)
            </div>
            <div className="text-[18px] font-black text-[var(--text-primary)]">{capexLabel}</div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
              {gridCapacity.voltageCapacity.capacityConstrained
                ? `⚠ Voltage upgrade required → ${gridCapacity.voltageCapacity.upgradeVoltageKv} kV`
                : 'Voltage sufficient for project MW'}
            </div>
          </div>

          {/* Active barriers */}
          {gridCapacity.barriers.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Active Corridor Barriers
              </div>
              {gridCapacity.barriers.map((b, i) => (
                <div key={i} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <span className="text-[11px] font-bold text-amber-800">{b.label}</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    {b.multiplier.toFixed(2)}×
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* RTO Queue Risk */}
          <div className={`rounded-xl border px-4 py-3 ${queueRisk.bg} ${queueRisk.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${queueRisk.text}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                  Queue Risk
                </span>
              </div>
              <span className={`text-[10px] font-bold ${queueRisk.text}`}>
                {gridCapacity.queueRisk.queueRisk} — ~{gridCapacity.queueRisk.estimatedQueueMonths} mo.
              </span>
            </div>
          </div>

          {/* Engine confidence */}
          <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
            <ShieldCheck className={`w-3.5 h-3.5 ${gridCapacity.engineConfidence === 'high' ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="text-[10px] text-[var(--text-muted)] font-semibold">
              Engine confidence: <span className={gridCapacity.engineConfidence === 'high' ? 'text-emerald-600' : 'text-amber-600'}>{gridCapacity.engineConfidence}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Corridor Cable Path Visualizer */}
      <CorridorVisualizer
        gridCapacity={gridCapacity}
        siteLabel={location.label || location.address || 'Candidate Site'}
        projectMw={projectMw}
      />

      {/* RAG Regulatory Intelligence */}
      <RegulatoryIntelligenceCard
        lat={location.lat!}
        lng={location.lng!}
        useCaseName={result.fieldScores.length > 0 ? 'Infrastructure' : 'Solar Farm'}
        projectMw={projectMw}
        gridCapacity={gridCapacity}
      />
    </div>
  );
}
