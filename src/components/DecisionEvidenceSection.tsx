'use client';

import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

export function DecisionEvidenceSection() {
  const pipelineSteps = [
    {
      num: '01',
      stage: 'UNDERSTAND',
      tag: 'PARCEL PARSING & ACQUISITION MANDATE',
      title: 'Candidate Portfolio Understanding',
      description: 'Atlas parses candidate property portfolios, extracts site geometries, and establishes physical criteria for commercial underwriting.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Portfolio Parsed',
    },
    {
      num: '02',
      stage: 'INVESTIGATE',
      tag: 'MIREYE API & PHYSICAL EVIDENCE SYNTHESIS',
      title: 'Physical Evidence & Location Intelligence',
      description: 'Atlas queries Mireye physical endpoints and GIS layers for slope, floodways, solar potential, and grid proximity.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Evidence Synthesized',
    },
    {
      num: '03',
      stage: 'UNDERWRITE',
      tag: 'FATAL FLAW SCREENING & REJECTION PROOFS',
      title: 'Fatal Flaw Screening & Feasibility Ranking',
      description: 'Atlas eliminates physical deal-killers, creates written rejection proofs, and ranks viable sites using multi-factor analysis.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Flaws Screened',
    },
    {
      num: '04',
      stage: 'SELECT',
      tag: 'TARGET SELECTION & DECISION EVIDENCE',
      title: 'Acquisition Target Selection',
      description: 'Atlas identifies the primary acquisition candidate and exposes the underlying physical and commercial evidence.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Target Selected',
    },
    {
      num: '05',
      stage: 'PERSIST',
      tag: 'PARCEL REGISTRATION (POST /v1/sites)',
      title: 'Target Site Registration',
      description: 'Atlas establishes a persistent Mireye site identity for candidates with verified parcel geometry. Sites without verified boundaries continue through stateless spatial analysis.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Site Registered',
    },
    {
      num: '06',
      stage: 'ACT',
      tag: 'COMMERCIAL MEMOS & LOI SITE CONTROL',
      title: 'Investment Memo & Site-Control Output',
      description: 'Atlas produces executive investment committee memos and draft land option agreements to execute site control.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Deliverables Ready',
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
                  Flat terrain. Zero cut-and-fill civil grading required for solar tracking array racking.
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-2 font-bold text-white">FEMA Flood Hazard</td>
                <td className="py-3 px-2 font-bold text-emerald-400">Zone X (Unencumbered)</td>
                <td className="py-3 px-2 text-slate-400 text-[11px]">FEMA NFHL WMS v24.1 • 2026-08-02</td>
                <td className="py-3 px-2 font-sans font-medium text-slate-200">
                  Outside Special Flood Hazard Area. Zero base flood elevation mandates or mandatory commercial flood insurance.
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-2 font-bold text-white">Plane-of-Array Irradiance</td>
                <td className="py-3 px-2 font-bold text-emerald-400">2,131 kWh/m²/yr</td>
                <td className="py-3 px-2 text-slate-400 text-[11px]">NREL PVWatts v8 • 2026-08-02</td>
                <td className="py-3 px-2 font-sans font-medium text-slate-200">
                  Tier-1 prime solar resource. Optimal solar irradiance yield for commercial utility export.
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-2 font-bold text-white">138kV Power Grid Feeder</td>
                <td className="py-3 px-2 font-bold text-emerald-400">&lt; 480m Distance</td>
                <td className="py-3 px-2 text-slate-400 text-[11px]">EIA Electric Power Grid • 2026-08-02</td>
                <td className="py-3 px-2 font-sans font-medium text-slate-200">
                  Direct distribution feeder access. Reduces gen-tie interconnect extension timeline and cost.
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-2 font-bold text-white">Mireye Site Dossier</td>
                <td className="py-3 px-2 font-bold text-emerald-400">Registered (POST /v1/sites)</td>
                <td className="py-3 px-2 text-slate-400 text-[11px]">Mireye Earth API v0.14.0 • 2026-08-02</td>
                <td className="py-3 px-2 font-sans font-medium text-slate-200">
                  Persistent site identity created (`site_id`). Enables dossier-backed Copilot due diligence via `/v1/ask-site`.
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
