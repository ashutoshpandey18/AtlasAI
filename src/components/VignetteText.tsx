'use client';

import React from 'react';

interface VignetteTextProps {
  text: string;
  className?: string;
}

export function VignetteText({ text, className = '' }: VignetteTextProps) {
  return (
    <span className={`inline-flex flex-wrap items-center justify-center gap-x-[0.24em] ${className}`}>
      {text.split(' ').map((word, wordIdx) => (
        <span key={wordIdx} className="inline-flex whitespace-nowrap">
          {word.split('').map((char, charIdx) => (
            <span
              key={charIdx}
              className="inline-block relative px-[0.5px] transition-all duration-300 hover:-translate-y-1.5 hover:scale-110 cursor-default group"
            >
              {/* Character Edge Vignette Shadow Backing */}
              <span className="absolute inset-0 rounded-md bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.22)_0%,_transparent_70%)] opacity-40 group-hover:opacity-100 transition-opacity blur-[1px] pointer-events-none" />

              {/* Character Text with Per-Letter Gradient Vignette */}
              <span className="relative z-10 bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
                {char}
              </span>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
