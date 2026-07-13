'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Terminal, Sparkles, User } from 'lucide-react';

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
      q: "Are there active wetlands or protected lands near the Florida site?",
      userName: "Alex (GIS Analyst)",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80",
      logs: [
        "▸ Ingestion: Received Florida coordinates (27.7568, -81.4640)",
        "▸ Geocoding: Resolved site to Polk County, Florida",
        "▸ Mireye Fetch: Querying USFWS Wetland contours...",
        "▸ Mireye Response: Intersects PAD_US protected conservation easement",
        "▸ Siting Engine: Florida score calculated: 74/100 (Medium Risk)"
      ],
      a: "The Florida site has a Siting Suitability Index of 74/100 (Medium Risk). While outside of FEMA flood hazard zones, PAD_US records confirm it intersects a protected conservation easement."
    },
    {
      q: "How close is the nearest highway or main road for retail access?",
      userName: "Sarah (Siting Director)",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80",
      logs: [
        "▸ Mireye Fetch: Querying OVERTURE_TRANSPORTATION grid...",
        "▸ Mireye Response: Primary highway corridor found",
        "▸ Feasibility Engine: Road distance: 359 meters (Excellent access)"
      ],
      a: "Overture transportation mapping indicates excellent highway access. A primary retail corridor is located just 359 meters from the center coordinates."
    },
    {
      q: "Can we shift the coordinates to bypass the easement?",
      userName: "Mark (Civil Engineer)",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80",
      logs: [
        "▸ Siting Engine: Perturbing coordinate nodes 200m North...",
        "▸ Mireye Re-fetch: Checking protected easement boundary line...",
        "▸ Optimization: Overlap reduced by 92%. Est. score: 88/100 (Low Risk)"
      ],
      a: "Yes. Shifting the proposed storefront coordinates 200 meters North bypasses 92% of the PAD_US conservation easement boundary, raising the suitability index to 88."
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
        
        setLogs([]);
        let logIdx = 0;
        
        function printLogs() {
          if (!active) return;
          if (logIdx < current.logs.length) {
            setLogs((prev) => [...prev, current.logs[logIdx]]);
            logIdx++;
            addTimeout(printLogs, 450);
          }
        }
        addTimeout(printLogs, 300);
      }, 600);

      addTimeout(() => {
        if (!active) return;
        setTyping(false);
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Add AI response
        setMessages((prev) => [
          ...prev, 
          { 
            sender: 'ai', 
            senderName: 'Atlas AI Siting Bot', 
            senderAvatar: botAvatar, 
            text: current.a, 
            time: timeStr 
          }
        ]);
        runDialogue(idx + 1);
      }, current.logs.length * 450 + 1800);
    }

    runDialogue(0);

    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  const handleRedirect = () => {
    router.push('/workspace/demo-campaign?uc=retail-store&chat=open&locs=Miami%2C%20FL%3BColumbus%2C%20OH');
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-[780px] mx-auto select-none">
      
      {/* Floating Interactive Alert Indicator Banner */}
      <div 
        onClick={handleRedirect}
        className="w-fit mx-auto bg-[var(--surface)] hover:bg-[var(--bg-soft)]/20 border border-[var(--border)] hover:border-[var(--accent)]/55 rounded-full py-2.5 px-5 flex items-center justify-center gap-3 text-[12px] cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md animate-fadeIn"
      >
        <div className="relative w-2 h-2 flex-shrink-0 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping absolute" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] absolute" />
        </div>
        <div className="flex items-center flex-wrap gap-1 leading-none">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Interactive Tour
          </span>
          <span className="w-1 h-1 rounded-full bg-[var(--border-focus)] mx-1" />
          <span className="font-semibold text-[var(--text-secondary)]">
            Click anywhere below to launch the live feasibility workspace & Copilot
          </span>
        </div>
        <span className="text-[11px] font-extrabold text-[var(--accent)] hover:underline ml-1.5 flex items-center gap-0.5">
          Launch Live ↗
        </span>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-8 items-stretch font-sans">
        
        {/* Premium iPhone Mockup Frame */}
        <div 
          onClick={handleRedirect}
          className="w-[305px] h-[530px] rounded-[52px] p-[10px] bg-gradient-to-b from-[#DFDCD0] to-[#CFCAB8] border border-[var(--border)] shadow-2xl relative flex-shrink-0 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] cursor-pointer select-none group"
          style={{
            boxShadow: '0 25px 50px -12px rgba(22, 20, 15, 0.12), inset 0 2px 4px rgba(255,255,255,0.6)'
          }}
        >
          {/* Inner Screen Bezel */}
          <div className="w-full h-full rounded-[42px] border-[8px] border-[var(--text-primary)] bg-[var(--bg)] overflow-hidden flex flex-col justify-between relative">
            
            {/* iOS Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-[var(--text-primary)] rounded-full z-30 flex items-center justify-between px-3">
              <span className="w-2.5 h-2.5 bg-[#1F1F1F] rounded-full border border-zinc-800" />
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            </div>

            {/* Status Bar */}
            <div className="h-10 bg-[var(--bg-soft)] border-b border-[var(--border)] flex items-end justify-between px-6 pb-2 text-[9px] text-[var(--text-secondary)] font-bold tracking-wider relative z-20">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span className="w-3.5 h-2 border border-[var(--text-secondary)] rounded-sm bg-[var(--text-secondary)]" />
              </div>
            </div>

            {/* Chat Header */}
            <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3.5 flex items-center gap-2.5 relative z-20 shadow-sm">
              <div className="relative">
                <img
                  src={botAvatar}
                  alt="AI Siting Bot"
                  className="w-8 h-8 rounded-full object-cover border border-[var(--border)] shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--accent)] border-2 border-[var(--surface)] rounded-full animate-pulse" />
              </div>
              <div>
                <h4 className="text-[12px] font-extrabold text-[var(--text-primary)] leading-tight">Atlas Team Board</h4>
                <span className="text-[8.5px] text-[var(--accent)] font-bold uppercase tracking-wider">active campaign feed</span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-5 bg-[var(--bg)] scrollbar-none relative z-10 overflow-hidden">
              
              {/* Ambient Background Glow Orbs for the Phone Screen */}
              <div className="absolute top-12 -right-8 w-24 h-24 rounded-full bg-[var(--accent)]/15 blur-xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-16 -left-8 w-28 h-28 rounded-full bg-[#B88E53]/15 blur-xl pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
              
              {/* Custom Topographic Map Background Mesh */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <ellipse cx="50" cy="50" rx="42" ry="32" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="2,2"/>
                <ellipse cx="50" cy="50" rx="30" ry="22" fill="none" stroke="var(--text-muted)" strokeWidth="0.5"/>
                <ellipse cx="50" cy="50" rx="18" ry="12" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="1,1"/>
              </svg>

              {/* Glass diagonal screen reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-40 pointer-events-none z-20" />

              {messages.map((msg, i) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2 max-w-[90%] relative z-10 animate-fadeIn ${
                      isUser ? 'self-end flex-row-reverse' : 'self-start flex-row'
                    }`}
                  >
                    {/* Sender Human Avatar */}
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-7.5 h-7.5 rounded-full object-cover border border-white/25 shadow-md flex-shrink-0"
                    />

                    <div>
                      {/* Sender name label */}
                      <span className={`text-[8px] font-bold text-[var(--text-muted)] block mb-1 px-1 ${
                        isUser ? 'text-right' : 'text-left'
                      }`}>
                        {msg.senderName}
                      </span>

                      {/* Dynamic Custom Bubble shape with tail aesthetics */}
                      <div
                        className={`rounded-[18px] px-3.5 py-2.5 text-[11.5px] leading-relaxed shadow-sm border ${
                          isUser
                            ? 'bg-gradient-to-br from-[var(--accent)] to-[#3A563D] border-[var(--accent)] text-[var(--bg)] rounded-br-[4px]'
                            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] rounded-bl-[4px]'
                        }`}
                      >
                        <p className="font-semibold">{msg.text}</p>
                        <span className={`text-[7.5px] mt-1.5 block text-right font-medium ${isUser ? 'text-[var(--bg)]/70' : 'text-[var(--text-muted)]'}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {typing && (
                <div className="flex items-start gap-2 max-w-[90%] relative z-10">
                  <img
                    src={botAvatar}
                    alt="AI Siting Agent"
                    className="w-7.5 h-7.5 rounded-full object-cover border border-white/20 shadow-md flex-shrink-0 animate-pulse"
                  />
                  <div>
                    <span className="text-[8px] font-bold text-[var(--text-muted)] block mb-1 px-1">
                      Atlas AI Siting Bot
                    </span>
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] rounded-bl-[4px] px-3.5 py-2.5 flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-2 relative z-20">
              <div className="flex-1 bg-[var(--bg)] border border-[var(--border)] px-4 py-1.5 rounded-full text-[10px] text-[var(--text-muted)] font-medium">
                Click to ask Copilot...
              </div>
              <button className="w-7.5 h-7.5 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--bg)] shadow-md hover:scale-95 transition-transform">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Side Logs Panel (macOS Window Console style matching phone heights) */}
        <div 
          onClick={handleRedirect}
          className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[36px] p-6 flex flex-col justify-between font-mono text-[11px] min-h-[300px] shadow-lg relative overflow-hidden select-none hover:-translate-y-2 hover:scale-[1.01] cursor-pointer transition-all duration-500 group"
        >
          {/* Soft grid background */}
          <div className="absolute inset-0 opacity-[0.25] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 0)', backgroundSize: '16px 16px' }} />

          <div className="relative z-10">
            {/* macOS title bar */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5B18A] shadow-sm" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E6D08E] shadow-sm" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#A8C7A3] shadow-sm" />
              </div>
              <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider flex items-center gap-1">
                <Terminal className="w-3 h-3 text-[var(--accent)]" />
                atlas-agent-session.log
              </span>
            </div>

            {/* Color-coded logs layout */}
            <div className="flex flex-col gap-3">
              {logs.map((log, i) => {
                if (!log || typeof log !== 'string') return null;
                let element = <span className="text-[var(--text-secondary)]">{log}</span>;
                
                if (log.startsWith("▸ Ingestion:")) {
                  element = (
                    <>
                      <span className="text-[var(--accent)] font-bold">▸ Ingestion:</span>
                      <span className="text-[var(--text-primary)] font-medium">{log.replace("▸ Ingestion:", "")}</span>
                    </>
                  );
                } else if (log.startsWith("▸ Geocoding:")) {
                  element = (
                    <>
                      <span className="text-[#9B763A] font-bold">▸ Geocoding:</span>
                      <span className="text-[var(--text-primary)] font-medium">{log.replace("▸ Geocoding:", "")}</span>
                    </>
                  );
                } else if (log.startsWith("▸ Mireye API:") || log.startsWith("▸ Mireye Fetch:") || log.startsWith("▸ Mireye Response:")) {
                  const prefix = log.split(":")[0] + ":";
                  element = (
                    <>
                      <span className="text-[var(--accent)] font-extrabold">{prefix}</span>
                      <span className="text-[var(--text-secondary)] font-medium">{log.replace(prefix, "")}</span>
                    </>
                  );
                } else if (log.startsWith("▸ Feasibility Engine:") || log.startsWith("▸ Siting Option:") || log.startsWith("▸ Optimization:") || log.startsWith("▸ Output:")) {
                  const prefix = log.split(":")[0] + ":";
                  element = (
                    <>
                      <span className="text-[#9B763A] font-extrabold">{prefix}</span>
                      <span className="text-[var(--text-primary)] font-bold">{log.replace(prefix, "")}</span>
                    </>
                  );
                }

                return (
                  <div key={i} className="leading-relaxed animate-fadeIn tracking-tight">
                    {element}
                  </div>
                );
              })}

              {typing && (
                <div className="text-[var(--accent)] animate-pulse font-bold tracking-tight">
                  ▸ Processing location intelligence layers...
                </div>
              )}
            </div>
          </div>

          {/* Console Footer Status */}
          <div className="border-t border-[var(--border)] pt-4 mt-6 relative z-10 bg-[var(--surface)]/85 backdrop-blur-sm">
            <div className="flex justify-between items-center text-[9.5px] text-[var(--text-secondary)]">
              <span className="font-semibold">Active Scenario: Shelby vs Dallas</span>
              <span className="text-[var(--accent)] flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                Live API Grounded
              </span>
            </div>
            <p className="text-[9.5px] text-[var(--text-muted)] leading-relaxed mt-2.5">
              This simulator runs the exact geocoding and scoring algorithms utilized by Atlas campaigns to identify site anomalies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
