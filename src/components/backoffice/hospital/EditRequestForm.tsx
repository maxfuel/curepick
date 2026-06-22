"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitEditRequest } from "@/lib/actions/hospital";

export function EditRequestForm({ section }: { section: string }) {
  const t = useTranslations("hospital.editRequest");
  const [state, formAction, pending] = useActionState(submitEditRequest, null);

  if (state?.success) {
    return (
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        {t("sent")}
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 rounded-lg border p-4 bg-muted/20">
      <input type="hidden" name="section" value={section} />
      <h3 className="text-sm font-semibold mb-2">{t("title")}</h3>
      <p className="text-xs text-muted-foreground mb-3">{t("subtitle")}</p>
      {state?.error && (
        <p className="mb-2 text-xs text-destructive">{state.error}</p>
      )}
      <textarea
        name="message"
        required
        rows={3}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        placeholder={t("placeholder")}
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {pending ? t("sending") : t("submit")}
        </button>
      </div>
    </form>
  );
}
