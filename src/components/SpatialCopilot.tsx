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

const SITE_DOSSIER_QUESTIONS = [
  'Why is this site physically attractive?',
  'What physical risks affect this parcel?',
  'What infrastructure & grid lines are nearby?',
  'What residual risks remain unverified?',
];

const PORTFOLIO_DECISION_QUESTIONS = [
  'Why did Atlas select this site as Rank #1?',
  'Why were cut sites rejected?',
  'Compare the top 3 candidates.',
  "Explain the investment memo like I'm a CFO.",
];

export function SpatialCopilot({ userPrompt, winnerSite, evaluations = [], rejections = [], mireyeSiteId }: SpatialCopilotProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [answerData, setAnswerData] = useState<{
    answer: string;
    traceSteps?: string[];
    citations?: { fieldName: string; source: string; value: string }[];
    source?: 'mireye_site_dossier' | 'mireye_ask' | 'atlas_portfolio_comparison';
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
      const isComparisonQuery = /\b(compare|top\s*3|portfolio|candidates|versus|vs)\b/i.test(q);

      // CASE B — Mireye /v1/ask-site is grounded strictly to a SINGLE site_id dossier.
      // For multi-site portfolio comparison queries, route to /api/mireye/ask (which consumes the full candidate evaluation state).
      if (mireyeSiteId && !isComparisonQuery) {
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

      // Portfolio comparison or /v1/ask query: Grounded strictly in evaluated candidate portfolio state
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
        setAnswerData({
          ...data,
          source: isComparisonQuery ? 'atlas_portfolio_comparison' : (data.source || 'mireye_ask'),
        });
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

      {/* Grounded Mireye Site Dossier Status Indicator */}
      <div className="flex items-center justify-between text-[10.5px] font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300">
        <span>Grounded Intelligence: <strong className="text-white">{mireyeSiteId ? `Registered Mireye Site Dossier (${mireyeSiteId})` : 'Mireye Physical API Endpoints'}</strong></span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{mireyeSiteId ? 'POST /v1/ask-site' : 'POST /v1/ask'}</span>
        </span>
      </div>

      {/* Categorized Suggested Question Chips */}
      <div className="space-y-3 font-mono">
        {/* Group 1: Mireye Site Dossier Q&A */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Mireye Site Dossier Q&A (POST /v1/ask-site)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SITE_DOSSIER_QUESTIONS.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuestion(sq);
                  handleAsk(sq);
                }}
                className="text-xs font-mono py-1 px-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-slate-200 hover:text-white hover:border-emerald-400 transition-all cursor-pointer text-left flex items-center gap-1.5"
              >
                <span>{sq}</span>
                <ArrowRight className="w-3 h-3 text-emerald-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Group 2: Atlas Portfolio Decision Assistant */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Atlas Portfolio Decision Assistant</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_DECISION_QUESTIONS.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuestion(sq);
                  handleAsk(sq);
                }}
                className="text-xs font-mono py-1 px-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-slate-200 hover:text-white hover:border-cyan-400 transition-all cursor-pointer text-left flex items-center gap-1.5"
              >
                <span>{sq}</span>
                <ArrowRight className="w-3 h-3 text-cyan-500" />
              </button>
            ))}
          </div>
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

          {/* Structured Canonical Candidate Comparison Table (guarantees 100% data consistency with Decision Ledger) */}
          {answerData.source === 'atlas_portfolio_comparison' && evaluations.length > 0 && (
            <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2 font-mono text-xs my-2">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>VERIFIED ATLAS CANDIDATE COMPARISON MATRIX</span>
                <span className="text-slate-400 font-mono text-[9px]">{evaluations.length} SURVIVORS</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] text-slate-400 border-b border-white/10 uppercase">
                    <tr>
                      <th className="py-1">Rank</th>
                      <th className="py-1">Candidate Site</th>
                      <th className="py-1">Technical Score</th>
                      <th className="py-1">Priority Score</th>
                      <th className="py-1">Decision Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {evaluations.slice(0, 3).map((cand: any, idx: number) => {
                      const tScore = cand.techScore ?? cand.techEval?.technicalFeasibilityScore;
                      const tScoreDisplay = tScore != null ? `${tScore} / 100` : '— / 100';
                      const pScore = cand.priorityScore ?? cand.intelEval?.acquisitionPriorityScore;
                      const pScoreDisplay = pScore != null ? `${pScore}%` : '—';
                      const siteName = cand.siteName || cand.techEval?.siteName || `Site #${idx + 1}`;
                      const county = cand.county || cand.techEval?.county || 'TX';

                      return (
                        <tr key={idx} className={idx === 0 ? 'text-white font-bold bg-emerald-950/20' : ''}>
                          <td className="py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${idx === 0 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}>
                              #{idx + 1}
                            </span>
                          </td>
                          <td className="py-1.5 font-sans font-semibold">{siteName} ({county})</td>
                          <td className="py-1.5 text-emerald-400">{tScoreDisplay}</td>
                          <td className="py-1.5 text-slate-200">{pScoreDisplay}</td>
                          <td className="py-1.5">
                            <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${idx === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                              {idx === 0 ? '✓ SELECTED PRIORITY' : 'PASSED SCREENING'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                Registered Mireye Site Dossier ({mireyeSiteId})
              </span>
            ) : answerData.source === 'atlas_portfolio_comparison' ? (
              <span className="inline-flex items-center gap-1 text-cyan-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Atlas Portfolio Comparison (Grounded in Verified Evaluation Results)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Mireye Physical API Intelligence
              </span>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
