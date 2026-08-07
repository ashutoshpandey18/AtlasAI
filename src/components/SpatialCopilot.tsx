'use client';

import React, { useState } from 'react';
import { MessageSquare, Sparkles, Compass, Shield, Zap, ArrowRight, CheckCircle2, Loader2, Send } from 'lucide-react';

interface SpatialCopilotProps {
  userPrompt: string;
  winnerSite?: any;
  evaluations?: any[];
  rejections?: any[];
  /** Atlas V1.3 — Mireye site_id for ask-site routing. null = use /v1/ask fallback. */
  mireyeSiteId?: string | null;
}

const SUGGESTED_QUESTIONS = [
  'Why was Site #1 selected?',
  'Why were cut sites rejected?',
  'Compare the top 3 candidates.',
  "Explain this recommendation like I'm a CFO.",
  'What residual risks affect this parcel?',
  'Summarize the acquisition strategy.',
];

export function SpatialCopilot({ userPrompt, winnerSite, evaluations = [], rejections = [], mireyeSiteId }: SpatialCopilotProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [answerData, setAnswerData] = useState<{
    answer: string;
    traceSteps?: string[];
    citations?: { fieldName: string; source: string; value: string }[];
    source?: 'mireye_site_dossier' | 'mireye_ask';
  } | null>(null);

  const handleAsk = async (qToAsk?: string) => {
    const q = qToAsk || question;
    if (!q.trim() || loading) return;

    setActiveQuestion(q);
    setLoading(true);
    setAnswerData(null);

    const winnerName = winnerSite?.siteName || winnerSite?.chain || 'Top Candidate';
    const candidateId = winnerSite?.geoId || winnerSite?.siteId || 'site-1';
    const county = winnerSite?.county || 'Target County';
    const lat = winnerSite?.lat ?? 0;
    const lng = winnerSite?.lng ?? winnerSite?.lon ?? 0;

    console.log(`[COPILOT SITE CONTEXT]`, {
      displayedWinner: winnerName,
      candidateId,
      county,
      lat,
      lng,
      mireyeSiteId: mireyeSiteId || 'none (using /v1/ask fallback)',
      question: q,
      askEndpoint: mireyeSiteId ? '/api/mireye/ask-site' : '/api/mireye/ask',
    });

    try {
      // Atlas V1.3: Use /v1/ask-site (dossier-backed) if site_id is available.
      // Falls back to /v1/ask automatically — user never sees an error.
      if (mireyeSiteId) {
        try {
          const siteRes = await fetch('/api/mireye/ask-site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site_id: mireyeSiteId, question: q.slice(0, 2000) }),
          });
          if (siteRes.ok) {
            const siteData = await siteRes.json();
            if (siteData?.answer) {
              console.log(`[MIREYE DOSSIER RESPONSE]`, {
                siteId: mireyeSiteId,
                dossierLocation: `${county}, ${lat}, ${lng}`,
                answerSnippet: siteData.answer.slice(0, 120),
              });
              setAnswerData({
                answer: siteData.answer,
                traceSteps: siteData.traceSteps,
                citations: siteData.citations,
                source: 'mireye_site_dossier',
              });
              return; // success — exit early
            }
          }
          // Non-OK or no answer — fall through to /v1/ask
        } catch {
          // Network error — fall through to /v1/ask
        }
      }

      // Fallback: stateless /v1/ask (existing behavior, unchanged)
      const res = await fetch('/api/mireye/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: {
            userPrompt,
            winnerSite,
            survivors: evaluations,
            rejections,
          },
          include_trace: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnswerData({ ...data, source: 'mireye_ask' });
      }
    } catch (err) {
      console.error('Failed to ask Spatial Copilot:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-6 border-t border-white/10 font-sans text-left">
      {/* Copilot Header */}
      <div className="flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-300 uppercase tracking-widest">
            02 • MIREYE SPATIAL INTELLIGENCE COPILOT
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>COPILOT ACTIVE</span>
        </span>
      </div>

      {/* Suggested Question Chips */}
      <div className="space-y-1.5 font-mono">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Suggested Spatial Questions
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuestion(sq);
                handleAsk(sq);
              }}
              className="text-xs font-mono py-1 px-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-amber-400/50 transition-all cursor-pointer text-left flex items-center gap-1.5"
            >
              <span>{sq}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Spatial Copilot Command Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center gap-2 bg-white/5 border border-white/15 focus-within:border-amber-400/80 rounded-xl p-1.5 transition-all font-mono"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a spatial question about this portfolio..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-3 py-1 font-mono"
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-sm"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Ask</span>
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="py-3 text-xs font-mono text-amber-300 flex items-center gap-2.5 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
          <span>Executing Spatial Intelligence reasoning trace across Mireye physical layers...</span>
        </div>
      )}

      {/* Answer Output Stream */}
      {answerData && !loading && (
        <div className="pt-2 border-t border-white/10 space-y-3 font-sans text-xs">
          
          {/* Active Question Title */}
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="font-bold">{activeQuestion}</span>
          </div>

          {/* Reasoning Trace Steps Visual Timeline */}
          {answerData.traceSteps && answerData.traceSteps.length > 0 && (
            <div className="space-y-1 font-mono text-[10.5px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Reasoning Trace Timeline
              </div>
              <div className="flex flex-wrap items-center gap-2 text-slate-300">
                {answerData.traceSteps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="flex items-center gap-1 text-slate-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{step}</span>
                    </span>
                    {idx < answerData.traceSteps!.length - 1 && (
                      <span className="text-slate-500 font-bold">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Executive Consultant Answer Narrative */}
          <div className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium pt-1">
            {answerData.answer}
          </div>

          {/* Evidence Citation Tags */}
          {answerData.citations && answerData.citations.length > 0 && (
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-3 font-mono text-[10.5px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Mireye Physical Signals:</span>
              {answerData.citations.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-amber-400 font-bold">{c.fieldName}:</span>
                  <span>{c.value}</span>
                  <span className="text-[9px] text-emerald-400">({c.source})</span>
                </span>
              ))}
            </div>
          )}

          {/* Provenance Source Tag — honest, never faked */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 font-mono text-[9.5px] text-slate-500">
            <span className="uppercase tracking-wider font-bold">Source:</span>
            {answerData.source === 'mireye_site_dossier' ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Mireye Site Dossier
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Stateless Mireye /v1/ask
              </span>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
