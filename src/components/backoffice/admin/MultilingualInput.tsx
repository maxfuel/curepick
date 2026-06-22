"use client";

import { useState } from "react";

type Langs = "en" | "ko" | "zh" | "ja";
const LANGS: Langs[] = ["en", "ko", "zh", "ja"];
const LANG_LABELS: Record<Langs, string> = { en: "EN", ko: "KO", zh: "ZH", ja: "JA" };

export type MultilingualValue = Record<Langs, string>;

interface MultilingualInputProps {
  name: string;
  label: string;
  value?: Partial<MultilingualValue>;
  multiline?: boolean;
}

export function MultilingualInput({
  name,
  label,
  value = {},
  multiline = false,
}: MultilingualInputProps) {
  const [active, setActive] = useState<Langs>("en");
  const [vals, setVals] = useState<MultilingualValue>({
    en: value.en ?? "",
    ko: value.ko ?? "",
    zh: value.zh ?? "",
    ja: value.ja ?? "",
  });

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-1 mb-1">
        {LANGS.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActive(lang)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              active === lang
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {LANG_LABELS[lang]}
          </button>
        ))}
      </div>
      {LANGS.map((lang) => (
        <div key={lang} className={lang === active ? "block" : "hidden"}>
          {multiline ? (
            <textarea
              rows={3}
              value={vals[lang]}
              onChange={(e) => setVals((v) => ({ ...v, [lang]: e.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          ) : (
            <input
              type="text"
              value={vals[lang]}
              onChange={(e) => setVals((v) => ({ ...v, [lang]: e.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          )}
        </div>
      ))}
      <input type="hidden" name={name} value={JSON.stringify(vals)} />
    </div>
  );
}
