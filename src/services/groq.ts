export async function askGroq(prompt: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq Proxy Error:", errText);
      return '';
    }

    const data = await res.json();
    return data.answer || '';
  } catch (err) {
    console.error("Failed to query Groq Proxy API:", err);
    return '';
  }
}
