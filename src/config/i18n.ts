export const locales = ["en", "ko", "ja", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  zh: "中文",
};

export const SUPPORTED_LANGS = [
  { code: "ko", label: "KR", name: "한국어" },
  { code: "en", label: "EN", name: "English" },
  { code: "zh", label: "CN", name: "简体中文" },
  { code: "zh-TW", label: "TW", name: "繁體中文" },
  { code: "ja", label: "JP", name: "日本語" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "ar", label: "AR", name: "العربية" },
  { code: "uk", label: "UA", name: "Українська" },
  { code: "kk", label: "KZ", name: "Қазақша" },
  { code: "it", label: "IT", name: "Italiano" },
  { code: "es", label: "ES", name: "Español" },
  { code: "id", label: "ID", name: "Bahasa Indonesia" },
  { code: "pt", label: "PT", name: "Português" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "pl", label: "PL", name: "Polski" },
] as const;

export type LangCode = (typeof SUPPORTED_LANGS)[number]["code"];
export type MultilingualValue = Partial<Record<LangCode, string>>;
export const PRIMARY_LANGS = ["ko", "en"] as const;
