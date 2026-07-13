'use client';

import { useState } from 'react';
import type { LocationResult } from '../types/atlas';
import { Shield, Zap, Compass, MapPin, CheckCircle, AlertTriangle, Route } from 'lucide-react';

interface Props {
  results: LocationResult[];
}

export default function InteractiveMap({ results }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    results.length > 0 ? results[0].location.id : null
  );

  const active = results.find((r) => r.location.id === selectedId) || results[0];
  if (!active) return null;

  const valid = results.filter((r) => !r.error && r.location.lat !== null && r.location.lng !== null);

  return (
    <div className="space-y-6 mt-6">
      
      {/* HUD Header explanation */}
      <div className="bg-[var(--bg-soft)] border border-[var(--border)] p-4 rounded-xl flex items-center gap-3">
        <Compass className="w-5 h-5 text-[var(--accent)] flex-shrink-0 animate-pulse" />
        <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed font-sans">
          <strong>Visual Site Profile Comparison:</strong> Select a candidate site below to review its geospatial profile. We map terrain profiles, power grid connections, and flood zones directly from the Mireye registry.
        </p>
      </div>

      {/* Side-by-Side Location Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
        {valid.map((r) => {
          const isSelected = r.location.id === selectedId;
          
          // Get values
          const slope = (r.data?.fields['aspect_degrees']?.value !== undefined
            ? r.data.fields['slope_degrees']?.value as number
            : r.data?.fields['slope_degrees']?.value as number) || 0;
            
          const elevation = (r.data?.fields['elevation']?.value as number) || 0;
          const inFlood = r.data?.fields['within_floodplain_polygon']?.value === true;
          const gridDist = (r.data?.fields['nearest_transmission_line_distance_m']?.value as number) || 0;
          const gridKm = (gridDist / 1000).toFixed(1);

          return (
            <div
              key={r.location.id}
              onClick={() => setSelectedId(r.location.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[310px] ${
                isSelected
                  ? 'border-[var(--accent)] bg-[var(--surface)] shadow-md ring-1 ring-[var(--accent)]/30'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-focus)]'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--bg-soft)] text-[var(--text-secondary)]'
                  }`}>
                    Site {r.location.label}
                  </span>
                  
                  {/* Big Suitability Score Ring */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11.5px] text-[var(--text-secondary)] font-medium">Score:</span>
                    <span className={`text-[15px] font-extrabold px-2 py-0.5 rounded ${
                      r.totalScore >= 85 ? 'bg-green-100 text-[var(--accent)]' : 'bg-amber-100 text-[#9B763A]'
                    }`}>
                      {r.totalScore}/100
                    </span>
                  </div>
                </div>

                <h3 className="text-[14px] font-extrabold text-[var(--text-primary)] mt-3 truncate">
                  {r.location.address.split(',')[0]}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                  Lat: {r.location.lat?.toFixed(4)} | Lng: {r.location.lng?.toFixed(4)}
                </p>
              </div>

              {/* Graphical Profile illustration inside card */}
              <div className="h-[100px] border border-[var(--border)] rounded-xl my-4 bg-[var(--bg)]/40 relative flex items-center justify-center overflow-hidden">
                
                {/* SVG Visual Profile */}
                <svg width="100%" height="100%" viewBox="0 0 200 80" className="absolute inset-0">
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="slopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--border)" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="var(--border)" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Topography Slope Line */}
                  {slope > 3 ? (
                    // Steep profile
                    <path d="M 0,70 L 200,30 L 200,80 L 0,80 Z" fill="url(#slopeGrad)" stroke="var(--text-muted)" strokeWidth="1" />
                  ) : (
                    // Flat profile
                    <path d="M 0,65 L 200,65 L 200,80 L 0,80 Z" fill="url(#slopeGrad)" stroke="var(--text-muted)" strokeWidth="1" />
                  )}

                  {/* Grid Tower representation */}
                  <g transform={`translate(${gridDist < 1000 ? '40' : '150'}, 15)`} opacity="0.85">
                    <line x1="0" y1="40" x2="-10" y2="10" stroke="var(--accent)" strokeWidth="1" />
                    <line x1="0" y1="40" x2="10" y2="10" stroke="var(--accent)" strokeWidth="1" />
                    <line x1="-12" y1="20" x2="12" y2="20" stroke="var(--accent)" strokeWidth="1" />
                    <circle cx="0" cy="8" r="2.5" fill="var(--accent)" />
                  </g>

                  {/* Connection Line to Site */}
                  <line
                    x1="100"
                    y1={slope > 3 ? "50" : "65"}
                    x2={gridDist < 1000 ? "40" : "150"}
                    y2="25"
                    stroke="var(--text-muted)"
                    strokeWidth="1.25"
                    strokeDasharray="3,3"
                  />
                </svg>

                {/* Info Overlay Badges */}
                <div className="absolute inset-x-2 bottom-1.5 flex justify-between text-[9px] font-bold text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1 bg-[var(--bg-soft)] border border-[var(--border)] px-1.5 py-0.5 rounded">
                    Terrain: {slope > 3 ? `Sloped (${slope.toFixed(1)}°)` : `Flat (${slope.toFixed(1)}°)`}
                  </span>
                  <span className="flex items-center gap-1 bg-[var(--bg-soft)] border border-[var(--border)] px-1.5 py-0.5 rounded">
                    Grid: {gridKm} km
                  </span>
                </div>

                {/* Flood badge overlay */}
                <div className="absolute top-2 right-2">
                  {inFlood ? (
                    <span className="flex items-center gap-1 bg-red-50 border border-red-200 text-[#A04B3C] text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Flood Hazard
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-green-50 border border-green-200 text-[var(--accent)] text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      <Shield className="w-2.5 h-2.5" />
                      Flood Safe
                    </span>
                  )}
                </div>

              </div>

              {/* Mini metrics bar */}
              <div className="flex justify-between items-center text-[11px] text-[var(--text-secondary)] border-t border-[var(--border)] pt-3 font-medium">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Grid: {gridKm} km
                </span>
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-500" />
                  Slope: {slope.toFixed(1)}°
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                  Elevation: {Math.round(elevation)}m
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Selected location summary HUD (at the bottom) */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
            Active Siting Inspection Target
          </span>
          <h4 className="text-[15px] font-extrabold text-[var(--text-primary)] mt-1 truncate">
            {active.location.address}
          </h4>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
            Geospatial details are verified using primary USGS Dem, FEMA NFHL, and EIA power capacity matrices.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:self-center">
          <span className="bg-[var(--bg-soft)] border border-[var(--border)] px-2.5 py-1 rounded-lg text-[10px] font-bold text-[var(--text-primary)]">
            FEMA: {active.data?.fields['within_floodplain_polygon']?.value ? 'Floodplain overlap' : 'Minimal risk (Zone X)'}
          </span>
          <span className="bg-[var(--bg-soft)] border border-[var(--border)] px-2.5 py-1 rounded-lg text-[10px] font-bold text-[var(--text-primary)]">
            USGS Slope: {(active.data?.fields['slope_degrees']?.value as number || 0).toFixed(1)}°
          </span>
        </div>
      </div>

    </div>
  );
}
