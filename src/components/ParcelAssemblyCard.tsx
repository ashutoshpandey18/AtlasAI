'use client';

import type { AssemblyResult } from '@/types/atlas';
import { Layers, Users, AlertTriangle, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface Props {
  assembly: AssemblyResult;
  siteLabel: string;
  address: string;
}

export default function ParcelAssemblyCard({ assembly, siteLabel, address }: Props) {
  const isHigh = assembly.feasibilityScore >= 75;
  const isModerate = assembly.feasibilityScore >= 55;

  const scoreBadgeColor = isHigh
    ? 'bg-green-500/10 text-green-600 border-green-500/20 font-black'
    : isModerate
    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 font-black'
    : 'bg-red-500/10 text-red-600 border-red-500/20 font-black';

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[28px] p-6 shadow-sm relative overflow-hidden font-sans">
      {/* Decorative subtle gradient background */}
      <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-[var(--accent)]/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[var(--border)] pb-4.5 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[9.5px] uppercase font-black tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2.5 py-0.5 rounded-full">
              <Layers className="w-3 h-3" />
              Parcel Topology Estimator
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-bold">
              Site {siteLabel}
            </span>
          </div>
          <h3 className="text-[16px] font-black text-[var(--text-primary)] mt-2 tracking-tight">
            Contiguous Land Assembly Analysis
          </h3>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 max-w-[480px]">
            Estimates ownership fragmentation and contiguity barriers for a target {assembly.targetAcres}-acre site footprint based on Mireye topography & environmental overlays.
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="text-[10px] uppercase font-extrabold text-[var(--text-muted)] tracking-wider mb-1">
            Assembly Feasibility
          </span>
          <span className={`text-[17px] px-3 py-1 rounded-xl border ${scoreBadgeColor}`}>
            {assembly.feasibilityScore}/100 ({assembly.contiguityRating})
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Landowners Estimated */}
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              Landowner Clusters
            </span>
            <span className="text-[15px] font-black text-[var(--text-primary)] mt-0.5 block">
              {assembly.estimatedOwnersMin} – {assembly.estimatedOwnersMax} Owners
            </span>
          </div>
        </div>

        {/* Assemblable Acres */}
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              Assemblable Envelope
            </span>
            <span className="text-[15px] font-black text-[var(--text-primary)] mt-0.5 block">
              {assembly.assemblableAcres} / {assembly.targetAcres} Acres
            </span>
          </div>
        </div>

        {/* Primary Topological Barrier */}
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
              Primary Bottleneck
            </span>
            <span className="text-[12px] font-bold text-[var(--text-primary)] truncate mt-0.5 block">
              {assembly.dominantConstraint}
            </span>
          </div>
        </div>
      </div>

      {/* Assembly Contiguity Progress Bar */}
      <div className="bg-[var(--bg-soft)]/50 border border-[var(--border)] rounded-2xl p-4 mb-5">
        <div className="flex justify-between items-center text-[11.5px] font-bold text-[var(--text-secondary)] mb-2">
          <span>Site Envelope Contiguity Continuity</span>
          <span className="text-[var(--text-primary)] font-black">
            {Math.round((assembly.assemblableAcres / assembly.targetAcres) * 100)}% Contiguous Yield
          </span>
        </div>
        <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHigh
                ? 'bg-gradient-to-r from-[var(--accent)] to-green-500'
                : isModerate
                ? 'bg-gradient-to-r from-amber-500 to-[#B88E53]'
                : 'bg-gradient-to-r from-red-500 to-amber-600'
            }`}
            style={{ width: `${Math.round((assembly.assemblableAcres / assembly.targetAcres) * 100)}%` }}
          />
        </div>
      </div>

      {/* Key Assembly Barriers List */}
      {assembly.keyBarriers.length > 0 ? (
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-2">
            Topological & Ownership Encumbrance Flags
          </span>
          <div className="flex flex-wrap gap-2">
            {assembly.keyBarriers.map((barrier, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg"
              >
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {barrier}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[12px] font-semibold text-green-600 bg-green-50 border border-green-200 p-3 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          No topological encumbrance barriers detected — candidate parcel block demonstrates uniform contiguity.
        </div>
      )}
    </div>
  );
}
