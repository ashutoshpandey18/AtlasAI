'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, FolderKanban } from 'lucide-react';

import PhoneSimulator from '@/components/PhoneSimulator';
import { PipelineStepper } from '@/components/PipelineStepper';

const TICKER = [
  { flag: "TX", q: "Dollar General Ector County", r: "Rank #1 (100.0%) — $28.4k Tax Delinquent", t: "0.4s" },
  { flag: "TX", q: "Nacogdoches #2 Solar Canopy", r: "REJECTED: FEMA Flood Zone AE (-$18k/yr Risk)", t: "0.8s" },
  { flag: "TX", q: "Rusk County #4 Commercial", r: "REJECTED: ERCOT Queue 1,619 MW (Cluster Delay)", t: "0.3s" },
  { flag: "FL", q: "Family Dollar Polk County", r: "Priority 94.2% — 4.3× Lot Coverage Ratio", t: "1.1s" },
  { flag: "TX", q: "El Paso Family Dollar #2", r: "Rank #2 (98.6%) — 2,437 kWh/m²/yr POA Yield", t: "0.9s" },
];

const METRICS = [
  { target: 70, suffix: " Sites", label: "Texas Store Cohort", sub: "Fee-simple corporate owned" },
  { target: 3, suffix: " Calls", label: "Mireye Batch API Requests", sub: "True /v1/fetch/batch parallel fetch" },
  { target: 67, suffix: " Cut", label: "Doomed Candidates Rejected", sub: "Written rejection reasons" },
  { target: 100, suffix: "%", label: "Reproducible Evidence", sub: "Verified Mireye timestamps" },
];

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [trigger, target, duration]);
  return val;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [metricsOn, setMetricsOn] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMetricsOn(true);
      },
      { threshold: 0.25 }
    );
    if (metricsRef.current) observer.observe(metricsRef.current);
    return () => observer.disconnect();
  }, []);

  const m0 = useCountUp(METRICS[0].target, 1200, metricsOn);
  const m1 = useCountUp(METRICS[1].target, 1200, metricsOn);
  const m2 = useCountUp(METRICS[2].target, 1200, metricsOn);
  const m3 = useCountUp(METRICS[3].target, 1200, metricsOn);
  const counts = [m0, m1, m2, m3];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans relative selection:bg-[var(--accent)] selection:text-white">
      {/* Background Glow Orbs */}
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      {/* Ticker Bar */}
      <div className="ticker-bar" role="marquee" aria-label="Live coordinates processed">
        <span className="ticker-live-tag">AUTONOMOUS SCANS</span>
        <div className="ticker-track">
          <div className="ticker-items">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="ticker-item">
                <span className="ti-flag-badge">{t.flag}</span>
                <span className="ti-q">"{t.q}"</span>
                <span className="ti-arr">→</span>
                <span className="ti-r">{t.r}</span>
                <span className="ti-t">{t.t}</span>
                <span className="ti-sep">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* YC-Style Minimal Navigation */}
      <nav className={`border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}>
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-[13.5px] tracking-[0.15em] text-[var(--text-primary)] uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(74,117,89,0.8)] animate-pulse" />
            ATLAS ACQUISITION
          </Link>
          <div className="flex items-center gap-5">
            <Link 
              href="/projects" 
              className="flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
              <span>Saved Campaigns</span>
            </Link>
            <Link
              href="/agent"
              className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-[var(--accent)] text-[var(--accent-text)] px-4 py-2 rounded-full transition-all shadow-xs hover:bg-[var(--accent-hover)] cursor-pointer"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main YC-Style Minimal Hero Container */}
      <main className="relative z-10 flex-1 w-full">
        <section className="max-w-[1100px] mx-auto px-6 pt-16 pb-16 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 bg-[var(--bg-soft)] border border-[var(--border)] px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-[var(--accent)] tracking-wide mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              MIREYE BUILD CHALLENGE
            </div>

            <h1 className="text-[40px] sm:text-[52px] font-extrabold tracking-tighter leading-[1.05] mb-5 font-sans">
              Autonomous Land Acquisition for Commercial Renewables.
            </h1>

            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-[480px] mb-8 font-medium">
              Answers which land opportunities deserve your team's time first — autonomously ingesting tax rolls, running Mireye physical due diligence, and rejecting bad sites in 60 seconds.
            </p>

            <div className="flex flex-wrap gap-3.5 items-center">
              <Link
                href="/agent"
                className="inline-flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 px-6.5 py-3.5 rounded-2xl text-[13px] font-extrabold transition-all shadow-sm cursor-pointer"
              >
                <span>Launch Autonomous Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/memo/45835"
                className="inline-flex items-center gap-2 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)] px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all shadow-xs"
              >
                <span>Sample Memo</span>
              </Link>
            </div>
          </div>

          {/* Live Mobile Simulator Component */}
          <div className="w-full flex justify-center">
            <PhoneSimulator />
          </div>
        </section>

        {/* Interactive Pipeline Stepper */}
        <section id="features" className="border-t border-[var(--border)] py-16 bg-[var(--bg-soft)]/20">
          <div className="max-w-[1100px] mx-auto px-6">
            <PipelineStepper />
          </div>
        </section>

        {/* Proof of Work Metrics */}
        <section ref={metricsRef} className="border-t border-[var(--border)] py-16 bg-[var(--surface)]">
          <div className="max-w-[1100px] mx-auto px-6 text-center">
            <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider bg-[var(--bg-soft)] border border-[var(--border)] px-3.5 py-1 rounded-full">
              Proof of Work
            </span>
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mt-3 mb-10">
              Empirical Pipeline Results
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {METRICS.map((m, idx) => (
                <div key={idx} className="bg-[var(--bg-soft)] border border-[var(--border)] p-5 rounded-2xl">
                  <div className="text-2xl font-black text-[var(--accent)] mb-1">
                    {counts[idx]}
                    {m.suffix}
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mb-1">{m.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[var(--border)] py-6 bg-[var(--bg)] text-[11px] text-[var(--text-muted)]">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>© 2026 Atlas Acquisition Agent — Mireye Build Challenge</div>
          <div className="flex gap-3">
            <span className="text-[var(--accent)] font-semibold">Mireye API /v1/fetch/batch</span>
            <span>·</span>
            <span>Texas CAD Tax Rolls</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
