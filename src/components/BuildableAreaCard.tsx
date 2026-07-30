'use client';

import { useMemo } from 'react';
import { Layers, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, ArrowRight, Info } from 'lucide-react';
import type { MireyeFetchResponse } from '@/types/mireye';
import { analyzeBuildableArea, type AgentActionVerdict } from '@/services/buildableAreaHarness';

interface Props {
  data: MireyeFetchResponse;
  targetRequiredAcres?: number;
  totalParcelAcres?: number;
}

export default function BuildableAreaCard({
  data,
  targetRequiredAcres = 50,
  totalParcelAcres = 100,
}: Props) {
  const report = useMemo(() => {
    return analyzeBuildableArea(data, targetRequiredAcres, totalParcelAcres);
  }, [data, targetRequiredAcres, totalParcelAcres]);

  const verdictStyles: Record<
    AgentActionVerdict,
    { bg: string; border: string; text: string; dot: string; icon: any }
  > = {
    READY_FOR_SITE_CONTROL: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    NEEDS_PARCEL_ASSEMBLY: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
    },
    REJECT_CONSTRAINED: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-600 dark:text-red-400',
      dot: 'bg-red-500',
      icon: XCircle,
    },
  };

  const style = verdictStyles[report.verdict];
  const VerdictIcon = style.icon;

  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
          </div>
          <div>
            <h4 className="text-[12px] font-extrabold text-[var(--text-primary)]">
              Buildable Area Mask Harness
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">
              Net Parcel Footprint Deductions & Agent Action Verdict
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${style.bg} ${style.border} ${style.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {report.verdictLabel}
        </span>
      </div>

      {/* Progress Bar & Footprint Summary */}
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-0.5">
              Net Buildable Acreage
            </div>
            <div className="text-[20px] font-black text-[var(--text-primary)] leading-none">
              {report.netBuildableAcres}{' '}
              <span className="text-[11px] font-normal text-[var(--text-muted)]">
                / {report.totalParcelAcres} Acres ({report.buildableEfficiencyPct}% Efficient)
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Target Required</div>
            <div className="text-[13px] font-extrabold text-[var(--accent)]">
              {report.targetRequiredAcres} Acres
            </div>
          </div>
        </div>

        {/* Visual Acreage Bar */}
        <div className="h-2.5 bg-[var(--bg-soft)] rounded-full overflow-hidden flex border border-[var(--border)]">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${report.buildableEfficiencyPct}%` }}
            title={`Net Buildable: ${report.netBuildableAcres} Acres`}
          />
          {report.totalDeductionsAcres > 0 && (
            <div
              className="h-full bg-red-500/80 transition-all duration-500"
              style={{ width: `${100 - report.buildableEfficiencyPct}%` }}
              title={`Constraint Deductions: -${report.totalDeductionsAcres} Acres`}
            />
          )}
        </div>
      </div>

      {/* Constraint Deductions Chips */}
      {report.deductions.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            Active Constraint Deductions
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.deductions.map((d) => (
              <div
                key={d.code}
                className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2"
              >
                <span className="text-[10.5px] font-bold text-red-600 dark:text-red-400">
                  {d.label}
                </span>
                <span className="text-[9.5px] font-extrabold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  -{d.deductionAcres} Acres (-{d.deductionPct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verdict Rationale Banner */}
      <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 ${style.bg} ${style.border}`}>
        <VerdictIcon className={`w-4 h-4 ${style.text} flex-shrink-0 mt-0.5`} />
        <div className="text-[11px] font-medium leading-relaxed text-[var(--text-primary)]">
          {report.verdictReason}
        </div>
      </div>
    </div>
  );
}
