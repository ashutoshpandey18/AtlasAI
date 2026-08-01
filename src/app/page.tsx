'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, FolderKanban, ShieldCheck, Zap } from 'lucide-react';
import { AgentRunPanel } from '@/components/AgentRunPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans relative selection:bg-[var(--accent)] selection:text-white">
      {/* Background Glow Orbs */}
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      {/* Top Header / Navigation */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md sticky top-0 z-50 py-3.5">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-[var(--text-primary)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(74,117,89,0.8)] animate-pulse" />
              <span>ATLAS ACQUISITION AGENT</span>
            </div>
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md hidden sm:inline-block">
              Commercial Renewables
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/projects"
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
              <span>Saved Campaigns</span>
            </Link>

            <Link
              href="/workspace/campaign-1785535927306?uc=solar-carport"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>70 Texas Sites</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Body: Primary Autonomous Agent Command Center */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-6 relative z-10">
        <AgentRunPanel />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[var(--border)] py-4 bg-[var(--bg)] text-[11px] text-[var(--text-muted)] mt-8">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>© 2026 Atlas Acquisition Agent — Autonomous Commercial Renewable Land Acquisition</div>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mireye API /v1/fetch/batch Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
