'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Terminal, Sparkles, User, FileText } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
}

export default function PhoneSimulator() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const scenario = [
    {
      q: "Find fast-deployment solar carport targets in Texas under $2M capex.",
      userName: "Alex (Acquisition Director)",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80",
      logs: [
        "▸ Strategy Planner: Evaluated 3 retail chain expansion strategies...",
        "▸ Strategy Selection: Dollar General selected (74% fee-simple, 4.3× lot coverage)",
        "▸ Entity Resolution: DOLGENCORP OF TEXAS INC matched (70 parcels)",
        "▸ Mireye API: Executed /v1/fetch/batch for 70 sites in 3 calls",
        "▸ Deal-Killer Detector: 67 parcels cut with defensible written rejection reasons",
        "▸ Acquisition Intelligence: Ector County #45835 ($28.4k tax delinquent = motivated seller)",
      ],
      a: "Strategy Plan complete. Evaluated 70 Texas parcels via Mireye. Ector County parcel #45835 ranks #1 (100.0%) with $28.4k tax delinquency signal. 67 sites cut with written rejection reasons. Executive Investment Memo generated."
    },
    {
      q: "Why was Nacogdoches parcel #2 rejected by the agent?",
      userName: "Sarah (VP Development)",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80",
      logs: [
        "▸ Decision Ledger: Querying fatal flaw log for Nacogdoches #2...",
        "▸ Mireye Polygon Check: FEMA Special Flood Hazard Area (Zone AE)",
        "▸ Risk Evaluation: Insurance cost overrun +$18k/yr",
        "▸ Alternative Suggestion: Adjacent parcel 1.4 mi East outside flood zone",
      ],
      a: "Nacogdoches #2 was rejected because FEMA NFHL data confirms Zone AE flood risk, introducing mandatory insurance & permitting delays. Recommending adjacent parcel 1.4 miles East."
    },
    {
      q: "Generate the LOI and Investment Memo for Ector County.",
      userName: "Mark (Financial Analyst)",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80",
      logs: [
        "▸ Financial Engine: 187 kW canopy capacity (324 MWh/yr yield)",
        "▸ Financial Model: $972k 25-yr gross revenue at $0.12/kWh",
        "▸ Memo Engine: Generated 3-page printable Investment Memo + LOI text",
      ],
      a: "Investment Memo and LOI generated for Ector County. Target execution date set for August 5, 2026. Sourced from 412 verified Mireye physical facts with timestamps."
    }
  ];

  const botAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80";

  useEffect(() => {
    let active = true;
    let timers: NodeJS.Timeout[] = [];

    function addTimeout(fn: () => void, delay: number) {
      if (active) {
        timers.push(setTimeout(fn, delay));
      }
    }

    function runDialogue(idx: number) {
      if (idx >= scenario.length) {
        addTimeout(() => {
          if (!active) return;
          setMessages([]);
          setLogs([]);
          runDialogue(0);
        }, 8000);
        return;
      }

      const current = scenario[idx];

      addTimeout(() => {
        if (!active) return;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Add User query
        setMessages((prev) => [
          ...prev, 
          { 
            sender: 'user', 
            senderName: current.userName, 
            senderAvatar: current.userAvatar, 
            text: current.q, 
            time: timeStr 
          }
        ]);
        setTyping(true);

        // Add Logs sequentially
        current.logs.forEach((logItem, lIdx) => {
          addTimeout(() => {
            if (!active) return;
            setLogs((prev) => [...prev, logItem]);
          }, (lIdx + 1) * 600);
        });

        // Add AI Answer
        const totalLogTime = (current.logs.length + 1) * 600;
        addTimeout(() => {
          if (!active) return;
          setTyping(false);
          setMessages((prev) => [
            ...prev, 
            { 
              sender: 'ai', 
              senderName: 'Atlas Agent', 
              senderAvatar: botAvatar, 
              text: current.a, 
              time: timeStr 
            }
          ]);

          // Move to next dialogue
          addTimeout(() => {
            if (!active) return;
            runDialogue(idx + 1);
          }, 4500);

        }, totalLogTime + 800);

      }, 1000);
    }

    runDialogue(0);

    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[360px] h-[640px] bg-[var(--surface)] border-[8px] border-[#222] rounded-[40px] shadow-2xl overflow-hidden flex flex-col font-sans">
      {/* Dynamic Notch / Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#222] rounded-b-xl z-50 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-black/60 mr-2" />
        <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
      </div>

      {/* Header */}
      <div className="bg-[var(--bg-soft)] border-b border-[var(--border)] pt-7 pb-3 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black tracking-wider uppercase text-[var(--text-primary)]">
            Atlas Agent Mobile
          </span>
        </div>
        <span className="text-[10px] text-[var(--accent)] font-bold bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-full">
          Mireye Live
        </span>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold text-[var(--text-secondary)]">{m.senderName}</span>
              <span className="text-[9px] text-[var(--text-muted)]">{m.time}</span>
            </div>
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-[11.5px] leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-[var(--text-primary)] text-[var(--bg)] rounded-br-xs font-medium'
                  : 'bg-[var(--bg-soft)] text-[var(--text-primary)] border border-[var(--border)] rounded-bl-xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] italic font-mono pl-1">
            <Sparkles className="w-3 h-3 text-[var(--accent)] animate-spin" />
            <span>Agent reasoning...</span>
          </div>
        )}
      </div>

      {/* Live Technical Execution Console Footer */}
      <div className="bg-[#111612] text-slate-300 border-t border-[var(--border)] p-3 text-[10px] font-mono h-32 overflow-y-auto">
        <div className="text-emerald-400 font-bold mb-1 flex items-center justify-between border-b border-slate-800 pb-1">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span>Live Audit Console</span>
          </span>
          <span className="text-[9px] text-slate-500">Mireye API</span>
        </div>
        <div className="space-y-1">
          {logs.slice(-5).map((l, i) => (
            <div key={i} className="leading-tight text-slate-300">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
