"use client";

import { useState, useTransition } from "react";
import { updateCaseStatus } from "@/lib/actions/cure-partner-cases";

const NEXT_STATUS: Record<string, string> = {
  confirmed: "arrived",
  arrived: "in_treatment",
  in_treatment: "completed",
};

const NEXT_LABEL: Record<string, string> = {
  arrived: "Mark as Arrived",
  in_treatment: "Start Treatment",
  completed: "Complete Case",
};

interface Props {
  caseId: string;
  currentStatus: string;
}

export function StatusUpdateButton({ caseId, currentStatus }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nextStatus = NEXT_STATUS[currentStatus];
  if (!nextStatus) return null;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await updateCaseStatus(caseId, nextStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update status");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
          nextStatus === "completed"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {isPending ? "Updating…" : NEXT_LABEL[nextStatus]}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
