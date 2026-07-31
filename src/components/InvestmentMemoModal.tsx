'use client';

import React from 'react';
import type { InvestmentMemo } from '../agent/memo';
import { FileText, Download, X, ShieldCheck, DollarSign, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-[var(--text-primary)]">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] p-6 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-text)]">
                  Rank #{memo.overallRank} Candidate
                </span>
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  {memo.county}, {memo.state}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-0.5">{memo.siteName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="btn bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF / Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--bg-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Content */}
        <div className="p-8 space-y-8 print:p-0 print:space-y-6">
          {/* Section 1: Executive Recommendation Callout */}
          <div className="bg-[var(--bg-soft)] border border-[var(--accent)] p-5 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Decision Authorization Sign-Off</span>
            </div>
            <div className="text-base font-extrabold text-[var(--text-primary)] mb-2">
              {memo.decisionAuthorizationSignOff.finalRecommendation}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
              {memo.tradeoffExplanation}
            </p>
            <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Target Execution Date: {memo.decisionAuthorizationSignOff.targetActionDate}</span>
            </div>
          </div>

          {/* Section 2: Financial & Production Summary */}
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--accent)]" />
              <span>25-Year Revenue & Financial Model</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-medium">Estimated Capacity</div>
                <div className="text-lg font-black text-[var(--text-primary)] mt-0.5">
                  {memo.financialSummary.estimatedCapacityKw} kW
                </div>
              </div>
              <div className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-medium">Annual Yield</div>
                <div className="text-lg font-black text-[var(--text-primary)] mt-0.5">
                  {Math.round(memo.financialSummary.annualProductionKwh / 1000).toLocaleString()} MWh/yr
                </div>
              </div>
              <div className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-medium">25-Yr Gross Revenue</div>
                <div className="text-lg font-black text-[var(--accent)] mt-0.5">
                  ${(memo.financialSummary.estimated25YrRevenueUsd / 1000).toFixed(0)}k USD
                </div>
              </div>
              <div className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-medium">Est. Interconnect Capex</div>
                <div className="text-lg font-black text-[var(--text-primary)] mt-0.5">
                  ${(memo.financialSummary.estimatedInterconnectCapexUsd / 1000).toFixed(0)}k USD
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Risk & Mitigation Matrix */}
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#9B763A]" />
              <span>Construction Risks & Mitigation Matrix</span>
            </h3>
            <div className="space-y-2.5">
              {memo.risksAndMitigations.map((item, idx) => (
                <div key={idx} className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)] text-xs">
                  <div className="font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9B763A]" />
                    <span>Risk: {item.risk}</span>
                  </div>
                  <div className="text-[var(--text-secondary)] leading-relaxed pl-3 border-l-2 border-[var(--accent)]/40">
                    Mitigation: {item.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Letter of Intent (LOI) Draft */}
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent)]" />
              <span>Non-Binding Letter of Intent (LOI) Draft</span>
            </h3>
            <div className="bg-[var(--bg-soft)] p-4 rounded-xl border border-[var(--border)] font-mono text-[11.5px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap max-h-48 overflow-y-auto">
              {memo.loiText}
            </div>
          </div>

          {/* Section 5: Mireye Evidence Panel & Timestamps */}
          <div className="border-t border-[var(--border)] pt-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
              <span>Mireye Proof-of-Work Evidence Panel</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Every value below was fetched directly from Mireye physical-world endpoints with verified source references and timestamps.
            </p>
            <div className="bg-[var(--bg-soft)] rounded-xl border border-[var(--border)] overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] font-semibold text-[11px]">
                    <th className="p-3">Physical Attribute</th>
                    <th className="p-3">Sourced Value</th>
                    <th className="p-3">Dataset Source</th>
                    <th className="p-3">Fetched At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)]">
                  {memo.mireyeCitations.slice(0, 6).map((c, i) => (
                    <tr key={i} className="hover:bg-[var(--surface)] transition-colors">
                      <td className="p-3 font-semibold text-[var(--text-primary)] font-mono">{c.fieldName}</td>
                      <td className="p-3 font-medium">{c.valueString}</td>
                      <td className="p-3">
                        <a
                          href={c.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-semibold"
                        >
                          <span>{c.source}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-3 font-mono text-[10.5px] text-[var(--text-muted)]">
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
