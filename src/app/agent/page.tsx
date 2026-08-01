'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AgentRunPanel } from '@/components/AgentRunPanel';
import { CompactAgentRobot } from '@/components/CompactAgentRobot';
import { AwwwardsCursorGlow } from '@/components/AwwwardsCursorGlow';
import { CosmicParticles } from '@/components/CosmicParticles';
import { Navbar } from '@/components/Navbar';

function AgentContent() {
  const searchParams = useSearchParams();
  const promptParam = searchParams.get('prompt');

  return (
    <div className="space-y-6">
      {/* Compact 3D Agent Robot Demonstrating the Pipeline Flow */}
      <CompactAgentRobot />

      {/* Dedicated Agent Execution & Scoring Panel */}
      <AgentRunPanel initialPrompt={promptParam || 'Find fast-deployment solar carport targets in Texas under $2M capex.'} />
    </div>
  );
}

export default function AgentPage() {
  return (
    <div className="min-h-screen cosmic-gradient-bg bg-spatial-grid text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">

      {/* Awwwards Liquid Cursor Glow, Floating Star Particles & Radial Vignette */}
      <AwwwardsCursorGlow />
      <CosmicParticles />
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial-vignette" />

      {/* Atmospheric Shifting Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-amber-600/10 to-transparent pointer-events-none z-0 blur-3xl animate-pulse" />
      <div className="absolute top-96 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/15 via-orange-500/10 to-transparent pointer-events-none z-0 blur-3xl" />

      {/* Floating Spatial HUD Navbar */}
      <Navbar />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8 relative z-10">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-mono">Loading workspace...</div>}>
          <AgentContent />
        </Suspense>
      </main>

    </div>
  );
}
