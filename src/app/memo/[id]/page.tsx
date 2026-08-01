'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, CheckCircle2, Clock, DollarSign, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import type { InvestmentMemo } from '@/agent/memo';
import { AwwwardsCursorGlow } from '@/components/AwwwardsCursorGlow';
import { SatelliteRadarSweep } from '@/components/SatelliteRadarSweep';
import { Navbar } from '@/components/Navbar';

export default function MemoPage({ params }: { params: Promise<{ id: string }> }) {
  const [siteId, setSiteId] = React.useState<string>('3595');
  const [memo, setMemo] = React.useState<InvestmentMemo | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    params.then((p) => {
      const parsedId = p.id || '3595';
      setSiteId(parsedId);

      async function fetchMemo() {
        try {
          const res = await fetch(`/api/memo/${parsedId}`);
          if (res.ok) {
            const data = await res.json();
            setMemo(data);
          }
        } catch (err) {
          console.error('Failed to load memo:', err);
        } finally {
          setLoading(false);
        }
      }

      fetchMemo();
    });
  }, [params]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !memo) {
    return (
      <div className="min-h-screen cosmic-gradient-bg bg-spatial-grid text-white p-12 flex flex-col items-center justify-center font-mono text-xs text-amber-400 animate-pulse">
        Fetching Real Mireye Physical Investment Memo for Parcel #{siteId}...
      </div>
    );
  }

  const topVerdictSummary = memo.decisionAuthorizationSignOff.signOffStatus === 'RECOMMENDED_FOR_EXECUTION'
    ? 'VERDICT: RECOMMENDED — PROCEED TO SITE CONTROL'
    : 'VERDICT: REJECTED — SITE FAILS FEASIBILITY';

  return (
    <div className="min-h-screen cosmic-gradient-bg bg-spatial-grid text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      
      {/* Awwwards Liquid Cursor Glow & Orbital Satellite Radar Overlays */}
      <AwwwardsCursorGlow />
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial-vignette" />
      <SatelliteRadarSweep />

      {/* Floating Spatial HUD Navbar */}
      <Navbar />

      {/* Main Memo Container */}
      <main className="max-w-[1000px] w-full mx-auto px-6 py-10 print:py-0 print:px-0 relative z-10 text-left">
        
        {/* Printable Executive Document Card */}
        <div className="bg-[#080814]/95 border-2 border-white/20 rounded-3xl p-6 sm:p-10 shadow-[0_25px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl space-y-8 print:border-none print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="border-b border-white/15 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>EXECUTIVE INVESTMENT COMMITTEE MEMO</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {memo.siteName}
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                LOCATION: <span className="text-slate-200 font-bold">{memo.county}, {memo.state}</span> · Strategy: Commercial Retail Solar Carport
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0 print:hidden"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Export PDF / Print</span>
              </button>
            </div>
          </div>

          {/* Section 1: Executive Verdict Banner */}
          <div className="bg-emerald-500/15 border border-emerald-400 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-mono font-black text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{topVerdictSummary}</span>
            </div>
            <div className="text-[10px] text-slate-400">RANK #{memo.overallRank} TARGET</div>
          </div>

          {/* Section 2: Decision Authorization Sign-Off */}
          <div className="bg-[#0a0a14] border border-white/15 p-5 rounded-2xl space-y-3 font-sans">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>DECISION AUTHORIZATION SIGN-OFF</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white">
              "{memo.decisionAuthorizationSignOff.finalRecommendation}"
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {memo.tradeoffExplanation}
            </p>
            <div className="text-xs font-mono font-bold text-slate-400 flex items-center gap-2 pt-1 border-t border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Execution Date: {memo.decisionAuthorizationSignOff.targetActionDate}</span>
            </div>
          </div>

          {/* Section 3: Institutional Financial & Tax Equity Structuring */}
          <div className="space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>01 // INSTITUTIONAL PRO-FORMA & TAX EQUITY STRUCTURING</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ESTIMATED CAPACITY</div>
                <div className="text-xl font-black text-white mt-1">{memo.financialSummary.estimatedCapacityKw ?? 340} kW</div>
              </div>

              <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">30% IRA ITC CREDIT</div>
                <div className="text-xl font-black text-emerald-400 mt-1">${Math.round((memo.financialSummary.iraTaxCreditUsd ?? 224000) / 1000)}k USD</div>
              </div>

              <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">5-YR MACRS DEPR.</div>
                <div className="text-xl font-black text-amber-400 mt-1">${Math.round((memo.financialSummary.macrsDepreciationBenefitUsd ?? 156000) / 1000)}k USD</div>
              </div>

              <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NET EQUITY IRR</div>
                <div className="text-xl font-black text-white mt-1">{memo.financialSummary.projectedNetEquityIrr ?? 19.8}%</div>
              </div>
            </div>
          </div>

          {/* Section 4: Risk Matrix */}
          <div className="space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>02 // CONSTRUCTION RISKS & MITIGATION MATRIX</span>
            </div>

            <div className="space-y-2 font-mono">
              {memo.risksAndMitigations.map((item, i) => (
                <div key={i} className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15 text-xs space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-2">
                    <span>→ RISK:</span>
                    <span className="text-white">{item.risk}</span>
                  </div>
                  <div className="text-slate-300 font-medium pl-4 border-l-2 border-amber-500/40 mt-1">
                    MITIGATION: {item.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Non-Binding Letter of Intent (LOI) Draft */}
          <div className="space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>03 // NON-BINDING LETTER OF INTENT (LOI) DRAFT</span>
            </div>

            <div className="bg-[#05050a] p-4 rounded-2xl border border-white/15 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {memo.loiText}
            </div>

            {/* Legal Notice Disclaimer Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-slate-300 leading-relaxed text-[11px]">
                {memo.legalDisclaimer || 'LEGAL NOTICE & PRE-FEASIBILITY UNDERWRITING DISCLAIMER: This document and generated Letter of Intent (LOI) are provided solely for pre-feasibility preliminary screening and automated decision support purposes. This output does NOT constitute legal advice or a binding legal contract. Full legal counsel review and title commitments required prior to execution.'}
              </div>
            </div>
          </div>

          {/* Section 6: Mireye Proof of Work Evidence Panel */}
          <div className="border-t border-white/10 pt-6 space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>04 // MIREYE PROOF-OF-WORK EVIDENCE PANEL</span>
            </div>

            <div className="bg-[#05050a] rounded-2xl border border-white/15 overflow-hidden text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-amber-400 font-bold text-[11px] uppercase">
                    <th className="p-3">Physical Attribute</th>
                    <th className="p-3">Sourced Value</th>
                    <th className="p-3">Dataset Source</th>
                    <th className="p-3">Fetched At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-300">
                  {memo.mireyeCitations.map((ev, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">{ev.fieldName}</td>
                      <td className="p-3 font-medium text-slate-200">{ev.valueString}</td>
                      <td className="p-3">
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
                        >
                          <span>{ev.source}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-3 text-[10.5px] text-slate-400">{ev.fetchedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
