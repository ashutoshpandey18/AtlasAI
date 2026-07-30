'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Zap,
  MapPin,
  Activity,
  CheckCircle2,
  XCircle,
  Info,
  Layers,
  BookOpen,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import type { LocationResult } from '@/types/atlas';
import { validateCentroid } from '@/services/centroidValidator';
import { analyzeGridCapacity } from '@/services/gridCapacityEngine';
import { analyzeBuildableArea } from '@/services/buildableAreaHarness';
import RegulatoryIntelligenceCard from './RegulatoryIntelligenceCard';
import CorridorVisualizer from './CorridorVisualizer';
import BuildableAreaCard from './BuildableAreaCard';

interface Props {
  result: LocationResult;
  projectMw?: number;
}

type IntelligenceTab = 'overview' | 'centroid' | 'buildable' | 'grid' | 'regulatory';

export default function GisIntelligencePanel({ result, projectMw = 100 }: Props) {
  const { location, data } = result;
  const [activeTab, setActiveTab] = useState<IntelligenceTab>('overview');

  // ── Run calculations ───────────────────────────────────────────────────────
  const centroidVal = useMemo(() => {
    if (!data || location.lat === null) return null;
    return validateCentroid(location.address, data);
  }, [data, location.address, location.lat]);

  const gridCapacity = useMemo(() => {
    if (!data) return null;
    return analyzeGridCapacity(data, projectMw);
  }, [data, projectMw]);

  const buildableReport = useMemo(() => {
    if (!data) return null;
    return analyzeBuildableArea(data, projectMw <= 50 ? 50 : 100, 100);
  }, [data, projectMw]);

  if (!data || !centroidVal || !gridCapacity || !buildableReport) return null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const riskColor = {
    clean:    { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700',  dot: 'bg-emerald-500' },
    low:      { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700',  dot: 'bg-emerald-500' },
    medium:   { bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-800',    dot: 'bg-amber-500'   },
    high:     { bg: 'bg-orange-50',   border: 'border-orange-200',  text: 'text-orange-800',   dot: 'bg-orange-500'  },
    critical: { bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',      dot: 'bg-red-500'     },
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
    clean:    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-px" />,
    critical: <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-px" />,
    high:     <AlertTriangle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-px" />,
    medium:   <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-px" />,
    low:      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-px" />,
  };

  const capexLabel = gridCapacity.estimatedCapexLowUsd !== null && gridCapacity.estimatedCapexHighUsd !== null
    ? `$${(gridCapacity.estimatedCapexLowUsd / 1_000_000).toFixed(1)}M – $${(gridCapacity.estimatedCapexHighUsd / 1_000_000).toFixed(1)}M`
    : gridCapacity.capexRangeLabel;

  return (
    <div className="flex flex-col gap-4">
      {/* Panel Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
            GIS Intelligence & Pre-Flight Suite
          </span>
          <h3 className="text-[14px] font-black text-[var(--text-primary)] tracking-tight">
            Spatial Data Quality, Grid & Regulatory Audit
          </h3>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-1 bg-[#FAF8F3] border border-[#E5DFD3] p-1 rounded-xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: SlidersHorizontal },
            { id: 'centroid', label: 'Centroid', icon: MapPin },
            { id: 'buildable', label: 'Buildable', icon: Layers },
            { id: 'grid', label: 'Grid & Path', icon: Zap },
            { id: 'regulatory', label: 'RAG Tariff', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as IntelligenceTab)}
                className={`flex items-center gap-1.5 text-[10.5px] font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[var(--text-primary)] shadow-sm border border-[#E5DFD3]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-[var(--text-muted)]'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive At-a-Glance Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: Centroid */}
        <button
          onClick={() => setActiveTab('centroid')}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
            activeTab === 'centroid' ? 'ring-2 ring-amber-500/30 border-amber-400 bg-white' : 'bg-[#FAF8F3] border-[#E5DFD3] hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Centroid</span>
            <MapPin className={`w-3.5 h-3.5 ${centroidRisk.text}`} />
          </div>
          <div className="text-[13px] font-black text-[var(--text-primary)]">
            {centroidVal.centroidConfidenceScore}/100 <span className="text-[10px] font-bold text-amber-700">({centroidVal.overallRisk.toUpperCase()})</span>
          </div>
        </button>

        {/* Metric 2: Buildable */}
        <button
          onClick={() => setActiveTab('buildable')}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
            activeTab === 'buildable' ? 'ring-2 ring-amber-500/30 border-amber-400 bg-white' : 'bg-[#FAF8F3] border-[#E5DFD3] hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Buildable</span>
            <Layers className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-[13px] font-black text-[var(--text-primary)]">
            {buildableReport.netBuildableAcres} Ac <span className="text-[10px] font-bold text-emerald-600">({buildableReport.buildableEfficiencyPct}%)</span>
          </div>
        </button>

        {/* Metric 3: Capex */}
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
            activeTab === 'grid' ? 'ring-2 ring-amber-500/30 border-amber-400 bg-white' : 'bg-[#FAF8F3] border-[#E5DFD3] hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Est. Capex</span>
            <Zap className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <div className="text-[13px] font-black text-[var(--text-primary)]">
            {capexLabel}
          </div>
        </button>

        {/* Metric 4: Queue Risk */}
        <button
          onClick={() => setActiveTab('regulatory')}
          className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
            activeTab === 'regulatory' ? 'ring-2 ring-amber-500/30 border-amber-400 bg-white' : 'bg-[#FAF8F3] border-[#E5DFD3] hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">RTO Queue</span>
            <Activity className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-[13px] font-black text-[var(--text-primary)]">
            {gridCapacity.queueRisk.rtoRegion} <span className="text-[10px] font-bold text-amber-700">({gridCapacity.queueRisk.queueRisk})</span>
          </div>
        </button>
      </div>

      {/* ── TAB CONTENT VIEWS ────────────────────────────────────────────────── */}

      {/* VIEW 1: OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Centroid Validation Card */}
            <div className={`rounded-[22px] border p-5 shadow-sm bg-white ${centroidRisk.border}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${centroidRisk.text}`} />
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                    Centroid Precision
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${centroidRisk.bg} ${centroidRisk.border} ${centroidRisk.text}`}>
                  {centroidVal.overallRisk.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mb-3">
                Geocode Confidence: <strong>{centroidVal.centroidConfidenceScore}/100</strong>. {centroidVal.flags.length === 0 ? 'No alignment errors detected.' : `${centroidVal.flags.length} potential alignment flags.`}
              </p>
              <button
                onClick={() => setActiveTab('centroid')}
                className="text-[10.5px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                View Centroid Audit <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Grid Capacity Card */}
            <div className="rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                    Grid & Interconnection
                  </span>
                </div>
                <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                  {gridCapacity.compositeBarrierMultiplier.toFixed(2)}× Barrier Multiplier
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mb-3">
                Est. Capex: <strong>{capexLabel}</strong>. Transmission distance: {(gridCapacity.adjustedDistanceMeters! / 1000).toFixed(1)} km adjusted.
              </p>
              <button
                onClick={() => setActiveTab('grid')}
                className="text-[10.5px] font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1"
              >
                View Cable Path & Interconnection <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <BuildableAreaCard
            data={data}
            targetRequiredAcres={projectMw <= 50 ? 50 : 100}
            totalParcelAcres={100}
          />
        </div>
      )}

      {/* VIEW 2: CENTROID TAB */}
      {activeTab === 'centroid' && (
        <div className="animate-fadeIn">
          <div className={`rounded-[22px] border p-5 shadow-sm bg-white ${centroidRisk.border}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${centroidRisk.text}`} />
                <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                  Centroid Misalignment Audit
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${centroidRisk.bg} ${centroidRisk.border} ${centroidRisk.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${centroidRisk.dot}`} />
                {centroidVal.overallRisk === 'clean' ? 'CLEAN' : centroidVal.overallRisk.toUpperCase()}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[10px] text-[var(--text-muted)] font-semibold">Centroid Confidence Score</span>
                <span className={`text-[20px] font-black leading-none ${centroidRisk.text}`}>
                  {centroidVal.centroidConfidenceScore}<span className="text-[11px] font-normal text-[var(--text-muted)]">/100</span>
                </span>
              </div>
              <div className="h-2 bg-[#EAE4D9] rounded-full overflow-hidden border border-[#DCD5C7]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    centroidVal.centroidConfidenceScore >= 80 ? 'bg-emerald-500' :
                    centroidVal.centroidConfidenceScore >= 55 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${centroidVal.centroidConfidenceScore}%` }}
                />
              </div>
            </div>

            {centroidVal.shouldBlock && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 mb-3">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-[11px] font-bold text-red-800">
                  BLOCKED — Coordinate ambiguity detected. Re-geocode with exact street address.
                </span>
              </div>
            )}

            {centroidVal.flags.length === 0 ? (
              <div className="flex items-center gap-2 text-[12px] text-emerald-700 font-bold mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <CheckCircle2 className="w-4 h-4" />
                No centroid misalignment detected for this coordinate.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {centroidVal.flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-3">
                    {severityIcon[flag.severity]}
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wide">
                        {flag.code}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5 leading-snug">
                        {flag.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: BUILDABLE TAB */}
      {activeTab === 'buildable' && (
        <div className="animate-fadeIn">
          <BuildableAreaCard
            data={data}
            targetRequiredAcres={projectMw <= 50 ? 50 : 100}
            totalParcelAcres={100}
          />
        </div>
      )}

      {/* VIEW 4: GRID TAB */}
      {activeTab === 'grid' && (
        <div className="animate-fadeIn">
          <CorridorVisualizer
            gridCapacity={gridCapacity}
            siteLabel={location.label || location.address || 'Candidate Site'}
            projectMw={projectMw}
          />
        </div>
      )}

      {/* VIEW 5: REGULATORY RAG TAB */}
      {activeTab === 'regulatory' && (
        <div className="animate-fadeIn">
          <RegulatoryIntelligenceCard
            lat={location.lat!}
            lng={location.lng!}
            useCaseName={result.fieldScores.length > 0 ? 'Infrastructure' : 'Solar Farm'}
            projectMw={projectMw}
            gridCapacity={gridCapacity}
          />
        </div>
      )}
    </div>
  );
}
