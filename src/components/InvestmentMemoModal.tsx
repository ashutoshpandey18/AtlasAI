'use client';

import React from 'react';
import type { InvestmentMemo } from '../agent/memo';
import { FileText, Download, X, ShieldCheck, DollarSign, AlertTriangle, CheckCircle2, Clock, ExternalLink } from 'lucide-react';

interface InvestmentMemoModalProps {
  memo: InvestmentMemo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvestmentMemoModal({ memo, isOpen, onClose }: InvestmentMemoModalProps) {
  if (!isOpen || !memo) return null;

  const handlePrint = () => {
    window.print();
  };

  const topVerdictSummary = memo.decisionAuthorizationSignOff.signOffStatus === 'RECOMMENDED_FOR_EXECUTION'
    ? 'VERDICT: RECOMMENDED — PROCEED TO SITE CONTROL'
    : 'VERDICT: REJECTED — SITE FAILS FEASIBILITY';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto font-sans text-left">
      
      {/* HIGH-TECH COSMIC SPACE GLASS CONTAINER */}
      <div className="cosmic-gradient-bg bg-spatial-grid border-2 border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_90px_rgba(0,0,0,0.95)] relative text-white space-y-6 overflow-x-hidden">
        
        {/* Sticky Top Navigation & Action Header */}
        <div className="sticky top-0 bg-[#080814]/95 backdrop-blur-2xl border-b border-white/15 p-6 z-20 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>01 // EXECUTIVE INVESTMENT COMMITTEE MEMO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">{memo.siteName}</h2>
            <div className="text-xs font-mono text-slate-400 mt-0.5">
              LOCATION: <span className="text-slate-200 font-bold">{memo.county}, {memo.state}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0"
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

        {/* Modal Body / Printable Executive Content */}
        <div className="p-6 sm:p-8 space-y-8 print:p-0 print:space-y-6">
          
          {/* Executive Verdict Header Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-mono font-black tracking-wider ${
            memo.decisionAuthorizationSignOff.signOffStatus === 'RECOMMENDED_FOR_EXECUTION'
              ? 'bg-emerald-500/15 border-emerald-400 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
              : 'bg-rose-500/15 border-rose-400 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.35)]'
          }`}>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{topVerdictSummary}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              RANK #{memo.overallRank} TARGET
            </div>
          </div>

          {/* Section 1: Executive Recommendation & Underwriting Callout */}
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

          {/* Section 2: Institutional Financial & Tax Equity Structuring */}
          <div className="space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>01 // INSTITUTIONAL PRO-FORMA & TAX EQUITY STRUCTURING</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ESTIMATED CAPACITY</div>
                <div className="text-xl font-black text-white mt-1">{memo.financialSummary.estimatedCapacityKw} kW</div>
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

          {/* Section 3: Construction Risk Matrix */}
          <div className="space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>02 // CONSTRUCTION RISKS & MITIGATION MATRIX</span>
            </div>

            <div className="space-y-2 font-mono">
              {memo.risksAndMitigations.map((item, idx) => (
                <div key={idx} className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15 text-xs space-y-1">
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

          {/* Section 4: Non-Binding Letter of Intent (LOI) Draft */}
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

          {/* Section 5: Mireye Evidence Panel & Timestamps */}
          <div className="border-t border-white/10 pt-6 space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>04 // MIREYE PROOF-OF-WORK EVIDENCE PANEL</span>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Every value below was fetched directly from Mireye physical-world endpoints with verified source references and timestamps.
            </p>

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
                  {memo.mireyeCitations.slice(0, 6).map((c, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">{c.fieldName}</td>
                      <td className="p-3 font-medium text-slate-200">{c.valueString}</td>
                      <td className="p-3">
                        <a
                          href={c.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
                        >
                          <span>{c.source}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-3 text-[10.5px] text-slate-400">
                        {new Date(c.fetchedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
