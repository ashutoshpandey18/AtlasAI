'use client';

import React, { useState } from 'react';
import { Play, FileText, CheckCircle2, Upload } from 'lucide-react';
import { InvestmentMemoModal } from './InvestmentMemoModal';
import { AskWhyModal, AskWhyData } from './AskWhyModal';
import { ParcelUploadModal, CustomSiteParcel } from './ParcelUploadModal';
import type { StrategyPlan } from '@/agent/planner';

interface RejectionItem {
  siteName: string;
  reason: string;
  inputsChecked: string[];
  rulesApplied: string[];
}

interface EvaluationItem {
  siteName: string;
  county: string;
  techScore: number;
  priorityScore: number;
  inputsChecked: string[];
  rulesApplied: string[];
  conclusion: string;
}

interface SurvivorItem {
  siteName: string;
  county: string;
  geoId?: string;
  memo: any;
}

interface AgentRunPanelProps {
  initialPrompt?: string;
}

export function AgentRunPanel({ initialPrompt }: AgentRunPanelProps) {
  const [prompt, setPrompt] = useState(
    initialPrompt || 'Find fast-deployment solar carport targets in Texas under $2M capex.'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [plan, setPlan] = useState<StrategyPlan | null>(null);
  const [rejections, setRejections] = useState<RejectionItem[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [survivors, setSurvivors] = useState<SurvivorItem[]>([]);
  
  const [selectedMemo, setSelectedMemo] = useState<any>(null);
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  const [askWhyData, setAskWhyData] = useState<AskWhyData | null>(null);
  const [isAskWhyOpen, setIsAskWhyOpen] = useState(false);

  const [showCriteriaWeights, setShowCriteriaWeights] = useState(false);

  // Custom Uploaded Parcel State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [customUploadedSites, setCustomUploadedSites] = useState<CustomSiteParcel[]>([]);
  const [customUploadedFilename, setCustomUploadedFilename] = useState<string | null>(null);

  const startScan = async () => {
    setIsRunning(true);
    setPlan(null);
    setRejections([]);
    setEvaluations([]);
    setSurvivors([]);

    try {
      const response = await fetch('/api/agent/site-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          customSites: customUploadedSites.length > 0 ? customUploadedSites : undefined,
        }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const event = JSON.parse(trimmed.slice(6));
              const eType = event.eventType || event.type;
              const eData = event.data;

              if (eType === 'strategy_plan') {
                setPlan(eData);
              } else if (eType === 'site_rejected') {
                setRejections((prev) => [...prev, eData]);
              } else if (eType === 'site_evaluated') {
                setEvaluations((prev) => [...prev, eData]);
              } else if (eType === 'final_result') {
                setSurvivors(eData.survivors || []);
              }
            } catch (err) {
              console.error('Failed to parse SSE event:', err);
            }
          }
        }
      }
    } catch (err) {
      console.error('Agent execution failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenWhyRejection = (rej: RejectionItem) => {
    setAskWhyData({
      title: `Rejection Audit — ${rej.siteName}`,
      subtitle: 'Written Rejection Proof & Flaw Screening Ledger',
      inputsChecked: rej.inputsChecked || [],
      rulesApplied: rej.rulesApplied || [],
      conclusion: rej.reason || 'Site rejected due to critical physical risk.',
      isApproved: false,
    });
    setIsAskWhyOpen(true);
  };

  const handleOpenWhyApproved = (ev: EvaluationItem) => {
    setAskWhyData({
      title: `Approved Audit — ${ev.siteName} (${ev.county})`,
      subtitle: `Feasibility Score: ${ev.techScore}/100 | Priority ${ev.priorityScore}%`,
      inputsChecked: ev.inputsChecked || [],
      rulesApplied: ev.rulesApplied || [],
      conclusion: ev.conclusion || `Feasibility score ${ev.techScore}/100 with clear civil status.`,
      isApproved: true,
    });
    setIsAskWhyOpen(true);
  };

  return (
    <div className="w-full bg-transparent text-white space-y-6 font-sans text-left relative z-10">
      
      {/* Target State Selector Pills & Custom CSV/GeoJSON Upload Button */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono font-bold">
          <span className="text-slate-400 uppercase tracking-wider">TARGET STATE PORTFOLIO:</span>
          
          {/* Custom Upload Trigger Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{customUploadedSites.length > 0 ? `Uploaded: ${customUploadedFilename} (${customUploadedSites.length} Sites)` : 'Upload Custom CSV / GeoJSON Portfolio'}</span>
          </button>
        </div>

        {/* Custom Upload Active Badge Callout */}
        {customUploadedSites.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono text-amber-400">
            <span>Using Custom Ingested Portfolio: <strong>{customUploadedFilename}</strong> ({customUploadedSites.length} Candidate Sites)</span>
            <button
              type="button"
              onClick={() => {
                setCustomUploadedSites([]);
                setCustomUploadedFilename(null);
              }}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              Reset to Standard Portfolio
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap text-xs font-bold font-mono">
          <button
            type="button"
            onClick={() => setPrompt('Find fast-deployment solar carport targets in Texas under $2M capex.')}
            className={`cursor-pointer transition-all ${
              prompt.includes('Texas')
                ? 'text-amber-400 underline font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Texas (ERCOT grid)
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={() => setPrompt('Find high-yield retail solar carport targets in Florida with low flood risk.')}
            className={`cursor-pointer transition-all ${
              prompt.includes('Florida')
                ? 'text-amber-400 underline font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Florida (FRCC grid)
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={() => setPrompt('Find corporate-owned Dollar General sites in Georgia with strong solar potential.')}
            className={`cursor-pointer transition-all ${
              prompt.includes('Georgia')
                ? 'text-amber-400 underline font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Georgia (SERC grid)
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={() => setPrompt('Find retail carport candidate sites in North Carolina with quick grid tie-in.')}
            className={`cursor-pointer transition-all ${
              prompt.includes('North Carolina')
                ? 'text-amber-400 underline font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            North Carolina (SERC grid)
          </button>
        </div>
      </div>

      {/* Borderless Prompt Input & Run Button Line */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter business goal (e.g. Find fast-deployment solar in Texas or Florida)..."
            className="w-full bg-[#0a0a14] border-b-2 border-white/20 focus:border-amber-400 px-4 py-3.5 text-xs sm:text-sm text-white focus:outline-none font-semibold transition-all"
          />
        </div>
        <button
          onClick={startScan}
          disabled={isRunning}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-md"
        >
          {isRunning ? (
            <span>Checking sites...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Run Agent Pipeline →</span>
            </>
          )}
        </button>
      </div>

      {/* Streamed Execution Outputs (Pure Typography Streams) */}
      {(plan || rejections.length > 0 || evaluations.length > 0) && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          
          {/* Strategy Plan Stream */}
          {plan && (
            <div className="space-y-1 font-mono text-xs">
              <div className="text-amber-400 font-bold uppercase tracking-wider">
                UNDERSTANDING YOUR REQUEST // TARGET: {plan.selectedChain} ({plan.targetState})
              </div>
              <div className="text-sm font-bold text-white">{plan.strategyName}</div>
            </div>
          )}

          {/* Rejections & Evaluations Streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Rejection Ledger Stream */}
            <div className="space-y-3 font-sans">
              <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                Explaining Rejections ({rejections.length} Sites Cut)
              </div>
              <div className="space-y-2">
                {rejections.map((rej, i) => (
                  <div
                    key={i}
                    onClick={() => handleOpenWhyRejection(rej)}
                    className="text-xs py-2 border-b border-white/10 cursor-pointer hover:border-rose-400 transition-colors"
                  >
                    <div className="font-bold text-rose-400 flex justify-between items-center">
                      <span>Rejected — {rej.siteName}</span>
                      <span className="text-[10px] text-slate-400 font-mono underline">Why? →</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 font-medium">{rej.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved Evaluations Stream */}
            <div className="space-y-3 font-sans">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex justify-between items-center">
                <span>Scoring Results ({evaluations.length} Evaluated)</span>
                <button
                  type="button"
                  onClick={() => setShowCriteriaWeights(!showCriteriaWeights)}
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  {showCriteriaWeights ? 'Hide weights' : 'Why this score?'}
                </button>
              </div>

              {showCriteriaWeights && (
                <div className="text-[11px] font-mono text-slate-400 space-y-1 py-1">
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
                    className="text-xs py-2 border-b border-white/10 cursor-pointer hover:border-emerald-400 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-emerald-400">Approved — {ev.siteName} ({ev.county})</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">Feasibility Score: {ev.techScore}/100</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-amber-400">Priority {ev.priorityScore}%</div>
                      <div className="text-[10px] text-slate-400 underline">See details →</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* MINIMALIST & PROFESSIONAL RANK #1 CANDIDATE UNDERWRITING STREAM (Card-Free, Div-Free) */}
          {survivors.length > 0 && (
            <div className="pt-6 border-t border-white/10 space-y-3 text-left font-sans">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>01 // RANK #1 CANDIDATE TARGET</span>
                </span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VERDICT: RECOMMENDED FOR SITE CONTROL</span>
                </span>
              </div>

              {/* Minimalist Professional Title & Location */}
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {survivors[0].siteName}
                </h3>
                <div className="text-xs font-mono text-slate-400">
                  LOCATION: <span className="text-slate-200 font-bold">{survivors[0].county}, TX</span>
                </div>
              </div>

              {/* Rationale Sentence */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium pt-1">
                "{survivors[0].memo?.tradeoffExplanation || 'Top ranked site meets all physical GIS thresholds and IRA ITC tax credit requirements.'}"
              </p>

              {/* Memo Action Trigger */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMemo(survivors[0].memo);
                    setIsMemoOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open 3-Page Executive Investment Memo →</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Investment Memo Modal */}
      <InvestmentMemoModal memo={selectedMemo} isOpen={isMemoOpen} onClose={() => setIsMemoOpen(false)} />

      {/* Decision Ledger AskWhy Modal */}
      <AskWhyModal data={askWhyData} isOpen={isAskWhyOpen} onClose={() => setIsAskWhyOpen(false)} />

      {/* Custom Parcel CSV/GeoJSON Upload Modal */}
      <ParcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(sites, filename) => {
          setCustomUploadedSites(sites);
          setCustomUploadedFilename(filename);
          setPrompt(`Analyze custom uploaded parcel portfolio (${filename}) with ${sites.length} target sites.`);
        }}
      />
    </div>
  );
}
