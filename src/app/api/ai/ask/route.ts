import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/services/db';

const MODEL_NAME = 'llama-3.3-70b-versatile';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API key is not configured on the server.' }, { status: 500 });
    }

    const cacheKey = `ai-ask:${prompt.trim().toLowerCase()}`;

    // Read from Turso persistent edge cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`[Turso Cache Hit] AI Ask: ${cacheKey}`);
      return NextResponse.json(cachedData);
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 250,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Groq API Error: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    const resultText = data?.choices?.[0]?.message?.content;
    const answer = resultText ? resultText.trim() : '';
    
    const responsePayload = { answer };
    
    // Save to Turso persistent edge cache
    await setCache(cacheKey, responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
