'use client';

import React from 'react';
import { X, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, FileCheck } from 'lucide-react';

export interface AskWhyData {
  title: string;
  subtitle: string;
  inputsChecked: string[];
  rulesApplied: string[];
  conclusion: string;
  isApproved: boolean;
}

interface AskWhyModalProps {
  data: AskWhyData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AskWhyModal({ data, isOpen, onClose }: AskWhyModalProps) {
  if (!isOpen || !data) return null;

  const isFlood = data.conclusion.toLowerCase().includes('flood');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-left">
      
      {/* PURE MATTE TITANIUM CONTAINER (0% Glow, 0% Neon Laser Lines) */}
      <div className="bg-[#0d0d12] border border-white/15 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-white space-y-4 overflow-hidden">
        
        {/* Top Header: Title & Close Button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Decision Explanation</span>
            </div>
            <h3 className="text-base font-black text-white tracking-tight mt-0.5">{data.title}</h3>
            <div className="text-xs text-slate-400 font-medium">{data.subtitle}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matte Verdict Status Badge */}
        <div className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
          data.isApproved
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
        }`}>
          {data.isApproved ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>
            {data.isApproved
              ? 'VERDICT: RECOMMENDED — PROCEED TO SITE CONTROL'
              : 'VERDICT: REJECTED — DISQUALIFIED ON CIVIL / ENVIRONMENTAL FEASIBILITY'}
          </span>
        </div>

        {/* Dynamic Mireye Physical Signals Grid */}
        {data.inputsChecked && data.inputsChecked.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              MIREYE PHYSICAL SIGNALS CHECKED:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {data.inputsChecked.map((input, idx) => (
                <div key={idx} className="bg-[#14141c] border border-white/10 p-2.5 rounded-xl font-mono text-[11px] text-slate-200">
                  {input}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applied Rules / Constraints Ledger */}
        {data.rulesApplied && data.rulesApplied.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              APPLIED RULES & CONSTRAINTS:
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-300">
              {data.rulesApplied.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                  <span className="text-amber-400 font-bold">→</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rationale Callout Box */}
        <div className={`p-3 rounded-xl border text-xs font-medium leading-relaxed font-mono ${
          data.isApproved
            ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-200'
            : 'bg-rose-950/20 border-rose-800/30 text-rose-200'
        }`}>
          "{data.conclusion}"
        </div>

        {/* Footer Close Button */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-200 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
          >
            Close Explanation
          </button>
        </div>

      </div>
    </div>
  );
}
