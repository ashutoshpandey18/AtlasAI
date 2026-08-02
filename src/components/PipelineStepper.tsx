'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Activity, ShieldCheck, HelpCircle, ArrowRight, FileText } from 'lucide-react';
import { Land3DVisualizer } from './Land3DVisualizer';

interface Stage {
  id: number;
  title: string;
  badge: string;
  icon: React.ReactNode;
  shortDesc: string;
  fullReasoning: string[];
  demoVisual: React.ReactNode;
}

export function PipelineStepper() {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages: Stage[] = [
    {
      id: 1,
      title: "01. Autonomous Strategy Planner",
      badge: "Goal-Driven Planning",
      icon: <Sparkles className="w-4 h-4 text-[var(--accent)]" />,
      shortDesc: "Evaluates retail chain expansion footprints against user goals to select target strategy.",
      fullReasoning: [
        "Business Goal: 'Fastest deployment under $2M capex in Texas'",
        "Evaluated 3 commercial retail strategies across Texas parcel rolls.",
        "Dollar General selected over Walmart & Target due to 74% fee-simple corporate ownership and 4.3× lot coverage ratio.",
        "Fee-simple retail sites minimize ground lease negotiation friction and reduce deployment timeline.",
      ],
      demoVisual: (
        <div className="space-y-3 font-sans">
          <div className="text-[11px] font-mono text-[var(--accent)] uppercase tracking-wider mb-2 font-bold flex items-center justify-between">
            <span>Strategy Selection Output:</span>
            <span className="text-[10px] bg-[var(--bg-soft)] px-2 py-0.5 rounded-full font-mono text-[var(--text-muted)]">
              Evaluated 3 Chains
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="p-3 rounded-xl border bg-[var(--bg-soft)]/60 border-[var(--border)] opacity-60">
              <div className="font-bold text-xs flex justify-between">
                <span>Walmart Big-Box Solar</span>
                <span className="text-rose-500 font-mono">[REJECTED]</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Lower fee-simple ownership rate (52% leased); urban ERCOT queue saturation &gt;3,200 MW.
              </p>
            </div>
            <div className="p-3 rounded-xl border bg-white border-[var(--accent)] text-[var(--accent)] shadow-xs">
              <div className="font-bold text-xs flex justify-between">
                <span>Dollar General Fee-Simple Carport</span>
                <span className="font-mono bg-[var(--accent)] text-[var(--accent-text)] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  [SELECTED]
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-normal">
                74% fee-simple ownership rate; 4.3× parking-to-building footprint ratio; 81% rural low queue pressure.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "02. Technical Due Diligence (Mireye)",
      badge: "Mireye /v1/fetch/batch",
      icon: <Activity className="w-4 h-4 text-[var(--accent)]" />,
      shortDesc: "Enriches candidates via Mireye API for physical ground truth across 13 parcel fields.",
      fullReasoning: [
        "Executed 3 batch POST calls (/v1/fetch/batch) for all 70 Texas store centroids.",
        "Fetched plane-of-array (POA) solar yield, USGS 3DEP slope, FEMA flood risk, EIA grid distance, and tree canopy.",
        "Zero mock data — 100% verified ground truth with primary dataset source references.",
      ],
      demoVisual: (
        <div className="space-y-2.5 font-mono text-xs">
          <div className="text-[11px] font-mono text-[var(--accent)] uppercase tracking-wider mb-2 font-bold font-sans">
            Mireye API Batch Inspection (/v1/fetch/batch):
          </div>
          <div className="bg-[var(--bg-soft)]/70 p-3 rounded-xl border border-[var(--border)] space-y-1.5 text-[11px] text-[var(--text-secondary)]">
            <div className="flex justify-between">
              <span>• POA Solar Yield:</span>
              <span className="font-bold text-[var(--text-primary)]">2,326.7 kWh/m²/yr (NREL)</span>
            </div>
            <div className="flex justify-between">
              <span>• Ground Slope:</span>
              <span className="font-bold text-[var(--text-primary)]">0.66° Flat Class (USGS 3DEP)</span>
            </div>
            <div className="flex justify-between">
              <span>• Floodplain Risk:</span>
              <span className="font-bold text-emerald-600">Zone X Clear (FEMA NFHL)</span>
            </div>
            <div className="flex justify-between">
              <span>• Grid Transmission:</span>
              <span className="font-bold text-[var(--text-primary)]">138 kV at 480m (EIA Power)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "03. Acquisition Intelligence",
      badge: "Motivated Seller Signals",
      icon: <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />,
      shortDesc: "Entity resolution across state tax rolls + property tax delinquency priority signals.",
      fullReasoning: [
        "Resolved corporate owner aliases across Texas CAD tax rolls (DOLGENCORP OF TEXAS INC).",
        "Cross-checked county property tax delinquency rolls ($28,400 overdue taxes in Nacogdoches County).",
        "Evaluates tax delinquency as an acquisition-priority signal — owner has direct financial incentive to sign an option agreement.",
      ],
      demoVisual: (
        <div className="space-y-3 font-sans">
          <div className="text-[11px] font-mono text-[var(--accent)] uppercase tracking-wider mb-2 font-bold">
            Motivated Seller Signal Detected:
          </div>
          <div className="bg-amber-950/10 border border-amber-800/40 p-3.5 rounded-xl text-xs">
            <div className="font-bold text-[var(--text-primary)] flex items-center justify-between mb-1">
              <span>PRIORITY ELEVATED: Nacogdoches #1</span>
              <span className="text-[10px] font-mono bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                Priority 92%
              </span>
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
              $28,400 in property taxes overdue (2 years). Owner exhibits strong economic incentive for a sale-leaseback option.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "04. Deal Killer & Investment Memo",
      badge: "Fatal Flaw Rejection & Memo",
      icon: <HelpCircle className="w-4 h-4 text-[var(--accent)]" />,
      shortDesc: "Identifies hidden fatal flaws before they kill projects 3 years in, and outputs a 3-page Investment Memo.",
      fullReasoning: [
        "Deal-Killer Detector rejects bad sites with defensible written reasons (FEMA flood zone AE insurance penalty, ERCOT queue delays).",
        "Recommends alternative adjacent commercial parcel 1.4 miles away for failed primary sites.",
        "Outputs a full 3-page printable Investment Memo + LOI text + Decision Authorization Sign-Off.",
      ],
      demoVisual: (
        <div className="space-y-3 font-sans">
          <div className="text-[11px] font-mono font-bold text-[#A04B3C] uppercase tracking-wider mb-2">
            Written Rejection & Actionable Output:
          </div>
          <div className="bg-rose-950/10 border border-rose-800/40 p-3 rounded-xl text-xs text-rose-900">
            <div className="font-bold flex justify-between mb-1">
              <span>✗ Nacogdoches #2</span>
              <span className="text-[10px] font-mono">REJECTED</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              FEMA Zone AE flood risk introduces mandatory insurance & permitting complexity. Alternative parcel 1.4 mi East suggested.
            </p>
          </div>
          <Link
            href="/memo/45835"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Generated Executive Investment Memo →</span>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[32px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] font-sans my-8 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-widest bg-[var(--bg-soft)] border border-[var(--border)] px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          AUTONOMOUS DECISION ENGINE
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mt-4 font-sans leading-tight">
          The Architecture of Autonomous Land Acquisition
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 leading-relaxed font-medium">
          Four synchronized stages transforming unstructured physical data into signed-ready development decisions.
        </p>
      </div>

      {/* Interactive 2-Column Pipeline & 3D Land Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 items-start relative z-10">
        {/* Left Side: Interactive Stage Selector Buttons with Animated Arrow */}
        <div className="space-y-3.5">
          {stages.map((stage) => {
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-300 relative flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[var(--bg-soft)] border-[var(--accent)] shadow-md translate-x-2'
                    : 'bg-white/70 border-[var(--border)] hover:border-[var(--border-focus)]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    isActive ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] shadow-xs' : 'bg-[var(--bg-soft)] border-[var(--border)] text-[var(--text-secondary)]'
                  }`}>
                    {stage.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                        {stage.title}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[var(--text-secondary)] mt-1 font-normal leading-relaxed">
                      {stage.shortDesc}
                    </p>
                  </div>
                </div>

                {/* Animated Arrow Indicator */}
                <div className={`transition-all duration-300 ml-3 ${isActive ? 'opacity-100 translate-x-0 text-[var(--accent)] font-bold scale-110' : 'opacity-0 -translate-x-3 text-[var(--text-muted)]'}`}>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: 3D Interactive Land & Grid Visualizer + Reasoning Output */}
        <div className="space-y-4">
          {/* Interactive 3D Land Simulator Card */}
          <Land3DVisualizer activeStage={activeStage} />

          {/* Stage Output & Reasoning Log */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs border-l-4 border-l-[var(--accent)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                Stage 0{stages[activeStage - 1].id} Reasoning Trail
              </span>
              <span className="text-[10px] font-mono font-bold bg-[var(--bg-soft)] border border-[var(--border)] px-2 py-0.5 rounded-full text-[var(--text-secondary)]">
                {stages[activeStage - 1].badge}
              </span>
            </div>

            {/* Render Visual Output */}
            {stages[activeStage - 1].demoVisual}

            {/* Internal Reasoning Log */}
            <div className="bg-[var(--bg-soft)] p-3.5 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
              <div className="font-bold text-[var(--text-primary)] text-[10.5px] uppercase tracking-wider mb-1">
                Internal Reasoning Steps:
              </div>
              {stages[activeStage - 1].fullReasoning.map((r, i) => (
                <p key={i} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                  <span className="text-[var(--accent)] font-bold">•</span>
                  <span>{r}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
