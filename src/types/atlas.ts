import type { MireyeFetchResponse } from './mireye';
import type { SiteRegistrationStatus } from '../services/mireyeSiteService';

export type UseCaseId =
  | 'warehouse'
  | 'hospital'
  | 'battery-factory'
  | 'ev-charging'
  | 'solar-farm'
  | 'solar-carport'
  | 'wind-farm'
  | 'retail-store'
  | 'manufacturing';

export interface RequirementQuestion {
  id: string;
  question: string;
  type: 'boolean' | 'select';
  options?: Array<{ label: string; value: string }>;
  defaultValue: string | boolean;
  hint?: string;
}

export interface UseCase {
  id: UseCaseId;
  name: string;
  description: string;
  fields: string[];
  questions: RequirementQuestion[];
  scoringWeights: Record<string, number>;
}

export interface LocationEntry {
  id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  label: string;
  geocoding: boolean;
  geocoded: boolean;
  error: string | null;
}

export interface JurisdictionRisk {
  rtoRegion: string;
  lineRtoRegion?: string;
  crossRtoBoundary: boolean;
  dfirmVintage?: string;
  note: string;
}

export interface FieldScore {
  fieldName: string;
  displayName: string;
  score: number;
  rawValue: string | number | boolean | null;
  unit: string | null;
  interpretation: string;
  source: string;
  sourceUrl: string;
  confidence: string;
  weight: number;
  routingPremiumPct?: number;
  routingBarriers?: string[];
  jurisdictionRisk?: JurisdictionRisk;
}

export interface AlternativeSite {
  label: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  direction: string;
  reason: string;
  estimatedScoreBoost: number;
}

export interface AssemblyResult {
  feasibilityScore: number;
  estimatedOwnersMin: number;
  estimatedOwnersMax: number;
  targetAcres: number;
  assemblableAcres: number;
  dominantConstraint: string;
  contiguityRating: 'High' | 'Moderate' | 'Low' | 'Severely Fragmented';
  keyBarriers: string[];
}

/** Mireye persistent Site Dossier registration metadata (Atlas V1.3) */
export interface MireyeSiteRegistration {
  site_id: string | null;
  status: SiteRegistrationStatus;
  registered_at: string | null;
  skip_reason?: string;
  error?: string;
  geometrySource?: 'Uploaded GeoJSON' | 'Mireye /v1/lookup' | null;
}

export interface LocationResult {
  location: LocationEntry;
  data: MireyeFetchResponse | null;
  totalScore: number;
  fieldScores: FieldScore[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  error: string | null;
  alternatives: AlternativeSite[];
  assemblyResult?: AssemblyResult;
  /** Populated after pipeline completes for top-ranked survivors only */
  mireyeSite?: MireyeSiteRegistration | null;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  useCaseId: UseCaseId;
  requirements: Record<string, string | boolean>;
  locations: LocationEntry[];
  createdAt: string;
}
