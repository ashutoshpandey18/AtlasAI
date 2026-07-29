'use client';

import { useState, useEffect, useRef } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import type { GridCapacityResult } from '@/services/gridCapacityEngine';

interface RetrievedChunk {
  chunk: {
    id: string;
    rtoRegion: string;
    topic: string;
    content: string;
    sourceLabel: string;
  };
  similarity: number;
}

interface RagResult {
  narrative: string;
  retrievedChunks: RetrievedChunk[];
  rtoRegion: string;
  usedFallback: boolean;
}

interface Props {
  lat: number;
  lng: number;
  useCaseName: string;
  projectMw: number;
  gridCapacity: GridCapacityResult;
}

export default function RegulatoryIntelligenceCard({ lat, lng, useCaseName, projectMw, gridCapacity }: Props) {
  const [result, setResult] = useState<RagResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once per site
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchRag() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat,
            lng,
            useCaseName,
            projectMw,
            distanceKm: gridCapacity.rawDistanceMeters
              ? gridCapacity.rawDistanceMeters / 1000
              : null,
            voltageKv: gridCapacity.voltageCapacity.nearestVoltageKv,
            barrierMultiplier: gridCapacity.compositeBarrierMultiplier,
            queueRisk: gridCapacity.queueRisk.queueRisk,
          }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json() as RagResult;
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load regulatory intelligence');
      } finally {
        setLoading(false);
      }
    }

    fetchRag();
  }, [lat, lng, useCaseName, projectMw, gridCapacity]);

  // Split narrative into paragraphs
  const paragraphs = result?.narrative.split('\n').filter((p) => p.trim().length > 0) ?? [];

  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--bg-soft)] to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
          </div>
          <div>
            <div className="text-[12px] font-extrabold text-[var(--text-primary)]">
              Regulatory Intelligence
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium">
              RAG · RTO Tariffs & FERC Filings
            </div>
          </div>
        </div>
        {result && !loading && (
          <span className={`inline-flex items-center gap-1.5 text-[9.5px] font-bold px-2.5 py-1 rounded-full border ${
            result.usedFallback
              ? 'text-amber-600 bg-amber-50 border-amber-200'
              : 'text-emerald-600 bg-emerald-50 border-emerald-200'
          }`}>
            <Sparkles className="w-2.5 h-2.5" />
            {result.usedFallback ? 'Keyword Match' : 'Semantic RAG'}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {loading && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin flex-shrink-0" />
            <div>
              <div className="text-[12px] font-semibold text-[var(--text-primary)]">
                Retrieving regulatory context...
              </div>
              <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
                Embedding query → searching {result ? '(cached)' : 'RTO tariff corpus'} → generating briefing
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-[11.5px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 font-medium">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-4">
            {/* RTO Region badge */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Region
              </span>
              <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2 py-0.5 rounded-full">
                {result.rtoRegion}
              </span>
              <span className="text-[9px] text-[var(--text-muted)] font-medium">
                · {result.retrievedChunks.length} regulatory sources retrieved
              </span>
            </div>

            {/* Narrative paragraphs */}
            <div className="flex flex-col gap-3">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-[12.5px] text-[var(--text-primary)] leading-relaxed font-medium">
                  {para}
                </p>
              ))}
            </div>

            {/* Sources toggle */}
            <div className="border-t border-[var(--border)] pt-3">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1.5 text-[10.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {showSources ? 'Hide' : 'Show'} sources ({result.retrievedChunks.length})
                {showSources
                  ? <ChevronUp className="w-3 h-3" />
                  : <ChevronDown className="w-3 h-3" />}
              </button>

              {showSources && (
                <div className="mt-3 flex flex-col gap-2">
                  {result.retrievedChunks.map((r, i) => (
                    <div
                      key={r.chunk.id}
                      className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3.5 py-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-[var(--accent)]/15 text-[8px] font-black text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-[11px] font-bold text-[var(--text-primary)]">
                            {r.chunk.topic}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            r.chunk.rtoRegion === 'all'
                              ? 'text-[var(--text-muted)] bg-[var(--bg-soft)] border-[var(--border)]'
                              : 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20'
                          }`}>
                            {r.chunk.rtoRegion === 'all' ? 'ALL RTOs' : r.chunk.rtoRegion}
                          </span>
                        </div>
                        {r.similarity > 0 && (
                          <span className="text-[9px] text-[var(--text-muted)] font-mono flex-shrink-0">
                            {(r.similarity * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-[var(--text-secondary)] font-medium leading-snug line-clamp-2">
                        {r.chunk.content}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[9.5px] text-[var(--text-muted)] font-medium">
                        <ExternalLink className="w-2.5 h-2.5" />
                        {r.chunk.sourceLabel}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
