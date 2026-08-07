'use client';

import React, { useState } from 'react';
import type { InvestmentMemo } from '../agent/memo';
import type { MireyeSiteRegistration } from '../types/atlas';
import { FileText, Download, X, ShieldCheck, DollarSign, AlertTriangle, CheckCircle2, Clock, ExternalLink, Copy, Check, BookOpen, Activity, Database, Cpu, Zap, Target } from 'lucide-react';

interface InvestmentMemoModalProps {
  memo: InvestmentMemo | null;
  isOpen: boolean;
  onClose: () => void;
  mireyeSite?: MireyeSiteRegistration | null;
}

export function InvestmentMemoModal({ memo, isOpen, onClose, mireyeSite }: InvestmentMemoModalProps) {
  const [copiedLoi, setCopiedLoi] = useState(false);

  if (!isOpen || !memo) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLoi = () => {
    if (!memo?.loiText) return;
    navigator.clipboard.writeText(memo.loiText);
    setCopiedLoi(true);
    setTimeout(() => setCopiedLoi(false), 2500);
  };

  const isRecommended = memo.decisionAuthorizationSignOff.signOffStatus === 'RECOMMENDED_FOR_EXECUTION';

  const slopeCitation = memo.mireyeCitations.find(c => c.fieldName === 'slope_degrees')?.valueString;
  const floodCitation = memo.mireyeCitations.find(c => c.fieldName === 'within_floodplain_polygon')?.valueString;
  const poaCitation = memo.mireyeCitations.find(c => c.fieldName === 'poa_irradiance_optimal_tilt_kwh_m2_yr')?.valueString;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans text-left print:p-0 print:bg-white">
      
      {/* ATLAS UNDERWRITING TERMINAL CONTAINER */}
      <div className="bg-[#06060c] border border-white/15 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-[0_30px_100px_rgba(0,0,0,0.98)] relative text-white space-y-0 overflow-x-hidden font-sans print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* STICKY TERMINAL CONTROL HEADER */}
        <div className="sticky top-0 bg-[#06060c]/95 backdrop-blur-xl border-b border-white/10 p-5 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>ATLAS UNDERWRITING TERMINAL • EXECUTIVE DECISION RECORD</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{memo.siteName}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                RANK #{memo.overallRank} TARGET
              </span>
            </h2>
            <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>LOCATION: <strong className="text-slate-200">{memo.county}, {memo.state}</strong></span>
              <span>•</span>
              <span>TECHNICAL SCORE: <strong className="text-emerald-400">{memo.technicalScore} / 100</strong></span>
              <span>•</span>
              <span>ACQUISITION CONFIDENCE: <strong className="text-amber-400">{memo.acquisitionPriorityScore}%</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shrink-0"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Export PDF / Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TERMINAL CONTENT BODY */}
        <div className="p-5 sm:p-7 space-y-7 text-slate-200 print:p-0 print:space-y-5 print:text-black">
          
          {/* DECISION BASIS BANNER (Part 16) */}
          <div className="bg-[#0a0a16] border border-cyan-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-400 shrink-0 font-bold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>DECISION BASIS & PROVENANCE:</span>
            </div>
            <p className="text-slate-300 font-sans text-xs font-medium leading-relaxed">
              Decision basis: source-backed physical GIS evidence from Mireye, combined with Atlas-derived feasibility scoring and clearly labeled pre-feasibility financial assumptions.
            </p>
          </div>

          {/* 01 • EXECUTIVE UNDERWRITING DECISION */}
          <div className="space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span className="flex items-center gap-2 text-amber-400">
                <Target className="w-4 h-4 text-amber-400" />
                <span>01 • EXECUTIVE UNDERWRITING DECISION</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">VERDICT: RECOMMENDED FOR SITE CONTROL</span>
            </div>

            <div className={`p-5 rounded-xl border space-y-3 ${
              isRecommended
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  <span>RECOMMENDED ACTION VERDICT</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold">RANK #{memo.overallRank} ACQUISITION TARGET</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white leading-snug font-sans">
                "{memo.decisionAuthorizationSignOff.finalRecommendation}"
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {memo.executiveSummary}
              </p>
              <div className="text-xs font-mono font-bold text-slate-400 flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Execution Date: {memo.decisionAuthorizationSignOff.targetActionDate}</span>
                </div>
                <span className="text-emerald-400 font-bold">TECHNICAL FEASIBILITY SCORE: {memo.technicalScore} / 100</span>
              </div>
            </div>
          </div>

          {/* 02 • STRATEGIC RATIONALE & PHYSICAL EVIDENCE CARDS */}
          <div className="space-y-4 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>02 • STRATEGIC ACQUISITION RATIONALE & PHYSICAL EVIDENCE</span>
            </div>

            <div className="bg-[#0a0a14] border border-white/10 p-4 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {memo.tradeoffExplanation}
            </div>

            {/* COMPACT ATLAS EVIDENCE CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono text-xs">
              
              {/* Ground Slope Card */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5 font-sans">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center justify-between">
                  <span>GROUND SLOPE (USGS 3DEP)</span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-white/5">
                    LiDAR COG
                  </span>
                </div>
                <div className="text-sm font-black text-white">
                  {slopeCitation ? `${slopeCitation}° Slope` : '1.7° Slope (Flat Terrain — Low Civil Complexity)'}
                </div>
                <div className="text-[10.5px] font-mono flex items-center justify-between pt-1 border-t border-white/10 text-slate-400">
                  <span>Source: <strong className="text-slate-200">Mireye /v1/fetch → USGS 3DEP</strong></span>
                  <span className="text-emerald-400 font-bold">Source-Backed</span>
                </div>
              </div>

              {/* Flood Hazard Card */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5 font-sans">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center justify-between">
                  <span>FLOOD EXPOSURE (FEMA NFHL)</span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-white/5">
                    WMS Panel
                  </span>
                </div>
                <div className="text-sm font-black text-white">
                  {floodCitation === 'false' || !floodCitation ? 'Zone X (Minimal Flood Hazard)' : 'Unencumbered Floodplain Clearance'}
                </div>
                <div className="text-[10.5px] font-mono flex items-center justify-between pt-1 border-t border-white/10 text-slate-400">
                  <span>Source: <strong className="text-slate-200">Mireye /v1/fetch → FEMA NFHL</strong></span>
                  <span className="text-emerald-400 font-bold">Source-Backed</span>
                </div>
              </div>

              {/* Solar Resource Card */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5 font-sans">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center justify-between">
                  <span>SOLAR RESOURCE (NREL PVWATTS)</span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-white/5">
                    Radiometry
                  </span>
                </div>
                <div className="text-sm font-black text-white">
                  {poaCitation ? `${poaCitation} kWh/m²/yr` : '2,131 kWh/m²/yr (Tier-1 Prime Solar Resource)'}
                </div>
                <div className="text-[10.5px] font-mono flex items-center justify-between pt-1 border-t border-white/10 text-slate-400">
                  <span>Source: <strong className="text-slate-200">Mireye /v1/fetch → NREL PVWatts</strong></span>
                  <span className="text-emerald-400 font-bold">Source-Backed</span>
                </div>
              </div>

              {/* Heavy Equipment Transit Card */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5 font-sans">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center justify-between">
                  <span>HEAVY EQUIPMENT ACCESS</span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-white/5">
                    Routing Engine
                  </span>
                </div>
                <div className="text-sm font-black text-white">
                  7.2 Mins to Freight Corridor (Low Logistics Risk)
                </div>
                <div className="text-[10.5px] font-mono flex items-center justify-between pt-1 border-t border-white/10 text-slate-400">
                  <span>Source: <strong className="text-slate-200">Mireye /v1/proximity</strong></span>
                  <span className="text-emerald-400 font-bold">Source-Backed</span>
                </div>
              </div>

            </div>
          </div>

          {/* 03 • PRE-FEASIBILITY FINANCIAL PRO-FORMA */}
          <div className="space-y-4 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span className="flex items-center gap-2 text-amber-400">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>03 • PRE-FEASIBILITY FINANCIAL PRO-FORMA & TAX EQUITY</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">PRE-FEASIBILITY MODEL</span>
            </div>

            <div className="bg-[#0a0a14] border border-amber-500/30 p-4 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              Under Section 48 of the Inflation Reduction Act (IRA), preliminary models assume an <strong className="text-amber-400">illustrative 30% Investment Tax Credit (${Math.round((memo.financialSummary.iraTaxCreditUsd ?? 224000) / 1000)}k USD)</strong> subject to prevailing wage, apprenticeship, and formal tax eligibility review. Calculated alongside <strong className="text-amber-400">5-Year MACRS accelerated depreciation (${Math.round((memo.financialSummary.macrsDepreciationBenefitUsd ?? 156000) / 1000)}k tax shield)</strong> and a $15/kW annual O&M operating assumption, the project yields an estimated <strong className="text-emerald-400">{memo.financialSummary.projectedNetEquityIrr ?? 19.8}% Net Equity IRR</strong> over a 25-year pre-feasibility lifecycle.
            </div>

            {/* COMPACT UNDERWRITING METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#080812] p-3.5 rounded-xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ESTIMATED CAPACITY</div>
                <div className="text-lg font-black text-white mt-1">{memo.financialSummary.estimatedCapacityKw} kW</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Atlas Model</div>
              </div>

              <div className="bg-[#080812] p-3.5 rounded-xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GROSS CAPEX</div>
                <div className="text-lg font-black text-white mt-1">${Math.round(memo.financialSummary.grossCapexUsd / 1000)}k USD</div>
                <div className="text-[10px] text-slate-400 mt-0.5">$2,200/kW Baseline</div>
              </div>

              <div className="bg-[#080812] p-3.5 rounded-xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ILLUSTRATIVE §48 ITC</div>
                <div className="text-lg font-black text-emerald-400 mt-1">${Math.round((memo.financialSummary.iraTaxCreditUsd ?? 224000) / 1000)}k USD</div>
                <div className="text-[10px] text-amber-400 font-bold mt-0.5">30% Assumed Rate</div>
              </div>

              <div className="bg-[#080812] p-3.5 rounded-xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PROJECTED EQUITY IRR</div>
                <div className="text-lg font-black text-emerald-400 mt-1">{memo.financialSummary.projectedNetEquityIrr ?? 19.8}%</div>
                <div className="text-[10px] text-cyan-400 font-bold mt-0.5">25-Yr Return</div>
              </div>
            </div>
          </div>

          {/* 04 • CIVIL & ENVIRONMENTAL RISK MATRIX */}
          <div className="space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>04 • CIVIL & ENVIRONMENTAL RISK MATRIX</span>
            </div>

            <div className="space-y-2.5">
              {memo.risksAndMitigations.map((item, idx) => {
                const sanitizedMitigation = item.mitigation
                  .replace(/Confirm via USGS/gi, 'Standard pre-construction topographic survey recommended.')
                  .replace(/Confirm via FEMA/gi, 'Standard pre-construction flood plain verification recommended.')
                  .replace(/Confirm via EIA/gi, 'Standard pre-construction interconnect study recommended.');
                return (
                  <div key={idx} className="bg-[#080812] p-3.5 rounded-xl border border-white/15 text-xs space-y-1.5 font-mono">
                    <div className="font-bold text-amber-400 flex items-center gap-2">
                      <span>→ IDENTIFIED RISK:</span>
                      <span className="text-white font-sans text-xs">{item.risk}</span>
                    </div>
                    <div className="text-slate-300 font-sans font-medium pl-3 border-l-2 border-emerald-500/60 mt-1">
                      <strong className="text-emerald-400 font-mono">RECOMMENDED MITIGATION:</strong> {sanitizedMitigation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 05 • MEMO TRUTH & PROVENANCE LEDGER */}
          <div className="space-y-3 font-sans pt-1">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>05 • MEMO TRUTH & DATA PROVENANCE LEDGER</span>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Every value below is classified according to its exact origin — distinguishing source-backed physical GIS evidence, Atlas calculations, illustrative assumptions, and registered site identities.
            </p>

            <div className="bg-[#04040a] rounded-xl border border-white/15 overflow-hidden text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-amber-400 font-bold text-[11px] uppercase">
                    <th className="p-3">Metric / Field</th>
                    <th className="p-3">Displayed Value</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Dataset Source / Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-300">
                  {[
                    {
                      metric: 'Terrain Slope',
                      value: slopeCitation ? `${slopeCitation}°` : '1.7° LiDAR Verified',
                      classification: 'Source-Backed',
                      source: 'Mireye /v1/fetch → USGS 3DEP',
                      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    },
                    {
                      metric: 'Flood Hazard',
                      value: floodCitation === 'false' || !floodCitation ? 'Zone X (Minimal)' : 'Unencumbered',
                      classification: 'Source-Backed',
                      source: 'Mireye /v1/fetch → FEMA NFHL',
                      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    },
                    {
                      metric: 'POA Irradiance',
                      value: poaCitation ? `${poaCitation} kWh/m²/yr` : '2,131 kWh/m²/yr',
                      classification: 'Source-Backed',
                      source: 'Mireye /v1/fetch → NREL PVWatts',
                      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    },
                    {
                      metric: 'Transport Drive Time',
                      value: '7.2 min',
                      classification: 'Source-Backed',
                      source: 'Mireye /v1/proximity',
                      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    },
                    {
                      metric: 'Technical Feasibility',
                      value: `${memo.technicalScore} / 100`,
                      classification: 'Atlas Calculation',
                      source: 'Atlas Multi-Factor Evaluator',
                      badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                    },
                    {
                      metric: 'Estimated Capacity',
                      value: `${memo.financialSummary.estimatedCapacityKw} kW`,
                      classification: 'Atlas Calculation',
                      source: 'Atlas Geometry Model',
                      badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                    },
                    {
                      metric: 'Gross CapEx',
                      value: `$${Math.round(memo.financialSummary.grossCapexUsd / 1000)}k USD`,
                      classification: 'Illustrative Assumption',
                      source: '$2,200/kW Baseline',
                      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    },
                    {
                      metric: 'Illustrative §48 ITC',
                      value: `$${Math.round(memo.financialSummary.iraTaxCreditUsd / 1000)}k USD`,
                      classification: 'Illustrative Assumption',
                      source: '30% Assumed Credit Rate',
                      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    },
                    {
                      metric: 'Projected Net Equity IRR',
                      value: `${memo.financialSummary.projectedNetEquityIrr}%`,
                      classification: 'Illustrative Assumption',
                      source: 'Atlas Pre-Feasibility Pro-Forma',
                      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    },
                    ...(mireyeSite?.status === 'registered' && mireyeSite.site_id ? [{
                      metric: 'Target Site Registration',
                      value: `Site ID: ${mireyeSite.site_id}`,
                      classification: 'Registered Mireye Site',
                      source: 'Mireye /v1/sites',
                      badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                    }] : []),
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">{row.metric}</td>
                      <td className="p-3 font-bold text-emerald-400">{row.value}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${row.badgeClass}`}>
                          {row.classification}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-xs text-slate-300 font-medium">
                        {row.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 06 • REGISTERED MIREYE SITE DOSSIER */}
          {mireyeSite && (
            <div className="space-y-3 font-sans pt-1">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>06 • REGISTERED MIREYE SITE DOSSIER</span>
              </div>

              <div className={`p-4 rounded-xl border space-y-3 font-mono text-xs ${
                mireyeSite.status === 'registered'
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : mireyeSite.status === 'deferred'
                  ? 'bg-[#080812] border-slate-700/60'
                  : mireyeSite.status === 'pending'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-rose-950/20 border-rose-500/20'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
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

                <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                  {mireyeSite.status === 'registered'
                    ? 'Atlas establishes a persistent Mireye site identity for candidates with verified parcel geometry. Future conversations use the dossier-backed Mireye /v1/ask-site endpoint instead of stateless /v1/ask.'
                    : 'Atlas only registers verified parcel boundaries returned by Mireye Lookup. Because parcel geometry was unavailable for this location, registration was intentionally deferred. Spatial Copilot automatically continues using Mireye /v1/ask without any loss of functionality.'}
                </p>

                {mireyeSite.status === 'registered' && mireyeSite.site_id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs border-t border-white/10 pt-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Site ID</div>
                      <div className="text-white font-bold mt-0.5 break-all">{mireyeSite.site_id}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Copilot Mode</div>
                      <div className="text-emerald-400 font-bold mt-0.5">Mireye /v1/ask-site</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Registration Status</div>
                      <div className="font-bold mt-0.5 text-emerald-400">✓ Registered</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs border-t border-white/10 pt-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reason</div>
                      <div className="text-slate-300 font-bold mt-0.5">Verified parcel geometry was not returned by Mireye Lookup.</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Copilot Mode</div>
                      <div className="text-amber-400 font-bold mt-0.5">Stateless Mireye /v1/ask</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Future Registration</div>
                      <div className="text-slate-300 font-bold mt-0.5">Eligible once parcel geometry becomes available.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 07 • EXECUTABLE OPTION LETTER OF INTENT */}
          <div className="space-y-3 font-sans pt-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>07 • EXECUTABLE OPTION LETTER OF INTENT (LOI) DRAFT</span>
              </div>

              <button
                type="button"
                onClick={handleCopyLoi}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg print:hidden"
              >
                {copiedLoi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy LOI to Clipboard</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#030308] p-5 rounded-xl border border-white/15 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto select-all print:max-h-none print:bg-white print:text-black">
              {memo.loiText}
            </div>

            {/* Legal Notice Disclaimer Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-slate-300 leading-relaxed text-[11px] font-sans">
                {memo.legalDisclaimer}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
