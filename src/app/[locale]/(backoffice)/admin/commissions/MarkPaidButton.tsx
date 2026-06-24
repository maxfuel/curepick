"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markCommissionPaid } from "@/lib/actions/admin-commissions";

export default function MarkPaidButton({ commissionId }: { commissionId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!confirm("Mark this commission as paid?")) return;
    startTransition(async () => {
      await markCommissionPaid(commissionId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      {isPending ? "…" : "Mark Paid"}
    </button>
  );
}
