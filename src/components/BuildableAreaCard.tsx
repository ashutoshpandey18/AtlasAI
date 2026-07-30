'use client';

import { useMemo, useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Sparkles, ArrowRight, FileText } from 'lucide-react';
import type { MireyeFetchResponse } from '@/types/mireye';
import { analyzeBuildableArea, type AgentActionVerdict } from '@/services/buildableAreaHarness';
import OwnerOutreachModal from './OwnerOutreachModal';

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
  const [loiModalOpen, setLoiModalOpen] = useState(false);

  const report = useMemo(() => {
    return analyzeBuildableArea(data, targetRequiredAcres, totalParcelAcres);
  }, [data, targetRequiredAcres, totalParcelAcres]);

  const verdictStyles: Record<
    AgentActionVerdict,
    { bg: string; border: string; text: string; dot: string; icon: any }
  > = {
    READY_FOR_SITE_CONTROL: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    NEEDS_PARCEL_ASSEMBLY: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/40',
      text: 'text-amber-800 dark:text-amber-400',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
    },
    REJECT_CONSTRAINED: {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-800/40',
      text: 'text-orange-800 dark:text-orange-400',
      dot: 'bg-orange-500',
      icon: XCircle,
    },
  };

  const style = verdictStyles[report.verdict];
  const VerdictIcon = style.icon;

  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_4px_20px_-4px_rgba(22,20,15,0.06)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-wider">
                Buildable Footprint Harness
              </h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F3EFE6] border border-[#E5DFD3] text-amber-800">
                PARCEL MASK
              </span>
            </div>
            <p className="text-[10.5px] text-[var(--text-muted)] font-medium">
              Net Usable Acreage & AI Agent Site Control Verdict
            </p>
          </div>
        </div>

        {/* Verdict Badge */}
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${style.bg} ${style.border} ${style.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {report.verdictLabel}
        </span>
      </div>

      {/* Realistic Metric Card — Warm Skin / Cream Background */}
      <div className="bg-[#FAF8F3] border border-[#EAE4D9] rounded-2xl p-4 space-y-3 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-[9.5px] uppercase font-bold tracking-wider text-[#8C8273] mb-1">
              Net Buildable Acreage
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-black text-[var(--text-primary)] leading-none">
                {report.netBuildableAcres}
              </span>
              <span className="text-[12px] font-bold text-[#6E6659]">Acres</span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full ml-1">
                {report.buildableEfficiencyPct}% Usable
              </span>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 border-[#E5DFD3] pt-2 sm:pt-0">
            <div className="text-[9.5px] uppercase font-bold text-[#8C8273] mb-0.5">Target Requirement</div>
            <div className="text-[14px] font-black text-orange-600">
              {report.targetRequiredAcres} Acres
            </div>
          </div>
        </div>

        {/* Realistic Warm Yellow/Orange Progress Meter */}
        <div className="h-3 bg-[#EAE4D9] rounded-full overflow-hidden flex border border-[#DCD5C7] p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 transition-all duration-700 shadow-sm"
            style={{ width: `${report.buildableEfficiencyPct}%` }}
          />
        </div>
      </div>

      {/* Active Constraint Deductions */}
      {report.deductions.length > 0 && (
        <div className="space-y-2">
          <div className="text-[9.5px] uppercase font-bold tracking-wider text-[#8C8273]">
            Active Constraint Deductions ({report.deductions.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.deductions.map((d) => (
              <div
                key={d.code}
                className="flex items-center justify-between bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2.5 shadow-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                    {d.label}
                  </span>
                </div>
                <span className="text-[10px] font-black text-orange-700 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full flex-shrink-0">
                  -{d.deductionAcres} Ac (-{d.deductionPct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verdict Rationale Banner */}
      <div className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 ${style.bg} ${style.border}`}>
        <div className="flex items-start gap-2.5">
          <VerdictIcon className={`w-4 h-4 ${style.text} flex-shrink-0 mt-0.5`} />
          <div className="text-[11px] font-semibold leading-relaxed text-[var(--text-primary)]">
            {report.verdictReason}
          </div>
        </div>
        <button
          onClick={() => setLoiModalOpen(true)}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10.5px] font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-sm shrink-0"
        >
          <FileText className="w-3.5 h-3.5" />
          Draft LOI
        </button>
      </div>

      {/* LOI Draft Modal */}
      <OwnerOutreachModal
        isOpen={loiModalOpen}
        onClose={() => setLoiModalOpen(false)}
        address={`${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`}
        data={data}
        useCaseName="Solar / Data Center"
        targetAcres={report.netBuildableAcres}
      />
    </div>
  );
}
