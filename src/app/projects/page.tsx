'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectWorkspace } from '@/types/atlas';
import { USE_CASES } from '@/data/useCases';
import { Plus, Trash2, Calendar, ChevronRight, FolderKanban, ArrowRight, MapPin, Layers, Sparkles } from 'lucide-react';
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
    if (!confirm('Are you sure you want to delete this campaign?')) return;
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
      
      {/* Topography Contour Background Gradients */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      {/* Abstract Glowing Topography Contour Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--accent)]/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#B88E53]/10 blur-[100px] pointer-events-none" />

      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="50" cy="20" rx="60" ry="35" fill="none" stroke="var(--text-muted)" strokeWidth="0.25" strokeDasharray="2,2" />
        <ellipse cx="50" cy="20" rx="45" ry="25" fill="none" stroke="var(--text-muted)" strokeWidth="0.25" />
        <ellipse cx="50" cy="20" rx="30" ry="15" fill="none" stroke="var(--accent)" strokeWidth="0.25" />
      </svg>

      {/* Navbar */}
      <header className="border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-md relative z-20">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-[14px] tracking-[0.15em] text-[var(--text-primary)] uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(74,117,89,0.8)] animate-pulse" />
            ATLAS.AI
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[13px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              New Campaign
            </Link>
            <span className="text-[10px] font-extrabold text-[var(--accent)] border border-[var(--accent)]/30 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 uppercase tracking-widest shadow-sm">
              Campaign Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Campaign Directory Dashboard */}
      <main className="flex-1 max-w-[1200px] mx-auto px-6 py-16 w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/[0.06]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-black tracking-[0.2em] text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-1 rounded-full shadow-sm">
              <Layers className="w-3 h-3" />
              SITING PLATFORM
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-[var(--text-primary)] leading-tight">
              Active Feasibility Campaigns
            </h1>
            <p className="text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed max-w-[500px]">
              Compare, score, and analyze candidate locations using real-time topography, flood, utility, and environmental constraints.
            </p>
          </div>
          
          <button
            onClick={handleStartNew}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent)] to-[#5E8C6E] text-[#FAFAF7] hover:brightness-105 text-[13px] font-bold px-5.5 py-3 rounded-xl transition-all cursor-pointer shadow-[0_4px_20px_rgba(74,117,89,0.25)] self-start md:self-auto group border border-white/10"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            New Siting Campaign
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-[var(--accent)] animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 rounded-full bg-[var(--accent)]/10 blur-md" />
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] font-semibold tracking-wide">Connecting to Turso Edge DB...</p>
          </div>
        ) : workspaces.length === 0 ? (
          /* Empty Campaign Directory state */
          <div className="flex flex-col items-center justify-center border border-white/[0.06] rounded-[32px] py-24 px-6 text-center bg-white/[0.02] backdrop-blur-md shadow-2xl relative overflow-hidden select-none max-w-[580px] mx-auto mt-8 border-t-white/[0.1]">
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none" />
            
            {/* Topographic circle indicator */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-inner relative z-10">
                <FolderKanban className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-amber-500 border-4 border-[#121E15] rounded-full animate-pulse z-20" />
            </div>

            <h3 className="text-[17px] font-extrabold text-[var(--text-primary)] mt-3 tracking-tight">
              No Active Campaigns Found
            </h3>
            <p className="text-[12.5px] text-[var(--text-secondary)] mt-2.5 max-w-[340px] mx-auto leading-relaxed">
              Launch a new feasibility campaign using Natural Language search or start fresh on candidate properties.
            </p>
            
            <button
              onClick={handleStartNew}
              className="mt-8 flex items-center gap-2 bg-gradient-to-r from-[var(--accent)] to-[#5E8C6E] text-[#FAFAF7] hover:brightness-105 text-[13px] font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg border border-white/10"
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
                  className="bg-white/[0.02] border border-white/[0.06] hover:border-[var(--accent)]/50 rounded-[28px] p-6.5 cursor-pointer transition-all duration-300 flex flex-col justify-between h-[210px] group relative overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(74,117,89,0.15)] hover:-translate-y-1"
                >
                  {/* Decorative top-border accent line */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--accent)] to-[#B88E53] opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -right-12 -bottom-12 w-28 h-28 rounded-full bg-[var(--accent)]/5 blur-2xl group-hover:bg-[var(--accent)]/10 transition-colors duration-300" />

                  <div>
                    <div className="flex items-start justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-1 rounded-full">
                        <MapPin className="w-2.5 h-2.5" />
                        {ucName}
                      </span>
                      <button
                        onClick={(e) => handleDelete(ws.id, e)}
                        className="text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 p-1.5 transition-all rounded-lg z-20 cursor-pointer"
                        aria-label="Delete campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <h3 className="text-[16px] font-black text-[var(--text-primary)] mt-4 group-hover:text-[var(--accent)] transition-colors duration-200 tracking-tight leading-snug">
                      {ws.name}
                    </h3>

                    {/* Candidate Locations Tags */}
                    {ws.locations && ws.locations.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-3 relative z-10">
                        {ws.locations.slice(0, 2).map((loc, lIdx) => (
                          <span key={loc.id || lIdx} className="text-[10px] font-semibold text-[var(--text-secondary)] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md truncate max-w-[130px] inline-block">
                            📍 {loc.address.split(',')[0]}
                          </span>
                        ))}
                        {ws.locations.length > 2 && (
                          <span className="text-[10px] font-black text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2 py-0.5 rounded-md">
                            +{ws.locations.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11.5px] text-[var(--text-muted)] mt-3 italic">
                        No locations added yet
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-4 relative z-10">
                    <span className="text-[10.5px] text-[var(--text-muted)] font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                      {new Date(ws.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[11px] text-[var(--accent)] font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      View Analysis
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
