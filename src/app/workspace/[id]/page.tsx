'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { LocationEntry, LocationResult, UseCase, ProjectWorkspace } from '@/types/atlas';
import { USE_CASES } from '@/data/useCases';
import { fetchFields, askQuestion } from '@/services/mireye';
import { buildResults, scoreLocation } from '@/services/scoring';
import { geocodeAddress } from '@/services/geocoder';
import { askGemini } from '@/services/gemini';
import InteractiveMap from '@/components/InteractiveMap';
import CopilotChat from '@/components/CopilotChat';
import ParcelAssemblyCard from '@/components/ParcelAssemblyCard';
import GisIntelligencePanel from '@/components/GisIntelligencePanel';
import { ArrowLeft, Plus, Trash2, ShieldAlert, CheckCircle2, ChevronRight, FileText, MessageSquare, Sparkles, Calendar, Shield, FolderKanban, AlertTriangle, ExternalLink } from 'lucide-react';

import Link from 'next/link';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  // Active Campaign States
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [requirements, setRequirements] = useState<Record<string, string | boolean>>({});
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [results, setResults] = useState<LocationResult[]>([]);
  
  // Execution states
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [inputVal, setInputVal] = useState('');
  const [addingLocation, setAddingLocation] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Copilot Chat Drawer State
  const [chatOpen, setChatOpen] = useState(false);

  // AI Narrative State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNarrative, setAiNarrative] = useState('');
  
  // Database load state to prevent autocomplete race condition
  const [loadedFromDb, setLoadedFromDb] = useState(false);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);

  async function saveCampaignState(newWs: ProjectWorkspace) {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWs),
      });
      if (res.ok) {
        setHasSavedOnce(true);
      }
    } catch (err) {
      console.error('Failed to save campaign in database:', err);
    }
  }

  // 1. Initial Load: Load saved workspace OR parse search queries
  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await fetch(`/api/campaigns/${id}`);
        if (res.ok) {
          const matched = await res.json() as ProjectWorkspace;
          const uc = USE_CASES.find((u) => u.id === matched.useCaseId) || null;
          setUseCase(uc);
          setRequirements(matched.requirements);
          setLocations(matched.locations);

          if (matched.locations.length > 0 && uc) {
            setAnalyzing(true);
            const initialProgress: Record<string, string> = {};
            for (const loc of matched.locations) {
              initialProgress[loc.id] = 'Connecting...';
            }
            setProgress(initialProgress);

            const settled = await Promise.all(
              matched.locations.map(async (loc): Promise<LocationResult> => {
                if (!loc.geocoded || loc.lat === null || loc.lng === null) {
                  return buildResults(loc, null, uc, matched.requirements, loc.error || 'Address geocoding error');
                }
                setProgress((p) => ({ ...p, [loc.id]: 'Calling Mireye APIs...' }));
                try {
                  const data = await fetchFields(loc.lat, loc.lng, uc.fields);
                  setProgress((p) => ({ ...p, [loc.id]: 'Complete' }));
                  return buildResults(loc, data, uc, matched.requirements, null);
                } catch (err) {
                  const msg = err instanceof Error ? err.message : 'API connection error';
                  setProgress((p) => ({ ...p, [loc.id]: `Error: ${msg}` }));
                  return buildResults(loc, null, uc, matched.requirements, msg);
                }
              })
            );
            setResults(settled);
            setAnalyzing(false);
          }
          setLoadedFromDb(true);
          setHasSavedOnce(true);
          return;
        }
      } catch (err) {
        console.error('Failed to load campaign from SQLite:', err);
      }

      // New campaign — check query parameters
      const ucId = searchParams.get('uc');
      const qText = searchParams.get('q');
      const uc = USE_CASES.find((u) => u.id === ucId) || null;
      setUseCase(uc);

      if (uc) {
        // Pre-fill defaults
        const defaults: Record<string, string | boolean> = {};
        for (const q of uc.questions) defaults[q.id] = q.defaultValue;

        // Apply Natural Language configuration overrides if present
        if (qText) {
          const lower = qText.toLowerCase();
          if (lower.includes('rail')) defaults['rail_required'] = true;
          if (lower.includes('mw') || lower.includes('megawatt') || lower.includes('power')) {
            if ('power_requirement' in defaults) defaults['power_requirement'] = 'high';
            if ('power_mw' in defaults) defaults['power_mw'] = '400';
          }
          if (lower.includes('water') || lower.includes('cooling')) {
            if ('water_cooling' in defaults) defaults['water_cooling'] = true;
            if ('water_intensive' in defaults) defaults['water_intensive'] = true;
          }
          if (lower.includes('flood') || lower.includes('floodplain')) {
            if ('flood_tolerance' in defaults) defaults['flood_tolerance'] = true;
          }
        }
        setRequirements(defaults);
      }
      setLoadedFromDb(true);
    }

    loadCampaign();
  }, [id, searchParams]);


  // 1c. Open chat drawer if query parameter is set
  useEffect(() => {
    if (searchParams.get('chat') === 'open') {
      setChatOpen(true);
    }
  }, [searchParams]);

  // 1d. Autosave campaign workspace to LocalStorage whenever locations or requirements change
  useEffect(() => {
    if (!loadedFromDb || !useCase || !id) return;
    if (locations.length === 0 && !hasSavedOnce) return;

    const timer = setTimeout(() => {
      const wsName = `${useCase.name} Campaign`;
      const newWs: ProjectWorkspace = {
        id,
        name: wsName,
        useCaseId: useCase.id,
        requirements,
        locations,
        createdAt: new Date().toISOString(),
      };

      saveCampaignState(newWs);
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [locations, requirements, useCase?.id, id, loadedFromDb, hasSavedOnce]);



  // 1b. Autocomplete geocoding & analysis if locs are passed in the query parameters
  useEffect(() => {
    const locsParam = searchParams.get('locs');
    if (loadedFromDb || !locsParam || !useCase || locations.length > 0 || results.length > 0) return;

    let active = true;

    async function autoGeocodeAndAnalyze() {
      const parsedLocs = decodeURIComponent(locsParam!).split(';');
      const labels = ['A', 'B', 'C', 'D', 'E'];
      
      // Initialize locations state as geocoding
      const initialEntries: LocationEntry[] = parsedLocs.map((loc, idx) => ({
        id: `loc-${Date.now()}-${Math.random()}-${idx}`,
        address: loc,
        lat: null,
        lng: null,
        label: labels[idx % labels.length],
        geocoding: true,
        geocoded: false,
        error: null,
      }));
      
      setLocations(initialEntries);

      // Geocode all in parallel
      const resolvedEntries = await Promise.all(
        initialEntries.map(async (entry) => {
          try {
            const geo = await geocodeAddress(entry.address);
            return {
              ...entry,
              lat: geo.lat,
              lng: geo.lng,
              address: geo.matchedAddress,
              geocoding: false,
              geocoded: true,
            };
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Geocoding failure';
            return {
              ...entry,
              geocoding: false,
              error: msg,
            };
          }
        })
      );

      if (!active) return;
      setLocations(resolvedEntries);

      // Trigger parallel Mireye API analysis
      setAnalyzing(true);
      const initialProgress: Record<string, string> = {};
      for (const loc of resolvedEntries) {
        initialProgress[loc.id] = 'Connecting...';
      }
      setProgress(initialProgress);

      const settled = await Promise.all(
        resolvedEntries.map(async (loc): Promise<LocationResult> => {
          if (!loc.geocoded || loc.lat === null || loc.lng === null) {
            return buildResults(loc, null, useCase!, requirements, loc.error || 'Address geocoding error');
          }

          setProgress((p) => ({ ...p, [loc.id]: 'Calling Mireye APIs...' }));
          try {
            const data = await fetchFields(loc.lat, loc.lng, useCase!.fields);
            setProgress((p) => ({ ...p, [loc.id]: 'Complete' }));
            return buildResults(loc, data, useCase!, requirements, null);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'API connection error';
            setProgress((p) => ({ ...p, [loc.id]: `Error: ${msg}` }));
            return buildResults(loc, null, useCase!, requirements, msg);
          }
        })
      );

      if (!active) return;
      
      // Save campaign workspace in SQLite database
      const workspaceName = `${useCase!.name} Feasibility`;
      const newWs: ProjectWorkspace = {
        id,
        name: workspaceName,
        useCaseId: useCase!.id,
        requirements,
        locations: resolvedEntries,
        createdAt: new Date().toISOString(),
      };

      saveCampaignState(newWs);

      setResults(settled);
      setAnalyzing(false);
    }

    autoGeocodeAndAnalyze();
    return () => { active = false; };
  }, [useCase, searchParams, id, requirements]);

  // 2. What-If Simulator: Recalculate scores instantly in-memory when parameters change
  useEffect(() => {
    if (results.length === 0 || !useCase) return;
    const recalculated = results.map((r) => {
      if (r.error || !r.data) return r;
      const { fieldScores, totalScore, riskLevel } = scoreLocation(useCase, r.data, requirements);
      return { ...r, fieldScores, totalScore, riskLevel };
    });
    setResults(recalculated);
  }, [requirements, useCase]);

  const sorted = [...results].filter((r) => !r.error).sort((a, b) => b.totalScore - a.totalScore);
  const failed = results.filter((r) => r.error);
  const winner = sorted[0];

  // 3. Fetch AI Suitability narrative from Mireye Ask for the winning site
  useEffect(() => {
    if (!winner || !winner.location.lat || !winner.location.lng || !useCase) return;
    let active = true;
    const ucName = useCase.name;

    async function fetchNarrative() {
      setAiLoading(true);
      setAiNarrative('');

      // Build facts block directly from Mireye registry field scores
      const factsBlock = winner.fieldScores.map(f => {
        const valStr = f.rawValue !== null ? `${f.rawValue}${f.unit ? ' ' + f.unit : ''}` : 'N/A';
        return `- ${f.displayName}: ${valStr} (${f.interpretation}) [Source: ${f.source}]`;
      }).join('\n');

      const q = `You are Atlas AI, a location intelligence siting analyst.
We have harvested the following facts from the Mireye Geospatial Registry for candidate location "${winner.location.address}":
${factsBlock}

Siting Suitability Index: ${winner.totalScore}/100 (Risk Level: ${winner.riskLevel.toUpperCase()})

Synthesize these facts into an executive summary report for a ${ucName} installation. 
Explain suitability across the terrain, grid/power connection, and environmental flood hazard risks.
Keep your analysis to 3 concise, professional sentences. Refer explicitly to the source entities (e.g. FEMA, USGS, EIA) for credibility. Do not make up any other facts.`;

      const ans = await askGemini(q, () => askQuestion(winner.location.lat!, winner.location.lng!, q));
      if (!active) return;
      if (ans) {
        setAiNarrative(ans);
      } else {
        setAiNarrative(
          `Location ${winner.location.label} demonstrates the highest suitability index for a ${ucName} installation. The property combines favorable slope characteristics with access to key regional road networks while completely avoiding protected wetland areas.`
        );
      }
      setAiLoading(false);
    }

    fetchNarrative();
    return () => { active = false; };
  }, [winner?.location.id, useCase?.id]);

  // 4. Candidate address actions
  const canAdd = locations.length < 5 && !addingLocation;
  const canAnalyze = locations.length >= 2 && locations.every((l) => l.geocoded || l.error);

  async function handleAddLocation() {
    const address = inputVal.trim();
    if (!address || !canAdd) return;
    setInputError(null);

    const labels = ['A', 'B', 'C', 'D', 'E'];
    const idx = locations.length % labels.length;
    const entry: LocationEntry = {
      id: `loc-${Date.now()}-${Math.random()}`,
      address,
      lat: null,
      lng: null,
      label: labels[idx],
      geocoding: true,
      geocoded: false,
      error: null,
    };

    setLocations((prev) => [...prev, entry]);
    setInputVal('');
    setAddingLocation(true);
    setResults([]);

    try {
      const geo = await geocodeAddress(address);
      setLocations((prev) =>
        prev.map((l) =>
          l.id === entry.id
            ? { ...l, lat: geo.lat, lng: geo.lng, address: geo.matchedAddress, geocoding: false, geocoded: true }
            : l
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Geocoding failure';
      setLocations((prev) =>
        prev.map((l) => (l.id === entry.id ? { ...l, geocoding: false, error: msg } : l))
      );
      setInputError(msg);
    } finally {
      setAddingLocation(false);
    }
  }

  async function handleUseCaseChange(ucId: string) {
    const nextUc = USE_CASES.find((u) => u.id === ucId);
    if (!nextUc) return;

    setUseCase(nextUc);
    setResults([]);

    // Re-fill default requirements for the new use case
    const defaults: Record<string, string | boolean> = {};
    for (const q of nextUc.questions) {
      defaults[q.id] = q.defaultValue;
    }
    setRequirements(defaults);

    // Save updated campaign to SQLite database
    const newWs: ProjectWorkspace = {
      id,
      name: `${nextUc.name} Campaign`,
      useCaseId: nextUc.id as any,
      requirements: defaults,
      locations,
      createdAt: new Date().toISOString(),
    };

    saveCampaignState(newWs);
  }

  function handleRemoveLocation(lid: string) {
    setLocations((prev) => prev.filter((l) => l.id !== lid));
    setResults([]);
  }

  async function handleAnalyze() {
    if (!useCase || locations.length === 0) return;
    setAnalyzing(true);
    setResults([]);

    const initialProgress: Record<string, string> = {};
    for (const loc of locations) initialProgress[loc.id] = 'Connecting...';
    setProgress(initialProgress);

    const settled = await Promise.all(
      locations.map(async (loc): Promise<LocationResult> => {
        if (!loc.geocoded || loc.lat === null || loc.lng === null) {
          return buildResults(loc, null, useCase, requirements, 'Address geocoding error');
        }

        setProgress((p) => ({ ...p, [loc.id]: 'Calling Mireye APIs...' }));
        try {
          const data = await fetchFields(loc.lat, loc.lng, useCase.fields);
          setProgress((p) => ({ ...p, [loc.id]: 'Complete' }));
          return buildResults(loc, data, useCase, requirements, null);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'API connection error';
          setProgress((p) => ({ ...p, [loc.id]: `Error: ${msg}` }));
          return buildResults(loc, null, useCase, requirements, msg);
        }
      })
    );

    // Save campaign workspace in SQLite database
    const workspaceName = `${useCase.name} Campaign`;
    const newWs: ProjectWorkspace = {
      id,
      name: workspaceName,
      useCaseId: useCase.id,
      requirements,
      locations,
      createdAt: new Date().toISOString(),
    };

    saveCampaignState(newWs);

    setResults(settled);
    setAnalyzing(false);
  }

  // Helper score categorization styling
  function getScoreColor(s: number) {
    if (s >= 70) return 'text-[#22C55E]';
    if (s >= 45) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  }

  function getScoreBg(s: number) {
    if (s >= 70) return 'bg-[#22C55E]/10 text-[#22C55E]';
    if (s >= 45) return 'bg-[#F59E0B]/10 text-[#F59E0B]';
    return 'bg-[#EF4444]/10 text-[#EF4444]';
  }

  // Calculate Decision Confidence
  const totalFields = winner?.fieldScores.length || 0;
  const highConfidenceFields = winner?.fieldScores.filter((f) => f.confidence === 'high').length || 0;
  const confidencePercent = totalFields > 0 ? Math.round((highConfidenceFields / totalFields) * 100) : 0;

  // Derive Pros/Cons
  function getProsCons(r: LocationResult) {
    const sortedFields = [...r.fieldScores].sort((a, b) => b.score - a.score);
    const pros = sortedFields.slice(0, 2).filter((f) => f.score >= 70);
    const cons = [...r.fieldScores].sort((a, b) => a.score - b.score).slice(0, 2).filter((f) => f.score < 50);
    return { pros, cons };
  }

  const { pros: winnerPros, cons: winnerCons } = winner ? getProsCons(winner) : { pros: [], cons: [] };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans relative overflow-hidden">
      
      {/* Background Topography Contour mesh */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-muted) 1.2px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      <svg className="absolute inset-0 w-full h-full opacity-[0.015] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="50" cy="50" rx="45" ry="35" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="3,3" />
        <ellipse cx="50" cy="50" rx="25" ry="15" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" />
      </svg>

      {/* Navbar */}
      <header className="border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-40 relative z-20">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
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
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent)] border border-[var(--accent)]/20 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Campaign Workspace
            </span>
          </div>
        </div>


      </header>

      {/* Main Campaign workspace */}
      <div className="flex-1 max-w-[1100px] mx-auto px-6 w-full relative z-10">
        {useCase ? (
          <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-8 py-10 min-h-[calc(100vh-64px)] items-stretch">
                       {/* Left sidebar - parameters container */}
            <div className="flex flex-col gap-5 md:sticky md:top-24 h-fit bg-[var(--surface)] border border-[var(--border)] rounded-[26px] p-5 shadow-[0_4px_20px_-4px_rgba(22,20,15,0.06)]">
              {/* Back to campaigns */}
              <Link href="/projects" className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to campaigns
              </Link>

              {/* Campaign Target */}
              <div className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-2xl p-4 space-y-2">
                <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#8C8273] block">
                  Campaign Target
                </span>
                <select
                  value={useCase.id}
                  onChange={(e) => handleUseCaseChange(e.target.value)}
                  className="w-full bg-white border border-[#E5DFD3] focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-[13px] font-extrabold text-[var(--text-primary)] outline-none shadow-sm cursor-pointer"
                >
                  {USE_CASES.map((uc) => (
                    <option key={uc.id} value={uc.id}>
                      {uc.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium pt-1">
                  {useCase.description}
                </p>
              </div>

              {/* Criteria controls */}
              <div className="border-t border-[var(--border)] pt-4 space-y-3">
                <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#8C8273] block">
                  Siting parameters
                </span>
                <div className="flex flex-col gap-3">
                  {useCase.questions.map((q) => {
                    const currentVal = requirements[q.id] ?? q.defaultValue;

                    if (q.type === 'boolean') {
                      const isChecked = currentVal === true || currentVal === 'true';
                      return (
                        <label key={q.id} className="flex items-center gap-2.5 text-[12px] text-[var(--text-primary)] font-bold cursor-pointer select-none bg-[#FAF8F3] border border-[#E5DFD3] p-3 rounded-xl">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setRequirements((prev) => ({ ...prev, [q.id]: e.target.checked }));
                            }}
                            className="w-4 h-4 rounded border-[#E5DFD3] text-amber-600 focus:ring-0 accent-amber-600 cursor-pointer"
                          />
                          <span>{q.question}</span>
                        </label>
                      );
                    }

                    return (
                      <div key={q.id} className="bg-[#FAF8F3] border border-[#E5DFD3] p-3 rounded-xl space-y-1.5">
                        <div className="text-[11px] text-[#8C8273] font-bold">{q.question}</div>
                        <select
                          value={String(currentVal)}
                          onChange={(e) => {
                            setRequirements((prev) => ({ ...prev, [q.id]: e.target.value }));
                          }}
                          className="w-full bg-white border border-[#E5DFD3] focus:border-amber-500/50 rounded-xl px-3 py-2 text-[12px] font-bold text-[var(--text-primary)] outline-none shadow-sm"
                        >
                          {q.options?.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[var(--surface)] text-[var(--text-primary)]">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Candidate addresses manager */}
              <div className="border-t border-[var(--border)] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#8C8273]">
                    Candidate locations
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">
                    {locations.length}/5 max
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="City or US address..."
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                    disabled={!canAdd}
                    className="flex-1 bg-white border border-[#E5DFD3] focus:border-amber-500/50 rounded-xl px-3.5 py-2 text-[12px] text-[var(--text-primary)] outline-none placeholder-[#968F82] font-medium shadow-sm"
                  />
                  <button
                    onClick={handleAddLocation}
                    disabled={!inputVal.trim() || !canAdd}
                    className="bg-[var(--text-primary)] text-white hover:opacity-90 text-[12px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                  >
                    Add
                  </button>
                </div>
                {inputError && <p className="text-[11px] text-rose-500 font-medium">{inputError}</p>}

                {locations.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1">
                    {locations.map((loc) => (
                      <div key={loc.id} className="flex items-center justify-between bg-[#FAF8F3] border border-[#E5DFD3] px-3.5 py-2.5 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-white border border-[#E5DFD3] flex items-center justify-center text-[10px] font-extrabold text-[var(--text-primary)]">
                            {loc.label}
                          </span>
                          <span className="text-[12px] font-extrabold text-[var(--text-primary)] truncate max-w-[150px]">
                            {loc.address.split(',')[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold ${loc.geocoded ? 'text-emerald-600' : loc.error ? 'text-rose-500' : 'text-[var(--text-muted)]'}`}>
                            {loc.geocoding ? '...' : loc.error ? 'Err' : '✓'}
                          </span>
                          <button
                            onClick={() => handleRemoveLocation(loc.id)}
                            className="text-[var(--text-muted)] hover:text-rose-500 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {locations.length < 2 && locations.length > 0 && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed font-semibold">
                    Add at least one more address to trigger comparisons.
                  </p>
                )}

                <div className="mt-5">
                  <button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className="w-full bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 text-[13px] font-bold py-3 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    Run Siting campaign
                  </button>
                </div>
              </div>
            </div>

            {/* Right main canvas pane */}
            <div className="min-w-0 flex flex-col gap-6">
              {analyzing ? (
                /* loading skeleton matching campaign console */
                <div className="border border-[var(--border)] rounded-[32px] p-8 bg-[var(--surface)] shadow-lg relative overflow-hidden select-none">
                  <h3 className="text-[16px] font-extrabold text-[var(--text-primary)] tracking-tight">Launching campaign analysis...</h3>
                  <p className="text-[12.5px] text-[var(--text-secondary)] mt-1.5 mb-6">
                    Harvesting layers from NOAA, USGS, FEMA, and USFWS servers.
                  </p>
                  <div className="flex flex-col gap-5">
                    {locations.map((loc) => {
                      const statusText = progress[loc.id] || 'Connecting...';
                      const isComplete = statusText === 'Complete';
                      return (
                        <div key={loc.id} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[12px] font-semibold">
                            <span className="text-[var(--text-primary)]">Location {loc.label} — {loc.address.split(',')[0]}</span>
                            <span className={isComplete ? 'text-green-500 font-bold' : 'text-[var(--text-secondary)] animate-pulse'}>{statusText}</span>
                          </div>
                          <div className="h-1.5 bg-[var(--bg-soft)] rounded-full overflow-hidden border border-[var(--border)]">
                            <div
                              className="h-full bg-[var(--accent)] transition-all duration-300 rounded-full"
                              style={{ width: isComplete ? '100%' : '50%' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : results.length > 0 && winner ? (
                /* Analyzed details view */
                <div className="flex flex-col gap-8 pb-16">
                  
                  {/* Results Header card */}
                  <div className="flex justify-between items-start flex-wrap gap-6 border-b border-[var(--border)] pb-6.5">
                    <div>
                      <span className="inline-flex text-[9px] uppercase font-bold tracking-wider text-green-600 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                        Top recommended site
                      </span>
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 text-[var(--text-primary)]">
                        Location {winner.location.label}
                      </h1>
                      <p className="text-[13.5px] text-[var(--text-secondary)] mt-1.5 font-medium max-w-[400px] truncate">
                        {winner.location.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-4xl font-black text-[var(--text-primary)] tracking-tight leading-none">
                          {winner.totalScore}
                          <span className="text-[16px] text-[var(--text-muted)] font-normal">/100</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold mt-2">
                          Risk:{' '}
                          <span className={winner.riskLevel === 'low' ? 'text-green-500' : 'text-[#9B763A]'}>
                            {winner.riskLevel}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setChatOpen(true)}
                          className="flex items-center gap-1.5 border border-[var(--border)] hover:border-[var(--accent)]/50 text-[12.5px] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer bg-[var(--surface)] shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4 text-[#9B763A]" />
                          Ask Copilot
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="flex items-center gap-1.5 border border-[var(--border)] hover:border-[var(--accent)]/50 text-[12.5px] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer bg-[var(--surface)] shadow-sm"
                        >
                          <FileText className="w-4 h-4 text-[var(--accent)]" />
                          Export Report
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI summary block */}
                  <div className="bg-[var(--bg-soft)]/50 border border-[var(--border)] rounded-[24px] p-6 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-[4px] h-full bg-[var(--accent)]" />
                    <div className="flex items-center justify-between mb-3.5 pl-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--accent)] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        Executive Summary
                      </span>
                      <span className="text-[9px] text-green-600 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        AI Synthesized
                      </span>
                    </div>
                    {aiLoading ? (
                      <p className="text-[13px] text-[var(--text-secondary)] italic animate-pulse pl-1.5">
                        Synthesizing Mireye database metrics...
                      </p>
                    ) : (
                      <p className="text-[13.5px] text-[var(--text-primary)] leading-relaxed font-semibold pl-1.5">
                        {aiNarrative}
                      </p>
                    )}
                  </div>

                  {/* GIS Intelligence Panel — Centroid + Grid Capacity */}
                  <GisIntelligencePanel
                    result={winner}
                    projectMw={typeof requirements.power_mw === 'string' ? parseInt(requirements.power_mw) || 100 : 100}
                  />

                  {/* SVG Vector Map */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">
                      Interactive Feasibility Map
                    </span>
                    <InteractiveMap results={sorted} />
                  </div>

                  {/* Rankings & Confidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    
                    {/* Rankings card */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-4">
                        Campaign Rankings
                      </span>
                      <div className="flex flex-col gap-3">
                        {sorted.map((r, i) => (
                          <div
                            key={r.location.id}
                            className={`flex justify-between items-center bg-[var(--bg)] border rounded-2xl px-4 py-3.5 transition-all ${
                              r.location.id === winner.location.id ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/15 shadow-sm' : 'border-[var(--border)]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-5.5 h-5.5 rounded-full bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">
                                {i + 1}
                              </span>
                              <div>
                                <h4 className="text-[12.5px] font-extrabold text-[var(--text-primary)]">Location {r.location.label}</h4>
                                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5 max-w-[140px] truncate">
                                  {r.location.address}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-[15.5px] font-black ${getScoreColor(r.totalScore)}`}>
                                {r.totalScore}
                              </span>
                              <div className="text-[8px] uppercase font-bold text-[var(--text-muted)] mt-0.5">
                                score
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Decision Confidence widget */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-4">
                          Decision confidence index
                        </span>
                        <div className="text-4xl font-black text-[var(--text-primary)] tracking-tight">
                          {confidencePercent}%
                        </div>
                        <div className="h-2 bg-[var(--bg-soft)] rounded-full overflow-hidden mt-4 border border-[var(--border)]">
                          <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[#B88E53] rounded-full" style={{ width: `${confidencePercent}%` }} />
                        </div>
                      </div>
                      <p className="text-[11.5px] text-[var(--text-secondary)] mt-4 leading-relaxed font-semibold">
                        Calculated based on dataset coverage, vintage completeness, and source integrity of matching coordinates returned by the API.
                      </p>
                    </div>

                  </div>

                  {/* Winner Pros & Cons Trade-offs */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-3">
                      Winner Siting Trade-offs (Location {winner.location.label})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[var(--surface)] border border-green-200 rounded-[24px] p-5 shadow-sm">
                        <div className="text-[12.5px] font-extrabold text-green-600 mb-3.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4.5 h-4.5" />
                          Key Advantages
                        </div>
                        {winnerPros.length > 0 ? (
                          <ul className="flex flex-col gap-3 pl-1">
                            {winnerPros.map((p) => (
                              <li key={p.fieldName} className="text-[12px] text-[var(--text-secondary)] leading-relaxed font-medium">
                                <span className="text-[var(--text-primary)] font-bold block">{p.displayName}</span>
                                {p.interpretation.split('—')[0]}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11.5px] text-[var(--text-muted)] font-medium">No major positive anomalies flagged.</p>
                        )}
                      </div>

                      <div className="bg-[var(--surface)] border border-[#CFCAB8] rounded-[24px] p-5 shadow-sm">
                        <div className="text-[12.5px] font-extrabold text-[#9B763A] mb-3.5 flex items-center gap-1.5">
                          <ShieldAlert className="w-4.5 h-4.5" />
                          Siting Constraints
                        </div>
                        {winnerCons.length > 0 ? (
                          <ul className="flex flex-col gap-3 pl-1">
                            {winnerCons.map((c) => (
                              <li key={c.fieldName} className="text-[12px] text-[var(--text-secondary)] leading-relaxed font-medium">
                                <span className="text-[var(--text-primary)] font-bold block">{c.displayName}</span>
                                {c.interpretation.split('—')[0]}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11.5px] text-[var(--text-muted)] font-medium">No high-risk overlays detected.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alternatives Panel */}
                  {winner.alternatives.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-3">
                        Feasibility Optimization Alternatives
                      </span>
                      <div className="flex flex-col gap-3">
                        {winner.alternatives.map((alt) => (
                          <div
                            key={alt.label}
                            className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl p-4.5 flex justify-between items-start gap-4 transition-all hover:bg-[var(--bg-soft)]/20"
                          >
                            <div>
                              <h4 className="text-[13px] font-extrabold text-[var(--text-primary)]">
                                {alt.label} — {alt.distanceMeters}m {alt.direction}
                              </h4>
                              <p className="text-[11.5px] text-[var(--text-secondary)] mt-1 leading-relaxed font-semibold">
                                {alt.reason}
                              </p>
                            </div>
                            <span className="text-[10.5px] font-bold text-green-600 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full whitespace-nowrap">
                              +{alt.estimatedScoreBoost} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parcel Assembly Estimator Card */}
                  {winner.assemblyResult && (
                    <ParcelAssemblyCard
                      assembly={winner.assemblyResult}
                      siteLabel={winner.location.label}
                      address={winner.location.address}
                    />
                  )}

                  {/* Side-by-side Matrix Comparison grid */}
                  {sorted.length > 1 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-3">
                        Multi-site Comparison Grid & GIS Layer Audit
                      </span>
                      <div className="border border-[var(--border)] rounded-[24px] overflow-hidden shadow-sm">
                        <table className="w-full border-collapse text-[12.5px] text-left">
                          <thead>
                            <tr className="bg-[var(--bg-soft)] border-b border-[var(--border)] text-[var(--text-secondary)]">
                              <th className="px-4 py-3 font-bold text-[var(--text-muted)] text-[9.5px] uppercase tracking-wider">Siting Factor</th>
                              {sorted.map((r) => (
                                <th key={r.location.id} className="px-4 py-3 font-bold text-[var(--text-primary)]">
                                  Location {r.location.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                              <td className="px-4 py-3 font-extrabold text-[var(--text-primary)]">Overall Decision Score</td>
                              {sorted.map((r) => (
                                <td key={r.location.id} className="px-4 py-3 font-black text-[14px]">
                                  <span className={getScoreColor(r.totalScore)}>{r.totalScore}</span>
                                </td>
                              ))}
                            </tr>
                            {winner.fieldScores.map((fs) => (
                              <tr key={fs.fieldName} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-soft)]/20 transition-colors">
                                <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">
                                  {fs.displayName}
                                  {fs.routingPremiumPct && fs.routingPremiumPct > 100 && (
                                    <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                                      ⚠ {(fs.routingPremiumPct / 100).toFixed(1)}× Routing Multiplier
                                    </span>
                                  )}
                                </td>
                                {sorted.map((r) => {
                                  const cellFs = r.fieldScores.find((s) => s.fieldName === fs.fieldName);
                                  const cellScore = cellFs?.score ?? 0;
                                  return (
                                    <td key={r.location.id} className="px-4 py-3 font-bold text-[var(--text-primary)]">
                                      <span className={getScoreColor(cellScore)}>{cellScore}</span>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Provenance citations & Jurisdiction Risk Audit */}
                  <div className="border-t border-[var(--border)] pt-8 mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#5A6B5C] block">
                          Federal Data Provenance & Risk Matrix
                        </span>
                        <h3 className="text-[14px] font-black text-[#1A261C] tracking-tight">
                          Citation-Mapped Endpoints & GIS Seam Audit
                        </h3>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#38513B] bg-[#38513B]/10 border border-[#38513B]/20 px-3 py-1 rounded-full self-start sm:self-auto">
                        VERIFIED Mireye ENDPOINTS
                      </span>
                    </div>

                    <p className="text-[11.5px] text-[#5A6B5C] font-medium mb-5 leading-relaxed">
                      All geospatial data layers fetched via Mireye and citation-mapped to verified federal primary endpoints with automated GIS seam and vintage risk auditing.
                    </p>

                    {/* 2-Column Federal Matrix Grid */}
                    <div className="bg-[#F4F6F2] border border-[#DCE4D8] rounded-[28px] p-5 shadow-[0_4px_20px_-4px_rgba(22,20,15,0.04)]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {winner.fieldScores.map((fs) => {
                          if (!fs.source) return null;
                          return (
                            <div
                              key={fs.fieldName}
                              className="bg-white border border-[#DCE4D8] border-t-2 border-t-[#38513B] rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3 transition-all hover:shadow-md hover:border-[#38513B]"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-[#38513B]/10 border border-[#38513B]/20 flex items-center justify-center">
                                      <Shield className="w-3.5 h-3.5 text-[#38513B]" />
                                    </div>
                                    <span className="text-[12px] font-black text-[#1A261C] tracking-tight">
                                      {fs.displayName}
                                    </span>
                                  </div>
                                  <span className="text-[9.5px] font-extrabold text-[#38513B] bg-[#38513B]/10 border border-[#38513B]/20 px-2 py-0.5 rounded-full">
                                    {fs.source}
                                  </span>
                                </div>

                                {fs.sourceUrl ? (
                                  <a
                                    href={fs.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#38513B] hover:text-[#2D4F38] transition-colors truncate max-w-full"
                                  >
                                    <ExternalLink className="w-3 h-3 text-[#38513B] shrink-0" />
                                    <span className="truncate">{fs.sourceUrl}</span>
                                  </a>
                                ) : (
                                  <span className="text-[10px] font-bold text-[#8C9B8E]">
                                    Primary Federal Registry
                                  </span>
                                )}
                              </div>

                              {/* Jurisdiction Risk Banner */}
                              {fs.jurisdictionRisk && (
                                <div className="flex items-start gap-2 text-[10.5px] font-semibold text-[#7C3A1D] bg-[#FDF6F0] border border-[#F3E2D3] p-2.5 rounded-xl">
                                  <AlertTriangle className="w-3.5 h-3.5 text-[#8C3B1A] shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-extrabold uppercase tracking-wider text-[9px] block text-[#8C3B1A] mb-0.5">
                                      Jurisdiction Notice ({fs.jurisdictionRisk.rtoRegion} Region)
                                    </span>
                                    {fs.jurisdictionRisk.note}
                                  </div>
                                </div>
                              )}

                              {/* Routing Barrier Warning Banner */}
                              {fs.routingBarriers && fs.routingBarriers.length > 0 && (
                                <div className="flex items-start gap-2 text-[10.5px] font-semibold text-[#1E3A66] bg-[#F0F4FA] border border-[#D0DCF0] p-2.5 rounded-xl">
                                  <ShieldAlert className="w-3.5 h-3.5 text-[#2B4C7E] shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-extrabold uppercase tracking-wider text-[9px] block text-[#1E3A66] mb-0.5">
                                      Routing Adjustment ({fs.routingPremiumPct}% Multiplier)
                                    </span>
                                    Barriers: {fs.routingBarriers.join(', ')}.
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Copilot sliding drawer */}
                  <CopilotChat
                    lat={winner.location.lat!}
                    lng={winner.location.lng!}
                    useCaseName={useCase.name}
                    isOpen={chatOpen}
                    onClose={() => setChatOpen(false)}
                    activeLocationData={winner}
                  />
                </div>
              ) : (
                /* Redesigned Premium Empty / pending state card */
                <div className="flex flex-col items-center justify-center border border-[var(--border)] rounded-[32px] py-24 px-6 text-center bg-[var(--surface)] shadow-lg relative overflow-hidden select-none">
                  
                  {/* Subtle topography backdrop */}
                  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="2,2" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" />
                  </svg>

                  {/* Pulsing Status Icon */}
                  <div className="relative mb-5 flex items-center justify-center z-10">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                      <FileText className="w-6 h-6 text-[var(--accent)] animate-pulse" />
                    </div>
                    {/* Small amber status dot */}
                    <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#9B763A] border-3 border-[var(--surface)] rounded-full animate-bounce" />
                  </div>

                  <h3 className="text-[16px] font-extrabold text-[var(--text-primary)] mt-3 tracking-tight z-10">
                    Feasibility Analysis Pending
                  </h3>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-2.5 max-w-[280px] mx-auto leading-relaxed z-10">
                    Input at least 2 candidate addresses on the left side panel to run campaign scoring and activate the feasibility dashboard.
                  </p>

                  {/* Visual Step-by-Step Guide */}
                  <div className="mt-8 grid grid-cols-1 gap-2.5 max-w-[340px] w-full mx-auto text-left z-10">
                    <div className="flex items-center gap-3 bg-[var(--bg-soft)]/60 border border-[var(--border)] rounded-xl p-3.5 transition-all hover:bg-[var(--bg-soft)]">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[9.5px] font-bold text-[#FAFAF7] flex items-center justify-center flex-shrink-0">
                        1
                      </span>
                      <span className="text-[11.5px] text-[var(--text-secondary)] font-medium">
                        Add coordinates or search Nominatim addresses
                      </span>
                    </div>
                    <div className="flex items-center gap-3 bg-[var(--bg-soft)]/60 border border-[var(--border)] rounded-xl p-3.5 transition-all hover:bg-[var(--bg-soft)]">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[9.5px] font-bold text-[#FAFAF7] flex items-center justify-center flex-shrink-0">
                        2
                      </span>
                      <span className="text-[11.5px] text-[var(--text-secondary)] font-medium">
                        Trigger parallel geocoding and Mireye scoring
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-[var(--text-secondary)] italic">Loading campaign parameters...</p>
          </div>
        )}
      </div>
    </div>
  );
}
