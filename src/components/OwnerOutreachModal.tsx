'use client';

import { useState } from 'react';
import { X, Copy, Check, FileText, Download, DollarSign, Building, Sparkles } from 'lucide-react';
import type { MireyeFetchResponse } from '@/types/mireye';
import { generateLandLoi } from '@/services/ownerOutreachEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  data: MireyeFetchResponse;
  useCaseName?: string;
  targetAcres?: number;
}

export default function OwnerOutreachModal({
  isOpen,
  onClose,
  address,
  data,
  useCaseName = 'Solar Farm',
  targetAcres = 100,
}: Props) {
  const [customOwner, setCustomOwner] = useState('');
  const [copied, setCopied] = useState(false);

  const loi = generateLandLoi(address, data, useCaseName, targetAcres, customOwner || undefined);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(loi.loiText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([loi.loiText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `LOI_${loi.ownerName.replace(/\s+/g, '_')}_${loi.totalAcres}Acres.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#E5DFD3] bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-black text-[var(--text-primary)]">
                  Draft Land Acquisition LOI
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800">
                  LOI
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                Formal Letter of Intent to Option-to-Lease Parcel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#E5DFD3] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Key Contract Summary Bar */}
        <div className="grid grid-cols-3 gap-2.5 bg-[#FAF8F3] border border-[#E5DFD3] rounded-2xl p-3.5">
          <div>
            <div className="text-[9px] uppercase font-bold text-[#8C8273]">Est. Lease / Acre</div>
            <div className="text-[13px] font-black text-amber-800">${loi.estimatedAnnualLeasePerAcre.toLocaleString()} / yr</div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold text-[#8C8273]">Total Annual Rent</div>
            <div className="text-[13px] font-black text-[var(--text-primary)]">${loi.totalAnnualLeasePayment.toLocaleString()} / yr</div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold text-[#8C8273]">Option Period</div>
            <div className="text-[13px] font-black text-orange-700">36 Months ($${loi.optionFeePerYear.toLocaleString()}/yr)</div>
          </div>
        </div>

        {/* Custom Owner Input */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] whitespace-nowrap">
            Landowner Entity:
          </label>
          <input
            type="text"
            placeholder={loi.ownerName}
            value={customOwner}
            onChange={(e) => setCustomOwner(e.target.value)}
            className="flex-1 bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl px-3 py-1.5 text-[12px] font-bold text-[var(--text-primary)] outline-none focus:border-amber-500"
          />
        </div>

        {/* LOI Document Text Editor Box */}
        <div className="flex-1 overflow-y-auto bg-[#FAF8F3] border border-[#E5DFD3] rounded-2xl p-4 font-mono text-[11px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap select-all">
          {loi.loiText}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border)]">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#FAF8F3] border border-[#E5DFD3] hover:bg-white text-[12px] font-bold text-[var(--text-primary)] px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
            {copied ? 'Copied to Clipboard!' : 'Copy LOI Text'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-extrabold px-4 py-2 rounded-xl transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            Download Formal LOI (.txt)
          </button>
        </div>
      </div>
    </div>
  );
}
