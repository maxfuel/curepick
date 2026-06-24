"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignCurePartner } from "@/lib/actions/admin-cases";

interface Props {
  caseId: string;
  currentCurePartnerId: string | null;
  curePartners: { id: string; full_name: string }[];
}

export default function AssignCurePartnerForm({ caseId, currentCurePartnerId, curePartners }: Props) {
  const [selected, setSelected] = useState(currentCurePartnerId ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      await assignCurePartner(caseId, selected || null);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="rounded-md border bg-background px-3 py-2 text-sm flex-1 max-w-xs"
      >
        <option value="">— Unassigned —</option>
        {curePartners.map((cp) => (
          <option key={cp.id} value={cp.id}>{cp.full_name}</option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
      {saved && <span className="text-xs text-green-600">Saved</span>}
    </div>
  );
}
