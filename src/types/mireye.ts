export interface MireyeFieldValue {
  value: string | number | boolean | null;
  unit: string | null;
  source: string;
  source_url: string;
  confidence: 'high' | 'medium' | 'low';
  fetched_at: string;
  dataset_vintage: string | null;
  ttl_seconds: number;
  notes: string | null;
}

export interface MireyePartialFailure {
  field: string;
  source: string;
  error: string;
  retryable: boolean;
}

export interface MireyeFetchResponse {
  lat: number;
  lng: number;
  fetched_at: string;
  fields: Record<string, MireyeFieldValue>;
  partial_failures: MireyePartialFailure[];
}

export interface MireyeAskResponse {
  lat: number;
  lng: number;
  question: string;
  answered_at: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  citations: Array<{
    source: string;
    source_url: string;
    fields: string[];
    fetched_at: string;
    confidence: string;
  }>;
  fields_used: string[];
}
