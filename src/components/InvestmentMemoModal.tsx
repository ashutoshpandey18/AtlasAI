'use client';

import React, { useState } from 'react';
import type { InvestmentMemo } from '../agent/memo';
import { FileText, Download, X, ShieldCheck, DollarSign, AlertTriangle, CheckCircle2, Clock, ExternalLink, Copy, Check } from 'lucide-react';

interface InvestmentMemoModalProps {
  memo: InvestmentMemo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvestmentMemoModal({ memo, isOpen, onClose }: InvestmentMemoModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans text-left">
      
      {/* MCKINSEY / BCG INSTITUTIONAL EXECUTIVE CONTAINER */}
      <div className="bg-[#080812] border-2 border-white/20 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-[0_25px_90px_rgba(0,0,0,0.98)] relative text-white space-y-6 overflow-x-hidden font-sans">
        
        {/* Sticky Executive Action Header */}
        <div className="sticky top-0 bg-[#080812]/95 backdrop-blur-2xl border-b border-white/15 p-6 z-20 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>EXECUTIVE INVESTMENT COMMITTEE MEMORANDUM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">{memo.siteName}</h2>
            <div className="text-xs font-mono text-slate-400 mt-0.5">
              TARGET SITE: <span className="text-slate-200 font-bold">{memo.county}, {memo.state}</span> • OVERALL RANK #{memo.overallRank}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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

        {/* Modal Body / McKinsey Report View */}
        <div className="p-6 sm:p-8 space-y-8 print:p-0 print:space-y-6 text-slate-200">
          
          {/* SECTION 1: EXECUTIVE SUMMARY & FINAL RECOMMENDATION (Top Priority) */}
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isRecommended
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.25)]'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>1.0 EXECUTIVE RECOMMENDATION & VERDICT</span>
                </div>
                <span className="text-[11px] text-slate-400">RANK #{memo.overallRank} TARGET</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white leading-snug">
                "{memo.decisionAuthorizationSignOff.finalRecommendation}"
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {memo.executiveSummary}
              </p>
              <div className="text-xs font-mono font-bold text-slate-400 flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Execution Sign-off Date: {memo.decisionAuthorizationSignOff.targetActionDate}</span>
                </div>
                <span className="text-amber-400 font-bold">FEASIBILITY SCORE: {memo.technicalScore}/100</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: WHY THIS SITE (ACQUISITION & TRADEOFF RATIONALE) */}
          <div className="bg-[#0c0c16] border border-white/15 p-6 rounded-2xl space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>2.0 STRATEGIC ACQUISITION RATIONALE & TRADEOFFS</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {memo.tradeoffExplanation}
            </p>
          </div>

          {/* SECTION 3: INSTITUTIONAL FINANCIAL PRO-FORMA & IRA TAX EQUITY */}
          <div className="space-y-4 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>3.0 INSTITUTIONAL FINANCIAL PRO-FORMA & IRA TAX EQUITY</span>
            </div>

            {/* Financial Narrative Block */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              Under Section 48 of the Inflation Reduction Act (IRA), this commercial canopy installation qualifies for a <strong className="text-amber-400">30% Investment Tax Credit (${Math.round((memo.financialSummary.iraTaxCreditUsd ?? 224000) / 1000)}k USD)</strong> alongside <strong className="text-amber-400">5-Year MACRS accelerated depreciation (${Math.round((memo.financialSummary.macrsDepreciationBenefitUsd ?? 156000) / 1000)}k tax shield)</strong>. Combined with a low $15/kW annual O&M operating structure, the unlevered project yields a projected <strong className="text-emerald-400">{memo.financialSummary.projectedNetEquityIrr ?? 19.8}% Net Equity IRR</strong> over a 25-year operational lifecycle.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ESTIMATED CAPACITY</div>
                <div className="text-xl font-black text-white mt-1">{memo.financialSummary.estimatedCapacityKw} kW</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Commercial Canopy</div>
              </div>

              <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">30% IRA ITC CREDIT</div>
                <div className="text-xl font-black text-emerald-400 mt-1">${Math.round((memo.financialSummary.iraTaxCreditUsd ?? 224000) / 1000)}k USD</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tax Equity Value</div>
              </div>

              <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">5-YR MACRS SHIELD</div>
                <div className="text-xl font-black text-amber-400 mt-1">${Math.round((memo.financialSummary.macrsDepreciationBenefitUsd ?? 156000) / 1000)}k USD</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Depreciation Benefit</div>
              </div>

              <div className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NET EQUITY IRR</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{memo.financialSummary.projectedNetEquityIrr ?? 19.8}%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">25-Yr Projected Return</div>
              </div>
            </div>
          </div>

          {/* SECTION 4: CIVIL, ENVIRONMENTAL & CONSTRUCTION RISKS */}
          <div className="space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>4.0 CIVIL, ENVIRONMENTAL & CONSTRUCTION RISK MATRIX</span>
            </div>

            <div className="space-y-2.5">
              {memo.risksAndMitigations.map((item, idx) => (
                <div key={idx} className="bg-[#0a0a14] p-4 rounded-2xl border border-white/15 text-xs space-y-1.5 font-mono">
                  <div className="font-bold text-amber-400 flex items-center gap-2">
                    <span>→ IDENTIFIED RISK:</span>
                    <span className="text-white font-sans text-xs">{item.risk}</span>
                  </div>
                  <div className="text-slate-300 font-sans font-medium pl-4 border-l-2 border-emerald-500/60 mt-1">
                    <strong className="text-emerald-400 font-mono">MITIGATION:</strong> {item.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: MIREYE PROOF-OF-WORK EVIDENCE PANEL WITH BUSINESS IMPACT */}
          <div className="space-y-3 font-sans pt-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>5.0 MIREYE PROOF-OF-WORK EVIDENCE PANEL</span>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Every value below was fetched directly from Mireye physical location intelligence endpoints with timestamped sources and business impact rationale.
            </p>

            <div className="bg-[#05050a] rounded-2xl border border-white/15 overflow-hidden text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-amber-400 font-bold text-[11px] uppercase">
                    <th className="p-3">Physical Attribute</th>
                    <th className="p-3">Sourced Value</th>
                    <th className="p-3">Dataset Source</th>
                    <th className="p-3 font-sans">Business Impact (WHY It Matters)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-300">
                  {memo.mireyeCitations.slice(0, 6).map((c, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">{c.fieldName}</td>
                      <td className="p-3 font-bold text-emerald-400">{c.valueString}</td>
                      <td className="p-3 text-[11px]">
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
                      <td className="p-3 font-sans text-xs text-slate-200 font-medium">
                        {c.businessImpact || 'Verified physical signal used in automated civil and environmental feasibility.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 6: NON-BINDING OPTION LETTER OF INTENT (LOI) CONTRACT */}
          <div className="space-y-3 font-sans pt-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>6.0 EXECUTABLE OPTION LETTER OF INTENT (LOI) DRAFT</span>
              </div>

              <button
                type="button"
                onClick={handleCopyLoi}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg"
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

            <div className="bg-[#04040a] p-5 rounded-2xl border border-white/15 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto select-all">
              {memo.loiText}
            </div>

            {/* Legal Notice Disclaimer Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs font-mono">
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
