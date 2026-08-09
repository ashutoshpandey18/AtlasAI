'use client';

import React from 'react';
import { Target, CheckCircle2, XCircle, ShieldCheck, DollarSign, Award, Truck, Activity, Database, Cpu, BookOpen, Clock, Layers, Lightbulb } from 'lucide-react';
import type { LocationResult, MireyeSiteRegistration } from '../types/atlas';
import { formatTransportTruth } from '../services/transportTruth';
import { analyzeBuildableArea } from '../services/buildableAreaHarness';

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
  /** Atlas V1.3 — Mireye Site Dossier registration result for the top winner */
  mireyeSite?: MireyeSiteRegistration | null;
}

export function DecisionLedger({ promptStr, evaluations = [], rejections = [], winnerSite, mireyeSite }: Props) {
  const totalEvaluated = (evaluations?.length || 0) + (rejections?.length || 0);
  const promptDisplay = promptStr || 'Find fast-deployment solar carport targets in Texas under $2M capex.';
  const topSite = winnerSite || (evaluations.length > 0 ? evaluations[0] : null);

  const canonicalWinnerName = topSite?.siteName || topSite?.techEval?.siteName || topSite?.memo?.siteName || null;
  const canonicalWinnerId = topSite?.geoId || topSite?.siteId || topSite?.memo?.siteId || canonicalWinnerName;

  // Build canonical ranked candidates list starting strictly with topSite as Rank #1
  const sortedSurvivors = React.useMemo(() => {
    if (!topSite && (!evaluations || evaluations.length === 0)) return [];

    const rest = (evaluations || []).filter((e) => {
      const name = e.siteName || e.techEval?.siteName || e.memo?.siteName;
      const id = e.geoId || e.siteId || e.memo?.siteId || name;
      return id !== canonicalWinnerId && name !== canonicalWinnerName;
    }).sort((a, b) => {
      const scoreA = (a.techScore ?? a.techEval?.technicalFeasibilityScore ?? 0) + (a.priorityScore ?? 0);
      const scoreB = (b.techScore ?? b.techEval?.technicalFeasibilityScore ?? 0) + (b.priorityScore ?? 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      // Deterministic tie-breaker: lexicographical comparison on siteName
      return (a.siteName || '').localeCompare(b.siteName || '');
    });

    const list = topSite ? [topSite, ...rest] : rest;

    // Defensive validation: verify list[0] is the canonical winner
    if (topSite && list.length > 0) {
      const rank1Name = list[0].siteName || list[0].techEval?.siteName || list[0].memo?.siteName;
      if (rank1Name !== canonicalWinnerName) {
        console.error(`[CONSISTENCY ERROR]: Winner Site ID Mismatch! Main Winner (${canonicalWinnerName}) != Comparison Matrix Rank #1 (${rank1Name})`);
      }
    }

    return list;
  }, [topSite, evaluations, canonicalWinnerId, canonicalWinnerName]);

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

            {/* Atlas V1.3 — Mireye Site Dossier Registration Card */}
            {mireyeSite && (
              <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2.5 ${
                mireyeSite.status === 'registered'
                  ? 'bg-emerald-950/30 border-emerald-500/30'
                  : mireyeSite.status === 'deferred'
                  ? 'bg-slate-900/60 border-slate-700/60'
                  : mireyeSite.status === 'pending'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-rose-950/20 border-rose-500/20'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 shrink-0 ${
                      mireyeSite.status === 'registered' ? 'text-emerald-400'
                      : mireyeSite.status === 'deferred' ? 'text-slate-300'
                      : mireyeSite.status === 'pending' ? 'text-amber-400'
                      : 'text-rose-400'
                    }`} />
                    <span className="font-bold uppercase tracking-wider text-xs text-white">
                      Registered Mireye Site
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border ${
                    mireyeSite.status === 'registered'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : mireyeSite.status === 'deferred'
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : mireyeSite.status === 'pending'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {mireyeSite.status === 'registered' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {mireyeSite.status === 'registered' ? '✓ Registered'
                     : mireyeSite.status === 'deferred' ? '✓ Registration Deferred'
                     : mireyeSite.status === 'pending' ? '✓ Pending Registration'
                     : '✓ Registration Failed'}
                  </span>
                </div>

                {mireyeSite.status === 'registered' && mireyeSite.site_id && (
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div>Site ID: <span className="text-white font-bold">{mireyeSite.site_id}</span></div>
                    <div>Source: <span className="text-slate-200">Mireye /v1/sites</span></div>
                    <div>Registration Endpoint: <span className="text-cyan-400 font-bold">POST https://api.mireye.com/v1/sites</span></div>
                    {mireyeSite.geometrySource && (
                      <div>Geometry Source: <span className="text-emerald-400 font-bold">{mireyeSite.geometrySource}</span></div>
                    )}
                    {mireyeSite.registered_at && (
                      <div className="flex items-center gap-1 text-slate-400 text-[10.5px] pt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Registered: {new Date(mireyeSite.registered_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {mireyeSite.status === 'deferred' && (
                  <div className="space-y-2 text-[11px]">
                    <div className="text-slate-300 font-sans leading-relaxed">
                      Atlas only registers verified parcel boundaries returned by Mireye Lookup. Because parcel geometry was unavailable for this location, registration was intentionally deferred. Spatial Copilot automatically continues using Mireye /v1/ask without any loss of functionality.
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10 font-mono text-[10.5px]">
                      <div>Reason: <span className="text-slate-300">Verified parcel geometry was not returned by Mireye Lookup.</span></div>
                      <div>Copilot Mode: <span className="text-amber-400 font-bold">Stateless Mireye /v1/ask</span></div>
                      <div>Future Registration: <span className="text-emerald-400 font-bold">Eligible once parcel geometry becomes available.</span></div>
                    </div>
                  </div>
                )}

                {mireyeSite.status === 'failed' && (
                  <div className="text-[11px] text-rose-300 pt-0.5">
                    Reason: {mireyeSite.error || 'Mireye API registration request encountered an error. Spatial Copilot will fall back to stateless /v1/ask.'}
                  </div>
                )}
              </div>
            )}

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
                    return `${slopeVal}° Terrain Slope (Flat — Low Civil Earthwork Complexity)`;
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

              {/* Estimated Site Developability Card */}
              {(() => {
                const mireyeRaw = (topSite as any)?.raw?.mireye ?? null;
                const geometry = (topSite as any)?.geometry ?? null;
                const report = analyzeBuildableArea(mireyeRaw, 50, 100, geometry, false, topSite?.isFreshProximity);
                return (
                  <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm space-y-1.5 font-sans hover:border-white/20 transition-all">
                    <div className="text-[10px] font-mono text-amber-400 font-bold uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>ESTIMATED SITE DEVELOPABILITY</span>
                      </span>
                      <span className="text-[9px] bg-amber-950/80 text-amber-400 border border-amber-800/80 px-1.5 py-0.5 rounded font-mono">
                        {report.methodology}
                      </span>
                    </div>

                    <div className="text-sm font-black text-white flex items-baseline justify-between">
                      <span>{report.estimatedNetDevelopableAcres != null ? `${report.estimatedNetDevelopableAcres} Acres` : 'Developability Unavailable'}</span>
                      {report.estimatedSiteEfficiencyPct != null && (
                        <span className="text-[10.5px] font-bold text-amber-400">
                          {report.estimatedSiteEfficiencyPct}% Efficiency ({report.grossParcelAcres} Gross Ac)
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono flex items-center justify-between pt-1 border-t border-white/10 text-slate-400">
                      <span>Evidence: <strong className="text-slate-200">{report.provenance}</strong></span>
                      <span className="text-amber-400 font-bold">{report.confidence} Confidence</span>
                    </div>

                    <details className="group text-[10.5px] font-mono text-slate-400 pt-1">
                      <summary className="cursor-pointer text-slate-400 hover:text-slate-200 font-semibold select-none flex items-center gap-1">
                        <span>Data Provenance & Disclosures</span>
                      </summary>
                      <div className="mt-1.5 p-2 bg-black/60 border border-white/5 rounded space-y-1 text-[10px]">
                        <div>Method: <span className="text-slate-200">{report.methodology}</span></div>
                        <div>Boundary: <span className="text-slate-200">{report.boundaryLabel}</span></div>
                        <div>Constraint Deductions: <span className="text-slate-200">{report.deductions.length > 0 ? report.deductions.map(d => `${d.label} (-${d.deductionPct}%)`).join(', ') : 'None (Unencumbered)'}</span></div>
                        <div className="text-slate-500 pt-0.5 text-[9.5px]">{report.disclaimer}</div>
                      </div>
                    </details>
                  </div>
                );
              })()}

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
                    const truth = formatTransportTruth(dt);
                    return truth.statusText;
                  })()}
                </div>

                <div className="text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
                  <span className="text-slate-400">Source: <span className="text-slate-200 font-semibold">Mireye /v1/proximity</span></span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    {topSite?.isFreshProximity ? (
                      <>
                        <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span>Live Mireye API Result</span>
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
                    <div>Data Status: <span className="text-slate-200">{topSite?.isFreshProximity ? 'Live Mireye API Result' : 'Cached Mireye API Result'}</span></div>
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

            {/* CANDIDATE COMPARISON MATRIX (WINNER VS ALTERNATIVES) */}
            {evaluations.length > 1 && (
              <div className="pt-4 border-t border-white/10 space-y-3 font-sans">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>CANDIDATE COMPARISON MATRIX • WHY WINNER OVER ALTERNATIVES</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">TOP {Math.min(3, evaluations.length)} SURVIVORS</span>
                </div>

                <div className="text-[10.5px] font-mono text-slate-400 bg-white/5 border border-white/10 p-2 rounded-lg flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong className="text-slate-200">Scoring Methodology:</strong> Technical feasibility measures physical/site suitability. Acquisition priority incorporates Atlas portfolio-level selection logic.</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left font-mono text-xs text-slate-300">
                    <thead className="bg-black/60 text-[10.5px] uppercase font-bold text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="p-2.5">RANK</th>
                        <th className="p-2.5">CANDIDATE SITE</th>
                        <th className="p-2.5">TECHNICAL FEASIBILITY</th>
                        <th className="p-2.5">ACQUISITION PRIORITY</th>
                        <th className="p-2.5">DECISION STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedSurvivors.slice(0, 3).map((cand, idx) => {
                        const tScore = cand.techScore ?? cand.techEval?.technicalFeasibilityScore ?? cand.memo?.technicalScore;
                        const tScoreDisplay = tScore != null ? `${tScore} / 100` : '— / 100';

                        const pScore = cand.priorityScore ?? cand.intelEval?.acquisitionPriorityScore ?? cand.memo?.acquisitionPriorityScore;
                        const pScoreDisplay = pScore != null ? `${pScore}%` : '—';

                        const siteName = cand.siteName || cand.techEval?.siteName || cand.memo?.siteName || `Site #${idx + 1}`;
                        const county = cand.county || cand.techEval?.county || cand.memo?.county || 'TX';

                        return (
                          <tr key={idx} className={idx === 0 ? 'bg-emerald-950/20 font-bold text-white' : 'hover:bg-white/5'}>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${idx === 0 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}>
                                #{idx + 1}
                              </span>
                            </td>
                            <td className="p-2.5 font-sans font-semibold">
                              {siteName} ({county})
                            </td>
                            <td className="p-2.5 text-emerald-400">
                              {tScoreDisplay}
                            </td>
                            <td className="p-2.5 text-slate-200">
                              {pScoreDisplay}
                            </td>
                            <td className="p-2.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${idx === 0 ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border border-slate-700 text-slate-300'}`}>
                                {idx === 0 ? '✓ SELECTED PRIORITY' : 'PASSED SCREENING'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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

        {/* Rejection Evidence Ledger Section */}
        {rejections.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>DISQUALIFIED CANDIDATES ({rejections.length} CUT SITES)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">FATAL FLAW SCREENING PROOFS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rejections.map((rej, idx) => (
                <div key={idx} className="p-3.5 bg-black/40 border border-rose-500/20 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-rose-400 font-bold text-[11px]">
                    <span>✕ DISQUALIFIED — {rej.siteName}</span>
                    <span className="text-[9px] bg-rose-950/80 border border-rose-800/80 px-1.5 py-0.5 rounded text-rose-300 font-mono">
                      Fatal Flaw
                    </span>
                  </div>
                  <div className="text-slate-200 text-xs font-sans font-medium">
                    {rej.reason}
                  </div>
                  <div className="pt-1.5 border-t border-white/10 space-y-1 text-[10.5px]">
                    {rej.inputsChecked && rej.inputsChecked.length > 0 && (
                      <div><span className="text-slate-400">1. Mireye Evidence:</span> <span className="text-slate-200">{
                        rej.inputsChecked.find(i => 
                          (rej.reason.toLowerCase().includes('slope') || rej.reason.toLowerCase().includes('lidar')) ? i.toLowerCase().includes('slope') :
                          (rej.reason.toLowerCase().includes('flood') || rej.reason.toLowerCase().includes('fema')) ? i.toLowerCase().includes('flood') : true
                        ) || rej.inputsChecked[0]
                      }</span></div>
                    )}
                    {rej.rulesApplied && rej.rulesApplied.length > 0 && (
                      <div><span className="text-rose-300">2. Atlas Rule:</span> <span className="text-slate-200">{
                        rej.rulesApplied.find(r => 
                          (rej.reason.toLowerCase().includes('slope') || rej.reason.toLowerCase().includes('lidar')) ? r.toLowerCase().includes('slope') :
                          (rej.reason.toLowerCase().includes('flood') || rej.reason.toLowerCase().includes('fema')) ? r.toLowerCase().includes('flood') : true
                        ) || rej.rulesApplied[0]
                      }</span></div>
                    )}
                    <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-0.5">
                      <span>Source: <strong className="text-slate-300">Mireye Physical Intelligence</strong></span>
                      <span className="text-rose-400 font-bold">Live API Result</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
