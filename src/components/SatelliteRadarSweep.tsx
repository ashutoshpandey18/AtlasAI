'use client';

import React, { useEffect, useState } from 'react';
import { Compass, Satellite, ShieldCheck, Zap } from 'lucide-react';

export function SatelliteRadarSweep() {
  const [lat, setLat] = useState(31.8614);
  const [lng, setLng] = useState(-102.3421);

  useEffect(() => {
    const interval = setInterval(() => {
      setLat((prev) => +(prev + (Math.random() - 0.5) * 0.005).toFixed(4));
      setLng((prev) => +(prev + (Math.random() - 0.5) * 0.005).toFixed(4));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* TOP-LEFT ORBITAL SATELLITE RADAR SCANNER OVERLAY */}
      <div className="fixed top-8 left-6 z-20 pointer-events-none hidden lg:flex flex-col gap-2 font-mono text-[11px] bg-black/60 border border-white/15 p-3.5 rounded-2xl backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.2)]">
        <div className="flex items-center justify-between gap-3 text-indigo-300 font-bold border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Mireye Spatial Radar</span>
          </div>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
            ONLINE
          </span>
        </div>

        <div className="space-y-1 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">LAT:</span>
            <span className="font-bold text-amber-400">{lat}° N</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">LNG:</span>
            <span className="font-bold text-amber-400">{lng}° W</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">RESOLUTION:</span>
            <span className="font-bold text-white">0.5m COG</span>
          </div>
        </div>

        {/* Animated Radar Pulse Beam */}
        <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-400">
          <div className="w-3 h-3 rounded-full border border-amber-400 border-t-transparent animate-spin" />
          <span>Scanning 70 CAD Store Parcels...</span>
        </div>
      </div>

      {/* TOP-RIGHT GRID TRANSMISSION NODE OVERLAY */}
      <div className="fixed top-24 right-6 z-20 pointer-events-none hidden lg:flex flex-col gap-2 font-mono text-[11px] bg-black/60 border border-white/15 p-3.5 rounded-2xl backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <div className="flex items-center justify-between gap-3 text-amber-300 font-bold border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>EIA Grid Proximity</span>
          </div>
          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
            138 kV
          </span>
        </div>

        <div className="space-y-1 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">SUBSTATION:</span>
            <span className="font-bold text-emerald-400">&lt; 480m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">ISO REGION:</span>
            <span className="font-bold text-white">ERCOT / FRCC</span>
          </div>
        </div>

        <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
          <ShieldCheck className="w-3 h-3" />
          <span>Interconnect Viable</span>
        </div>
      </div>
    </>
  );
}
