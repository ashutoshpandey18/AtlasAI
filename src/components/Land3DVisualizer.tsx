'use client';

import React, { useState } from 'react';
import { Sun, Zap, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

interface Land3DVisualizerProps {
  activeStage: number;
}

export function Land3DVisualizer({ activeStage }: Land3DVisualizerProps) {
  const [activeLayer, setActiveLayer] = useState<'terrain' | 'flood' | 'grid'>('terrain');

  return (
    <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs font-sans relative overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
            3D Land & Grid Simulator
          </span>
        </div>
        <div className="flex gap-1.5 text-[10.5px]">
          <button
            onClick={() => setActiveLayer('terrain')}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
              activeLayer === 'terrain'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] font-bold'
                : 'bg-[var(--bg-soft)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-focus)]'
            }`}
          >
            3D Terrain
          </button>
          <button
            onClick={() => setActiveLayer('flood')}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
              activeLayer === 'flood'
                ? 'bg-[#A04B3C] text-white border-[#A04B3C] font-bold'
                : 'bg-[var(--bg-soft)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-focus)]'
            }`}
          >
            FEMA Flood
          </button>
          <button
            onClick={() => setActiveLayer('grid')}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer font-medium ${
              activeLayer === 'grid'
                ? 'bg-[#9B763A] text-white border-[#9B763A] font-bold'
                : 'bg-[var(--bg-soft)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-focus)]'
            }`}
          >
            138kV Grid
          </button>
        </div>
      </div>

      {/* Minimalist 3D Isometric Land Canvas */}
      <div className="relative h-48 w-full bg-[var(--bg-soft)] rounded-xl border border-[var(--border)] overflow-hidden flex items-center justify-center">
        {/* CSS 3D Perspective Plane */}
        <div
          className="relative w-64 h-40 transition-transform duration-700 ease-out transform-gpu"
          style={{
            transform: 'rotateX(52deg) rotateZ(-22deg) scale(0.95)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Base Grid Plane */}
          <div className="absolute inset-0 bg-white border border-[var(--accent)]/30 rounded-xl shadow-xs bg-[radial-gradient(#4A6B4E_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* 3D Solar Canopy Structures */}
          <div className="absolute top-5 left-6 w-22 h-14 bg-[var(--bg-soft)] border border-[var(--accent)] rounded-md shadow-xs flex flex-col justify-between p-1.5">
            <div className="flex justify-between items-center text-[8px] font-mono text-[var(--accent)] font-bold">
              <Sun className="w-3 h-3 text-[#9B763A]" />
              <span>187 kW</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--accent)] rounded-xs" />
          </div>

          {/* 3D Retail Store Building */}
          <div className="absolute top-5 right-6 w-18 h-20 bg-white border border-[var(--border)] rounded-md shadow-xs flex flex-col items-center justify-center p-1">
            <span className="text-[8px] font-bold text-[var(--text-primary)] text-center">Dollar General</span>
            <span className="text-[7px] text-[var(--text-muted)]">802 sqm</span>
          </div>

          {/* 3D FEMA Floodplain Layer */}
          {(activeLayer === 'flood' || activeStage === 4) && (
            <div className="absolute bottom-2 left-2 w-32 h-16 bg-rose-50 border border-rose-300 rounded-lg flex items-center justify-center">
              <span className="text-[8.5px] font-bold text-[#A04B3C] bg-white px-1.5 py-0.5 rounded border border-rose-200">
                FEMA Zone AE Risk
              </span>
            </div>
          )}

          {/* 3D Transmission Vector Line */}
          {(activeLayer === 'grid' || activeStage === 2) && (
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#9B763A] shadow-xs">
              <div className="absolute top-2 -left-6 bg-white text-[#9B763A] text-[7.5px] font-bold px-1.5 py-0.5 rounded border border-[#9B763A]/40">
                138kV Line (480m)
              </div>
            </div>
          )}

          {/* 3D Motivated Seller Aura Ring */}
          {activeStage === 3 && (
            <div className="absolute top-3 left-4 w-26 h-18 border-2 border-dashed border-[#9B763A] rounded-xl animate-pulse" />
          )}
        </div>

        {/* Minimal Stage Callout Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[10.5px] font-semibold text-[var(--text-primary)] flex items-center gap-2 shadow-xs">
          {activeStage === 1 && (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>4.3× Lot Ratio Parking Canopy Selected</span>
            </>
          )}
          {activeStage === 2 && (
            <>
              <Zap className="w-3.5 h-3.5 text-[#9B763A]" />
              <span>USGS 0.66° Slope + 138kV Transmission Vector</span>
            </>
          )}
          {activeStage === 3 && (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-[#9B763A]" />
              <span>$28.4k Tax Delinquent Motivated Seller Signal</span>
            </>
          )}
          {activeStage === 4 && (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-[#A04B3C]" />
              <span>FEMA Zone AE Hazard Boundaries Screened</span>
            </>
          )}
        </div>
      </div>

      {/* Sourced Data Attribution */}
      <div className="mt-3 flex items-center justify-between text-[10.5px] text-[var(--text-muted)]">
        <div>3D Terrain Sourced: USGS 3DEP COG + FEMA NFHL + EIA Power</div>
        <div className="text-[var(--accent)] font-semibold">Mireye Verified</div>
      </div>
    </div>
  );
}
