'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectWorkspace } from '@/types/atlas';
import { Plus, Trash2, ChevronRight, ArrowRight, Layers, Bot, FolderKanban, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans relative selection:bg-[var(--accent)] selection:text-white">
      {/* Navbar */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-50 py-4">
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-[13.5px] tracking-[0.15em] text-[var(--text-primary)] uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
            ATLAS ACQUISITION AGENT
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/agent" className="btn bg-[var(--accent)] text-[var(--accent-text)] px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:bg-[var(--accent-hover)] shadow-xs">
              Launch Agent Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Directory */}
      <main className="flex-1 max-w-[1100px] mx-auto px-6 py-12 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[var(--border)]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--bg-soft)] border border-[var(--border)] px-3 py-1 rounded-full">
              <Bot className="w-3.5 h-3.5" />
              <span>SAVED ACQUISITION CAMPAIGNS</span>
            </span>
            <h1 className="text-3xl font-black tracking-tight mt-3 text-[var(--text-primary)]">
              Land Acquisition Campaigns
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-[500px]">
              Saved strategy plans, Mireye batch inspections, rejection logs, and executive Investment Memos.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            {workspaces.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="btn bg-[var(--bg-soft)] text-rose-600 border border-rose-200 hover:bg-rose-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Clear All Campaigns
              </button>
            )}

            <button
              onClick={handleStartNew}
              className="btn bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Run New Agent Campaign</span>
            </button>
          </div>
        </div>

        {/* Saved Campaigns Directory */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-muted)] font-mono animate-pulse">
            Loading saved acquisition campaigns...
          </div>
        ) : workspaces.length === 0 ? (
          /* Clean YC-Style Empty State */
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-soft)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)]">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              No Active Acquisition Campaigns
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
              Launch an autonomous scan in the workspace to plan your first land acquisition campaign.
            </p>
            <button
              onClick={handleStartNew}
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] px-6 py-3 rounded-full text-xs font-extrabold transition-all shadow-xs cursor-pointer"
            >
              <span>Launch Autonomous Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => router.push(`/workspace/${ws.id}?uc=${ws.useCaseId}`)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs hover:border-[var(--accent)] transition-all cursor-pointer relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold bg-[var(--bg-soft)] text-[var(--text-secondary)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
                    {ws.locations?.length || 0} Locations Sited
                  </span>
                  <button
                    onClick={(e) => handleDelete(ws.id, e)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{ws.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4 font-mono text-[11px]">
                  Created {new Date(ws.createdAt).toLocaleDateString()}
                </p>
                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                  <span>Inspect Workspace</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
