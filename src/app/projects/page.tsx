'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectWorkspace } from '@/types/atlas';
import { USE_CASES } from '@/data/useCases';
import { Plus, Trash2, Calendar, ChevronRight, LayoutGrid, Sparkles, FolderKanban, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
    const campaignId = `campaign-${Date.now()}`;
    router.push(`/workspace/${campaignId}?uc=solar-farm`);
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
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
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans relative overflow-hidden">
      
      {/* Background Topography Contour mesh */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-muted) 1.2px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="50" cy="50" rx="42" ry="32" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="3,3" />
        <ellipse cx="50" cy="50" rx="28" ry="18" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" />
      </svg>

      {/* Navbar */}
      <header className="border-b border-[var(--border)] bg-[var(--bg)] relative z-20">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-[14px] tracking-[0.1em] text-[var(--text-primary)] uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
            ATLAS.AI
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[13px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              New Campaign
            </Link>
            <span className="text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)] px-3 py-1 rounded-full bg-[var(--surface)] uppercase tracking-wider">
              Campaign Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Campaign Directory Dashboard */}
      <main className="flex-1 max-w-[1100px] mx-auto px-6 py-16 w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-[var(--border)]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Campaign Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-[var(--text-primary)] leading-tight">
              Active Siting Campaigns
            </h1>
            <p className="text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">
              Select or manage active feasibility campaigns across candidate locations.
            </p>
          </div>
          
          <button
            onClick={handleStartNew}
            className="flex items-center gap-1.5 bg-[var(--accent)] text-[#FAFAF7] hover:opacity-95 text-[13px] font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Sparkles className="w-8 h-8 text-[var(--accent)] animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-[12.5px] text-[var(--text-secondary)] mt-3 font-semibold">Loading active campaigns...</p>
          </div>
        ) : workspaces.length === 0 ? (
          /* Empty Campaign Directory state */
          <div className="flex flex-col items-center justify-center border border-[var(--border)] rounded-[32px] py-20 px-6 text-center bg-[var(--surface)] shadow-lg relative overflow-hidden select-none max-w-[580px] mx-auto mt-8">
            
            {/* Topographic circle indicator */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                <FolderKanban className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 border-3 border-[var(--surface)] rounded-full animate-pulse" />
            </div>

            <h3 className="text-[16px] font-extrabold text-[var(--text-primary)] mt-3 tracking-tight">
              No Active Campaigns Found
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-2.5 max-w-[320px] mx-auto leading-relaxed">
              Launch a new campaign from the landing page using Natural Language search or start a fresh feasibility campaign.
            </p>
            
            <button
              onClick={handleStartNew}
              className="mt-8 flex items-center gap-2 bg-[var(--accent)] text-[#FAFAF7] hover:opacity-95 text-[12.5px] font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Start New Campaign
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Workspace Campaign Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workspaces.map((ws) => {
              const ucName = USE_CASES.find((u) => u.id === ws.useCaseId)?.name ?? ws.useCaseId;
              return (
                <div
                  key={ws.id}
                  onClick={() => router.push(`/workspace/${ws.id}`)}
                  className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/40 rounded-[28px] p-6.5 cursor-pointer transition-all duration-300 flex flex-col justify-between h-48 group relative overflow-hidden shadow-sm hover:shadow-md"
                >
                  {/* Decorative top-border line */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--accent)] to-[#B88E53] opacity-40 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    <div className="flex items-start justify-between">
                      <span className="inline-flex text-[9px] uppercase font-bold tracking-wider text-[var(--accent)] bg-[var(--bg-soft)] border border-[var(--border)] px-2.5 py-0.5 rounded-full">
                        {ucName}
                      </span>
                      <button
                        onClick={(e) => handleDelete(ws.id, e)}
                        className="text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 p-1.5 transition-colors rounded-lg z-10"
                        aria-label="Delete campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <h3 className="text-[15.5px] font-extrabold text-[var(--text-primary)] mt-3.5 group-hover:text-[var(--accent)] transition-colors duration-200 tracking-tight leading-snug">
                      {ws.name}
                    </h3>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-1.5 font-medium">
                      {ws.locations.length} candidate location{ws.locations.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-4 relative z-10">
                    <span className="text-[11px] text-[var(--text-muted)] font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                      {new Date(ws.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[11.5px] text-[var(--accent)] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      Open Campaign
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
