// src/utils/sanitizeResponse.ts
// Utility for sanitizing raw Mireye LLM response markup (removing <parameter> tags and extracting metadata)

export interface SanitizedMireyeResponse {
  cleanAnswer: string;
  extractedConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | null;
}

export function sanitizeMireyeResponse(rawAnswer: string): SanitizedMireyeResponse {
  if (!rawAnswer || typeof rawAnswer !== 'string') {
    return { cleanAnswer: '', extractedConfidence: null };
  }

  let extractedConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | null = null;

  // Extract confidence if present in parameter tags
  const confMatch = rawAnswer.match(/<parameter\s+name=["']confidence["']\s*>(high|medium|low)/i) ||
                    rawAnswer.match(/confidence:\s*(high|medium|low)/i);
  if (confMatch) {
    const val = confMatch[1].toUpperCase();
    if (val === 'HIGH' || val === 'MEDIUM' || val === 'LOW') {
      extractedConfidence = val;
    }
  }

  // Strip all XML parameter tags and internal serialization wrappers
  let cleanAnswer = rawAnswer
    .replace(/<parameter\s+name=["'][^"']*["']\s*>[^<]*<\/parameter>/gi, '')
    .replace(/<parameter[^>]*>/gi, '')
    .replace(/<\/parameter>/gi, '')
    .replace(/<\/?xml[^>]*>/gi, '')
    .replace(/<\/?metadata[^>]*>/gi, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  return { cleanAnswer, extractedConfidence };
}
