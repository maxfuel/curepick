"use client";

import { useTranslations } from "next-intl";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error: _error, reset }: ErrorPageProps) {
  const t = useTranslations("errors");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-8xl font-bold text-muted-foreground">500</p>
      <h1 className="text-2xl font-semibold">{t("serverError.title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("serverError.message")}</p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("serverError.retry")}
        </button>
        <a
          href="/"
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {t("serverError.backHome")}
        </a>
      </div>
    </div>
  );
}
