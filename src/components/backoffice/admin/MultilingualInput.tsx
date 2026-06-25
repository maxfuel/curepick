"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { SUPPORTED_LANGS, PRIMARY_LANGS, type LangCode, type MultilingualValue } from "@/config/i18n";

const SECONDARY_LANGS = SUPPORTED_LANGS.filter(
  (l) => !(PRIMARY_LANGS as readonly string[]).includes(l.code)
);

interface MultilingualInputProps {
  name: string;
  label: string;
  value?: MultilingualValue;
  multiline?: boolean;
}

type TranslateState = "idle" | "loading";

export function MultilingualInput({
  name,
  label,
  value = {},
  multiline = false,
}: MultilingualInputProps) {
  const [vals, setVals] = useState<MultilingualValue>(() =>
    Object.fromEntries(SUPPORTED_LANGS.map((l) => [l.code, value[l.code as LangCode] ?? ""])) as MultilingualValue
  );
  const [autoTranslated, setAutoTranslated] = useState<Set<LangCode>>(new Set());
  const [state, setState] = useState<TranslateState>("idle");
  const [fieldState, setFieldState] = useState<Partial<Record<LangCode, TranslateState>>>({});
  const [error, setError] = useState<string | null>(null);

  const callTranslate = async (from: LangCode, targets: LangCode[]): Promise<Partial<Record<LangCode, string>>> => {
    const text = vals[from] ?? "";
    if (!text.trim()) return {};
    const res = await fetch("/api/admin/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, from, targets }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { translations: Partial<Record<LangCode, string>>; error?: string };
    if (data.error) throw new Error(data.error);
    return data.translations;
  };

  const translateFrom = async (from: LangCode, force = false) => {
    flushSync(() => {
      setState("loading");
      setError(null);
    });
    const targets = SUPPORTED_LANGS
      .map((l) => l.code as LangCode)
      .filter((code) => code !== from && (force || !(vals[code] ?? "").trim()));
    try {
      const translations = await callTranslate(from, targets);
      if (Object.keys(translations).length === 0) {
        setError("번역에 실패했습니다. API 키를 확인하세요.");
      } else {
        setVals((v) => ({ ...v, ...translations }));
        setAutoTranslated((prev) => {
          const next = new Set(prev);
          Object.keys(translations).forEach((k) => next.add(k as LangCode));
          return next;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "번역 중 오류가 발생했습니다.");
    } finally {
      setState("idle");
    }
  };

  const translateField = async (code: LangCode) => {
    const from: LangCode = "ko";
    setFieldState((s) => ({ ...s, [code]: "loading" }));
    setError(null);
    try {
      const translations = await callTranslate(from, [code]);
      if (translations[code]) {
        setVals((v) => ({ ...v, [code]: translations[code]! }));
        setAutoTranslated((prev) => new Set([...prev, code]));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "번역 중 오류가 발생했습니다.");
    } finally {
      setFieldState((s) => ({ ...s, [code]: "idle" }));
    }
  };

  const inputClass = (code: LangCode) =>
    `flex-1 rounded-md border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
      autoTranslated.has(code) ? "bg-blue-50/60 border-blue-200" : "bg-background"
    }`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-1 relative">
          <button
            type="button"
            disabled={state === "loading"}
            onClick={() => translateFrom("ko", true)}
            className="px-2 py-0.5 rounded text-xs font-medium bg-muted hover:bg-muted/70 disabled:opacity-50 transition-colors"
          >
            {state === "loading" ? "번역 중…" : "KO로 번역"}
          </button>
          <button
            type="button"
            disabled={state === "loading"}
            onClick={() => translateFrom("en", true)}
            className="px-2 py-0.5 rounded text-xs font-medium bg-muted hover:bg-muted/70 disabled:opacity-50 transition-colors"
          >
            EN으로 번역
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Primary langs: KO + EN side by side */}
      <div className="grid grid-cols-2 gap-2">
        {PRIMARY_LANGS.map((code) => {
          const lang = SUPPORTED_LANGS.find((l) => l.code === code)!;
          return (
            <div key={code} className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">{lang.label} ({lang.name})</span>
              {multiline ? (
                <textarea
                  rows={3}
                  value={vals[code as LangCode] ?? ""}
                  onChange={(e) => {
                    setVals((v) => ({ ...v, [code]: e.target.value }));
                    setAutoTranslated((prev) => { const n = new Set(prev); n.delete(code as LangCode); return n; });
                  }}
                  className="w-full rounded-md border bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              ) : (
                <input
                  type="text"
                  value={vals[code as LangCode] ?? ""}
                  onChange={(e) => {
                    setVals((v) => ({ ...v, [code]: e.target.value }));
                    setAutoTranslated((prev) => { const n = new Set(prev); n.delete(code as LangCode); return n; });
                  }}
                  className="w-full rounded-md border bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Secondary langs: 2-column grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1 border-t">
        {SECONDARY_LANGS.map((lang) => {
          const code = lang.code as LangCode;
          const isLoading = fieldState[code] === "loading";
          return (
            <div key={code} className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground w-7 shrink-0">{lang.label}</span>
              {multiline ? (
                <textarea
                  rows={2}
                  value={vals[code] ?? ""}
                  onChange={(e) => {
                    setVals((v) => ({ ...v, [code]: e.target.value }));
                    setAutoTranslated((prev) => { const n = new Set(prev); n.delete(code); return n; });
                  }}
                  className={inputClass(code)}
                />
              ) : (
                <input
                  type="text"
                  value={vals[code] ?? ""}
                  onChange={(e) => {
                    setVals((v) => ({ ...v, [code]: e.target.value }));
                    setAutoTranslated((prev) => { const n = new Set(prev); n.delete(code); return n; });
                  }}
                  className={inputClass(code)}
                />
              )}
              <button
                type="button"
                disabled={isLoading || !vals["ko"]?.trim()}
                onClick={() => translateField(code)}
                title="KO에서 재번역"
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors shrink-0 text-xs"
              >
                {isLoading ? "…" : "↺"}
              </button>
            </div>
          );
        })}
      </div>

      <input type="hidden" name={name} value={JSON.stringify(vals)} />
    </div>
  );
}
