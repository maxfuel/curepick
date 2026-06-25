import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { translateText } from "@/lib/translation/google";
import { SUPPORTED_LANGS, type LangCode } from "@/config/i18n";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    text: string;
    from: LangCode;
    targets?: LangCode[];
    force?: boolean;
  };

  const { text, from, targets, force = false } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const allTargets = (targets ?? SUPPORTED_LANGS.map((l) => l.code as LangCode))
    .filter((code) => code !== from);

  const results = await Promise.allSettled(
    allTargets.map(async (code) => {
      const translated = await translateText(text, code);
      return [code, translated] as [LangCode, string];
    })
  );

  const translations: Partial<Record<LangCode, string>> = {};
  const errors: string[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      const [code, translated] = result.value;
      translations[code] = translated;
    } else {
      errors.push(String((result.reason as Error).message));
    }
  }

  void force; // force flag handled client-side (which fields to overwrite)

  if (Object.keys(translations).length === 0 && errors.length > 0) {
    return NextResponse.json({ translations, error: errors[0] });
  }

  return NextResponse.json({ translations });
}
