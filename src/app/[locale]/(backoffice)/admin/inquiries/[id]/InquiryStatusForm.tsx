"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateInquiryStatus } from "@/lib/actions/admin-inquiries";
import { useTranslations } from "next-intl";

interface Props {
  id: string;
  currentStatus: string;
}

const STATUSES = ["new", "contacted", "closed"] as const;

export function InquiryStatusForm({ id, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("admin.inquiries");

  function handleChange(newStatus: string) {
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      await adminUpdateInquiryStatus(id, newStatus);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {STATUSES.map((s) => (
        <button
          key={s}
          disabled={isPending || s === currentStatus}
          onClick={() => handleChange(s)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
            s === currentStatus
              ? "bg-primary text-primary-foreground cursor-default"
              : "border hover:bg-muted"
          }`}
        >
          {t(s)}
        </button>
      ))}
    </div>
  );
}
