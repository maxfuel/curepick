"use client";

import { useState } from "react";
import { SUPPORTED_LANGS } from "@/config/i18n";

interface Props {
  name: string;
  defaultValue?: string[];
}

export function LanguageTagPicker({ name, defaultValue = [] }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultValue);

  const add = (code: string) => setSelected((prev) => [...prev, code]);
  const remove = (code: string) => setSelected((prev) => prev.filter((c) => c !== code));

  const selectedLangs = SUPPORTED_LANGS.filter((l) => selected.includes(l.code));
  const availableLangs = SUPPORTED_LANGS.filter((l) => !selected.includes(l.code));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="min-h-[96px] rounded-md border bg-background p-3">
          <p className="mb-2 text-xs text-muted-foreground">선택된 언어</p>
          <div className="flex flex-wrap gap-1">
            {selectedLangs.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => remove(l.code)}
                className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {l.label}{l.name}
                <span className="ml-0.5 opacity-60">×</span>
              </button>
            ))}
          </div>
        </div>
        <div className="min-h-[96px] rounded-md border bg-muted/30 p-3">
          <p className="mb-2 text-xs text-muted-foreground">클릭하여 추가</p>
          <div className="flex flex-wrap gap-1">
            {availableLangs.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => add(l.code)}
                className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                {l.label}{l.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <input type="hidden" name={name} value={selected.join(",")} />
    </div>
  );
}
