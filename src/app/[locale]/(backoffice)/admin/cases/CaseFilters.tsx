"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const STATUSES = ["", "lead", "qualified", "confirmed", "arrived", "in_treatment", "completed"];
const LABELS: Record<string, string> = {
  "": "All",
  lead: "Lead",
  qualified: "Qualified",
  confirmed: "Confirmed",
  arrived: "Arrived",
  in_treatment: "In Treatment",
  completed: "Completed",
};

export default function CaseFilters({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(status: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (status) sp.set("status", status);
    else sp.delete("status");
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => navigate(s)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            currentStatus === s
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          {LABELS[s]}
        </button>
      ))}
    </div>
  );
}
