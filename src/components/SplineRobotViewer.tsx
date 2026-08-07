'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Pause, Play, ChevronRight } from 'lucide-react';

export function SplineRobotViewer() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const robotDialogues = [
    {
      title: "Candidate Portfolio Understanding",
      subtitle: "PARCEL PARSING & TARGET OBJECTIVES",
      message: "Atlas parses candidate property portfolios and establishes physical criteria for commercial underwriting.",
      badge: "Stage 01: UNDERSTAND",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      title: "Physical Evidence Synthesis",
      subtitle: "MIREYE API & SPATIAL DATA INTEGRATION",
      message: "Atlas queries Mireye physical endpoints and combines ground-truth GIS layers for terrain, flood, and grid access.",
      badge: "Stage 02: INVESTIGATE",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    {
      title: "Fatal Flaw Screening & Ranking",
      subtitle: "DEAL-KILLER AUDIT & REJECTION LEDGER",
      message: "Atlas screens physical deal-killers, cuts unviable properties with written proof, and ranks candidate feasibility.",
      badge: "Stage 03: UNDERWRITE",
      badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
    {
      title: "Acquisition Target Selection",
      subtitle: "TOP FEASIBILITY CANDIDATE SELECTION",
      message: "Atlas identifies the primary acquisition target and exposes the evidence behind the recommendation.",
      badge: "Stage 04: SELECT",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    },
    {
      title: "Target Site Registration",
      subtitle: "REAL PARCEL REGISTRATION (POST /v1/sites)",
      message: "Atlas establishes a persistent Mireye site identity for candidates with verified parcel geometry. Sites without verified boundaries continue through stateless spatial analysis.",
      badge: "Stage 05: PERSIST",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    {
      title: "Investment Memo & Site Control",
      subtitle: "COMMERCIAL DELIVERABLES & DRAFT LOI",
      message: "Atlas generates executive investment committee memos and draft land option agreements ready for acquisition review.",
      badge: "Stage 06: ACT",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
  ];

  // Lazy load Spline viewer script when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    if (!document.querySelector('script[src*="spline-viewer"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@splinetool/viewer@1.9.72/build/spline-viewer.js';
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setHasError(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, [isInView]);

  // Hide Spline logo watermark safely
  useEffect(() => {
    if (!isLoaded) return;

    const hideSplineLogo = () => {
      const viewer = document.querySelector('spline-viewer');
      if (viewer && viewer.shadowRoot) {
        if (!viewer.shadowRoot.querySelector('#spline-hide-logo')) {
          const style = document.createElement('style');
          style.id = 'spline-hide-logo';
          style.textContent = `
            #logo, .logo, [class*="logo"], a[href*="spline"], #spline-logo {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
          `;
          viewer.shadowRoot.appendChild(style);
        }
      }
    };

    const interval = setInterval(hideSplineLogo, 150);
    return () => clearInterval(interval);
  }, [isLoaded]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % robotDialogues.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, robotDialogues.length]);

  const currentDialogue = robotDialogues[speechIndex];

  return (
    <div ref={containerRef} className="relative w-full flex flex-col md:flex-row items-center justify-center bg-transparent overflow-visible min-h-[480px]">
      
      {/* FLOATING / STACKED HUD DIALOGUE OVERLAY */}
      <div className="w-full md:absolute md:top-2 md:left-6 md:max-w-md z-30 space-y-2 pointer-events-auto mb-4 md:mb-0 text-left">
        
        {/* Stage Badge & Controls */}
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-md ${currentDialogue.badgeColor}`}>
            {currentDialogue.badge}
          </span>
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1 rounded-full cursor-pointer transition-all backdrop-blur-md"
          >
            {isAutoPlaying ? <Pause className="w-2.5 h-2.5 text-amber-400" /> : <Play className="w-2.5 h-2.5 text-amber-400" />}
            <span>{isAutoPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>

        {/* Dialogue Headline & Message */}
        <div className="space-y-1">
          <h4 className="text-base sm:text-xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            {currentDialogue.title}
          </h4>
          <div className="text-xs font-bold text-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {currentDialogue.subtitle}
          </div>
        </div>

        {/* Speech Message Text */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] max-w-sm pt-1">
          "{currentDialogue.message}"
        </p>

        {/* Stepper Dots & Next Button */}
        <div className="flex items-center justify-between pt-2 text-xs max-w-xs">
          <div className="flex items-center gap-1.5">
            {robotDialogues.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSpeechIndex(i);
                  setIsAutoPlaying(false);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === speechIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setSpeechIndex((prev) => (prev + 1) % robotDialogues.length);
              setIsAutoPlaying(false);
            }}
            className="text-xs font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors drop-shadow-md"
          >
            <span>Next Speech</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Spline Canvas Container (Visible & Scaled Mobile & Desktop) */}
      <div className="w-full h-[360px] sm:h-[540px] flex items-center justify-center relative z-10 bg-transparent">
        {isLoaded && !hasError ? (
          // @ts-expect-error custom element
          <spline-viewer
            url="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400 text-xs">
            <div className="w-16 h-16 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-300">Loading 3D Robot Model...</span>
          </div>
        )}
      </div>

      {/* Floating Badge */}
      <div className="absolute bottom-2 right-4 sm:right-6 z-20 bg-black/60 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-bold text-slate-300">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>3D Autonomous Decision Model</span>
      </div>
    </div>
  );
}
