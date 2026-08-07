'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles } from 'lucide-react';

export function CompactAgentRobot() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const stages = [
    {
      num: '01',
      title: 'Candidate Portfolio Understanding',
      badge: 'Stage 01: UNDERSTAND',
      message: 'Atlas parses candidate property portfolios and establishes physical criteria for commercial underwriting.',
    },
    {
      num: '02',
      title: 'Physical Evidence Synthesis',
      badge: 'Stage 02: INVESTIGATE',
      message: 'Atlas queries Mireye physical endpoints and combines ground-truth GIS layers for terrain, flood, and grid access.',
    },
    {
      num: '03',
      title: 'Fatal Flaw Screening & Ranking',
      badge: 'Stage 03: UNDERWRITE',
      message: 'Atlas screens physical deal-killers, cuts unviable properties with written proof, and ranks candidate feasibility.',
    },
    {
      num: '04',
      title: 'Acquisition Target Selection',
      badge: 'Stage 04: SELECT',
      message: 'Atlas identifies the primary acquisition target and exposes the evidence behind the recommendation.',
    },
    {
      num: '05',
      title: 'Target Site Registration',
      badge: 'Stage 05: PERSIST',
      message: 'Atlas establishes a persistent Mireye site identity for candidates with verified parcel geometry. Sites without verified boundaries continue through stateless spatial analysis.',
    },
    {
      num: '06',
      title: 'Investment Memo & Site Control',
      badge: 'Stage 06: ACT',
      message: 'Atlas produces the executive investment committee memo and draft land option agreement to execute site control.',
    },
  ];

  // IntersectionObserver for lazy loading Spline WebGL canvas
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

  // Load Spline viewer script when in viewport
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
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [stages.length]);

  const currentStage = stages[activeStage];

  return (
    <div ref={containerRef} className="w-full bg-transparent mb-8 text-left relative overflow-visible">
      
      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8 items-center">
        
        {/* Left Column: 3D Robot Model (Rendered Mobile & Desktop) */}
        <div className="relative w-full h-[300px] sm:h-[380px] bg-transparent overflow-hidden flex items-center justify-center">
          {isLoaded && !hasError ? (
            // @ts-expect-error custom element
            <spline-viewer
              url="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              style={{ width: '100%', height: '100%', background: 'transparent' }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
              <div className="w-12 h-12 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 animate-pulse">
                <Bot className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-300">Loading 3D Robot Model...</span>
            </div>
          )}
        </div>

        {/* Right Column: Pure Borderless Typography Stream */}
        <div className="space-y-5">
          
          {/* Header */}
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Siting Pipeline Status</span>
          </div>

          {/* Clean Borderless Typographic Steps */}
          <div className="space-y-3 font-sans">
            {stages.map((stg, idx) => {
              const isActive = idx === activeStage;
              return (
                <div
                  key={stg.num}
                  onClick={() => setActiveStage(idx)}
                  className={`cursor-pointer transition-all duration-300 flex items-center justify-between text-xs sm:text-sm ${
                    isActive
                      ? 'text-white font-bold tracking-tight'
                      : 'text-slate-500 font-medium hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs font-bold ${isActive ? 'text-amber-400' : 'text-slate-600'}`}>
                      {stg.num}
                    </span>
                    <span>{stg.title}</span>
                  </div>

                  <span className={`text-[11px] font-mono ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                    {stg.badge}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active Stage Real-Time Status Sentence */}
          <div className="pt-2">
            <div className="text-xs text-amber-400 font-mono font-bold mb-1">
              Stage {currentStage.num}: {currentStage.title}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              "{currentStage.message}"
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
