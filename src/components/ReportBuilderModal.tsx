'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Shield, Zap, FileText, CheckCircle2, Play, Terminal, Sparkles, Sliders } from 'lucide-react';

interface ReportDetails {
  title: string;
  suitability: number;
  grade: string;
  recommendation: string;
  gridScore: number;
  floodScore: number;
  slopeScore: number;
  citation: string;
}

const REPORTS: Record<string, ReportDetails> = {
  battery: {
    title: "Battery Gigafactory (Texas Loop)",
    suitability: 88,
    grade: "A- Excellent",
    recommendation: "Travis County node satisfies the 345kV voltage rule, but intersects a gentle 4.2° slope. Shift coordinates 350m NW to escape the FEMA 100-year floodplain boundary.",
    gridScore: 92,
    floodScore: 78,
    slopeScore: 84,
    citation: "NOAA Coastal Hazard Inundation, EIA Grid Capacity"
  },
  solar: {
    title: "Community Solar Pad (Ohio Valley)",
    suitability: 94,
    grade: "A+ Optimal",
    recommendation: "Pickaway County node has a southern aspect of 184° and 0% canopy coverage. Direct transmission interconnect available within 420m.",
    gridScore: 96,
    floodScore: 100,
    slopeScore: 90,
    citation: "USGS Elevation Model, USFWS National Wetland Inventory"
  },
  warehouse: {
    title: "Logistics Hub (Memphis Node)",
    suitability: 92,
    grade: "A Excellent",
    recommendation: "Shelby County site features direct highway access (I-240 within 320m) and flat topography. Minor USFWS wetland polygon overlap detected at the east boundary.",
    gridScore: 90,
    floodScore: 94,
    slopeScore: 100,
    citation: "DOT National Freight Network, FEMA National Flood Hazard"
  }
};

