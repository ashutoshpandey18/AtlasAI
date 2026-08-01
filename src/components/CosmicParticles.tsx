'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedY: number;
}

export function CosmicParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 80 spatial particles for a rich floating star field
    const initialParticles: Particle[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.65 + 0.25,
      speedY: Math.random() * 0.06 + 0.02,
    }));
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y - p.speedY < 0 ? 100 : p.y - p.speedY,
        }))
      );
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-amber-400/90 shadow-[0_0_10px_rgba(245,158,11,0.9)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
