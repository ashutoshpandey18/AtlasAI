'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectWorkspace } from '@/types/atlas';
import { Plus, Trash2, ChevronRight, ArrowRight, FolderKanban } from 'lucide-react';
import { AwwwardsCursorGlow } from '@/components/AwwwardsCursorGlow';
import { CosmicParticles } from '@/components/CosmicParticles';
import { Navbar } from '@/components/Navbar';

export default function ProjectsPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        if (res.ok) {
          const data = await res.json();
          setWorkspaces(data);
        }
      } catch (err) {
        console.error('Failed to load campaigns:', err);
      } finally {
        setLoading(false);
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
      
      {/* Awwwards Liquid Cursor Glow & Radial Vignette */}
      <AwwwardsCursorGlow />
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial-vignette" />

      {/* Atmospheric Shifting Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-amber-600/10 to-transparent pointer-events-none z-0 blur-3xl animate-pulse" />

      {/* Floating Spatial HUD Navbar */}
      <Navbar />

      {/* Main Directory (Zero Card Container) */}
      <main className="flex-1 max-w-[1140px] mx-auto px-6 py-12 w-full relative z-10 text-left">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-amber-400">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>SAVED ACQUISITION CAMPAIGNS</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-4 text-white">
              Land Acquisition Campaigns
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-[540px] font-medium leading-relaxed">
              Saved strategy plans, Mireye batch inspections, rejection logs, and 3-page executive Investment Memos.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            {workspaces.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteAll}
                className="text-rose-400 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer"
              >
                Clear All Campaigns
              </button>
            )}

            <button
              type="button"
              onClick={handleStartNew}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Run New Agent Campaign</span>
            </button>
          </div>
        </div>

        {/* Saved Campaigns Directory (Pure Borderless Typography List) */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono animate-pulse">
            Loading saved acquisition campaigns...
          </div>
        ) : workspaces.length === 0 ? (
          /* Pure Borderless Empty State */
          <div className="py-16 text-center max-w-lg mx-auto font-sans">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">
              No Active Acquisition Campaigns
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
              Launch an autonomous scan in the workspace to plan your first land acquisition campaign.
            </p>
            <button
              type="button"
              onClick={handleStartNew}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer"
            >
              <span>Launch Autonomous Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {workspaces.map((ws, idx) => (
              <div
                key={ws.id}
                onClick={() => router.push(`/workspace/${ws.id}?uc=${ws.useCaseId}`)}
                className="py-4 border-b border-white/10 cursor-pointer hover:border-amber-400 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-amber-400 font-bold">{(idx + 1).toString().padStart(2, '0')} //</span>
                    <span className="text-slate-400">{ws.locations?.length || 0} LOCATIONS SITED</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">CREATED {new Date(ws.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                    {ws.name}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono font-bold text-amber-400">
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Inspect Workspace</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(ws.id, e)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
