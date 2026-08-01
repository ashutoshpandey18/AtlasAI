'use client';

import React from 'react';
import { X, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, FileCheck } from 'lucide-react';

export interface AskWhyData {
  title: string;
  subtitle: string;
  inputsChecked: string[];
  rulesApplied: string[];
  conclusion: string;
  isApproved: boolean;
}

interface AskWhyModalProps {
  data: AskWhyData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AskWhyModal({ data, isOpen, onClose }: AskWhyModalProps) {
  if (!isOpen || !data) return null;

  const isFlood = data.conclusion.toLowerCase().includes('flood');
  const isSlope = data.conclusion.toLowerCase().includes('slope');
  const isGrid = data.conclusion.toLowerCase().includes('grid');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-left">
      
      {/* PURE MATTE TITANIUM CONTAINER (0% Glow, 0% Neon Laser Lines) */}
      <div className="bg-[#0d0d12] border border-white/15 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-white space-y-4 overflow-hidden">
        
        {/* Top Header: Title & Close Button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Decision Explanation</span>
            </div>
            <h3 className="text-base font-black text-white tracking-tight mt-0.5">{data.title}</h3>
            <div className="text-xs text-slate-400 font-medium">{data.subtitle}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matte Verdict Status Badge */}
        <div className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
          data.isApproved
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
        }`}>
          {data.isApproved ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>
            {data.isApproved
              ? 'VERDICT: RECOMMENDED — PROCEED TO SITE CONTROL'
              : `VERDICT: REJECTED — ${isFlood ? 'FLOODPLAIN HAZARD' : isSlope ? 'STEEP SLOPE OVERRUN' : 'GRID CONGESTION'}`}
          </span>
        </div>

        {/* 2x2 Matte Physical Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-[#14141c] border border-white/10 p-2.5 rounded-xl">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">FEMA FLOOD</div>
            <div className={`font-bold mt-0.5 text-[11px] ${isFlood ? 'text-rose-400' : 'text-slate-200'}`}>
              {isFlood ? 'Zone AE (High Risk)' : 'Zone X (Low Risk)'}
            </div>
          </div>

          <div className="bg-[#14141c] border border-white/10 p-2.5 rounded-xl">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">USGS SLOPE</div>
            <div className={`font-bold mt-0.5 text-[11px] ${isSlope ? 'text-rose-400' : 'text-slate-200'}`}>
              {isSlope ? '8.2° (Steep Grading)' : '1.2° (Flat Class)'}
            </div>
          </div>

          <div className="bg-[#14141c] border border-white/10 p-2.5 rounded-xl">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">SOLAR YIELD</div>
            <div className="text-slate-200 font-bold mt-0.5 text-[11px]">2,131 kWh/m²/yr</div>
          </div>

          <div className="bg-[#14141c] border border-white/10 p-2.5 rounded-xl">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">138kV GRID LINE</div>
            <div className={`font-bold mt-0.5 text-[11px] ${isGrid ? 'text-rose-400' : 'text-slate-200'}`}>
              {isGrid ? '1.8 km (Congested)' : '< 480m (Fast Tie-in)'}
            </div>
          </div>
        </div>

        {/* Matte Rationale Callout Box */}
        <div className={`p-3 rounded-xl border text-xs font-medium leading-relaxed ${
          data.isApproved
            ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-200'
            : 'bg-rose-950/20 border-rose-800/30 text-rose-200'
        }`}>
          "{data.conclusion}"
        </div>

        {/* Footer Close Button */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-200 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
          >
            Close Explanation
          </button>
        </div>

      </div>
    </div>
  );
}
