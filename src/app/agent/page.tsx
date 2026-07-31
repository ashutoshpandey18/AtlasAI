'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, FolderKanban } from 'lucide-react';
import { AgentRunPanel } from '@/components/AgentRunPanel';

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans relative selection:bg-[var(--accent)] selection:text-white">
      {/* Background Glow Orbs */}
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      {/* Top Header / Navigation */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md sticky top-0 z-50 py-4">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-[var(--bg-soft)] px-3 py-1.5 rounded-full border border-[var(--border)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" />
            <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase text-[var(--text-primary)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <span>ATLAS ACQUISITION WORKSPACE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Saved Campaigns</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-6 relative z-10">
        {/* Dedicated Agent Panel Component */}
        <AgentRunPanel />
      </main>
    </div>
  );
}