export default function ReportBuilderModal() {
  const router = useRouter();
  const [projectType, setProjectType] = useState<'battery' | 'solar' | 'warehouse'>('battery');
  const [gridWeight, setGridWeight] = useState(30);
  const [terrainWeight, setTerrainWeight] = useState(30);
  const [floodWeight, setFloodWeight] = useState(40);
  
  const [stage, setStage] = useState<'config' | 'generating' | 'done'>('config');
  const [logs, setLogs] = useState<string[]>([]);
  const currentReport = REPORTS[projectType];

  function handleLaunchWorkspace() {
    let path = '';
    if (projectType === 'battery') {
      path = '/workspace/demo-campaign?uc=battery-factory&chat=open&locs=Austin%2C%20TX%3BRound%20Rock%2C%20TX';
    } else if (projectType === 'solar') {
      path = '/workspace/demo-campaign?uc=solar-farm&chat=open&locs=Franklin%20County%2C%20OH%3BPickaway%20County%2C%20OH';
    } else {
      path = '/workspace/demo-campaign?uc=warehouse&chat=open&locs=Memphis%2C%20TN%3BDallas%2C%20TX';
    }
    router.push(path);
  }

  useEffect(() => {
    if (stage !== 'generating') return;

    let active = true;
    let timers: NodeJS.Timeout[] = [];
    const stepLogs = [
      "▸ Ingesting Campaign Parameters...",
      `▸ Applying Weights (Grid: ${gridWeight}%, Terrain: ${terrainWeight}%, Flood: ${floodWeight}%)`,
      "▸ Querying Mireye /v1/fetch for candidate coordinates...",
      "▸ Computing suitability matrices in-memory...",
      "▸ Querying Mireye /v1/ask for narrative executive report...",
      "▸ Grounding data with primary federal citations...",
      "✓ Campaign Report Compiled."
    ];

    let logIdx = 0;
    function printNextLog() {
      if (!active) return;
      if (logIdx < stepLogs.length) {
        const nextVal = stepLogs[logIdx];
        if (nextVal) {
          setLogs((prev) => [...prev, nextVal]);
        }
        logIdx++;
        timers.push(setTimeout(printNextLog, 450));
      } else {
        timers.push(setTimeout(() => {
          if (active) setStage('done');
        }, 300));
      }
    }

    timers.push(setTimeout(printNextLog, 200));

    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, [stage, gridWeight, terrainWeight, floodWeight]);

  function handleStart() {
    setLogs([]);
    setStage('generating');
  }

  function handleReset() {
    setStage('config');
    setLogs([]);
  }

  return (
    <div className="w-full max-w-[680px] mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-[32px] shadow-lg overflow-hidden font-sans relative">
      
      {/* Soft mesh background */}
      <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 0)', backgroundSize: '20px 20px' }} />

      {/* Modal Header */}
      <div className="bg-[var(--bg-soft)] border-b border-[var(--border)] px-6 py-4.5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[var(--accent)] animate-spin-slow" />
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Siting Simulator Control Panel
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5B18A]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E6D08E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#A8C7A3]" />
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-6 sm:p-8 relative z-10">
        
        {stage === 'config' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-[18px] font-extrabold text-[var(--text-primary)] tracking-tight">
                AI Feasibility Report Builder
              </h3>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Configure parameters and criteria weights below to dynamically run campaigns against the geocoding and Mireye API engines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Left Column: Preset Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Select Project Type
                </label>
                <div className="flex flex-col gap-2.5">
                  {[
                    { id: 'battery', label: 'Battery Gigafactory', desc: 'High grid pull & rail tie-in' },
                    { id: 'solar', label: 'Community Solar Farm', desc: 'Aspect, flat slope & canopy' },
                    { id: 'warehouse', label: 'Logistics Warehouse', desc: 'Road access & topography' }
                  ].map((preset) => {
                    const isActive = projectType === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setProjectType(preset.id as any)}
                        className={`text-left px-4.5 py-3 rounded-2xl border text-[13px] font-bold transition-all flex flex-col justify-between cursor-pointer ${
                          isActive
                            ? 'border-[var(--accent)] bg-[var(--accent)] text-[#FAFAF7] shadow-sm'
                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-soft)]/20'
                        }`}
                      >
                        <span>{preset.label}</span>
                        <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-[#FAFAF7]/80' : 'text-[var(--text-muted)]'}`}>
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Weight Sliders */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Adjust Criteria Weights
                </label>
                <div className="space-y-4 bg-[var(--bg-soft)]/50 p-5 rounded-2xl border border-[var(--border)]">
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)] mb-1.5">
                      <span>Power / Grid Interconnect</span>
                      <span className="font-bold text-[var(--accent)]">{gridWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={gridWeight}
                      onChange={(e) => setGridWeight(Number(e.target.value))}
                      className="w-full accent-[var(--accent)] cursor-ew-resize"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)] mb-1.5">
                      <span>Topography & Slope</span>
                      <span className="font-bold text-[var(--accent)]">{terrainWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={terrainWeight}
                      onChange={(e) => setTerrainWeight(Number(e.target.value))}
                      className="w-full accent-[var(--accent)] cursor-ew-resize"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)] mb-1.5">
                      <span>Floodplain Exposure</span>
                      <span className="font-bold text-[var(--accent)]">{floodWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={floodWeight}
                      onChange={(e) => setFloodWeight(Number(e.target.value))}
                      className="w-full accent-[var(--accent)] cursor-ew-resize"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={handleStart}
                className="flex items-center gap-2 bg-[var(--accent)] text-[#FAFAF7] hover:opacity-95 font-bold text-[13px] px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Generate Feasibility Report
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Log Output (Re-themed to match the cream/olive terminal layout) */}
        {stage === 'generating' && (
          <div className="py-6 flex items-center justify-center min-h-[220px] animate-fadeIn">
            <div className="w-full max-w-[460px] bg-[var(--bg-soft)] border border-[var(--border)] rounded-[24px] p-5 shadow-md relative overflow-hidden font-mono text-[10.5px]">
              
              {/* macOS bar */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E5B18A] shadow-sm" />
                  <span className="w-2 h-2 rounded-full bg-[#E6D08E] shadow-sm" />
                  <span className="w-2 h-2 rounded-full bg-[#A8C7A3] shadow-sm" />
                </div>
                <span className="text-[8px] uppercase font-bold text-[var(--text-muted)] tracking-widest">
                  mireye-report-compiler.log
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {logs.map((log, i) => {
                  if (!log || typeof log !== 'string') return null;
                  let element = <span className="text-[var(--text-secondary)]">{log}</span>;
                  if (log.startsWith("▸")) {
                    element = (
                      <>
                        <span className="text-[var(--accent)] font-bold">▸</span>
                        <span className="text-[var(--text-primary)] font-medium"> {log.replace("▸ ", "")}</span>
                      </>
                    );
                  } else if (log.startsWith("✓")) {
                    element = (
                      <>
                        <span className="text-[var(--accent)] font-bold">✓</span>
                        <span className="text-[var(--accent)] font-bold"> {log.replace("✓ ", "")}</span>
                      </>
                    );
                  }
                  return (
                    <div key={i} className="animate-fadeIn">
                      {element}
                    </div>
                  );
                })}
                {logs.length < stepLogs.length && (
                  <div className="text-[var(--accent)] animate-pulse font-bold mt-2">
                    ▸ Running Mireye API Harvest...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {stage === 'done' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Result summary */}
            <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[var(--border)] pb-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Feasibility Report Result
                </span>
                <h3 className="text-[17px] font-extrabold text-[var(--text-primary)] mt-1.5">
                  {currentReport.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[26px] font-extrabold text-[var(--text-primary)] leading-tight">
                    {currentReport.suitability}
                    <span className="text-[13px] font-normal text-[var(--text-muted)]">/100</span>
                  </div>
                  <div className="text-[10px] text-[var(--accent)] font-extrabold uppercase tracking-widest mt-0.5">
                    {currentReport.grade}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Grid details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[var(--bg-soft)] p-4.5 rounded-2xl border border-[var(--border)] text-center shadow-sm">
                <div className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Grid Capacity</div>
                <div className="text-[20px] font-extrabold text-[var(--text-primary)] mt-1.5">{currentReport.gridScore}%</div>
              </div>
              <div className="bg-[var(--bg-soft)] p-4.5 rounded-2xl border border-[var(--border)] text-center shadow-sm">
                <div className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Terrain Slope</div>
                <div className="text-[20px] font-extrabold text-[var(--text-primary)] mt-1.5">{currentReport.slopeScore}%</div>
              </div>
              <div className="bg-[var(--bg-soft)] p-4.5 rounded-2xl border border-[var(--border)] text-center shadow-sm">
                <div className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Floodplain</div>
                <div className="text-[20px] font-extrabold text-[var(--text-primary)] mt-1.5">{currentReport.floodScore}%</div>
              </div>
            </div>

            {/* Recommendation block */}
            <div className="bg-[var(--bg-soft)]/50 p-5 rounded-2xl border border-[var(--border)] space-y-2.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-[4px] h-full bg-[var(--accent)]" />
              <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                AI Recommendation Summary
              </span>
              <p className="text-[12.5px] text-[var(--text-primary)] leading-relaxed font-medium pl-1">
                {currentReport.recommendation}
              </p>
            </div>

            {/* Citations footer */}
            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pt-4 border-t border-[var(--border)] flex-wrap gap-2.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
                Citations: {currentReport.citation}
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleReset}
                  className="text-[var(--text-secondary)] font-bold hover:underline cursor-pointer"
                >
                  Re-Configure
                </button>
                <button
                  onClick={handleLaunchWorkspace}
                  className="px-4 py-1.5 bg-[var(--accent)] text-[#FAFAF7] hover:opacity-90 font-bold rounded-full transition-all cursor-pointer shadow-sm text-[10px] flex items-center gap-1"
                >
                  Launch Workspace ↗
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Constant logs mapping for compilation test reference
const stepLogs = [
  "▸ Ingesting Campaign Parameters...",
  "▸ Applying Weights",
  "▸ Querying Mireye /v1/fetch for candidate coordinates...",
  "▸ Computing suitability matrices in-memory...",
  "▸ Querying Mireye /v1/ask for narrative executive report...",
  "▸ Grounding data with primary federal citations...",
  "✓ Campaign Report Compiled."
];
