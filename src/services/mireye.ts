import type { MireyeFetchResponse } from '../types/mireye';

export async function fetchFields(
  lat: number,
  lng: number,
  fields: string[]
): Promise<MireyeFetchResponse> {
  const res = await fetch('/api/mireye/fetch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lat, lng, fields }),
  });

  if (!res.ok) {
    let detail = `Mireye API error (${res.status})`;
    try {
      const err = await res.json();
      if (err.error) detail = err.error;
    } catch {}
    throw new Error(detail);
  }

  return res.json() as Promise<MireyeFetchResponse>;
}

export async function askQuestion(
  lat: number,
  lng: number,
  question: string
): Promise<string> {
  try {
    const res = await fetch('/api/mireye/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng, question }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return (data.answer as string) || '';
  } catch {
    return '';
  }
}
