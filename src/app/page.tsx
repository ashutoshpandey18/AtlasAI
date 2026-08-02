'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, FolderKanban, ShieldCheck, Zap, Bot, MapPin, Sun, Compass, Play, FileText, ArrowRight } from 'lucide-react';
import { SplineRobotViewer } from '@/components/SplineRobotViewer';
import { AwwwardsCursorGlow } from '@/components/AwwwardsCursorGlow';
import { CosmicParticles } from '@/components/CosmicParticles';
import { SatelliteRadarSweep } from '@/components/SatelliteRadarSweep';
import { AppleStyleCapabilities } from '@/components/AppleStyleCapabilities';
import { DecisionEvidenceSection } from '@/components/DecisionEvidenceSection';
import { Navbar } from '@/components/Navbar';
import { VignetteText } from '@/components/VignetteText';

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('Find fast-deployment solar carport targets in Texas under $2M capex.');
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const placeholders = [
    'Find fast-deployment solar carport targets in Texas under $2M capex...',
    'Find high-yield retail solar carport targets in Florida with low flood risk...',
    'Find corporate-owned Dollar General sites in Georgia for BESS storage...',
    'Find retail carport candidate sites in North Carolina near 138kV grid lines...',
  ];
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    let charIndex = 0;
    const currentText = placeholders[promptIndex];
    const typingInterval = setInterval(() => {
      if (charIndex <= currentText.length) {
        setTypedPlaceholder(currentText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setPromptIndex((prev) => (prev + 1) % placeholders.length);
        }, 3200);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [promptIndex]);

  const handlePillClick = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    router.push(`/agent?prompt=${encodeURIComponent(selectedPrompt)}`);
  };

  const handleLaunchAgent = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/agent?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleInstantDemo = () => {
    router.push(`/agent?prompt=${encodeURIComponent(prompt)}&demo=true`);
  };

  return (
    <div className="min-h-screen cosmic-gradient-bg bg-spatial-grid text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">

      {/* Awwwards Liquid Cursor Glow & Radial Vignette */}
      <AwwwardsCursorGlow />
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial-vignette" />

      {/* GEODO FLOATING LEFT HAND GRAPHIC (Ultra-Seamless Mix-Blend Screen Overlay) */}
      <div id="hand-left" className="absolute -left-[10%] top-[-10%] md:left-[-5%] md:top-[-15%] w-[50vw] md:w-[40vw] max-w-[800px] z-10 pointer-events-none opacity-90 animate-float-left">
        <img
          src="https://geodo.ai/assets/hand-left.png"
          alt="Decorative hand illustration left"
          className="w-full h-auto object-contain mix-blend-screen"
          style={{ filter: 'grayscale(1) brightness(1.35) contrast(1.1)' }}
        />
      </div>

      {/* GEODO FLOATING RIGHT HAND GRAPHIC (Ultra-Seamless Mix-Blend Screen Overlay) */}
      <div id="hand-right" className="absolute -right-[10%] top-[35%] md:right-[-5%] md:top-[30%] w-[50vw] md:w-[40vw] max-w-[800px] z-10 pointer-events-none opacity-90 animate-float-right">
        <img
          src="https://geodo.ai/assets/hand-right.png"
          alt="Decorative hand illustration right"
          className="w-full h-auto object-contain mix-blend-screen"
          style={{ filter: 'grayscale(1) brightness(1.35) contrast(1.1)' }}
        />
      </div>

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-amber-500/10 to-transparent pointer-events-none z-0 blur-3xl" />
      <div className="absolute top-96 right-0 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 to-transparent pointer-events-none z-0 blur-3xl" />

      {/* Floating Spatial HUD Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6 max-w-[1140px] mx-auto text-center flex flex-col items-center">

        {/* Pure Borderless Typography Subheader Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-300 mb-6 relative z-10">
          <Bot className="w-3.5 h-3.5 text-slate-300" />
          <span>AUTONOMOUS AI AGENT FOR RENEWABLE LAND ACQUISITION</span>
        </div>

        {/* 2-Line Balanced Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.15] max-w-4xl font-sans mb-6 relative z-10 text-white text-center flex flex-col items-center gap-2">
          {/* Line 1: Automate Commercial */}
          <div className="whitespace-nowrap">
            <VignetteText text="Automate Commercial" />
          </div>

          {/* Line 2: Land Siting in Minutes */}
          <div className="relative inline-flex items-center justify-center gap-x-3 pb-3 whitespace-nowrap">
            <VignetteText text="Land Siting in" />
            <span className="font-serif italic font-normal bg-gradient-to-r from-slate-100 via-white to-slate-300 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,255,255,0.35)]">
              Minutes
            </span>

            {/* Line 2 Silver Metallic Glowing Laser Underline Beam */}
            <span className="absolute bottom-0 inset-x-0 h-[3.5px] bg-gradient-to-r from-slate-400 via-white to-slate-400/20 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.7)] pointer-events-none" />
            <span className="absolute -bottom-[2px] left-1/4 right-1/4 h-[1.5px] bg-white blur-xs pointer-events-none" />
          </div>
        </h1>

        {/* Subtitle with Uniform Slate-Silver Typography */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mb-10 font-medium relative z-10 text-center">
          Stop spending weeks manually inspecting 50 map layers. Enter a business goal below to run automated site checking, written rejection proofs, and 3-page institutional investment memos.
        </p>

        {/* CARD-FREE INTERACTIVE PROMPT LAUNCHER */}
        <form onSubmit={handleLaunchAgent} className="w-full max-w-2xl mb-12 relative z-10 text-left font-sans">

          {/* Pure Typography State Selector Header */}
          <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>SELECT TARGET STATE PORTFOLIO:</span>
          </div>

          {/* Borderless State Selector Typography Stream (0 Cards, 0 Pill Divs) */}
          <div className="flex items-center gap-3 flex-wrap text-xs font-mono mb-6">
            <button
              type="button"
              onClick={() => handlePillClick('Find fast-deployment solar carport targets in Texas under $2M capex.')}
              className={`cursor-pointer transition-all ${
                prompt.includes('Texas')
                  ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5'
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
                  ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5'
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
                  ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5'
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
                  ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              North Carolina (SERC grid)
            </button>
          </div>

          {/* Borderless Prompt Input Line & Action Triggers */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={typedPlaceholder}
                className="w-full bg-transparent border-b-2 border-white/20 focus:border-amber-400 px-4 py-3.5 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none font-medium transition-all"
              />
            </div>
            
            <button
              type="button"
              onClick={handleInstantDemo}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Run Instant Demo</span>
            </button>

            <button
              type="submit"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Run Live Scan →</span>
            </button>
          </div>
        </form>

        {/* Social Proof Trust Avatars */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md relative z-10">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-amber-600 border-2 border-[#030308] flex items-center justify-center text-[10px] font-black text-white">VP</div>
            <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-[#030308] flex items-center justify-center text-[10px] font-black text-white">DEV</div>
            <div className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-[#030308] flex items-center justify-center text-[10px] font-black text-white">GIS</div>
          </div>
          <span className="text-xs font-semibold text-slate-300">
            Trusted by Commercial Clean Tech Developers & Solar Funds
          </span>
        </div>
      </section>

      {/* COMMERCIAL SITE CONTROL ENGINE SECTION */}
      <section id="robot-agent" className="relative z-10 max-w-[1140px] w-full mx-auto px-6 mb-24">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            COMMERCIAL SITE CONTROL ENGINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
            Spatial Intelligence & Decision System
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
            Powered by Mireye physical location intelligence and real-time GIS radiometry.
          </p>
        </div>

        <SplineRobotViewer />
      </section>

      {/* AWWWARDS-GRADE DECISION EVIDENCE TELEMETRY INSPECTOR SECTION */}
      <DecisionEvidenceSection />

      {/* Card-Free Minimalist Spatial Floating Footer */}
      <footer className="border-t border-white/10 py-16 bg-transparent text-slate-400 relative z-10 font-sans text-left">
        <div className="max-w-[1140px] mx-auto px-6 space-y-12">

          {/* Top Row: Brand & Status Telemetry */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/10 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse" />
              <span className="text-sm font-black text-white tracking-widest uppercase">
                ATLAS <span className="text-amber-400">//</span> SITE CONTROL AGENT
              </span>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>MIREYE API VERIFIED INTELLIGENCE</span>
            </div>
          </div>

          {/* 4 Minimalist Typography Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 font-mono text-xs">
            <div>
              <div className="text-amber-400 font-bold uppercase tracking-widest text-[11px] mb-3">
                01 // SYSTEM MODULES
              </div>
              <div className="space-y-1.5 text-slate-300 font-medium">
                <div>3D Decision Engine</div>
                <div>Mireye GIS Synthesizer</div>
                <div>Rejection Ledger</div>
                <div>LOI Underwriting Engine</div>
              </div>
            </div>

            <div>
              <div className="text-amber-400 font-bold uppercase tracking-widest text-[11px] mb-3">
                02 // TARGET PORTFOLIOS
              </div>
              <div className="space-y-1.5 text-slate-300 font-medium">
                <div>Texas (ERCOT Grid)</div>
                <div>Florida (FRCC Grid)</div>
                <div>Georgia (SERC Grid)</div>
                <div>North Carolina (SERC Grid)</div>
              </div>
            </div>

            <div>
              <div className="text-amber-400 font-bold uppercase tracking-widest text-[11px] mb-3">
                03 // PHYSICAL DATASETS
              </div>
              <div className="space-y-1.5 text-slate-300 font-medium">
                <div>NREL PVWatts v8 GHI</div>
                <div>USGS 3DEP 1m LiDAR</div>
                <div>FEMA NFHL Flood Polygons</div>
                <div>EIA 138kV Transmission</div>
              </div>
            </div>

            <div>
              <div className="text-amber-400 font-bold uppercase tracking-widest text-[11px] mb-3">
                04 // DEPLOYMENT
              </div>
              <div className="space-y-1.5 text-slate-300 font-medium">
                <div>Autonomous Siting Workspace</div>
                <div>Instant PDF Memo Generation</div>
                <div>Non-Binding Option LOIs</div>
                <div>Zero Manual Map Inspecting</div>
              </div>
            </div>
          </div>

          {/* Baseline Copyright Line */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-slate-500">
            <div>© 2026 ATLAS ACQUISITION AGENT. ALL RIGHTS RESERVED.</div>
            <div>POWERED BY MIREYE LOCATION INTELLIGENCE</div>
          </div>

        </div>
      </footer>
    </div>
  );
}
