import type { MireyeFetchResponse } from './mireye';

export type UseCaseId =
  | 'warehouse'
  | 'hospital'
  | 'battery-factory'
  | 'ev-charging'
  | 'solar-farm'
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

export interface LocationResult {
  location: LocationEntry;
  data: MireyeFetchResponse | null;
  totalScore: number;
  fieldScores: FieldScore[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  error: string | null;
  alternatives: AlternativeSite[];
  assemblyResult?: AssemblyResult;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  useCaseId: UseCaseId;
  requirements: Record<string, string | boolean>;
  locations: LocationEntry[];
  createdAt: string;
}
