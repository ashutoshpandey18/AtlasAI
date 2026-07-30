export async function askGroq(
  prompt: string,
  options?: { systemPrompt?: string; userQuestion?: string }
): Promise<string> {
  try {
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemPrompt: options?.systemPrompt,
        userQuestion: options?.userQuestion,
      }),
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
