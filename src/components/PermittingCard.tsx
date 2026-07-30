'use client';

import { useMemo } from 'react';
import { Calendar, ShieldAlert, CheckCircle2, FileText, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import type { MireyeFetchResponse } from '@/types/mireye';
import { analyzeEnvironmentalPermitting } from '@/services/permittingEngine';

interface Props {
  data: MireyeFetchResponse;
  useCaseName?: string;
}

export default function PermittingCard({ data, useCaseName = 'Solar Farm' }: Props) {
  const report = useMemo(() => {
    return analyzeEnvironmentalPermitting(data, useCaseName);
  }, [data, useCaseName]);

  const categoryStyles = {
    FAST_TRACK_ELIGIBLE: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    STANDARD_PERMITTING: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      dot: 'bg-amber-500',
      icon: Clock,
    },
    EXTENDED_NEPA_DELAY: {
      bg: 'bg-orange-50 border-orange-200 text-orange-800',
      dot: 'bg-orange-500',
      icon: AlertTriangle,
    },
  };

  const style = categoryStyles[report.permittingCategory];
  const CategoryIcon = style.icon;

  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_4px_20px_-4px_rgba(22,20,15,0.06)] space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-sm">
            <Calendar className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-wider">
                Environmental Permitting Timeline
              </h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F3EFE6] border border-[#E5DFD3] text-amber-800">
                NEPA & USACE AUDIT
              </span>
            </div>
            <p className="text-[10.5px] text-[var(--text-muted)] font-medium">
              Regulatory Clearance Timelines & Critical Path Permit Matrix
            </p>
          </div>
        </div>

        {/* Category Status Pill */}
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${style.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {report.categoryLabel}
        </span>
      </div>

      {/* Main Metric Visualizer Banner */}
      <div className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-[9.5px] uppercase font-bold tracking-wider text-[#8C8273] mb-1">
              Est. Permitting Clearance Timeline
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-black text-[var(--text-primary)] leading-none">
                {report.estimatedLeadTimeMonths}
              </span>
              <span className="text-[12px] font-bold text-[#6E6659]">Months Lead Time</span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full ml-1">
                Range: {report.leadTimeRangeLabel}
              </span>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 border-[#E5DFD3] pt-2 sm:pt-0">
            <div className="text-[9.5px] uppercase font-bold text-[#8C8273] mb-0.5">Critical Path Agency</div>
            <div className="text-[12px] font-black text-[var(--text-primary)] truncate max-w-[200px]">
              {report.criticalPathAgency}
            </div>
          </div>
        </div>

        {/* Timeline Visual Bar */}
        <div className="h-2.5 bg-[#EAE4D9] rounded-full overflow-hidden flex border border-[#DCD5C7]">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              report.estimatedLeadTimeMonths <= 6 ? 'bg-emerald-500' :
              report.estimatedLeadTimeMonths <= 18 ? 'bg-amber-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(100, (report.estimatedLeadTimeMonths / 36) * 100)}%` }}
          />
        </div>
      </div>

      {/* Required Permit Matrix Grid */}
      <div className="space-y-2">
        <div className="text-[9.5px] uppercase font-bold tracking-wider text-[#8C8273]">
          Required Permit Matrix ({report.requiredPermits.length} Permits)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {report.requiredPermits.map((p) => (
            <div
              key={p.code}
              className="bg-white border border-[#E5DFD3] rounded-xl p-3 shadow-sm flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[var(--text-primary)] truncate">
                  {p.name}
                </span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                  p.isCriticalPath ? 'bg-orange-100 border-orange-200 text-orange-800' : 'bg-[#F3EFE6] border-[#E5DFD3] text-[#6E6659]'
                }`}>
                  ~{p.estimatedMonths} Mo
                </span>
              </div>
              <div className="text-[9.5px] text-[var(--text-muted)] font-medium truncate">
                {p.agency}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permitting Advice Banner */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
        <CategoryIcon className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] font-semibold leading-relaxed text-amber-900">
          {report.permittingAdvice}
        </div>
      </div>
    </div>
  );
}
