'use client';

import React from 'react';
import { HelpCircle, X, CheckCircle, AlertTriangle } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-[var(--text-primary)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Decision Ledger & Explainability
              </div>
              <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">{data.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 text-xs">
          {/* Inputs Checked */}
          <div>
            <div className="font-bold text-[var(--text-muted)] uppercase text-[10.5px] tracking-wider mb-2">
              1. Physical Inputs Checked (Mireye Sourced)
            </div>
            <div className="bg-[var(--bg-soft)] p-3 rounded-xl border border-[var(--border)] space-y-1.5 font-mono text-[11.5px] text-[var(--text-secondary)]">
              {data.inputsChecked.map((inp, i) => (
                <div key={i}>• {inp}</div>
              ))}
            </div>
          </div>

          {/* Rules Applied */}
          <div>
            <div className="font-bold text-[var(--text-muted)] uppercase text-[10.5px] tracking-wider mb-2">
              2. Acquisition Rules Evaluated
            </div>
            <div className="bg-[var(--bg-soft)] p-3 rounded-xl border border-[var(--border)] space-y-1.5 text-[11.5px] text-[var(--text-secondary)]">
              {data.rulesApplied.map((r, i) => (
                <div key={i}>• {r}</div>
              ))}
            </div>
          </div>

          {/* Conclusion */}
          <div className={`p-4 rounded-xl border ${
            data.isApproved
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-800'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-800'
          }`}>
            <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
              {data.isApproved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Approved for Target List</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Rejected by Agent</span>
                </>
              )}
            </div>
            <p className="text-[12px] leading-relaxed font-medium">{data.conclusion}</p>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-end">
          <button
            onClick={onClose}
            className="btn bg-[var(--text-primary)] text-[var(--bg)] px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close Decision Trail
          </button>
        </div>
      </div>
    </div>
  );
}
