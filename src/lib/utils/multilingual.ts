import { SUPPORTED_LANGS, type LangCode, type MultilingualValue } from "@/config/i18n";

export function parseMultilingual(raw: string | null | unknown): MultilingualValue {
  if (!raw) return emptyMultilingual();
  if (typeof raw === "object" && raw !== null) return raw as MultilingualValue;
  try {
    return JSON.parse(raw as string) as MultilingualValue;
  } catch {
    const fallback = raw as string;
    return Object.fromEntries(
      SUPPORTED_LANGS.map((l) => [l.code, fallback])
    ) as Record<LangCode, string>;
  }
}

export function emptyMultilingual(): MultilingualValue {
  return Object.fromEntries(
    SUPPORTED_LANGS.map((l) => [l.code, ""])
  ) as Record<LangCode, string>;
}
