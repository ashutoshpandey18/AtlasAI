import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { lat, lng, question } = await req.json();
    const token = process.env.MIREYE_API_TOKEN || process.env.NEXT_PUBLIC_MIREYE_API_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'Mireye API token is not configured on the server.' }, { status: 500 });
    }

    const res = await fetch('https://api.mireye.com/v1/ask', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng, question }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Mireye Ask request failed' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
