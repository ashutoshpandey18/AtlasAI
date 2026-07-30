import { askGroq } from './groq';

export async function askGemini(
  prompt: string,
  fallbackFn?: () => Promise<string>,
  options?: { systemPrompt?: string; userQuestion?: string }
): Promise<string> {
  try {
    const groqAns = await askGroq(prompt, options);
    if (groqAns) {
      return groqAns;
    }
  } catch (err) {
    console.warn("Failed to query Groq API. Falling back...", err);
  }

  // Fallback to the default Mireye Ask engine
  if (fallbackFn) {
    return await fallbackFn();
  }
  return '';
}
