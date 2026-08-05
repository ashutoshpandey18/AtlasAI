'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles, Zap, ArrowRight, Download } from 'lucide-react';
import type { AddressInputItem } from '@/services/addressLookupService';

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
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [isResolvingAddresses, setIsResolvingAddresses] = useState(false);
  const [resolutionProgress, setResolutionProgress] = useState<{ current: number; total: number } | null>(null);
  const [ingestionMode, setIngestionMode] = useState<'COORDINATES' | 'ADDRESS_LOOKUP' | null>(null);
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

  const parseCsv = async (csvText: string) => {
    setSkippedCount(0);
    setErrorMsg(null);
    setParsedSites([]);
    setIngestionMode(null);

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setErrorMsg('CSV must contain a header row and at least 1 valid candidate data row.');
      return;
    }

    const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
    const rawHeaders = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    // Ultra-Flexible Header Alias Matching
    const latIdx = rawHeaders.findIndex((h) => ['lat', 'latitude', 'y', 'lat_coord', 'lat_dd', 'y_coord'].includes(h) || h.includes('latitude') || h === 'lat');
    const lngIdx = rawHeaders.findIndex((h) => ['lng', 'lon', 'longitude', 'x', 'long', 'lng_dd', 'long_coord', 'x_coord'].includes(h) || h.includes('longitude') || h === 'lng' || h === 'lon');
    const addressIdx = rawHeaders.findIndex((h) => ['address', 'street', 'street_address', 'property_address', 'property_location', 'location', 'site_address', 'full_address', 'addr', 'loc'].includes(h) || h.includes('address') || h.includes('street') || h.includes('addr') || h.includes('location'));
    const cityIdx = rawHeaders.findIndex((h) => ['city', 'municipality', 'town'].includes(h) || h.includes('city') || h.includes('town'));
    const stateIdx = rawHeaders.findIndex((h) => ['state', 'st', 'province'].includes(h) || h.includes('state') || h === 'st');
    const zipIdx = rawHeaders.findIndex((h) => ['zip', 'zipcode', 'postal_code', 'zip_code'].includes(h) || h.includes('zip'));
    const nameIdx = rawHeaders.findIndex((h) => ['site_name', 'name', 'store_name', 'site', 'property', 'apn', 'store', 'chain', 'location_name'].includes(h) || h.includes('name') || h.includes('site') || h.includes('store'));
    const countyIdx = rawHeaders.findIndex((h) => ['county', 'parish', 'district'].includes(h) || h.includes('county'));

    const hasCoordinates = latIdx !== -1 && lngIdx !== -1;
    const hasAddress = addressIdx !== -1 || (cityIdx !== -1 && stateIdx !== -1) || nameIdx !== -1;

    if (!hasCoordinates && !hasAddress) {
      setErrorMsg('CSV missing required location headers. Please include "lat"/"lng" coordinates OR "address"/"city"/"state" text columns.');
      return;
    }

    // Mode 1: Coordinates Available (Preferred)
    if (hasCoordinates) {
      setIngestionMode('COORDINATES');
      const sites: CustomSiteParcel[] = [];
      const seenCoords = new Set<string>();
      let skipped = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/['"]/g, ''));
        if (cols.length <= Math.max(latIdx, lngIdx)) {
          skipped++;
          continue;
        }

        const lat = parseFloat(cols[latIdx]);
        const lng = parseFloat(cols[lngIdx]);
        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
          skipped++;
          continue;
        }

        const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
        if (seenCoords.has(coordKey)) {
          skipped++;
          continue;
        }
        seenCoords.add(coordKey);

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
        setErrorMsg('No valid coordinate rows found in CSV portfolio.');
        return;
      }

      setSkippedCount(skipped);
      setParsedSites(sites);
      return;
    }

    // Mode 2: Address-Based Portfolio Resolution via Mireye /v1/lookup
    if (hasAddress) {
      setIngestionMode('ADDRESS_LOOKUP');
      setIsResolvingAddresses(true);
      setResolutionProgress({ current: 0, total: lines.length - 1 });

      const addressItems: AddressInputItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/['"]/g, ''));
        let addrText = addressIdx !== -1 ? cols[addressIdx] : '';
        if (!addrText) {
          const parts = [
            nameIdx !== -1 ? cols[nameIdx] : '',
            cityIdx !== -1 ? cols[cityIdx] : '',
            stateIdx !== -1 ? cols[stateIdx] : '',
            zipIdx !== -1 ? cols[zipIdx] : '',
          ].filter(Boolean);
          addrText = parts.join(', ');
        }
        if (!addrText) continue;

        const siteName = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Property ${addrText.split(',')[0]}`;
        const city = cityIdx !== -1 ? cols[cityIdx] : undefined;
        const state = stateIdx !== -1 ? cols[stateIdx] : undefined;
        const zip = zipIdx !== -1 ? cols[zipIdx] : undefined;
        const county = countyIdx !== -1 ? cols[countyIdx] : undefined;

        addressItems.push({
          id: `addr-${i}-${Date.now()}`,
          siteName,
          address: addrText,
          city,
          state,
          zip,
          county,
        });
      }

      const { resolveBatchAddresses } = await import('@/services/addressLookupService');
      const { resolved, skippedCount: lookupSkipped } = await resolveBatchAddresses(
        addressItems,
        (current, total) => setResolutionProgress({ current, total })
      );

      setIsResolvingAddresses(false);
      setResolutionProgress(null);

      if (resolved.length === 0) {
        setErrorMsg('Could not resolve addresses to coordinates using Mireye /v1/lookup.');
        return;
      }

      const convertedSites: CustomSiteParcel[] = resolved.map((r) => ({
        siteId: r.siteId,
        siteName: r.siteName,
        county: r.county,
        state: r.state,
        lat: r.lat,
        lng: r.lng,
        ownershipType: 'CORPORATE_FEE_SIMPLE',
        parkingLotAreaSqFt: 45000,
      }));

      setSkippedCount(lookupSkipped);
      setParsedSites(convertedSites);
    }
  };

  const parseGeoJson = (jsonText: string) => {
    setSkippedCount(0);
    const data = JSON.parse(jsonText);
    const sites: CustomSiteParcel[] = [];
    const seenCoords = new Set<string>();
    let skipped = 0;

    const features = data.type === 'FeatureCollection' ? data.features : [data];
    features.forEach((feat: any, idx: number) => {
      if (!feat.geometry) {
        skipped++;
        return;
      }
      let lat = 0;
      let lng = 0;

      if (feat.geometry.type === 'Point') {
        [lng, lat] = feat.geometry.coordinates;
      } else if (feat.geometry.type === 'Polygon') {
        const ring = feat.geometry.coordinates[0];
        lng = ring.reduce((acc: number, pt: number[]) => acc + pt[0], 0) / ring.length;
        lat = ring.reduce((acc: number, pt: number[]) => acc + pt[1], 0) / ring.length;
      }

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        skipped++;
        return;
      }

      const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      if (seenCoords.has(coordKey)) {
        skipped++;
        return;
      }
      seenCoords.add(coordKey);

      const props = feat.properties || {};
      const siteName = props.name || props.site_name || props.store_name || props.apn || `GeoJSON Site #${idx + 1}`;
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

    setSkippedCount(skipped);
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

        {/* Dual Mode Feature Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className={`p-3 rounded-xl border transition-all ${ingestionMode === 'COORDINATES' ? 'bg-amber-500/10 border-amber-400 text-amber-300' : 'bg-slate-950/60 border-white/10 text-slate-400'}`}>
            <div className="font-bold flex items-center justify-between text-white">
              <span>Option A: Coordinates</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Fastest</span>
              </span>
            </div>
            <div className="text-[11px] mt-1 text-slate-400">CSV/GeoJSON containing lat, lng values for instant evaluation.</div>
          </div>
          <div className={`p-3 rounded-xl border transition-all ${ingestionMode === 'ADDRESS_LOOKUP' ? 'bg-amber-500/10 border-amber-400 text-amber-300' : 'bg-slate-950/60 border-white/10 text-slate-400'}`}>
            <div className="font-bold flex items-center justify-between text-white">
              <span>Option B: Addresses</span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Mireye Lookup</span>
              </span>
            </div>
            <div className="text-[11px] mt-1 text-slate-400">CSV with street, city, state. Auto-resolves locations via /v1/lookup.</div>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
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
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-white">
              Drag & Drop your parcel portfolio file here
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Supports <span className="text-amber-400 font-bold">.CSV</span> with coordinates OR street addresses
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-slate-400" onClick={(e) => e.stopPropagation()}>
              <span>Download sample test portfolio:</span>
              <a href="/data/address_portfolio_15.csv" download className="text-amber-400 hover:underline font-bold flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>15 Sites</span>
              </a>
              <span>•</span>
              <a href="/data/address_portfolio_20.csv" download className="text-amber-400 hover:underline font-bold flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>20 Sites</span>
              </a>
              <span>•</span>
              <a href="/data/address_portfolio_50.csv" download className="text-amber-400 hover:underline font-bold flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>50 Sites</span>
              </a>
              <span>•</span>
              <a href="/data/address_portfolio_100.csv" download className="text-amber-400 hover:underline font-bold flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>100 Sites</span>
              </a>
              <span>•</span>
              <a href="/data/coordinates_portfolio_100.csv" download className="text-cyan-400 hover:underline font-bold flex items-center gap-1">
                <Download className="w-3 h-3 text-cyan-400" />
                <span>100 Coords (Option A)</span>
              </a>
              <span>•</span>
              <a href="/data/address_portfolio_300.csv" download className="text-amber-400 hover:underline font-bold flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>300 Sites</span>
              </a>
              <span>•</span>
              <a href="/data/address_portfolio_500.csv" download className="text-amber-400 hover:underline font-bold flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>500 Sites</span>
              </a>
            </div>
          </div>
        </div>

        {/* Address Resolution Progress Indicator */}
        {isResolvingAddresses && resolutionProgress && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 font-mono text-xs text-amber-300">
            <div className="flex justify-between items-center font-bold">
              <span>Resolving property locations via Mireye /v1/lookup...</span>
              <span>{resolutionProgress.current} / {resolutionProgress.total} addresses resolved</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-200"
                style={{ width: `${Math.round((resolutionProgress.current / Math.max(1, resolutionProgress.total)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Callout */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs font-mono text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Sites Preview */}
        {parsedSites.length > 0 && !isResolvingAddresses && (
          <div className="p-4 rounded-2xl bg-[#0a0a14] border border-white/15 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{parsedSites.length} Resolved Candidate Sites</span>
                {skippedCount > 0 && (
                  <span className="text-amber-400 text-[11px] font-normal font-mono ml-2 inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>({skippedCount} unresolved/invalid skipped)</span>
                  </span>
                )}
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
                  + {parsedSites.length - 5} more candidate parcels ready for Mireye batch evaluation
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
            disabled={parsedSites.length === 0 || isResolvingAddresses}
            onClick={handleConfirm}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 shadow-md"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Ingest Portfolio into Agent ({parsedSites.length} Sites)</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

      </div>
    </div>
  );
}
