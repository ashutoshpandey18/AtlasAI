'use client';

import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

export function DecisionEvidenceSection() {
  const pipelineSteps = [
    {
      num: '01',
      stage: 'RAW GIS INGESTION',
      tag: 'NREL / USGS / FEMA / EIA',
      title: 'Physical Ground Truth',
      description: 'Ingests 5 raw spatial layers: 2,131 kWh/m²/yr solar irradiance, 2.1° 3D slope LiDAR, FEMA flood zone polygons, and 138kV grid lines.',
      metricLabel: 'STAGE METRIC:',
      metricValue: '5 Raw Layers',
    },
    {
      num: '02',
      stage: 'FEATURE SYNTHESIS',
      tag: 'SYNTHESIZER & CITATION LEDGER',
      title: 'Mireye Evidence Engine',
      description: 'Synthesizes raw geospatial attributes into structured Decision Evidence with timestamped citations and zero manual map inspecting.',
      metricLabel: 'STAGE METRIC:',
      metricValue: '180ms Latency',
    },
    {
      num: '03',
      stage: 'FLAW SCREENING',
      tag: 'WRITTEN REJECTION PROOFS',
      title: 'Rejection Ledger',
      description: 'Automatically screens store candidate portfolios and cuts unviable sites with written proofs before engineering capital is wasted.',
      metricLabel: 'STAGE METRIC:',
      metricValue: '0 Capital Wasted',
    },
    {
      num: '04',
      stage: 'LOI UNDERWRITING',
      tag: '30% IRA ITC & LOI CONTRACT',
      title: '3-Page Investment Memo',
      description: 'Generates printable investment committee memos with 30% IRA ITC tax equity modeling ($224k benefit) and non-binding option LOI contracts.',
      metricLabel: 'STAGE METRIC:',
      metricValue: '19.8% Net IRR',
    },
  ];

  return (
    <section id="evidence" className="relative z-10 max-w-[1140px] w-full mx-auto px-6 mb-28 text-left font-sans">
      
      {/* Section Header (Pure Borderless Typography) */}
      <div className="max-w-2xl mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>MIREYE SPATIAL PIPELINE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Turn Raw GIS Layers into Decision Evidence
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          Instead of exposing raw geospatial attributes, Atlas translates Mireye's structured location intelligence into verified Decision Evidence. Every solar yield number, slope degree, and flood hazard is cited with timestamped sources.
        </p>
      </div>

      {/* PURE BORDERLESS SPATIAL PIPELINE LIST STREAM (0 Cards, 0 Outer Div Containers) */}
      <div className="space-y-8">
        {pipelineSteps.map((step) => (
          <div
            key={step.num}
            className="pt-6 border-t border-white/10 hover:border-amber-400/50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6 group"
          >
            {/* Left Column: Number & Stage Tag */}
            <div className="md:w-1/4 space-y-1 font-mono">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-black text-amber-400">
                  {step.num}
                </span>
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                  {step.stage}
                </span>
              </div>
              <div className="text-[11px] text-amber-400/80 font-bold uppercase tracking-wider">
                {step.tag}
              </div>
            </div>

            {/* Center Column: Title & Description */}
            <div className="md:w-1/2 space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>

            {/* Right Column: Stage Metric */}
            <div className="md:w-1/4 md:text-right font-mono text-xs">
              <span className="text-slate-400 font-bold uppercase block">{step.metricLabel}</span>
              <span className="text-amber-400 font-black text-sm block mt-0.5">{step.metricValue}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MIREYE EVIDENCE BUSINESS IMPACT STREAM (Borderless Spatial Layout) */}
      <div className="mt-14 pt-8 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>MIREYE EVIDENCE PROOF-OF-WORK • BUSINESS IMPACT MATRIX</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">LIVE MIREYE API FEED</span>
        </div>

        {/* Pure Borderless Table Stream */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold text-[11px] uppercase">
                <th className="py-3 px-2">Mireye Attribute</th>
                <th className="py-3 px-2">Physical Value</th>
                <th className="py-3 px-2">Dataset Source & Timestamp</th>
                <th className="py-3 px-2 font-sans">Business Impact (WHY It Matters)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-300">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-2 font-bold text-white">Ground Slope LiDAR</td>
                <td className="py-3 px-2 font-bold text-emerald-400">1.2° (Flat Class)</td>
                <td className="py-3 px-2 text-slate-400 text-[11px]">USGS 3DEP 1m COG • 2026-08-02</td>
                <td className="py-3 px-2 font-sans font-medium text-slate-200">
                  Flat terrain. Zero cut-and-fill civil grading required. <strong className="text-slate-100 font-bold">Estimated CapEx savings: ~$145,000</strong>.
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-2 font-bold text-white">FEMA Flood Hazard</td>
                <td className="py-3 px-2 font-bold text-emerald-400">Zone X (Unencumbered)</td>
                <td className="py-3 px-2 text-slate-400 text-[11px]">FEMA NFHL WMS v24.1 • 2026-08-02</td>
                <td className="py-3 px-2 font-sans font-medium text-slate-200">
                  Outside Special Flood Hazard Area. Zero base flood elevation mandates or commercial flood insurance premiums.
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-2 font-bold text-white">Plane-of-Array Irradiance</td>
                <td className="py-3 px-2 font-bold text-emerald-400">2,131 kWh/m²/yr</td>
                <td className="py-3 px-2 text-slate-400 text-[11px]">NREL PVWatts v8 • 2026-08-02</td>
                <td className="py-3 px-2 font-sans font-medium text-slate-200">
                  Tier-1 prime solar resource. Yields <strong className="text-slate-100 font-bold">+14.2% higher annual MWh revenue</strong> vs regional benchmark.
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-2 font-bold text-white">138kV Power Grid Feeder</td>
                <td className="py-3 px-2 font-bold text-emerald-400">&lt; 480m Distance</td>
                <td className="py-3 px-2 text-slate-400 text-[11px]">EIA Electric Power Grid • 2026-08-02</td>
                <td className="py-3 px-2 font-sans font-medium text-slate-200">
                  Direct distribution feeder access. Reduces gen-tie interconnect timeline to &lt; 12 months.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pure Borderless Citation Footer Banner */}
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>VERIFIED GIS SOURCES: NREL PVWatts v8 • USGS 3DEP COG • FEMA NFHL WMS • EIA Power Grid</span>
        </div>
        <div className="text-[10px] text-slate-400">Timestamped Proof of Work Sync</div>
      </div>

    </section>
  );
}
