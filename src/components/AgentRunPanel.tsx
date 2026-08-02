'use client';

import React, { useState } from 'react';
import { Play, FileText, CheckCircle2, Upload, Zap } from 'lucide-react';
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
  autoRunInstantDemo?: boolean;
  autoRunScan?: boolean;
}

export function AgentRunPanel({ initialPrompt, autoRunInstantDemo, autoRunScan }: AgentRunPanelProps) {
  const [prompt, setPrompt] = useState(
    initialPrompt || 'Find fast-deployment solar carport targets in Texas under $2M capex.'
  );
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    if (autoRunInstantDemo) {
      runInstantDemo();
    } else if (autoRunScan) {
      startScan(initialPrompt);
    }
  }, [autoRunInstantDemo, autoRunScan]);
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

  const [scanStep, setScanStep] = useState<string>('');

  const runInstantDemo = async () => {
    setIsRunning(true);
    setPlan(null);
    setRejections([]);
    setEvaluations([]);
    setSurvivors([]);
    setScanStep('Loading Precomputed Campaign...');

    try {
      const res = await fetch('/api/memo/0');
      if (res.ok) {
        const demoMemo = await res.json();
        
        const demoPlan: StrategyPlan = {
          businessGoal: 'Find fast-deployment solar carport targets in Texas under $2M capex.',
          targetState: 'TX',
          selectedChain: 'Dollar General Texas Portfolio',
          strategyName: 'ERCOT Commercial Retail Solar Canopy Strategy',
          reasoning: [
            'Formulated targeted acquisition strategy for fast-deployment solar carports in Texas.',
            'Evaluated candidate deployment strategies across ERCOT grid distribution territory.',
            'Selected Dollar General fee-simple retail portfolio to maximize site control velocity.',
            'Optimized for sub-market option lease negotiation and Section 48 IRA tax equity monetization.',
          ],
          rulesApplied: [
            'Fee-Simple Ownership: Corporate fee-simple title verified (zero landlord ground lease risk)',
            'Parking Footprint: Parking ratio >= 2.5× building footprint (~250kW canopy capacity)',
            'Environmental Safety: Unencumbered FEMA Zone X clearance (zero 100-year flood risk)',
          ],
          consideredAlternatives: [
            {
              strategyName: 'Walmart Big-Box Solar',
              targetChain: 'Walmart',
              status: 'REJECTED',
              rejectionReason: 'Lower fee-simple ownership rate (~52% ground lease); high urban ERCOT queue saturation.',
              ownershipRatePct: 52,
              lotCoverageRatio: 2.1,
            },
            {
              strategyName: 'Dollar General Retail Carport',
              targetChain: 'Dollar General',
              status: 'SELECTED',
              selectionReason: '74% fee-simple corporate ownership, 4.3× parking ratio, and minimal grid queue congestion.',
              ownershipRatePct: 74,
              lotCoverageRatio: 4.3,
            },
          ],
        };

        const demoRejections: RejectionItem[] = [
          {
            siteName: 'Dollar General Harris County #1042',
            reason: 'Disqualified via FEMA NFHL: Parcel falls within 100-year Special Flood Hazard Area (Zone AE), incurring structural elevation mandates (+18% CapEx).',
            inputsChecked: ['FEMA Flood Risk: Zone AE (Special Flood Hazard Area)', 'USGS Slope: 1.8° (Flat)', 'POA Irradiance: 1,980 kWh/m²/yr'],
            rulesApplied: ['Constraint: Siting within FEMA 100-Year Special Flood Hazard Area triggers mandatory base flood elevation mandates'],
          },
          {
            siteName: 'Dollar General Travis County #0819',
            reason: 'Disqualified via USGS 3DEP 1m LiDAR: Ground slope of 7.4° exceeds single-axis tracker racking tolerances (+$145k/acre earthwork overrun).',
            inputsChecked: ['FEMA Flood Risk: Zone X (Clear)', 'USGS Slope: 7.4° (Severe Slope)', 'POA Irradiance: 2,050 kWh/m²/yr'],
            rulesApplied: ['Constraint: Topographical terrain slope > 4.0° exceeds standard tracker racking tolerance'],
          },
        ];

        const demoEvaluations: EvaluationItem[] = [
          {
            siteName: 'Dollar General Austin County #03595',
            county: 'Austin County',
            techScore: 94,
            priorityScore: 92,
            inputsChecked: ['FEMA Flood Risk: Zone X (Clear)', 'USGS Slope: 1.1° (Flat)', 'POA Irradiance: 2,131 kWh/m²/yr', '138kV Transmission: < 480m'],
            rulesApplied: ['Approved: Flat terrain, zero flood hazard, prime solar irradiance yield'],
            conclusion: 'APPROVED: Technical Feasibility Score 94/100 with unencumbered Zone X flood clearance and flat 1.1° civil terrain.',
          },
          {
            siteName: 'Dollar General Ector County #45835',
            county: 'Ector County',
            techScore: 88,
            priorityScore: 88,
            inputsChecked: ['FEMA Flood Risk: Zone X (Clear)', 'USGS Slope: 1.4° (Flat)', 'POA Irradiance: 2,090 kWh/m²/yr'],
            rulesApplied: ['Approved: Low queue congestion territory, clear fee-simple title'],
            conclusion: 'APPROVED: Technical Feasibility Score 88/100 with clear civil and floodplain status.',
          },
        ];

        setPlan(demoPlan);
        setRejections(demoRejections);
        setEvaluations(demoEvaluations);
        setSurvivors([
          {
            siteName: demoMemo.siteName || 'Dollar General Austin County #03595',
            county: demoMemo.county || 'Austin County',
            geoId: demoMemo.siteId || '03595',
            memo: demoMemo,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to run instant demo:', err);
    } finally {
      setIsRunning(false);
      setScanStep('');
    }
  };

  const startScan = async (targetPrompt?: string) => {
    const promptToUse = targetPrompt || prompt;
    setIsRunning(true);
    setScanStep('Step 1 of 4: Formulating Strategy Plan...');
    setPlan(null);
    setRejections([]);
    setEvaluations([]);
    setSurvivors([]);

    try {
      const response = await fetch('/api/agent/site-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
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
                setScanStep('Step 2 of 4: Querying Mireye GIS Endpoints...');
              } else if (eType === 'site_rejected') {
                setRejections((prev) => [...prev, eData]);
                setScanStep('Step 3 of 4: Screening Rejection Flaws...');
              } else if (eType === 'site_evaluated') {
                setEvaluations((prev) => [...prev, eData]);
              } else if (eType === 'final_result') {
                setSurvivors(eData.survivors || []);
                setScanStep('Step 4 of 4: Generating Investment Memo...');
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
      setScanStep('');
    }
  };

  const handlePillClick = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    startScan(selectedPrompt);
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

        {/* Custom Upload Active Badge Callout (Borderless Spatial Line) */}
        {customUploadedSites.length > 0 && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
            <span>Using Custom Ingested Portfolio: <strong className="text-white">{customUploadedFilename}</strong> ({customUploadedSites.length} Candidate Sites)</span>
            <button
              type="button"
              onClick={() => {
                setCustomUploadedSites([]);
                setCustomUploadedFilename(null);
              }}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Reset to Standard Portfolio
            </button>
          </div>
        )}

        {/* State Portfolio Selection Pills */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-mono pt-1">
          <button
            type="button"
            onClick={() => handlePillClick('Find fast-deployment solar carport targets in Texas under $2M capex.')}
            className={`cursor-pointer transition-all ${
              prompt.includes('Texas')
                ? 'text-slate-100 font-bold border-b border-white/80 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Texas (ERCOT grid)
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={() => handlePillClick('Find high-yield retail solar carport targets in Florida with low flood risk.')}
            className={`cursor-pointer transition-all ${
              prompt.includes('Florida')
                ? 'text-slate-100 font-bold border-b border-white/80 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Florida (FRCC grid)
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={() => handlePillClick('Find corporate-owned Dollar General sites in Georgia with strong solar potential.')}
            className={`cursor-pointer transition-all ${
              prompt.includes('Georgia')
                ? 'text-slate-100 font-bold border-b border-white/80 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Georgia (SERC grid)
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={() => handlePillClick('Find retail carport candidate sites in North Carolina with quick grid tie-in.')}
            className={`cursor-pointer transition-all ${
              prompt.includes('North Carolina')
                ? 'text-slate-100 font-bold border-b border-white/80 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            North Carolina (SERC grid)
          </button>
        </div>
      </div>

      {/* Borderless Prompt Input & Run Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter business goal (e.g. Find fast-deployment solar in Texas or Florida)..."
            className="w-full bg-[#0a0a14] border-b-2 border-white/20 focus:border-white/80 px-4 py-3.5 text-xs sm:text-sm text-white focus:outline-none font-semibold transition-all"
          />
        </div>
        
        {/* Instant Demo Fast Button */}
        <button
          type="button"
          onClick={runInstantDemo}
          disabled={isRunning}
          className="bg-slate-100 hover:bg-white text-slate-950 border border-white/40 px-5 py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.12)] shrink-0"
        >
          <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>Run Instant Demo</span>
        </button>

        {/* Live SSE Pipeline Launch Button */}
        <button
          onClick={() => startScan()}
          disabled={isRunning}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isRunning ? (
            <span>Processing...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Live Agent Scan →</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar Loader During Active Scans */}
      {isRunning && (
        <div className="bg-[#0c0c16] border border-amber-500/30 p-3.5 rounded-2xl space-y-2 animate-pulse font-mono text-xs">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{scanStep || 'Executing Mireye Site Control Agent Pipeline...'}</span>
            </div>
            <span className="text-[10px] text-slate-400">Sub-second Latency</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-400 h-full w-3/4 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Streamed Execution Outputs (Pure Typography Streams) */}
      {(plan || rejections.length > 0 || evaluations.length > 0) && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          
          {/* Strategy Plan Stream */}
          {plan && (
            <div className="space-y-1 font-mono text-xs border-b border-white/10 pb-3">
              <div className="text-slate-300 font-bold uppercase tracking-widest text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
                <span>UNDERSTANDING YOUR REQUEST • TARGET: {plan.selectedChain} ({plan.targetState})</span>
              </div>
              <div className="text-sm font-bold text-white tracking-tight mt-0.5">{plan.strategyName}</div>
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
                      <div className="text-xs font-bold text-slate-200">Priority {ev.priorityScore}%</div>
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
                <span className="font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-200 shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse" />
                  <span>01 • RANK #1 CANDIDATE TARGET</span>
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
                  LOCATION: <span className="text-slate-200 font-bold">{survivors[0].county || survivors[0].memo?.county || 'Austin County'}, {survivors[0].memo?.state || plan?.targetState || 'TX'}</span>
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
                  className="bg-slate-100 hover:bg-white text-slate-950 border border-white/40 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
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
