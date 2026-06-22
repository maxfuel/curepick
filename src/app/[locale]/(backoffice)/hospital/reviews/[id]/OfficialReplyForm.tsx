"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addOfficialReply } from "@/lib/actions/hospital-review";

type ActionState = { error?: string; success?: boolean } | null;

async function replyAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const reviewId = formData.get("reviewId") as string;
  const content = formData.get("content") as string;
  return addOfficialReply(reviewId, content);
}

export function OfficialReplyForm({ reviewId }: { reviewId: string }) {
  const t = useTranslations("hospital.reviews");
  const [state, formAction, pending] = useActionState(replyAction, null);

  if (state?.success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        {t("replySent")}
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 bg-muted/20">
      <h3 className="text-sm font-semibold mb-2">{t("officialReply")}</h3>
      <p className="text-xs text-muted-foreground mb-3">{t("officialReplyHint")}</p>
      <form action={formAction}>
        <input type="hidden" name="reviewId" value={reviewId} />
        {state?.error && (
          <p className="mb-2 text-xs text-destructive">{state.error}</p>
        )}
        <textarea
          name="content"
          required
          rows={4}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder={t("replyPlaceholder")}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {pending ? t("sending") : t("submitReply")}
          </button>
        </div>
      </form>
    </div>
  );
}
