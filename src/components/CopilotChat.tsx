'use client';

import React, { useState, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, X, ArrowRight, User } from 'lucide-react';
import { askQuestion } from '../services/mireye';
import { askGemini } from '../services/gemini';
import type { LocationResult } from '../types/atlas';

interface Props {
  lat: number;
  lng: number;
  useCaseName: string;
  isOpen: boolean;
  onClose: () => void;
  activeLocationData?: LocationResult | null;
}

interface Message {
  sender: 'user' | 'ai';
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
}

export default function CopilotChat({ lat, lng, useCaseName, isOpen, onClose, activeLocationData }: Props) {
  const botAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80";
  const userAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize welcome message when coordinates change
  useEffect(() => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages([
      {
        sender: 'ai',
        senderName: 'Siting Copilot',
        senderAvatar: botAvatar,
        text: `Hello, I'm your Atlas Siting Copilot. I can query Mireye to answer site-specific environmental questions about this location (${lat.toFixed(4)}, ${lng.toFixed(4)}) for a ${useCaseName} installation. Try asking "Are there active wetlands nearby?" or "How close is the nearest highway?"`,
        time: timeStr
      }
    ]);
  }, [lat, lng, useCaseName]);

  async function handleSend() {
    const qText = input.trim();
    if (!qText || loading) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Add User query
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user', 
        senderName: 'You', 
        senderAvatar: userAvatar, 
        text: qText, 
        time: timeStr 
      }
    ]);

    setInput('');
    setLoading(true);

    try {
      // Build facts block from activeLocationData for grounded completions
      let factsContext = `Coordinates: (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      if (activeLocationData && activeLocationData.fieldScores) {
        const factsList = activeLocationData.fieldScores.map(f => {
          const valStr = f.rawValue !== null ? `${f.rawValue}${f.unit ? ' ' + f.unit : ''}` : 'N/A';
          return `- ${f.displayName}: ${valStr} (${f.interpretation}) [Source: ${f.source}]`;
        }).join('\n');
        
        factsContext = `
Active Candidate Address: "${activeLocationData.location.address}"
Mireye Geospatial Registry Structured Facts:
${factsList}
Siting Suitability Index: ${activeLocationData.totalScore}/100 (Risk Level: ${activeLocationData.riskLevel.toUpperCase()})
`;
      }

      const response = await askGemini(
        `You are Atlas Siting Copilot, an intelligent geospatial assistant.
Use the following structured coordinate facts to answer the user's question.

Facts:
${factsContext}

User Question: "${qText}"

Answer in 2-3 concise, professional sentences. Refer directly to the citable data sources (e.g. FEMA, USGS, EIA) from the facts when answering. If you cannot answer based on the facts, explain that you have grounded coordinate data but need more specifics.`,
        () => askQuestion(lat, lng, qText)
      );
      const answer = response || `Mireye answered that this site (${lat.toFixed(4)}, ${lng.toFixed(4)}) has suitable conditions, but did not return detailed text for this prompt.`;
      
      const replyTime = new Date();
      const replyTimeStr = `${String(replyTime.getHours()).padStart(2, '0')}:${String(replyTime.getMinutes()).padStart(2, '0')}`;

      // Simulate typing effect
      setMessages((prev) => [
        ...prev, 
        { 
          sender: 'ai', 
          senderName: 'Siting Copilot', 
          senderAvatar: botAvatar, 
          text: '', 
          time: replyTimeStr 
        }
      ]);
      
      let typedText = '';
      const words = answer.split(' ');
      let idx = 0;
      
      const interval = setInterval(() => {
        if (idx < words.length) {
          typedText += (idx === 0 ? '' : ' ') + words[idx];
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              sender: 'ai', 
              senderName: 'Siting Copilot', 
              senderAvatar: botAvatar, 
              text: typedText, 
              time: replyTimeStr 
            };
            return updated;
          });
          idx++;
        } else {
          clearInterval(interval);
          setLoading(false);
        }
      }, 35);
    } catch {
      const errTime = new Date();
      const errTimeStr = `${String(errTime.getHours()).padStart(2, '0')}:${String(errTime.getMinutes()).padStart(2, '0')}`;
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'ai', 
          senderName: 'Siting Copilot', 
          senderAvatar: botAvatar, 
          text: 'Error contacting Mireye Ask service. Please verify your connection.', 
          time: errTimeStr 
        }
      ]);
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Translucent Backdrop overlay to easily click out and exit */}
      <div 
        className="fixed inset-0 bg-[#16140F]/15 backdrop-blur-[2px] z-40 transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Elegant sliding sidebar drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-[var(--surface)] border-l border-[var(--border)] z-50 shadow-2xl flex flex-col justify-between font-sans overflow-hidden animate-slideLeft select-none">
        
        {/* Ambient Glow Orbs inside the Chat Panel */}
        <div className="absolute top-16 -right-12 w-32 h-32 rounded-full bg-[var(--accent)]/10 blur-2xl pointer-events-none z-0" />
        <div className="absolute bottom-20 -left-12 w-36 h-36 rounded-full bg-[#B88E53]/10 blur-2xl pointer-events-none z-0" />

        {/* Topographic Watermark Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <ellipse cx="50" cy="50" rx="42" ry="32" fill="none" stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="2,2"/>
          <ellipse cx="50" cy="50" rx="28" ry="18" fill="none" stroke="var(--text-muted)" strokeWidth="0.5"/>
        </svg>

        {/* Header */}
        <div className="p-4 px-6 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between relative z-10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={botAvatar}
                alt="AI Siting Copilot"
                className="w-8 h-8 rounded-full object-cover border border-[var(--border)] shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[var(--surface)] rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-[13px] font-extrabold text-[var(--text-primary)] leading-tight">Siting Copilot</h3>
              <span className="text-[8.5px] text-[var(--accent)] font-bold uppercase tracking-wider">online analyst</span>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-soft)] hover:bg-[var(--border)] border border-[var(--border)] rounded-xl text-[10.5px] font-bold text-[var(--text-secondary)] transition-all shadow-sm cursor-pointer"
            title="Exit Copilot"
          >
            <span>Exit Chat</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 px-6 overflow-y-auto flex flex-col gap-5 bg-transparent relative z-10 scrollbar-none">
          {messages.map((msg, i) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 max-w-[90%] animate-fadeIn ${
                  isUser ? 'self-end flex-row-reverse' : 'self-start flex-row'
                }`}
              >
                {/* Human Avatar */}
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-7.5 h-7.5 rounded-full object-cover border border-white/20 shadow-md flex-shrink-0"
                />

                <div>
                  {/* Name label */}
                  <span className={`text-[8.5px] font-bold text-[var(--text-muted)] block mb-1 px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}>
                    {msg.senderName}
                  </span>

                  {/* Elegant Speech bubble */}
                  <div
                    className={`rounded-[18px] px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-sm border ${
                      isUser
                        ? 'bg-gradient-to-br from-[var(--accent)] to-[#3A563D] border-[var(--accent)] text-[#FAFAF7] rounded-br-[4px]'
                        : 'bg-[var(--bg-soft)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-[4px]'
                    }`}
                  >
                    {msg.text === '' ? (
                      <span className="flex gap-1 items-center py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    ) : (
                      <p className="font-semibold">{msg.text}</p>
                    )}
                    <span className={`text-[7.5px] mt-1.5 block text-right font-medium ${isUser ? 'text-[#FAFAF7]/70' : 'text-[var(--text-muted)]'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <div className="p-4 px-6 border-t border-[var(--border)] bg-[var(--surface)] relative z-10 shadow-inner">
          <div className="flex gap-2 bg-[var(--bg)] border border-[var(--border)] focus-within:border-[var(--accent)]/50 p-2 rounded-xl transition-all shadow-sm">
            <input
              type="text"
              placeholder="Ask anything about the site..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none outline-none text-[12.5px] text-[var(--text-primary)] placeholder-[#888680] px-2 py-1.5 font-medium"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2 bg-[var(--accent)] text-[#FAFAF7] hover:opacity-90 rounded-xl transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
