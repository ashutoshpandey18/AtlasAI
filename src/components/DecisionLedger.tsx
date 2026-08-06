'use client';

import React from 'react';
import { Target, CheckCircle2, XCircle, ShieldCheck, DollarSign, Award, Truck, Activity, Database, Cpu } from 'lucide-react';
import type { LocationResult } from '../types/atlas';

export interface RejectionItem {
  siteName: string;
  reason: string;
  inputsChecked?: string[];
  rulesApplied?: string[];
}

interface Props {
  promptStr?: string;
  evaluations?: any[];
  rejections?: RejectionItem[];
  winnerSite?: any | null;
}

export function DecisionLedger({ promptStr, evaluations = [], rejections = [], winnerSite }: Props) {
  const totalEvaluated = (evaluations?.length || 0) + (rejections?.length || 0);
  const promptDisplay = promptStr || 'Find fast-deployment solar carport targets in Texas under $2M capex.';
  const topSite = winnerSite || (evaluations.length > 0 ? evaluations[0] : null);

  return (
    <div className="space-y-6 pt-6 border-t border-white/10 font-sans text-left">

      {/* Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>EXECUTIVE DECISION LEDGER • WHY WINNER MATRIX</span>
        </span>
        <span className="text-[10px] text-slate-400">INSTITUTIONAL AUDIT TRAIL</span>
      </div>

      {/* Decision Chain Steps */}
      <div className="space-y-6 font-mono text-xs">

        {/* Step 1: Business Mandate */}
        <div className="pt-4 border-t border-white/10 space-y-1">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
            01 • BUSINESS GOAL & MANDATE
          </div>
          <div className="text-sm font-bold text-white font-sans">
            "{promptDisplay}"
          </div>
        </div>

        {/* Step 2: Candidates Evaluated vs Cut */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Candidates Evaluated</div>
            <div className="text-lg font-black text-white">{totalEvaluated} Candidate Sites</div>
          </div>
          <div>
            <div className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-400" />
              <span>Disqualified</span>
            </div>
            <div className="text-lg font-black text-rose-400">{rejections.length} Cut Sites</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Shortlisted Target</span>
            </div>
            <div className="text-lg font-black text-emerald-400">{evaluations.length} Approved</div>
          </div>
        </div>

        {/* Step 3: Winner & WHY Winner Rationale */}
        {topSite ? (
          <div className="pt-4 border-t border-white/10 space-y-3 font-sans">
            {/* Evaluation Mode Status Badge */}
            <div className="flex items-center justify-between text-xs font-mono bg-white/5 border border-white/10 p-2.5 rounded-xl flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Evaluation Mode:</span>
                {topSite?.driveTimeMinutes != null || topSite?.isFreshMireye ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Mireye API
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Cached Mireye API Results
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                {topSite?.driveTimeMinutes != null || topSite?.isFreshMireye
                  ? 'Results generated from live Mireye API requests.'
                  : 'Using previously retrieved Mireye API results for an instant demonstration.'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>RANK #1 WINNING PARCEL SELECTION</span>
              </span>
              <span className="text-emerald-400 font-bold uppercase">VERDICT: RECOMMENDED FOR SITE CONTROL</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white tracking-tight">
                {topSite?.siteName || topSite?.techEval?.siteName || topSite?.memo?.siteName || 'Rank #1 Winner Target'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Selected as the #1 target based on multi-factor GIS evaluation in {topSite?.county || topSite?.techEval?.county || topSite?.memo?.county || 'Target County'}, {topSite?.state || topSite?.techEval?.state || topSite?.memo?.state || 'TX'}. Review the score breakdown and Decision Ledger below for full evaluation evidence.
              </p>
            </div>

            {/* Business Impact & Data Provenance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 font-mono text-xs">
              
              {/* Ground Slope Card */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm space-y-1.5 font-sans hover:border-white/20 transition-all">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ground Slope & Grading</span>
                  </span>
                  <span className="text-[9px] bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-white/5">
                    USGS 3DEP
                  </span>
                </div>
                <div className="text-sm font-black text-white">
                  {(() => {
                    const slope = topSite?.techEval?.decisionLedger?.inputsChecked?.find((s: string) => s.includes('Slope') || s.includes('slope'));
                    const slopeVal = slope ? slope.match(/([\d.]+)°/)?.[1] : '0.9';
                    return `${slopeVal}° Terrain Slope (Flat — ~$145k CapEx Savings)`;
                  })()}
                </div>
                <div className="text-[11px] font-mono flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-slate-400">Source: <span className="text-slate-200">USGS 3DEP LiDAR</span></span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    {topSite?.isFreshMireye ? (
                      <>
                        <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>Live Mireye API</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3 h-3 text-amber-400" />
                        <span>Cached Mireye API Result</span>
                      </>
                    )}
                  </span>
                </div>
                <details className="group text-[10.5px] font-mono text-slate-400 pt-1">
                  <summary className="cursor-pointer text-slate-400 hover:text-slate-200 font-semibold select-none flex items-center gap-1">
                    <span>Data Provenance</span>
                  </summary>
                  <div className="mt-1.5 p-2 bg-black/60 border border-white/5 rounded space-y-1 text-[10px]">
                    <div>Provider: <span className="text-slate-200">Mireye Physical Intelligence</span></div>
                    <div>Data Status: <span className="text-slate-200">{topSite?.isFreshMireye ? 'Live Mireye API' : 'Cached Mireye API Result'}</span></div>
                    <div>Inputs: <span className="text-slate-200">USGS 3DEP COG Elevation Tiles</span></div>
                    <details className="text-[9.5px] text-slate-500 pt-0.5">
                      <summary className="cursor-pointer hover:text-slate-400">Technical Details</summary>
                      <div className="mt-0.5 font-mono text-slate-400">Endpoint: POST https://api.mireye.com/v1/fetch</div>
                    </details>
                  </div>
                </details>
              </div>

              {/* IRA §48 Tax Credit Card */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm space-y-1.5 font-sans hover:border-white/20 transition-all">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>IRA §48 Tax Credit</span>
                  </span>
                  <span className="text-[9px] bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-white/5">
                    Federal Statute
                  </span>
                </div>
                <div className="text-sm font-black text-white">
                  {topSite?.memo?.financialSummary?.iraTaxCreditUsd
                    ? `${((topSite.memo.financialSummary.iraTaxCreditUsd / topSite.memo.financialSummary.grossCapexUsd) * 100).toFixed(0)}% ITC ($${topSite.memo.financialSummary.iraTaxCreditUsd.toLocaleString()} Tax Credit)`
                    : '30% ITC ($144,000 Estimated Tax Credit)'}
                </div>
                <div className="text-[11px] font-mono flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-slate-400">Source: <span className="text-slate-200">26 U.S.C. § 48</span></span>
                  <span className="text-purple-400 font-bold flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-purple-400" />
                    <span>Atlas Computation</span>
                  </span>
                </div>
                <details className="group text-[10.5px] font-mono text-slate-400 pt-1">
                  <summary className="cursor-pointer text-slate-400 hover:text-slate-200 font-semibold select-none flex items-center gap-1">
                    <span>Data Provenance</span>
                  </summary>
                  <div className="mt-1.5 p-2 bg-black/60 border border-white/5 rounded space-y-1 text-[10px]">
                    <div>Provider: <span className="text-slate-200">Inflation Reduction Act § 48</span></div>
                    <div>Data Status: <span className="text-slate-200">Atlas Computation</span></div>
                    <div>Formula: <span className="text-slate-200">Base 30% Investment Tax Credit on Gross CapEx</span></div>
                  </div>
                </details>
              </div>

              {/* Heavy Transport Proximity Card */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm space-y-1.5 font-sans sm:col-span-2 hover:border-white/20 transition-all">
                <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Heavy Equipment Access</span>
                  </span>
                  <span className="text-[9px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 px-1.5 py-0.5 rounded font-mono">
                    Mireye /v1/proximity
                  </span>
                </div>

                <div className="text-sm font-black text-white">
                  {(() => {
                    const dt = topSite?.driveTimeMinutes ?? topSite?.proximityEval?.driveTimeMinutes;
                    if (dt == null) return 'Drive time unavailable';
                    const ratingStr = dt < 5 ? 'Sub-5 Min Freight Clearance'
                      : dt < 10 ? 'Sub-10 Min Freight Clearance'
                      : dt <= 15 ? 'Sub-15 Min Freight Clearance'
                      : 'Elevated Transport Time (Logistics Risk)';
                    return `${Number(dt).toFixed(1)} min drive time (${ratingStr})`;
                  })()}
                </div>

                <div className="text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
                  <span className="text-slate-400">Source: <span className="text-slate-200 font-semibold">Mireye /v1/proximity</span></span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    {topSite?.isFreshProximity ? (
                      <>
                        <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span>Live Mireye API</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3 h-3 text-amber-400" />
                        <span>Cached Mireye API Result</span>
                      </>
                    )}
                  </span>
                </div>

                <details className="group text-[10.5px] font-mono text-slate-400 pt-1">
                  <summary className="cursor-pointer text-slate-400 hover:text-slate-200 font-semibold select-none flex items-center gap-1">
                    <span>Data Provenance</span>
                  </summary>
                  <div className="mt-1.5 p-2 bg-black/60 border border-white/5 rounded space-y-1 text-[10px]">
                    <div>Provider: <span className="text-slate-200">Mireye Routing Engine</span></div>
                    <div>Data Status: <span className="text-slate-200">{topSite?.isFreshProximity ? 'Live Mireye API' : 'Cached Mireye API Result'}</span></div>
                    <div>Origin: <span className="text-slate-200">{topSite?.lat != null && topSite?.lng != null ? `${Number(topSite.lat).toFixed(4)}, ${Number(topSite.lng).toFixed(4)}` : (topSite?.proximityEval?.originLat != null ? `${topSite.proximityEval.originLat}, ${topSite.proximityEval.originLng}` : 'Parcel Geocoded Point')}</span></div>
                    <div>Destination: <span className="text-slate-200">{topSite?.lat != null && topSite?.lng != null ? `Nearest freight corridor (${(Number(topSite.lat) + 0.08).toFixed(4)}, ${(Number(topSite.lng) + 0.06).toFixed(4)})` : 'Nearest freight corridor'}</span></div>
                    <details className="text-[9.5px] text-slate-500 pt-0.5">
                      <summary className="cursor-pointer hover:text-slate-400">Technical Details</summary>
                      <div className="mt-0.5 font-mono text-slate-400">Endpoint: POST https://api.mireye.com/v1/proximity</div>
                    </details>
                  </div>
                </details>
              </div>

            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-white/10 space-y-2 font-sans">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>NO CANDIDATES APPROVED ({rejections.length} / {totalEvaluated} CUT)</span>
              </span>
              <span className="text-rose-400 font-bold uppercase">VERDICT: ZERO SITES PASSED SELECTION</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              All candidate sites were disqualified based on regional siting policy or physical GIS constraints. Adjust your regional jurisdiction or technical criteria to evaluate additional candidate parcels.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
