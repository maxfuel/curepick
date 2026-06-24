"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function CommissionFilters({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(status: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (status) sp.set("status", status); else sp.delete("status");
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex gap-2">
      {(["", "pending", "paid"] as const).map((s) => (
        <button
          key={s}
          onClick={() => navigate(s)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            currentStatus === s
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          {s === "" ? "All" : s === "pending" ? "Pending" : "Paid"}
        </button>
      ))}
    </div>
  );
}
