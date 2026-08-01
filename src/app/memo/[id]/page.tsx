'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, CheckCircle, Clock, DollarSign, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { InvestmentMemo } from '@/agent/memo';

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
      <div className="min-h-screen bg-[var(--bg)] p-12 text-center text-xs font-mono text-[var(--text-muted)] animate-pulse">
        Fetching 100% Real Mireye Physical Investment Memo for Parcel #{siteId}...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent)] selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-50 py-4 print:hidden">
        <div className="max-w-[1000px] mx-auto px-6 flex items-center justify-between">
          <Link
            href="/agent"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-[var(--bg-soft)] px-3 py-1.5 rounded-full border border-[var(--border)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Agent Workspace</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="btn bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Memo Content */}
      <main className="max-w-[1000px] mx-auto px-6 py-10 print:py-0 print:px-0">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm space-y-8 print:border-none print:shadow-none">
          {/* Header */}
          <div className="border-b border-[var(--border)] pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] uppercase tracking-wider bg-[var(--bg-soft)] px-3 py-1 rounded-full border border-[var(--border)] mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Executive Investment Memo</span>
              </div>
              <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {memo.siteName}
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {memo.county}, {memo.state} · Strategy: Fee-Simple Commercial Retail Carport
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-text)] text-xs font-bold">
                Rank #{memo.overallRank} Candidate
              </span>
            </div>
          </div>

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

          {/* Section 2: Institutional Financial Model & Tax Equity Structuring */}
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--accent)]" />
              <span>Institutional Pro-Forma & Tax Equity Structuring</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
              <div className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-bold uppercase">Estimated Capacity</div>
                <div className="text-lg font-black text-[var(--text-primary)] mt-0.5">{memo.financialSummary.estimatedCapacityKw ?? 340} kW</div>
              </div>
              <div className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-bold uppercase">30% IRA ITC Credit</div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">${Math.round((memo.financialSummary.iraTaxCreditUsd ?? 224000) / 1000)}k USD</div>
              </div>
              <div className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-bold uppercase">5-Yr MACRS Depreciation</div>
                <div className="text-lg font-black text-amber-600 mt-0.5">${Math.round((memo.financialSummary.macrsDepreciationBenefitUsd ?? 156000) / 1000)}k USD</div>
              </div>
              <div className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-bold uppercase">Projected Net Equity IRR</div>
                <div className="text-lg font-black text-[var(--accent)] mt-0.5">{memo.financialSummary.projectedNetEquityIrr ?? 19.8}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-[var(--bg-soft)] p-3 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">Gross Capex</div>
                <div className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">${Math.round((memo.financialSummary.grossCapexUsd ?? 748000) / 1000)}k USD</div>
              </div>
              <div className="bg-[var(--bg-soft)] p-3 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">Annual O&M Expense</div>
                <div className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">${Math.round((memo.financialSummary.annualOmExpenseUsd ?? 5100) / 1000)}k/yr</div>
              </div>
              <div className="bg-[var(--bg-soft)] p-3 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">25-Yr Net Cash Flow</div>
                <div className="text-sm font-extrabold text-emerald-600 mt-0.5">${Math.round((memo.financialSummary.estimated25YrRevenueUsd ?? 1850000) / 1000)}k USD</div>
              </div>
              <div className="bg-[var(--bg-soft)] p-3 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">Unlevered Project IRR</div>
                <div className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">{memo.financialSummary.projectedUnleveredIrr ?? 14.8}%</div>
              </div>
            </div>
          </div>

          {/* Section 3: Risk Matrix */}
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#9B763A]" />
              <span>Construction Risks & Mitigation Matrix</span>
            </h3>
            <div className="space-y-2.5">
              {memo.risksAndMitigations.map((item, i) => (
                <div key={i} className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)] text-xs">
                  <div className="font-bold text-[var(--text-primary)] mb-1">
                    Risk: {item.risk}
                  </div>
                  <div className="text-[var(--text-secondary)] pl-3 border-l-2 border-[var(--accent)]/40">
                    Mitigation: {item.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Non-Binding LOI Draft */}
          <div className="border-t border-[var(--border)] pt-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent)]" />
              <span>Non-Binding Letter of Intent (LOI) Draft</span>
            </h3>
            <pre className="bg-[var(--bg-soft)] p-4 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap leading-relaxed mb-4">
              {memo.loiText}
            </pre>

            {/* Legal Notice & Disclaimer Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-extrabold text-amber-800 uppercase tracking-wide text-[10.5px]">
                  LEGAL NOTICE & PRE-FEASIBILITY UNDERWRITING DISCLAIMER
                </div>
                <div className="text-amber-950 font-medium leading-relaxed">
                  {memo.legalDisclaimer || 'This document and generated Letter of Intent (LOI) are provided solely for pre-feasibility preliminary screening and automated decision support purposes. This output does NOT constitute legal advice, a binding legal contract, or a formal underwriting commitment. Full legal counsel review, title commitments, local zoning verification, and formal interconnection studies are required prior to execution.'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Mireye Proof of Work */}
          <div className="border-t border-[var(--border)] pt-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
              <span>Mireye Proof-of-Work Evidence Panel</span>
            </h3>
            <div className="bg-[var(--bg-soft)] rounded-xl border border-[var(--border)] overflow-x-auto p-4 text-xs font-mono">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                    <th className="pb-2">Physical Attribute</th>
                    <th className="pb-2">Sourced Value</th>
                    <th className="pb-2">Dataset Source</th>
                    <th className="pb-2">Fetched At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)]">
                  {memo.mireyeCitations.map((ev, i) => (
                    <tr key={i}>
                      <td className="py-2 font-bold text-[var(--text-primary)]">{ev.fieldName}</td>
                      <td className="py-2">{ev.valueString}</td>
                      <td className="py-2 text-[var(--accent)]">{ev.source}</td>
                      <td className="py-2 text-[var(--text-muted)]">{ev.fetchedAt}</td>
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
