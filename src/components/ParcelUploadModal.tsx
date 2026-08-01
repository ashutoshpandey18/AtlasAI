'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export interface CustomSiteParcel {
  siteId: string;
  siteName: string;
  county: string;
  state: string;
  lat: number;
  lng: number;
  ownershipType?: 'CORPORATE_FEE_SIMPLE' | 'GROUND_LEASE';
  parkingLotAreaSqFt?: number;
}

interface ParcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (sites: CustomSiteParcel[], filename: string) => void;
}

export function ParcelUploadModal({ isOpen, onClose, onUploadSuccess }: ParcelUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parsedSites, setParsedSites] = useState<CustomSiteParcel[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setErrorMsg(null);
    setUploadedFilename(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setErrorMsg('File content is empty.');
        return;
      }

      try {
        if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
          parseGeoJson(text);
        } else {
          parseCsv(text);
        }
      } catch (err: any) {
        setErrorMsg(`Failed to parse file: ${err.message || 'Invalid format'}`);
      }
    };

    reader.readAsText(file);
  };

  const parseCsv = (csvText: string) => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setErrorMsg('CSV must contain a header row and at least 1 data row.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('site') || h.includes('store'));
    const countyIdx = headers.findIndex((h) => h.includes('county'));
    const stateIdx = headers.findIndex((h) => h.includes('state'));
    const latIdx = headers.findIndex((h) => h.includes('lat'));
    const lngIdx = headers.findIndex((h) => h.includes('lng') || h.includes('lon'));

    if (latIdx === -1 || lngIdx === -1) {
      setErrorMsg('CSV must contain "lat" and "lng" (or "lon") column headers.');
      return;
    }

    const sites: CustomSiteParcel[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/['"]/g, ''));
      if (cols.length <= Math.max(latIdx, lngIdx)) continue;

      const lat = parseFloat(cols[latIdx]);
      const lng = parseFloat(cols[lngIdx]);
      if (isNaN(lat) || isNaN(lng)) continue;

      const siteName = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Uploaded Site #${i}`;
      const county = countyIdx !== -1 && cols[countyIdx] ? cols[countyIdx] : 'Custom County';
      const state = stateIdx !== -1 && cols[stateIdx] ? cols[stateIdx].toUpperCase() : 'TX';

      sites.push({
        siteId: `custom-${i}-${Date.now()}`,
        siteName,
        county,
        state,
        lat,
        lng,
        ownershipType: 'CORPORATE_FEE_SIMPLE',
        parkingLotAreaSqFt: 45000,
      });
    }

    if (sites.length === 0) {
      setErrorMsg('No valid coordinate rows found in CSV.');
      return;
    }

    setParsedSites(sites);
  };

  const parseGeoJson = (jsonText: string) => {
    const data = JSON.parse(jsonText);
    const sites: CustomSiteParcel[] = [];

    const features = data.type === 'FeatureCollection' ? data.features : [data];
    features.forEach((feat: any, idx: number) => {
      if (!feat.geometry) return;
      let lat = 0;
      let lng = 0;

      if (feat.geometry.type === 'Point') {
        [lng, lat] = feat.geometry.coordinates;
      } else if (feat.geometry.type === 'Polygon') {
        const ring = feat.geometry.coordinates[0];
        lng = ring.reduce((acc: number, pt: number[]) => acc + pt[0], 0) / ring.length;
        lat = ring.reduce((acc: number, pt: number[]) => acc + pt[1], 0) / ring.length;
      }

      if (!lat || !lng) return;

      const props = feat.properties || {};
      const siteName = props.name || props.site_name || props.store_name || `GeoJSON Site #${idx + 1}`;
      const county = props.county || 'Custom County';
      const state = (props.state || 'TX').toUpperCase();

      sites.push({
        siteId: `geojson-${idx + 1}-${Date.now()}`,
        siteName,
        county,
        state,
        lat,
        lng,
        ownershipType: 'CORPORATE_FEE_SIMPLE',
        parkingLotAreaSqFt: 50000,
      });
    });

    if (sites.length === 0) {
      setErrorMsg('No valid Point or Polygon features found in GeoJSON.');
      return;
    }

    setParsedSites(sites);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (parsedSites.length > 0 && uploadedFilename) {
      onUploadSuccess(parsedSites, uploadedFilename);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 font-sans text-left">
      <div className="cosmic-gradient-bg bg-spatial-grid border-2 border-white/20 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_25px_90px_rgba(0,0,0,0.95)] relative text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                CUSTOM PARCEL INGESTION ENGINE
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Upload CSV or GeoJSON Portfolio</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            dragActive
              ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
              : 'border-white/20 hover:border-amber-500/50 bg-[#06060e]/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.geojson"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-white">
              Drag & Drop your parcel portfolio file here
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Supports <span className="text-amber-400 font-bold">.CSV</span>, <span className="text-amber-400 font-bold">.JSON</span>, or <span className="text-amber-400 font-bold">.GeoJSON</span> (lat, lng, site_name)
            </div>
          </div>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs font-mono text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Sites Preview */}
        {parsedSites.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#0a0a14] border border-white/15 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Successfully Parsed {parsedSites.length} Candidate Parcels</span>
              </div>
              <span className="text-[10px] text-slate-400">{uploadedFilename}</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1 text-[11px] text-slate-300 divide-y divide-white/10">
              {parsedSites.slice(0, 5).map((site, i) => (
                <div key={i} className="pt-1 flex justify-between items-center">
                  <span className="font-bold text-white truncate max-w-[240px]">{site.siteName}</span>
                  <span className="text-slate-400">{site.county}, {site.state} ({site.lat.toFixed(3)}, {site.lng.toFixed(3)})</span>
                </div>
              ))}
              {parsedSites.length > 5 && (
                <div className="pt-2 text-[10px] text-amber-400 italic">
                  + {parsedSites.length - 5} more candidate parcels ready for Mireye batch ingestion
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white text-xs font-mono font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedSites.length === 0}
            onClick={handleConfirm}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 shadow-md"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Ingest Portfolio into Agent ({parsedSites.length} Sites) →</span>
          </button>
        </div>

      </div>
    </div>
  );
}
