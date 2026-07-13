'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, Activity, ShieldCheck, Sliders, Layers, CheckCircle, FolderKanban } from 'lucide-react';

import PhoneSimulator from '@/components/PhoneSimulator';
import ReportBuilderModal from '@/components/ReportBuilderModal';

const TICKER = [
  { flag: "TX", q: "Austin battery plant grid", r: "345kV lines within 620m (FEMA Zone X)", t: "0.4s" },
  { flag: "OH", q: "Solar farm slope Pickaway", r: "Slope 1.2° (0% canopy shading)", t: "0.8s" },
  { flag: "TN", q: "Memphis logistics road proximity", r: "I-240 corridor within 320m", t: "0.3s" },
  { flag: "FL", q: "EV charging pad wetlands", r: "USFWS wetland buffer confirmed", t: "1.1s" },
  { flag: "CA", q: "Wind farm FAA clearance", r: "23km to nearest airport (Notice clear)", t: "1.4s" },
  { flag: "AZ", q: "Hospital siting elevation", r: "USGS elevation 640m above sea level", t: "0.9s" },
];

const FEATURES = [
  {
    icon: <Sparkles className="w-5 h-5 text-[var(--score-mid)]" />,
    title: "Agentic Suitability Scoring",
    desc: "Replaces dashboard clutter with a singular, weighted suitability score (0-100) tuned to your project rules.",
    details: "Scores are computed dynamically in-memory based on target weights (e.g. 30% grid voltage, 20% FEMA risk, 18% rail connection) and normalize raw metrics into feasibility tags."
  },
  {
    icon: <Activity className="w-5 h-5 text-[var(--accent)]" />,
    title: "Interactive Vector Mapping",
    desc: "Draws connection vectors from your candidate coordinates to nearby roads, grid infrastructure, and water resources.",
    details: "Using SVG scaling, the map plots coordinates relative to campaign boundaries and overlays distance lines with hover citations linked directly to primary servers."
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
    title: "Cognitive Risk Overlays",
    desc: "Flags environmental easements, FEMA floodplain intersections, and USFWS wetlands with verified citation records.",
    details: "Ensures legal and regulatory compliance by tracking parcel overlap, protected area indexes, and wetland acreage down to coordinate precision."
  },
];

