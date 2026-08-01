'use client';

import React from 'react';

export function AppleStyleCapabilities() {
  const capabilities = [
    {
      num: '01',
      stageTag: 'RAW GIS INGESTION',
      subtitle: 'NREL / USGS / FEMA / EIA',
      title: 'Physical Ground Truth',
      description: 'Ingests 5 raw spatial layers: 2,131 kWh/m²/yr solar irradiance, 2.1° 3D slope LiDAR, FEMA flood zone polygons, and 138kV grid lines.',
      metricLabel: 'STAGE METRIC:',
      metricValue: '5 Raw Layers',
    },
    {
      num: '02',
      stageTag: 'FEATURE SYNTHESIS',
      subtitle: 'SYNTHESIZER & CITATION LEDGER',
      title: 'Mireye Evidence Engine',
      description: 'Synthesizes raw geospatial attributes into structured Decision Evidence with timestamped citations and zero manual map inspecting.',
      metricLabel: 'STAGE METRIC:',
      metricValue: '180ms Latency',
    },
    {
      num: '03',
      stageTag: 'FLAW SCREENING',
      subtitle: 'WRITTEN REJECTION PROOFS',
      title: 'Rejection Ledger',
      description: 'Automatically screens store candidate portfolios and cuts unviable sites with written proofs before engineering capital is wasted.',
      metricLabel: 'STAGE METRIC:',
      metricValue: '0 Capital Wasted',
    },
    {
      num: '04',
      stageTag: 'LOI UNDERWRITING',
      subtitle: '30% IRA ITC & LOI CONTRACT',
      title: '3-Page Investment Memo',
      description: 'Generates printable investment committee memos with 30% IRA ITC tax equity modeling ($224k benefit) and non-binding option LOI contracts.',
      metricLabel: 'STAGE METRIC:',
      metricValue: '19.8% Net IRR',
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
            4-Stage Spatial Pipeline Architecture
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 font-bold">
          MIREYE API VERIFIED • ERCOT / FRCC / SERC
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
                  {cap.num} //
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
