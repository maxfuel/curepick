export async function translateText(
  text: string,
  targetLocale: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_TRANSLATE_API_KEY not set");

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target: targetLocale, format: "text" }),
    }
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const msg = (errBody as { error?: { message?: string } }).error?.message
      ?? `HTTP ${response.status}`;
    throw new Error(msg);
  }

  const data = (await response.json()) as {
    data: { translations: Array<{ translatedText: string }> };
  };
  return data.data.translations[0].translatedText;
}
