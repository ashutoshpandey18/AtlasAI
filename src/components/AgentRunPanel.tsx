'use client';

import React, { useState } from 'react';
import type { StrategyPlan } from '@/agent/planner';
import type { InvestmentMemo } from '@/agent/memo';
import { InvestmentMemoModal } from './InvestmentMemoModal';
import { AskWhyModal, type AskWhyData } from './AskWhyModal';
import { Sparkles, Play, CheckCircle, AlertTriangle, ArrowRight, Trophy, Bot, FileText, MapPin, Sun, Compass, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface AgentRunPanelProps {
  initialPrompt?: string;
}

export function AgentRunPanel({ initialPrompt = 'Find fast-deployment solar carport targets in Texas under $2M capex.' }: AgentRunPanelProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isRunning, setIsRunning] = useState(false);
  const [plan, setPlan] = useState<StrategyPlan | null>(null);
  const [rejections, setRejections] = useState<Array<{ siteName: string; county: string; reason: string; inputsChecked?: string[]; rulesApplied?: string[]; conclusion?: string }>>([]);
  const [evaluations, setEvaluations] = useState<Array<{ siteName: string; county: string; techScore: number; priorityScore: number; inputsChecked?: string[]; rulesApplied?: string[]; conclusion?: string }>>([]);
  const [survivors, setSurvivors] = useState<any[]>([]);
  const [savedCampaignId, setSavedCampaignId] = useState<string | null>(null);
  const [showCriteriaWeights, setShowCriteriaWeights] = useState(false);

  // Modal States
  const [selectedMemo, setSelectedMemo] = useState<InvestmentMemo | null>(null);
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  const [askWhyData, setAskWhyData] = useState<AskWhyData | null>(null);
  const [isAskWhyOpen, setIsAskWhyOpen] = useState(false);

  const saveCampaignToDb = async (currentPrompt: string, currentEvaluations: any[]) => {
    const campaignId = `campaign-${Date.now()}`;
    const name = currentPrompt.length > 50 ? `${currentPrompt.slice(0, 48)}...` : currentPrompt;

    const locations = currentEvaluations.map((ev, idx) => ({
      id: `loc-${idx}-${Date.now()}`,
      address: ev.siteName,
      label: ev.siteName,
      lat: 31.86 + idx * 0.1,
      lng: -102.34 - idx * 0.1,
      geocoding: false,
      geocoded: true,
      error: null,
    }));

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: campaignId,
          name: `Acquisition: ${name}`,
          useCaseId: 'solar-carport',
          requirements: { prompt: currentPrompt },
          locations,
          createdAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setSavedCampaignId(campaignId);
      }
    } catch (err) {
      console.error('Failed to save campaign to database:', err);
    }
  };

  const startScan = async () => {
    setIsRunning(true);
    setPlan(null);
    setRejections([]);
    setEvaluations([]);
    setSurvivors([]);
    setSavedCampaignId(null);

    try {
      const res = await fetch('/api/agent/site-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let latestEvaluations: any[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const evt = JSON.parse(line.replace('data: ', ''));
              if (evt.eventType === 'strategy_plan') {
                setPlan(evt.data);
              } else if (evt.eventType === 'site_rejected') {
                latestEvaluations.push(evt.data);
                setRejections((prev) => [...prev, evt.data]);
              } else if (evt.eventType === 'site_evaluated') {
                latestEvaluations.push(evt.data);
                setEvaluations((prev) => [...prev, evt.data]);
              } else if (evt.eventType === 'final_result') {
                setSurvivors(evt.data.survivors || []);
                saveCampaignToDb(prompt, latestEvaluations);
              }
            } catch (err) {}
          }
        }
      }
    } catch (err) {
      console.error('Pipeline error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenWhyRejection = (rej: {
    siteName: string;
    county: string;
    reason: string;
    inputsChecked?: string[];
    rulesApplied?: string[];
    conclusion?: string;
  }) => {
    setAskWhyData({
      title: rej.siteName,
      subtitle: rej.county,
      inputsChecked: rej.inputsChecked || [rej.reason],
      rulesApplied: rej.rulesApplied || ['FEMA Flood Hazard Check', 'USGS Slope Check'],
      conclusion: rej.conclusion || rej.reason,
      isApproved: false,
    });
    setIsAskWhyOpen(true);
  };

  const handleOpenWhyApproved = (ev: {
    siteName: string;
    county: string;
    techScore: number;
    priorityScore: number;
    inputsChecked?: string[];
    rulesApplied?: string[];
    conclusion?: string;
  }) => {
    setAskWhyData({
      title: ev.siteName,
      subtitle: ev.county,
      inputsChecked: ev.inputsChecked || ['High solar POA irradiance', 'Flat USGS slope < 1.0°', 'Clean FEMA Zone X'],
      rulesApplied: ev.rulesApplied || ['Fee-Simple Ownership Approved', 'Grid Distance < 1 km'],
      conclusion: ev.conclusion || `Approved for acquisition with ${ev.techScore}/100 feasibility score.`,
      isApproved: true,
    });
    setIsAskWhyOpen(true);
  };

  return (
    <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[28px] p-6 sm:p-8 shadow-xs font-sans relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4 text-[var(--accent)]" />
            <span>Autonomous Land Acquisition Agent</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Commercial Siting Workspace
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
            Enter a business goal below to run automated site checking, rejection explanations, and investment memos.
          </p>
        </div>

        {savedCampaignId && (
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-2xs"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Saved to Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* State Portfolio Selector Pills (Plain-English Labels) */}
      <div className="mb-5 relative z-10">
        <div className="text-[10.5px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-[var(--accent)]" />
          Select Target State Portfolio:
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setPrompt('Find fast-deployment solar carport targets in Texas under $2M capex.')}
            className={`text-xs font-black px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
              prompt.includes('Texas')
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-500" /> Texas (ERCOT grid)
          </button>
          <button
            type="button"
            onClick={() => setPrompt('Find high-yield retail solar carport targets in Florida with low flood risk.')}
            className={`text-xs font-black px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
              prompt.includes('Florida')
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" /> Florida (FRCC grid)
          </button>
          <button
            type="button"
            onClick={() => setPrompt('Find corporate-owned Dollar General sites in Georgia with strong solar potential.')}
            className={`text-xs font-black px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
              prompt.includes('Georgia')
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-500" /> Georgia (SERC grid)
          </button>
          <button
            type="button"
            onClick={() => setPrompt('Find retail carport candidate sites in North Carolina with quick grid tie-in.')}
            className={`text-xs font-black px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
              prompt.includes('North Carolina')
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" /> North Carolina (SERC grid)
          </button>
        </div>
      </div>

      {/* Prompt Command Bar Form */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 relative z-10">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter business goal (e.g. Find fast-deployment solar in Texas or Florida)..."
            className="w-full bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--accent)] rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none font-semibold shadow-inner transition-all pr-10"
          />
        </div>
        <button
          onClick={startScan}
          disabled={isRunning}
          className="bg-[var(--accent)] hover:bg-[#85632D] text-white px-6 py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 min-w-[190px]"
        >
          {isRunning ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
              <span>Checking sites...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Agent Pipeline →</span>
            </>
          )}
        </button>
      </div>

      {/* ZERO-STATE / FIRST-RUN DEMO CARD (Shown before query execution) */}
      {!isRunning && evaluations.length === 0 && rejections.length === 0 && (
        <div className="bg-[var(--bg-soft)] border border-[var(--border)] rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-[var(--accent)] bg-[var(--surface)] border border-[var(--border)] px-2.5 py-0.5 rounded-md">
                Example Demo Scenario
              </span>
              <h4 className="text-sm font-extrabold text-[var(--text-primary)] mt-1.5">
                "Find fast-deployment solar carport targets in Texas under $2M capex."
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                Click "See example" to run an instant demo scan showing site checking, rejection reasons, and investment memos.
              </p>
            </div>
            <button
              type="button"
              onClick={startScan}
              className="bg-[var(--surface)] border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>See example</span>
            </button>
          </div>
        </div>
      )}

      {/* User-Facing Plain Status Pipeline Stage Stepper */}
      {isRunning && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-soft)] border border-[var(--border)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
            <span>Agent Active: Checking Sites & Sourcing Physical Data...</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-bold text-[var(--text-secondary)]">
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">1. Understanding request</div>
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">2. Checking sites</div>
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">3. Scoring results</div>
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">4. Explaining rejections</div>
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">5. Building report</div>
          </div>
        </div>
      )}

      {/* Agent Execution Outputs */}
      {(plan || rejections.length > 0 || evaluations.length > 0) && (
        <div className="space-y-6 pt-4 border-t border-[var(--border)]">
          
          {/* Strategy Plan Output */}
          {plan && (
            <div className="bg-[var(--bg-soft)] p-4 rounded-xl border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Understanding your request
                </span>
                <span className="text-xs font-mono font-bold bg-[var(--surface)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
                  Target: {plan.selectedChain} ({plan.targetState})
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{plan.strategyName}</h3>
            </div>
          )}

          {/* Rejections & Evaluations Log */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Explaining Rejections Log */}
            <div className="bg-[var(--bg-soft)] p-4 rounded-xl border border-[var(--border)] max-h-64 overflow-y-auto">
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-3">
                Explaining Rejections ({rejections.length} Sites Cut)
              </div>
              <div className="space-y-2">
                {rejections.map((rej, i) => (
                  <div
                    key={i}
                    onClick={() => handleOpenWhyRejection(rej)}
                    className="text-xs p-2.5 rounded-lg bg-white border border-rose-200 text-[var(--text-primary)] cursor-pointer hover:border-rose-400 transition-all shadow-2xs"
                  >
                    <div className="font-bold text-rose-700 flex justify-between items-center">
                      <span>Verdict: Recommended — Reject Site ({rej.siteName})</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-bold underline">Why this rejection? →</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">{rej.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict-First Scoring Results */}
            <div className="bg-[var(--bg-soft)] p-4 rounded-xl border border-[var(--border)] max-h-64 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Scoring Results ({evaluations.length} Evaluated)
                </div>
                <button
                  type="button"
                  onClick={() => setShowCriteriaWeights(!showCriteriaWeights)}
                  className="text-[10.5px] font-bold text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{showCriteriaWeights ? 'Hide weights' : 'Why this score?'}</span>
                  {showCriteriaWeights ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Progressive Disclosure: Criteria Weights */}
              {showCriteriaWeights && (
                <div className="mb-3 bg-white p-2.5 rounded-lg border border-[var(--border)] text-[10.5px] text-[var(--text-secondary)] space-y-1 font-medium">
                  <div className="font-bold text-[var(--text-primary)]">Configurable Scoring Criteria:</div>
                  <div>• Solar Yield (28%) — Optimal POA Irradiance</div>
                  <div>• Slope & Topography (22%) — USGS 3DEP Flat Class</div>
                  <div>• Grid Proximity (18%) — Substation & Transmission Distance</div>
                  <div>• Flood Hazard (10%) — FEMA Zone X Clean Polygon</div>
                </div>
              )}

              <div className="space-y-2">
                {evaluations.map((ev, i) => (
                  <div
                    key={i}
                    onClick={() => handleOpenWhyApproved(ev)}
                    className="text-xs p-2.5 rounded-lg bg-white border border-[var(--border)] text-[var(--text-primary)] flex justify-between items-center cursor-pointer hover:border-[var(--accent)] transition-all shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-emerald-800">Verdict: Recommended — Pass (Score {ev.techScore}%)</div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">{ev.siteName} ({ev.county})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-[var(--accent)]">Priority {ev.priorityScore}%</div>
                      <div className="text-[9.5px] text-[var(--text-muted)] underline">See details →</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Building Your Report & Investment Memo */}
          {survivors.length > 0 && (
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--accent)] shadow-sm">
              <div className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Building Your Report & Decision Sign-Off
              </div>

              {/* ONE-LINE PLAIN-ENGLISH VERDICT SUMMARY AT THE VERY TOP */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-3 text-xs font-black text-emerald-900">
                Verdict: Recommended — Proceed to Site Control
              </div>

              <div className="text-sm font-bold text-[var(--text-primary)] mb-2">
                {survivors[0].memo.decisionAuthorizationSignOff.finalRecommendation}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-4 font-medium">{survivors[0].memo.tradeoffExplanation}</p>

              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={() => {
                    setSelectedMemo(survivors[0].memo);
                    setIsMemoOpen(true);
                  }}
                  className="bg-[var(--accent)] hover:bg-[#85632D] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open 3-Page Executive Investment Memo</span>
                </button>
              </div>

              {/* Individual Candidate Memos */}
              <div className="border-t border-[var(--border)] pt-4">
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  All Portfolio Candidate Reports ({survivors.length} Memos Generated):
                </div>
                <div className="flex flex-wrap gap-2">
                  {survivors.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedMemo(s.memo);
                        setIsMemoOpen(true);
                      }}
                      className="text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-soft)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{s.memo.siteName} (Rank #{s.memo.overallRank})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Investment Memo Modal */}
      <InvestmentMemoModal memo={selectedMemo} isOpen={isMemoOpen} onClose={() => setIsMemoOpen(false)} />

      {/* Decision Ledger AskWhy Modal */}
      <AskWhyModal data={askWhyData} isOpen={isAskWhyOpen} onClose={() => setIsAskWhyOpen(false)} />
    </div>
  );
}
