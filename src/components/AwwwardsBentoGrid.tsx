'use client';

import React, { useState } from 'react';
import { Cpu, ShieldAlert, FileText, Sliders, CheckCircle, ArrowRight, Play, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

export function AwwwardsBentoGrid() {
  // Bento Tile 1: Siting Rules State
  const [minRatio, setMinRatio] = useState(2.5);
  const [maxCapex, setMaxCapex] = useState(2.0);

  // Bento Tile 2: Simulated Rejection Terminal State
  const [isScanningFlaws, setIsScanningFlaws] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const simulateFlawScan = () => {
    setIsScanningFlaws(true);
    setScanStep(1);
    setTimeout(() => setScanStep(2), 1200);
    setTimeout(() => {
      setScanStep(3);
      setIsScanningFlaws(false);
    }, 2400);
  };

  // Bento Tile 3: Pro-Forma Tax Credit State
  const [arraySizeKw, setArraySizeKw] = useState(350);
  const estimatedCapex = Math.round(arraySizeKw * 2150);
  const iraTaxCredit = Math.round(estimatedCapex * 0.3);
  const netEquityIrr = (14.5 + (arraySizeKw / 100) * 1.5).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      
      {/* BENTO TILE 1: ACQUISITION PLANNER INTERACTIVE RULE BUILDER */}
      <div className="bg-[#0c0c16]/90 border-2 border-white/15 hover:border-amber-500/60 p-7 rounded-3xl backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300 group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sliders className="w-3 h-3" />
              <span>STAGE 01 // RULES ENGINE</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:rotate-12 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Acquisition Planner</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium mb-6">
            Formulates commercial siting rules, parking lot coverage thresholds ($\ge 2.5\times$), fee-simple corporate ownership filters, and grid ISO queue constraints.
          </p>
        </div>

        {/* Live Interactive Siting Sliders */}
        <div className="bg-[#05050c] border border-white/15 p-4 rounded-2xl space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span className="text-[11px] font-bold">MIN PARKING LOT RATIO:</span>
              <span className="text-amber-400 font-black">{minRatio}x Array</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="4.0"
              step="0.1"
              value={minRatio}
              onChange={(e) => setMinRatio(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-white/10 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span className="text-[11px] font-bold">MAX CAPEX CAP:</span>
              <span className="text-amber-400 font-black">${maxCapex.toFixed(1)}M</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.2"
              value={maxCapex}
              onChange={(e) => setMaxCapex(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-white/10 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-sans">Qualified Parcels:</span>
            <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
              {Math.round(66 * (4.0 / minRatio))} Sites Match
            </span>
          </div>
        </div>
      </div>

      {/* BENTO TILE 2: WRITTEN REJECTION PROOFS LIVE TERMINAL SCANNER */}
      <div className="bg-[#0c0c16]/90 border-2 border-white/15 hover:border-rose-500/60 p-7 rounded-3xl backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300 group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              <span>STAGE 02 // FATAL FLAW LEDGER</span>
            </span>
            <button
              type="button"
              onClick={simulateFlawScan}
              disabled={isScanningFlaws}
              className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${isScanningFlaws ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Written Rejection Proofs</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium mb-6">
            Automatically screens candidate store portfolios and cuts unviable sites with written proofs for flood hazards, steep slopes, or grid congestion.
          </p>
        </div>

        {/* Live Terminal Rejection Proof Log */}
        <div className="bg-[#05050c] border border-white/15 p-4 rounded-2xl space-y-2 font-mono text-[11px] text-slate-300 min-h-[140px] flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-white/10 pb-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>FLAW SIMULATOR LEDGER</span>
            </div>

            {scanStep === 0 && (
              <div className="text-slate-400 italic">Click refresh button above to run live flaw scan...</div>
            )}
            {scanStep >= 1 && (
              <div className="text-slate-300">• Ingesting FEMA NFHL Zone AE flood polygons...</div>
            )}
            {scanStep >= 2 && (
              <div className="text-rose-400 font-bold">• [FATAL FLAW DETECTED] Parcel #4 in 100-yr flood zone.</div>
            )}
            {scanStep >= 3 && (
              <div className="text-emerald-400 font-bold">• [WRITTEN PROOF] Nacogdoches #2 Rejected (-$18k/yr penalty).</div>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Avoided Capex Flaws:</span>
            <span className="text-rose-400 font-black">4 Sites Cut</span>
          </div>
        </div>
      </div>

      {/* BENTO TILE 3: 3-PAGE INVESTMENT MEMO PRO-FORMA FINANCIAL CALCULATOR */}
      <div className="bg-[#0c0c16]/90 border-2 border-white/15 hover:border-emerald-500/60 p-7 rounded-3xl backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300 group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              <span>STAGE 03 // PRO-FORMA ENGINE</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white mb-2 tracking-tight">3-Page Investment Memos</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium mb-6">
            Generates printable investment committee memos featuring 30% IRA ITC tax equity modeling, 5-Yr MACRS depreciation, and non-binding LOI contracts.
          </p>
        </div>

        {/* Live Pro-Forma Tax Equity Calculator */}
        <div className="bg-[#05050c] border border-white/15 p-4 rounded-2xl space-y-3 font-mono text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="text-[11px] font-bold">SOLAR SYSTEM SIZE:</span>
              <span className="text-emerald-400 font-black">{arraySizeKw} kW System</span>
            </div>
            <input
              type="range"
              min="200"
              max="600"
              step="25"
              value={arraySizeKw}
              onChange={(e) => setArraySizeKw(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 bg-white/10 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            <div className="bg-black/50 p-2 rounded-xl border border-white/10">
              <div className="text-slate-400 text-[9px]">30% IRA ITC</div>
              <div className="text-emerald-400 font-black text-xs mt-0.5">${iraTaxCredit.toLocaleString()}</div>
            </div>
            <div className="bg-black/50 p-2 rounded-xl border border-white/10">
              <div className="text-slate-400 text-[9px]">NET EQUITY IRR</div>
              <div className="text-amber-400 font-black text-xs mt-0.5">{netEquityIrr}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
