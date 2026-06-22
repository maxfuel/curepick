"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface TranslateButtonProps {
  type: "review" | "comment";
  id: string;
  locale: string;
  translation: { title?: string; content: string } | null;
  showTranslation: boolean;
  onTranslated: (data: { title?: string; content: string }) => void;
  onToggle: (show: boolean) => void;
}

export function TranslateButton({
  type,
  id,
  locale,
  translation,
  showTranslation,
  onTranslated,
  onToggle,
}: TranslateButtonProps) {
  const t = useTranslations("reviews");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    if (showTranslation) {
      onToggle(false);
      return;
    }

    if (translation) {
      onToggle(true);
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch(
        `/api/translations?type=${type}&id=${encodeURIComponent(id)}&locale=${encodeURIComponent(locale)}`
      );
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { title?: string; content: string };
      onTranslated(data);
      onToggle(true);
    } catch {
      setError(t("translationError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:opacity-50"
      >
        {isPending
          ? t("translating")
          : showTranslation
            ? t("viewOriginal")
            : t("viewTranslation")}
      </button>
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
