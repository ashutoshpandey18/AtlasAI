'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { AwwwardsCursorGlow } from '@/components/AwwwardsCursorGlow';
import { SatelliteRadarSweep } from '@/components/SatelliteRadarSweep';
import { Trash2, ArrowRight, Plus, FolderKanban, ShieldCheck } from 'lucide-react';

interface SavedWorkspace {
  id: string;
  name: string;
  createdAt: string;
  count: number;
}

export default function ProjectsPage() {
  const [workspaces, setWorkspaces] = useState<SavedWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        if (res.ok) {
          const data = await res.json();
          setWorkspaces(Array.isArray(data) ? data : data.campaigns || []);
        }
      } catch (err) {
        console.error('Failed to load campaigns:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  function handleStartNew() {
    router.push('/agent');
  }

  async function handleDeleteAll() {
    if (!confirm('Are you sure you want to delete all saved campaigns?')) return;
    try {
      const res = await fetch('/api/campaigns', { method: 'DELETE' });
      if (res.ok) {
        setWorkspaces([]);
      }
    } catch (err) {
      console.error('Failed to clear campaigns:', err);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this acquisition campaign?')) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  }

  return (
    <div className="min-h-screen cosmic-gradient-bg bg-spatial-grid text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      
      {/* Awwwards Liquid Cursor Glow & Orbital Satellite Radar Overlays */}
      <AwwwardsCursorGlow />
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial-vignette" />
      <SatelliteRadarSweep />

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-amber-500/10 to-transparent pointer-events-none z-0 blur-3xl" />
      <div className="absolute top-96 right-0 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 to-transparent pointer-events-none z-0 blur-3xl" />

      {/* Floating Spatial HUD Navbar */}
      <Navbar />

      {/* Main Directory (Zero Card Container) */}
      <main className="flex-1 max-w-[1140px] mx-auto px-6 py-12 w-full relative z-10 text-left">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <FolderKanban className="w-4 h-4 text-amber-400" />
              <span>SAVED ACQUISITION CAMPAIGNS</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Land Acquisition Campaigns
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
              Saved strategy plans, Mireye batch inspections, rejection logs, and 3-page executive Investment Memos.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {workspaces.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-xs font-mono font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                Clear All Campaigns
              </button>
            )}
            <button
              onClick={handleStartNew}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Run New Agent Campaign</span>
            </button>
          </div>
        </div>

        {/* Campaign List Stream (Pure Borderless Typography) */}
        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs text-slate-400">
            Loading saved campaigns...
          </div>
        ) : workspaces.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="text-sm text-slate-400 font-medium">No saved acquisition campaigns found.</div>
            <button
              onClick={handleStartNew}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl text-xs font-black inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>Run First Agent Campaign →</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workspaces.map((ws, i) => (
              <div
                key={ws.id}
                onClick={() => router.push(`/agent?prompt=${encodeURIComponent(ws.name)}`)}
                className="pt-4 pb-4 border-b border-white/10 hover:border-amber-400/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400">
                    <span className="text-amber-400 font-bold">0{i + 1} //</span> {Array.isArray((ws as any).locations) ? (ws as any).locations.length : ws.count || 66} LOCATIONS SITED • CREATED {new Date(ws.createdAt).toLocaleDateString()}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                    Acquisition: {ws.name}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <button
                    onClick={(e) => handleDelete(ws.id, e)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

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
