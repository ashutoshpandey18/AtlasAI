'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Cpu } from 'lucide-react';

export function CompactAgentRobot() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const stages = [
    {
      num: '01',
      title: 'Goal Formulation',
      badge: 'Acquisition Strategy',
      message: 'Extracting capex limits ($2M), parking lot coverage thresholds (≥2.5x), and target ERCOT grid rules.',
    },
    {
      num: '02',
      title: 'Mireye GIS Batch',
      badge: 'Data Ingestion',
      message: 'Querying NREL solar radiometry (2,131 kWh/m²), USGS 3DEP 3D slope LiDAR, and FEMA flood maps in parallel.',
    },
    {
      num: '03',
      title: 'Feasibility Scoring',
      badge: 'Multi-Criteria Engine',
      message: 'Scoring 70 store parcels based on parking lot array area (≥2.5x) and 138kV substation tie-in distance.',
    },
    {
      num: '04',
      title: 'Rejection Ledger',
      badge: 'Fatal Flaw Screening',
      message: 'Cutting Nacogdoches #2 with written proof for FEMA Zone AE flood hazard (-$18,000/yr insurance penalty).',
    },
    {
      num: '05',
      title: 'Institutional Underwriting',
      badge: '3-Page Memo & LOI',
      message: 'Underwriting priority site with 30% IRA ITC tax equity ($224k benefit), 5-Yr MACRS, and land LOI.',
    },
  ];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // IntersectionObserver for lazy desktop loading
  useEffect(() => {
    if (isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile]);

  // Load Spline script on desktop when in view
  useEffect(() => {
    if (isMobile || !isInView) return;

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
  }, [isMobile, isInView]);

  // Hide Spline logo watermark safely
  useEffect(() => {
    if (isMobile || !isLoaded) return;

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
  }, [isMobile, isLoaded]);

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
        
        {/* Left Column: 3D Robot Model (or Mobile Hologram) */}
        <div className="relative w-full h-[240px] sm:h-[380px] bg-transparent overflow-hidden flex items-center justify-center">
          {isMobile ? (
            <div className="flex flex-col items-center justify-center text-center p-4 space-y-3">
              <div className="w-20 h-20 rounded-full border border-amber-400/40 bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
                <Bot className="w-10 h-10" />
              </div>
              <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                <span>Agent Copilot Active</span>
              </div>
            </div>
          ) : isLoaded && !hasError ? (
            // @ts-expect-error custom element
            <spline-viewer
              url="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              style={{ width: '100%', height: '100%', background: 'transparent' }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
              <Bot className="w-8 h-8 text-amber-400 animate-pulse" />
              <span className="font-semibold text-slate-300">Loading 3D Model...</span>
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
