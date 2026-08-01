'use client';

import React, { useState } from 'react';
import { Sun, Sparkles, Zap, ShieldCheck, DollarSign, Sliders, Layers } from 'lucide-react';

export function SplineSolarViewer() {
  const [panelTilt, setPanelTilt] = useState<number>(25);
  const [systemKw, setSystemKw] = useState<number>(350);

  const annualGenerationKwh = Math.round(systemKw * 1480);
  const taxCreditBenefit = Math.round(systemKw * 2150 * 0.3);
  const netIrr = (14.5 + (systemKw / 100) * 1.5).toFixed(1);

  return (
    <div className="relative w-full bg-[#0a0a14]/90 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] mb-8 overflow-hidden text-left">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">3D Commercial Solar Canopy Inspector</h3>
            <div className="text-xs font-mono text-slate-400">Solar Carport Array & BESS Energy Storage Underwriting</div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>30% IRA ITC QUALIFIED</span>
          </span>
        </div>
      </div>

      {/* 3D Interactive Solar Canopy & Photovoltaic Cell Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-center">
        
        {/* Left Column: 3D Solar Panel Matrix Render */}
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl bg-[#04040a] border border-white/15 overflow-hidden flex flex-col justify-between p-6">
          
          {/* Spatial Grid Shader */}
          <div className="absolute inset-0 bg-spatial-grid opacity-20 pointer-events-none" />

          {/* Floating Solar Array Grid */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="bg-black/80 border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl font-mono text-[10px]">
              <div className="text-slate-400 font-bold">SOLAR MODULE TYPE</div>
              <div className="text-amber-400 font-black text-xs mt-0.5">Bifacial Monocrystalline 550W</div>
            </div>

            <div className="bg-black/80 border border-emerald-500/40 backdrop-blur-md px-3.5 py-2 rounded-xl font-mono text-[10px] text-right">
              <div className="text-slate-400 font-bold">ANNUAL GENERATION</div>
              <div className="text-emerald-400 font-black text-xs mt-0.5">{annualGenerationKwh.toLocaleString()} kWh/yr</div>
            </div>
          </div>

          {/* 3D Solar Panel Grid Simulation Graphics */}
          <div className="relative z-10 my-auto flex justify-center items-center">
            <div
              className="w-full max-w-md h-36 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-indigo-950/80 via-amber-950/40 to-slate-950/80 shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-transform duration-500 flex flex-col justify-between p-4 relative"
              style={{ transform: `perspective(600px) rotateX(${panelTilt}deg)` }}
            >
              {/* PV Module Cells Grid */}
              <div className="grid grid-cols-6 gap-1.5 h-full opacity-80">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="bg-indigo-600/20 border border-indigo-400/40 rounded-md hover:bg-amber-500/40 transition-colors" />
                ))}
              </div>

              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-mono font-black text-[9.5px] px-3 py-0.5 rounded-full shadow-md">
                SOLAR ARRAY TILT: {panelTilt}° SOUTH
              </div>
            </div>
          </div>

          {/* Bottom Grid Status */}
          <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Interconnect Voltage: 138kV Substation</span>
            </div>
            <div>BESS Battery: 500 kWh Ready</div>
          </div>
        </div>

        {/* Right Column: Interactive Financial & Physical Controls */}
        <div className="space-y-4 font-mono text-xs text-left">
          
          <div className="bg-[#05050e] border border-white/15 p-4 rounded-2xl space-y-4">
            
            {/* System Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span className="text-[11px] font-bold">SOLAR SYSTEM SIZE:</span>
                <span className="text-amber-400 font-black text-sm">{systemKw} kW DC</span>
              </div>
              <input
                type="range"
                min="200"
                max="750"
                step="25"
                value={systemKw}
                onChange={(e) => setSystemKw(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 bg-white/10 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* Panel Tilt Angle Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span className="text-[11px] font-bold font-mono">PANEL TILT ANGLE:</span>
                <span className="text-amber-400 font-black text-sm">{panelTilt}° South</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="5"
                value={panelTilt}
                onChange={(e) => setPanelTilt(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 bg-white/10 rounded-lg h-1.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Underwriting Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-black/60 p-3 rounded-2xl border border-white/10">
              <div className="text-slate-400 text-[9px] font-bold">30% IRA ITC BENEFIT</div>
              <div className="text-emerald-400 font-black text-sm mt-0.5">${taxCreditBenefit.toLocaleString()}</div>
            </div>
            <div className="bg-black/60 p-3 rounded-2xl border border-white/10">
              <div className="text-slate-400 text-[9px] font-bold">PROJECT EQUITY IRR</div>
              <div className="text-amber-400 font-black text-sm mt-0.5">{netIrr}% Return</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
