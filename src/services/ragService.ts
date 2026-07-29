/**
 * ragService.ts
 *
 * Retrieval-Augmented Generation for Atlas regulatory intelligence.
 *
 * Architecture:
 *   1. Embed corpus chunks via Gemini text-embedding-004 (server-side, one-time)
 *   2. Store embeddings as JSON blobs in LibSQL (turso)
 *   3. At query time: embed the query, cosine-similarity rank all chunks, return top-K
 *   4. Augment Gemini prompt with retrieved chunks → regulation-aware narrative
 *
 * The corpus covers all 7 US RTO regions with interconnection queue rules,
 * study costs, capacity market rules, and geographic context.
 */

import { createClient } from '@libsql/client';
import { RTO_KNOWLEDGE_BASE, type RtoChunk } from '@/data/rtoKnowledgeBase';
import { getRtoRegion } from './jurisdictionRisk';

// ── LibSQL client (server-side only) ─────────────────────────────────────────

function getDbClient() {
  return createClient({
    url:       process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN   || '',
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RagChunkWithEmbedding extends RtoChunk {
  embedding: number[];
}

export interface RetrievedChunk {
  chunk: RtoChunk;
  similarity: number;
}

export interface RagResult {
  narrative: string;
  retrievedChunks: RetrievedChunk[];
  rtoRegion: string;
  usedFallback: boolean;
}

// ── Gemini Embedding API ─────────────────────────────────────────────────────

const GEMINI_EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent';

const GEMINI_GEN_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const GROQ_GEN_URL =
  'https://api.groq.com/openai/v1/chat/completions';

async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(`${GEMINI_EMBED_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text }] },
    }),
  });

  if (!res.ok) throw new Error(`Gemini embed error: ${res.status} ${await res.text()}`);

  const json = await res.json();
  return json.embedding?.values as number[];
}

async function generateText(prompt: string): Promise<string> {
  // Primary: Groq (llama-3.3-70b) — fast, no quota issues
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch(GROQ_GEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 700,
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content as string | undefined;
        if (text) return text;
      }
    } catch (e) {
      console.warn('[RAG] Groq generation failed, trying Gemini fallback:', e);
    }
  }

  // Fallback: Gemini Flash
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No generation API key available');

  const res = await fetch(`${GEMINI_GEN_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 700, temperature: 0.3 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini gen error: ${res.status} ${await res.text()}`);

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── Cosine Similarity ─────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function initRagTable(): Promise<void> {
  const db = getDbClient();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS rag_embeddings (
      id          TEXT PRIMARY KEY,
      rtoRegion   TEXT NOT NULL,
      topic       TEXT NOT NULL,
      content     TEXT NOT NULL,
      sourceLabel TEXT NOT NULL,
      embedding   TEXT NOT NULL,
      createdAt   TEXT NOT NULL
    )
  `);
}

async function getStoredEmbeddingCount(): Promise<number> {
  const db = getDbClient();
  const res = await db.execute('SELECT count(*) as c FROM rag_embeddings');
  return Number(res.rows[0]?.c ?? 0);
}

async function storeEmbedding(chunk: RtoChunk, embedding: number[]): Promise<void> {
  const db = getDbClient();
  await db.execute({
    sql: `INSERT INTO rag_embeddings (id, rtoRegion, topic, content, sourceLabel, embedding, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            embedding  = excluded.embedding,
            createdAt  = excluded.createdAt`,
    args: [
      chunk.id,
      chunk.rtoRegion,
      chunk.topic,
      chunk.content,
      chunk.sourceLabel,
      JSON.stringify(embedding),
      new Date().toISOString(),
    ],
  });
}

async function loadAllEmbeddings(): Promise<RagChunkWithEmbedding[]> {
  const db = getDbClient();
  const res = await db.execute('SELECT * FROM rag_embeddings');
  return res.rows.map((row) => ({
    id:          String(row.id),
    rtoRegion:   String(row.rtoRegion),
    topic:       String(row.topic),
    content:     String(row.content),
    sourceLabel: String(row.sourceLabel),
    embedding:   JSON.parse(String(row.embedding)) as number[],
  }));
}

// ── Corpus Seeding (called once at startup if corpus is empty) ────────────────

let seedPromise: Promise<void> | null = null;

export async function ensureCorpusSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      await initRagTable();
      const count = await getStoredEmbeddingCount();

      if (count >= RTO_KNOWLEDGE_BASE.length) {
        console.log(`[RAG] Corpus already seeded (${count} chunks).`);
        return;
      }

      console.log(`[RAG] Seeding corpus: ${RTO_KNOWLEDGE_BASE.length} chunks...`);

      for (const chunk of RTO_KNOWLEDGE_BASE) {
        const text = `${chunk.topic}. ${chunk.content}`;
        const embedding = await embedText(text);
        await storeEmbedding(chunk, embedding);
        // Small delay to respect API rate limits
        await new Promise((r) => setTimeout(r, 100));
      }

      console.log('[RAG] Corpus seeded successfully.');
    } catch (err) {
      console.error('[RAG] Failed to seed corpus:', err);
      // Don't block the app — fall back to region-matching
    }
  })();

  return seedPromise;
}

