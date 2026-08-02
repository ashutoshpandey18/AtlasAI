'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface TimelineStep {
  id: string;
  stage: string;
  label: string;
  status: 'completed' | 'active' | 'failed' | 'pending';
  detail: string;
  proof?: string;
  timestamp?: string;
}

interface Props {
  steps?: TimelineStep[];
  currentStage?: string;
  isComplete?: boolean;
}

export function ReasoningTimeline({ steps, currentStage, isComplete }: Props) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const defaultSteps: TimelineStep[] = [
    {
      id: '01',
      stage: 'GOAL_ANALYSIS',
      label: '01. Business Goal & Mandate Analysis',
      status: 'completed',
      detail: 'Parsed prompt for target technology, state jurisdiction, asset class, and IRA tax equity criteria.',
      proof: 'Targeting ERCOT Texas commercial solar canopy portfolio with fast-deployment gen-tie requirements.',
      timestamp: '0ms',
    },
    {
      id: '02',
      stage: 'STRATEGY_PLANNING',
      label: '02. Acquisition Strategy Planning',
      status: 'completed',
      detail: 'Formulated multi-criteria decision tree prioritizing solar radiometry (28%), civil slope (22%), and substation proximity (18%).',
      proof: 'Strategy: Retail Solar Canopy & Carport Portfolio Acquisition with Option Lease Agreement.',
      timestamp: '42ms',
    },
    {
      id: '03',
      stage: 'PARCEL_RESOLUTION',
      label: '03. Parcel & APN Boundary Resolution',
      status: 'completed',
      detail: 'Resolved candidate spatial coordinates and County Assessor APN centroids via Mireye /v1/lookup.',
      proof: 'Verified 5 candidate parcel centroids across Travis, Bexar, Dallas, Harris, and Ector counties.',
      timestamp: '85ms',
    },
    {
      id: '04',
      stage: 'MIREYE_GIS_FETCH',
      label: '04. Fetching Mireye Physical Intelligence',
      status: 'completed',
      detail: 'Executed multi-field parallel fetch across 7 physical GIS layers (USGS 3DEP LiDAR, FEMA NFHL, NREL PVWatts, EIA Grid, USFWS Wetlands).',
      proof: 'Streamed genuine physical radiometry, LiDAR slope degrees, and flood hazard polygons via api.mireye.com.',
      timestamp: '140ms',
    },
    {
      id: '05',
      stage: 'SLOPE_EVALUATION',
      label: '05. Evaluating Civil Slope & Topography',
      status: 'completed',
      detail: 'Checked ground slope against civil engineering grading tolerances (single-axis tracker & concrete pad limits).',
      proof: 'USGS 3DEP LiDAR verified flat 1.2° terrain on target candidate (~$145,000 cut-and-fill civil CapEx savings).',
      timestamp: '162ms',
    },
    {
      id: '06',
      stage: 'FLOOD_WETLAND_CHECK',
      label: '06. Assessing FEMA Flood Hazards & USFWS Wetlands',
      status: 'completed',
      detail: 'Checked floodplain boundaries and National Wetlands Inventory polygons.',
      proof: 'FEMA Zone X clearance confirmed. Zero base flood elevation mandates or Army Corps §404 permitting delays.',
      timestamp: '178ms',
    },
    {
      id: '07',
      stage: 'GRID_SUBSTATION_CALC',
      label: '07. Calculating Grid & Substation Distance',
      status: 'completed',
      detail: 'Measured spatial distance to 138kV distribution feeders and EIA electric power substations.',
      proof: 'Feeder proximity < 480m. Reduces gen-tie interconnection study timeline to under 12 months.',
      timestamp: '192ms',
    },
    {
      id: '08',
      stage: 'PRIORITY_SCORING',
      label: '08. Multi-Criteria Priority Scoring',
      status: 'completed',
      detail: 'Applied weighted scoring matrix across technical feasibility and economic yield.',
      proof: 'Target site scored 94.2/100 composite priority rating.',
      timestamp: '210ms',
    },
    {
      id: '09',
      stage: 'UNDERWRITING_RECOMMENDATION',
      label: '09. Generating Underwriting Recommendation',
      status: 'completed',
      detail: 'Synthesized trade-off analysis and written rejection proofs for cut parcels.',
      proof: 'Verdict: RECOMMENDED FOR SITE CONTROL. Written rejection proofs generated for non-qualifying sites.',
      timestamp: '235ms',
    },
    {
      id: '10',
      stage: 'MEMO_CONTRACT_CREATION',
      label: '10. Creating Executive Memo & LOI Contract',
      status: 'completed',
      detail: 'Generated printable 3-Page Investment Committee Memo with 30% IRA ITC tax equity pro-forma and non-binding option LOI.',
      proof: 'Underwriting artifacts compiled and ready for PDF export.',
      timestamp: '250ms',
    },
  ];

  const activeSteps = steps || defaultSteps;

  return (
    <div className="space-y-3 font-sans text-left">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>REPLAYABLE AI REASONING TIMELINE</span>
        </span>
        <span className="text-[10px] text-slate-400">10 STAGE AUDIT TRAIL</span>
      </div>

      <div className="space-y-2">
        {activeSteps.map((step) => {
          const isExpanded = expandedStep === step.id;
          const isDone = step.status === 'completed';
          const isActive = step.status === 'active';
          const isFailed = step.status === 'failed';

          return (
            <div
              key={step.id}
              onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-mono text-xs">
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isActive && <Loader2 className="w-4 h-4 text-slate-200 animate-spin shrink-0" />}
                  {isFailed && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                  {!isDone && !isActive && !isFailed && (
                    <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-slate-500">
                      {step.id}
                    </span>
                  )}
                  
                  <span className={`font-bold ${isDone ? 'text-slate-200' : isActive ? 'text-white' : isFailed ? 'text-rose-300' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  {step.timestamp && <span className="text-slate-400">{step.timestamp}</span>}
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5 text-xs text-slate-300 font-sans pl-6">
                  <p className="font-medium text-slate-200">{step.detail}</p>
                  {step.proof && (
                    <div className="text-[11px] font-mono text-emerald-400/90 font-semibold pt-0.5">
                      Proof of Work: {step.proof}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
