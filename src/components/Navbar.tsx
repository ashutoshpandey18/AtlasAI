'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, Zap, ArrowLeft } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isAgent = pathname === '/agent';
  const isProjects = pathname === '/projects';

  return (
    <header className="relative z-50 w-full max-w-[1140px] mx-auto py-6 px-6 bg-transparent border-b border-white/10 font-sans pointer-events-auto">
      <div className="flex items-center justify-between">
        
        {/* Brand & Status Telemetry (Zero Card Container) */}
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse" />
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-sm font-black text-white tracking-widest uppercase group-hover:text-amber-400 transition-colors">
                ATLAS
              </span>
              <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                // SITE CONTROL AGENT
              </span>
            </div>
          </Link>
        </div>

        {/* Center Nav Links (Visible on Home) */}
        {isHome && (
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs font-bold text-slate-300">
            <a href="#robot-agent" className="hover:text-amber-400 transition-colors">
              3D Model
            </a>
            <a href="#evidence" className="hover:text-amber-400 transition-colors">
              GIS Pipeline
            </a>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className={`flex items-center gap-1.5 text-xs font-mono font-bold transition-colors ${
              isProjects ? 'text-amber-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Saved Campaigns</span>
          </Link>

          {!isAgent && (
            <Link
              href="/agent"
              className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Launch Workspace →</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