// ── Retrieval ─────────────────────────────────────────────────────────────────

/**
 * Retrieve the top-K most relevant chunks for a given query and lat/lng.
 * Falls back to region-filtered keyword matching if embeddings are unavailable.
 */
export async function retrieveRelevantChunks(
  query: string,
  lat: number,
  lng: number,
  topK = 4,
): Promise<{ chunks: RetrievedChunk[]; usedFallback: boolean }> {
  const rtoRegion = getRtoRegion(lat, lng);

  // Try semantic retrieval
  try {
    await ensureCorpusSeeded();
    const storedChunks = await loadAllEmbeddings();

    if (storedChunks.length > 0) {
      const queryEmbedding = await embedText(query);
      const ranked = storedChunks
        .map((c) => ({ chunk: c, similarity: cosineSimilarity(queryEmbedding, c.embedding) }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      return { chunks: ranked, usedFallback: false };
    }
  } catch (err) {
    console.warn('[RAG] Semantic retrieval failed, using fallback:', err);
  }

  // Fallback: filter by RTO region + cross-region chunks
  const fallback = RTO_KNOWLEDGE_BASE
    .filter((c) => c.rtoRegion === rtoRegion || c.rtoRegion === 'all')
    .slice(0, topK)
    .map((c) => ({ chunk: c, similarity: 0 }));

  return { chunks: fallback, usedFallback: true };
}

// ── RAG-Augmented Generation ─────────────────────────────────────────────────

/**
 * Core RAG function: retrieve relevant regulatory chunks, augment Gemini prompt,
 * generate a regulation-aware interconnection intelligence narrative.
 *
 * @param lat       Site latitude
 * @param lng       Site longitude
 * @param useCaseName  e.g. "Solar Farm", "Data Center"
 * @param projectMw    Project capacity in MW
 * @param distanceKm   Distance to nearest transmission line in km
 * @param voltageKv    Nearest line voltage in kV (optional)
 */
export async function generateRegulatoryIntelligence(params: {
  lat: number;
  lng: number;
  useCaseName: string;
  projectMw: number;
  distanceKm: number | null;
  voltageKv: number | null;
  barrierMultiplier: number;
  queueRisk: string;
}): Promise<RagResult> {
  const { lat, lng, useCaseName, projectMw, distanceKm, voltageKv, barrierMultiplier, queueRisk } = params;
  const rtoRegion = getRtoRegion(lat, lng);

  const query = `interconnection rules queue timeline costs for ${useCaseName} ${projectMw} MW in ${rtoRegion} region`;

  const { chunks, usedFallback } = await retrieveRelevantChunks(query, lat, lng, 4);

  const contextBlock = chunks
    .map((r, i) => `[Source ${i + 1}: ${r.chunk.sourceLabel}]\n${r.chunk.content}`)
    .join('\n\n');

  const distanceStr = distanceKm !== null ? `${distanceKm.toFixed(1)} km` : 'unknown distance';
  const voltageStr  = voltageKv  !== null ? `${voltageKv} kV`             : 'unknown voltage';

  const prompt = `You are Atlas AI, an expert interconnection analyst for utility-scale infrastructure projects.

A ${projectMw} MW ${useCaseName} project is being evaluated at coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) in the ${rtoRegion} RTO region.

SITE METRICS:
- Distance to nearest transmission line: ${distanceStr}
- Nearest line voltage: ${voltageStr}
- Corridor barrier multiplier: ${barrierMultiplier.toFixed(2)}× (environmental terrain adjustment)
- Atlas queue risk assessment: ${queueRisk}

RETRIEVED REGULATORY CONTEXT (from RTO tariffs and FERC filings):
${contextBlock}

Based ONLY on the site metrics above and the retrieved regulatory context, write a 3-paragraph interconnection intelligence briefing:
1. Queue timeline and study process for this project in ${rtoRegion}
2. Expected interconnection cost range and network upgrade risk given the distance and voltage
3. Key regulatory risks or advantages specific to this region

Be specific. Reference actual timeline numbers and cost ranges from the context. Do not fabricate data not present in the context. Keep each paragraph to 2–3 sentences.`;

  try {
    const narrative = await generateText(prompt);
    return { narrative, retrievedChunks: chunks, rtoRegion, usedFallback };
  } catch (err) {
    // Fallback static narrative
    const fallbackNarrative = `This ${projectMw} MW ${useCaseName} site falls within the ${rtoRegion} interconnection region. ${
      distanceKm !== null
        ? `At ${distanceKm.toFixed(1)} km from the nearest ${voltageStr} line, the project faces ${barrierMultiplier > 1.2 ? 'elevated' : 'standard'} corridor complexity.`
        : 'Transmission distance data is unavailable for this site.'
    } Regulatory intelligence retrieval encountered an issue — please consult the ${rtoRegion} tariff directly for current queue timelines and study costs.`;

    return { narrative: fallbackNarrative, retrievedChunks: chunks, rtoRegion, usedFallback: true };
  }
}
