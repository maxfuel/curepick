"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateInquiryStatus } from "@/lib/actions/hospital-inquiry";

const STATUSES = ["new", "contacted", "closed"] as const;

export function InquiryStatusForm({
  id,
  currentStatus,
  locale,
}: {
  id: string;
  currentStatus: string;
  locale: string;
}) {
  const t = useTranslations("hospital.inquiries");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      await updateInquiryStatus(id, newStatus);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border p-4 bg-muted/20">
      <h2 className="text-sm font-semibold mb-3">{t("changeStatus")}</h2>
      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={isPending || currentStatus === s}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              currentStatus === s
                ? "bg-primary text-primary-foreground cursor-default"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {t(s)}
          </button>
        ))}
      </div>
    </div>
  );
}
