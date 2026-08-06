// src/types/provenance.ts
// Standard Data Provenance Model for Atlas Acquisition Agent

export type DataStatusLabel =
  | 'Live Mireye API'
  | 'Cached Mireye API Result'
  | 'Public Dataset'
  | 'Atlas Computation'
  | 'User Input';

export type SourceType =
  | 'LIVE_API'
  | 'CACHED_API'
  | 'BUNDLED_DEMO'
  | 'PUBLIC_DATASET'
  | 'COMPUTED'
  | 'HEURISTIC'
  | 'USER_INPUT';

export interface DataProvenance {
  sourceType: SourceType;
  dataStatus: DataStatusLabel;
  provider: string; // e.g. 'Mireye Physical Intelligence', 'USGS 3DEP LiDAR', 'FEMA NFHL', 'NREL PVWatts v8'
  humanSource: string; // e.g. 'Mireye Routing Engine', 'Mireye Geocoding', 'USGS 3DEP LiDAR'
  technicalEndpoint?: string; // e.g. '/v1/fetch', '/v1/proximity', '/v1/lookup', '/v1/ask'
  retrievedAt?: string;
  cachedAt?: string;
  cacheAge?: string;
  computedFormula?: string;
  inputsUsed?: string[];
}

export function getFriendlyEndpointLabel(endpoint?: string): string {
  switch (endpoint) {
    case '/v1/proximity':
      return 'Mireye Routing Engine';
    case '/v1/fetch':
      return 'Mireye Physical Intelligence';
    case '/v1/lookup':
      return 'Mireye Geocoding';
    case '/v1/ask':
      return 'Mireye Q&A Engine';
    default:
      return endpoint || 'Mireye API';
  }
}