const METRICS = [
  { target: 170, suffix: "+", label: "Location Layers Analyzed", sub: "Terrain, Grid, Wetlands, FEMA, Hazards" },
  { target: 4, suffix: "s", label: "Siting Report Latency", sub: "Parallel geocoding & harvesting pipelines" },
  { target: 98, suffix: "%", label: "Dataset Integrity Score", sub: "Grounded in primary federal resources" },
  { target: 92, suffix: "%", label: "Fewer Feasibility Bottlenecks", sub: "Autonomously flags siting constraints" },
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
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('product');
  const [metricsOn, setMetricsOn] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }

      const sections = ['product', 'simulator', 'how-it-works', 'features', 'metrics', 'waitlist'];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setActiveSection(s);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setMetricsOn(true);
    }, { threshold: 0.15 });

    if (metricsRef.current) obs.observe(metricsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.sr');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('sr-in');
      });
    }, { threshold: 0.05 });

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function handleSearch(qText: string) {
    if (!qText.trim()) return;
    setError(null);
    const q = qText.toLowerCase();
    let useCaseId = '';
    
    if (q.includes('solar') || q.includes('pv')) useCaseId = 'solar-farm';
    else if (q.includes('wind') || q.includes('turbine')) useCaseId = 'wind-farm';
    else if (q.includes('battery') || q.includes('gigafactory') || q.includes('storage')) useCaseId = 'battery-factory';
    else if (q.includes('ev') || q.includes('charge')) useCaseId = 'ev-charging';
    else if (q.includes('warehouse') || q.includes('fulfillment')) useCaseId = 'warehouse';
    else if (q.includes('hospital') || q.includes('medical') || q.includes('clinic')) useCaseId = 'hospital';
    else if (q.includes('retail') || q.includes('store') || q.includes('shop')) useCaseId = 'retail-store';
    else if (q.includes('manufactur') || q.includes('factory') || q.includes('industrial')) useCaseId = 'manufacturing';

    if (!useCaseId) {
      useCaseId = 'solar-farm'; // Default fallback to keep search extremely forgiving
    }

    let locationList: string[] = [];
    const keywords = [' in ', ' near ', ' at ', ' comparing ', ' vs '];
    let locationPart = '';
    for (const kw of keywords) {
      const idx = q.lastIndexOf(kw);
      if (idx !== -1) {
        locationPart = qText.substring(idx + kw.length);
        break;
      }
    }

    if (locationPart) {
      locationList = locationPart
        .split(/\s+and\s+|\s+vs\s+|,|;/i)
        .map((p) => p.trim())
        .filter((p) => p.length > 2);
    }

    const campaignId = `campaign-${Date.now()}`;
    const locsParam = locationList.length > 0 ? `&locs=${encodeURIComponent(locationList.join(';'))}` : '';
    router.push(`/workspace/${campaignId}?q=${encodeURIComponent(qText)}&uc=${useCaseId}${locsParam}`);
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailStatus('error');
      return;
    }
    setEmailStatus('submitting');
    setTimeout(() => {
      setEmailStatus('success');
      setEmail('');
    }, 1200);
  }

  const m0 = useCountUp(METRICS[0].target, 1500, metricsOn);
  const m1 = useCountUp(METRICS[1].target, 1000, metricsOn);
  const m2 = useCountUp(METRICS[2].target, 1200, metricsOn);
  const m3 = useCountUp(METRICS[3].target, 1400, metricsOn);
  const metricValues = [m0, m1, m2, m3];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans relative">
      <div className="fixed top-0 left-0 h-[2.5px] bg-[var(--accent)] z-[60] transition-all duration-75" style={{ width: `${scrollProgress}%` }} />

      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      <div className="dot-nav hidden md:flex" role="navigation" aria-label="Quick jump panel nav">
        {[
          { id: "product", label: "Hero Workspace" },
          { id: "simulator", label: "Feasibility Simulator" },
          { id: "how-it-works", label: "Siting Process" },
          { id: "features", label: "Feasibility Signals" },
          { id: "metrics", label: "Feasibility Index" },
          { id: "waitlist", label: "Waitlist Campaign" }
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })}
            className={`dot-nav-item ${activeSection === sec.id ? 'active' : ''}`}
            aria-label={`Scroll to ${sec.label}`}
          >
            <span className="dot-nav-tooltip">{sec.label}</span>
          </button>
        ))}
      </div>

      <div className="ticker-bar" role="marquee" aria-label="Live coordinates processed">
        <span className="ticker-live-tag">LIVE SITINGS</span>
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

      <nav className={`border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4.5'}`}>
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-[14px] tracking-[0.15em] text-[var(--text-primary)] uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(74,117,89,0.8)] animate-pulse" />
            ATLAS.AI
          </Link>
          <div className="flex items-center gap-6">
            <Link 
              href="/projects" 
              className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
              Saved Campaigns
            </Link>
            <Link
              href="/workspace/demo-campaign?uc=solar-farm&chat=open&locs=Franklin%20County%2C%20OH%3BPickaway%20County%2C%20OH"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-bold bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-primary)] border border-white/[0.08] hover:border-[var(--accent)]/40 px-4.5 py-2 rounded-full transition-all shadow-sm hover:shadow-[0_0_15px_rgba(74,117,89,0.15)]"
            >
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
              Active Workspace
            </Link>
          </div>
        </div>
      </nav>



      <main className="relative z-10 flex-1 w-full">
        <section id="product" className="max-w-[1100px] mx-auto px-6 pt-24 pb-20 grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-16 items-center">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 bg-[var(--bg-soft)] border border-[var(--border)] px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-[var(--text-secondary)] tracking-wide mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              SITING COPILOT V1.0
            </div>

            <h1 className="text-[46px] sm:text-[62px] lg:text-[70px] font-extrabold tracking-tighter leading-[1.05] mb-6 font-sans">
              <span className="block text-[var(--text-muted)] font-medium">Every coordinate's data.</span>
              <span className="block text-[var(--text-primary)]">Your entire campaign.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] via-[#648F69] to-[#B88E53] pb-1">
                Feasible.
              </span>
            </h1>

            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-[420px] mb-8">
              Atlas AI is an agentic copilot for location intelligence. Describe what you are building, parameterize your constraints, and compare candidate sites with citable federal datasets instantly.
            </p>

            <div className="w-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-focus)] focus-within:border-[var(--accent)] p-2 rounded-xl transition-all flex items-center gap-3 shadow-sm">
              <Search className="w-4 h-4 text-[var(--text-muted)] ml-2" />
              <input
                type="text"
                placeholder="e.g. 'Site a solar farm in Franklin County, OH and Pickaway County, OH'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                className="flex-1 bg-transparent border-none outline-none text-[13.5px] placeholder-[var(--text-muted)] py-1.5 text-[var(--text-primary)] font-medium"
              />
              <button
                onClick={() => handleSearch(query)}
                disabled={!query.trim()}
                className="btn bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-95 rounded-lg px-4 py-1.5 text-[12.5px] font-bold transition-all cursor-pointer"
              >
                Launch
              </button>
            </div>
            {error && <p className="text-[11.5px] text-[#A04B3C] font-semibold mt-2">{error}</p>}
            
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-[var(--text-secondary)] font-medium">
              <span className="font-bold text-[var(--text-muted)]">Suggested prompts:</span>
              <button
                onClick={() => {
                  setQuery('Site a battery factory in Travis County, TX and Shelby County, TN');
                  handleSearch('Site a battery factory in Travis County, TX and Shelby County, TN');
                }}
                className="hover:text-[var(--accent)] hover:underline transition-colors cursor-pointer"
              >
                Battery Gigafactory (TX & TN)
              </button>
              <span className="opacity-30">·</span>
              <button
                onClick={() => {
                  setQuery('Compare warehouse sites in Dallas County, TX and Memphis, TN');
                  handleSearch('Compare warehouse sites in Dallas County, TX and Memphis, TN');
                }}
                className="hover:text-[var(--accent)] hover:underline transition-colors cursor-pointer"
              >
                Logistics Warehouse (TX & TN)
              </button>
              <span className="opacity-30">·</span>
              <button
                onClick={() => {
                  setQuery('Solar farm in Franklin County, OH and Pickaway County, OH');
                  handleSearch('Solar farm in Franklin County, OH and Pickaway County, OH');
                }}
                className="hover:text-[var(--accent)] hover:underline transition-colors cursor-pointer"
              >
                Solar Farm (OH)
              </button>
            </div>
          </div>

          <div className="w-full">
            <PhoneSimulator />
          </div>
        </section>

        <section id="simulator" className="border-t border-[var(--border)] py-20 bg-[var(--bg-soft)]/30 sr">
          <div className="max-w-[1100px] mx-auto px-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Agentic Feasibility Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-[var(--text-primary)] leading-tight font-sans">
              Watch Atlas AI <span className="text-[var(--accent)]">Score Siting Proposals</span>
            </h2>
            <p className="text-[13.5px] text-[var(--text-secondary)] mt-3.5 max-w-[480px] mx-auto leading-relaxed">
              Observe the live audit traces in the console panel to follow parallel geocoding, Mireye API queries, and scoring constraints in real-time.
            </p>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-[var(--border)] py-24 sr">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-16 animate-fadeIn">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                Campaign Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-[var(--text-primary)] leading-tight font-sans">
                From Prompt to <span className="text-[var(--accent)]">Citable Feasibility Report</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {[
                { 
                  step: "01", 
                  title: "Parameterize Intent", 
                  desc: "Describe what you want to site. Atlas AI auto-configures custom weights for power voltage, flood exposure, rail spurs, and terrain slopes.",
                  icon: <Sliders className="w-5 h-5 text-[var(--accent)]" />
                },
                { 
                  step: "02", 
                  title: "Harvest Coordinate Layers", 
                  desc: "Atlas geocodes your candidate addresses and dispatches parallel requests to Mireye to gather verified EPA, FEMA, and USGS datasets.",
                  icon: <Layers className="w-5 h-5 text-[var(--accent)]" />
                },
                { 
                  step: "03", 
                  title: "Rank & Refine Siting", 
                  desc: "Atlas outputs a suitability score, flags environmental constraints, and suggests nearby geographical shifts to bypass floodplain bounds.",
                  icon: <CheckCircle className="w-5 h-5 text-[var(--accent)]" />
                }
              ].map((obj) => (
                <div 
                  key={obj.step} 
                  className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/50 p-8 rounded-2xl flex flex-col justify-between min-h-[230px] shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden cursor-default"
                >
                  {/* Subtle top corner gradient on hover */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(74,107,78,0.06),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-full border border-[var(--border)] group-hover:border-[var(--accent)]/30 flex items-center justify-center text-[12px] font-mono font-bold bg-[var(--bg)] text-[var(--accent)] group-hover:bg-[var(--accent)]/5 transition-all duration-300 shadow-sm">
                      {obj.step}
                    </span>
                    <div className="p-2 rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] group-hover:border-[var(--accent)]/20 transition-all duration-300">
                      {obj.icon}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-[15px] font-extrabold text-[var(--text-primary)] tracking-tight group-hover:text-[var(--accent)] transition-colors duration-200">
                      {obj.title}
                    </h4>
                    <p className="text-[12.5px] text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                      {obj.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-[var(--border)] py-24 bg-[var(--bg-soft)]/20 sr">
          <div className="max-w-[1100px] mx-auto px-6 animate-fadeIn">
            
            {/* Redesigned Section Header */}
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                Cognitive Signals
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-[var(--text-primary)] leading-tight font-sans">
                Built for <span className="text-[var(--accent)]">High-Stakes Decisions</span>
              </h2>
              <p className="text-[13.5px] text-[var(--text-secondary)] mt-2.5 max-w-[420px] mx-auto leading-relaxed">
                Click any panel below to expand primary feasibility indicators and logic checks.
              </p>
            </div>

            {/* Redesigned Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURES.map((feat, idx) => {
                const isExpanded = expandedFeature === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setExpandedFeature(isExpanded ? null : idx)}
                    className={`bg-[var(--surface)] border rounded-2xl p-7 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                      isExpanded 
                        ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/20' 
                        : 'border-[var(--border)] hover:border-[var(--accent)]/40'
                    }`}
                  >
                    {/* Subtle top corner ambient glow */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[radial-gradient(circle_at_top_right,rgba(74,107,78,0.04),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div>
                      {/* Stylized Icon Container */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-11 h-11 rounded-xl bg-[var(--bg-soft)] border border-[var(--border)] group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/5 flex items-center justify-center transition-all duration-300 shadow-sm">
                          {feat.icon}
                        </div>
                        {/* Rotating indicator chevron */}
                        <div className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors duration-200">
                          <span className={`text-[10px] uppercase font-bold tracking-wider mr-1.5 select-none ${isExpanded ? 'opacity-100' : 'opacity-40'}`}>
                            {isExpanded ? 'Close' : 'Details'}
                          </span>
                          <span className={`inline-block transition-transform duration-300 font-mono font-bold ${isExpanded ? 'rotate-90 text-[var(--accent)]' : ''}`}>
                            →
                          </span>
                        </div>
                      </div>

                      <h3 className="text-[15px] font-extrabold text-[var(--text-primary)] tracking-tight group-hover:text-[var(--accent)] transition-colors duration-200">
                        {feat.title}
                      </h3>
                      <p className="text-[12.5px] text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[var(--border)] pt-4 mt-6 text-[12px] text-[var(--text-secondary)] bg-[var(--bg-soft)] p-4 rounded-xl leading-relaxed animate-fadeIn">
                        <span className="text-[9px] uppercase font-bold text-[var(--accent)] tracking-wider block mb-1.5">
                          Methodology & Resolution
                        </span>
                        {feat.details}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="metrics" ref={metricsRef} className="border-t border-b border-[var(--border)] py-20 bg-[var(--bg-soft)]/20 relative overflow-hidden">
          <div className="max-w-[1100px] mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
              {[
                { target: 170, suffix: "+", label: "Location Layers Analyzed", sub: "Terrain, Grid, Wetlands, FEMA, Hazards" },
                { target: 4, suffix: "s", label: "Siting Report Latency", sub: "Parallel geocoding & harvesting pipelines" },
                { target: 98, suffix: "%", label: "Dataset Integrity Score", sub: "Grounded in primary federal resources" },
                { target: 92, suffix: "%", label: "Fewer Feasibility Bottlenecks", sub: "Autonomously flags siting constraints" }
              ].map((met, i) => (
                <div 
                  key={i} 
                  className="text-center group flex flex-col justify-between h-full px-4 relative border-r last:border-r-0 border-[var(--border)]/70 md:border-r"
                  style={{ borderRightWidth: i === 3 ? 0 : undefined }}
                >
                  <div className="transition-transform duration-300 group-hover:-translate-y-1">
                    {/* Centered big counter value */}
                    <div className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-300 tracking-tighter">
                      {metricValues[i]}
                      <span className="text-[18px] font-extrabold text-[var(--text-muted)] ml-0.5 align-baseline">{met.suffix}</span>
                    </div>

                    <div className="text-[13px] font-extrabold text-[var(--text-primary)] mt-3 leading-snug tracking-tight">
                      {met.label}
                    </div>
                  </div>

                  <div className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed max-w-[180px] mx-auto">
                    {met.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="waitlist" className="border-t border-[var(--border)] py-24 bg-[var(--bg-soft)]/30 sr">
          <div className="max-w-[1100px] mx-auto px-6 text-center">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                Interactive Campaign Designer
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-[var(--text-primary)] leading-tight font-sans">
                Build & <span className="text-[var(--accent)]">Simulate Feasibility Scenarios</span>
              </h2>
            </div>
            <div className="flex justify-center">
              <ReportBuilderModal />
            </div>
          </div>
        </section>
      </main>

      {/* Large Premium Rounded Atlas AI Logo Mark before Footer */}
      <div className="py-20 flex flex-col items-center justify-center bg-[var(--bg)] border-t border-[var(--border)] relative overflow-hidden select-none">
        {/* Topography vector details */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-muted) 1.2px, transparent 0)', backgroundSize: '16px 16px' }} />

        {/* Large Rounded Logo Emblem */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-md flex items-center justify-center relative group transition-all duration-500 hover:scale-105 hover:border-[var(--accent)]/55 overflow-hidden">
          {/* Subtle concentric circles backdrop inside emblem */}
          <div className="absolute inset-2 border border-dashed border-[var(--border)] rounded-full opacity-60" />
          <div className="absolute inset-6 border border-[var(--border)]/30 rounded-full" />
          
          {/* Pulsing center green light */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <svg className="w-10 h-10 text-[var(--accent)] relative z-10 transition-transform duration-700 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
            <path d="M12 2v20M2 12h20" strokeWidth="0.5" opacity="0.4" />
            <circle cx="12" cy="12" r="4.5" className="fill-[var(--accent)]/10 stroke-[var(--accent)]" />
            <circle cx="12" cy="12" r="1.5" className="fill-[var(--accent)]" />
          </svg>
        </div>

        {/* Dynamic Logo Title */}
        <span className="text-[22px] sm:text-[26px] font-black tracking-[0.2em] text-[var(--text-primary)] uppercase text-center mt-5 font-sans">
          ATLAS.AI
        </span>
        <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase mt-1">
          geospatial intelligence platform
        </span>
      </div>

      <footer className="border-t border-[var(--border)] py-8 bg-[var(--bg)]">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[12px] text-[var(--text-muted)] font-medium">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
            © {new Date().getFullYear()} Atlas AI, Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/projects" className="hover:text-[var(--text-primary)] transition-colors">Workspace</Link>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-default">Privacy</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-default">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
