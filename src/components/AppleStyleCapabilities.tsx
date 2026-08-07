'use client';

import React from 'react';

export function AppleStyleCapabilities() {
  const capabilities = [
    {
      num: '01',
      stageTag: 'UNDERSTAND',
      subtitle: 'PARCEL PARSING & ACQUISITION MANDATE',
      title: 'Candidate Portfolio Understanding',
      description: 'Atlas parses candidate property portfolios, extracts site geometries, and establishes physical criteria for commercial underwriting.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Portfolio Parsed',
    },
    {
      num: '02',
      stageTag: 'INVESTIGATE',
      subtitle: 'MIREYE API & PHYSICAL EVIDENCE SYNTHESIS',
      title: 'Physical Evidence & Location Intelligence',
      description: 'Atlas queries Mireye physical endpoints and GIS layers for slope, floodways, solar potential, and grid proximity.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Evidence Synthesized',
    },
    {
      num: '03',
      stageTag: 'UNDERWRITE',
      subtitle: 'FATAL FLAW SCREENING & REJECTION PROOFS',
      title: 'Fatal Flaw Screening & Feasibility Ranking',
      description: 'Atlas eliminates physical deal-killers, creates written rejection proofs, and ranks viable sites using multi-factor analysis.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Flaws Screened',
    },
    {
      num: '04',
      stageTag: 'SELECT',
      subtitle: 'TARGET SELECTION & DECISION EVIDENCE',
      title: 'Acquisition Target Selection',
      description: 'Atlas identifies the primary acquisition candidate and exposes the underlying physical and commercial evidence.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Target Selected',
    },
    {
      num: '05',
      stageTag: 'PERSIST',
      subtitle: 'PARCEL REGISTRATION (POST /v1/sites)',
      title: 'Target Site Registration',
      description: 'Atlas establishes a persistent Mireye site identity for candidates with verified parcel geometry. Sites without verified boundaries continue through stateless spatial analysis.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Site Registered',
    },
    {
      num: '06',
      stageTag: 'ACT',
      subtitle: 'COMMERCIAL MEMOS & LOI SITE CONTROL',
      title: 'Investment Memo & Site-Control Output',
      description: 'Atlas produces executive investment committee memos and draft land option agreements to execute site control.',
      metricLabel: 'AGENT ACTION:',
      metricValue: 'Deliverables Ready',
    },
  ];

  return (
    <div className="bg-[#080812]/90 border-2 border-white/15 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 font-sans text-left space-y-8">
      
      {/* Header Inside Card */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full">
            AUTONOMOUS LAND ACQUISITION ENGINE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            6-Stage Spatial Acquisition Lifecycle
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 font-bold">
          MIREYE PHYSICAL INTELLIGENCE BACKBONE • POST /v1/sites
        </div>
      </div>

      {/* 4 Pipeline Stages */}
      <div className="space-y-8">
        {capabilities.map((cap) => (
          <div
            key={cap.num}
            className="pt-6 border-t border-white/10 hover:border-amber-400/60 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6 group"
          >
            {/* Left Column: Number & Stage Tag */}
            <div className="md:w-1/4 space-y-1">
              <div className="flex items-center gap-3 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-amber-400">
                  {cap.num}
                </span>
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                  {cap.stageTag}
                </span>
              </div>
              <div className="text-[11px] font-mono text-amber-500/80 font-bold uppercase tracking-wider">
                {cap.subtitle}
              </div>
            </div>

            {/* Center Column: Title & Description */}
            <div className="md:w-1/2 space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                {cap.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {cap.description}
              </p>
            </div>

            {/* Right Column: Stage Metric */}
            <div className="md:w-1/4 md:text-right font-mono text-xs">
              <span className="text-slate-400 font-bold uppercase block">{cap.metricLabel}</span>
              <span className="text-amber-400 font-black text-sm block mt-0.5">{cap.metricValue}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
