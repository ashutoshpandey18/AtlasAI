'use client';

import React, { useState } from 'react';
import { HelpCircle, X, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showSources, setShowSources] = useState(false);

  if (!isOpen || !data) return null;

  // Plain-English sentence translation for technical inputs
  const translatedInputs = data.inputsChecked.map((inp) => {
    if (inp.includes('Zone AE') || inp.includes('flood')) {
      return 'This site floods on average once every 100 years (high flood hazard zone).';
    }
    if (inp.includes('slope') || inp.includes('USGS')) {
      return 'Steep ground slope requires expensive cut-and-fill land grading.';
    }
    if (inp.includes('poa') || inp.includes('solar')) {
      return 'High solar exposure for optimal clean energy yield.';
    }
    if (inp.includes('transmission') || inp.includes('grid')) {
      return 'Located near high-voltage power lines for fast grid connection.';
    }
    return inp;
  });

  const topVerdictSummary = data.isApproved
    ? 'Verdict: Recommended — Proceed to Site Control'
    : `Verdict: Recommended — Reject due to ${data.conclusion.includes('flood') ? '100-Year Floodplain Risk' : 'High Grid Congestion'}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-[var(--text-primary)]">
        
        {/* ONE-LINE PLAIN-ENGLISH VERDICT SUMMARY AT THE VERY TOP */}
        <div className={`p-3.5 rounded-xl border mb-5 flex items-center gap-2 text-xs font-black tracking-wide ${
          data.isApproved
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-800'
        }`}>
          {data.isApproved ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{topVerdictSummary}</span>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Decision Explanation
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
          
          {/* Plain English Explanation */}
          <div>
            <div className="font-bold text-[var(--text-muted)] uppercase text-[10.5px] tracking-wider mb-2">
              1. What We Found About This Site
            </div>
            <div className="bg-[var(--bg-soft)] p-3 rounded-xl border border-[var(--border)] space-y-2 text-[12px] text-[var(--text-primary)] font-medium">
              {translatedInputs.map((sentence, i) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[var(--accent)] font-bold">•</span>
                  <span>{sentence}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progressive Disclosure: Expandable Raw Sources */}
          <div>
            <button
              type="button"
              onClick={() => setShowSources(!showSources)}
              className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer py-1"
            >
              <span>{showSources ? 'Hide technical dataset citations' : 'Show technical dataset citations'}</span>
              {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showSources && (
              <div className="mt-2 bg-[var(--bg-soft)]/60 p-3 rounded-xl border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)] space-y-1">
                {data.inputsChecked.map((inp, i) => (
                  <div key={i}>• {inp}</div>
                ))}
              </div>
            )}
          </div>

          {/* Business Rules Evaluated */}
          <div>
            <div className="font-bold text-[var(--text-muted)] uppercase text-[10.5px] tracking-wider mb-2">
              2. Siting Rules Checked
            </div>
            <div className="bg-[var(--bg-soft)] p-3 rounded-xl border border-[var(--border)] space-y-1.5 text-[11.5px] text-[var(--text-secondary)]">
              {data.rulesApplied.map((r, i) => (
                <div key={i}>• {r}</div>
              ))}
            </div>
          </div>

          {/* Conclusion Box */}
          <div className={`p-4 rounded-xl border ${
            data.isApproved
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="font-bold flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wide">
              {data.isApproved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Approved for Site Control</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Site Rejected</span>
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
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
