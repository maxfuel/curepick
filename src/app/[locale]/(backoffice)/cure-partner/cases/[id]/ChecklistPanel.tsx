"use client";

import { useState, useTransition } from "react";
import { updateChecklist } from "@/lib/actions/cure-partner-cases";

const CHECKLIST_ITEMS = [
  { key: "airport_pickup", label: "Airport Pickup" },
  { key: "hospital_accompany", label: "Hospital Accompaniment" },
  { key: "interpretation", label: "Medical Interpretation" },
  { key: "discharge", label: "Discharge Assistance" },
] as const;

interface Props {
  caseId: string;
  initialChecklist: Record<string, boolean>;
}

export function ChecklistPanel({ caseId, initialChecklist }: Props) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialChecklist);
  const [isPending, startTransition] = useTransition();

  function toggle(key: string) {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    startTransition(async () => {
      await updateChecklist(caseId, updated);
    });
  }

  return (
    <div className="space-y-2">
      {CHECKLIST_ITEMS.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!checklist[key]}
            onChange={() => toggle(key)}
            disabled={isPending}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className={`text-sm ${checklist[key] ? "line-through text-muted-foreground" : ""}`}>
            {label}
          </span>
        </label>
      ))}
    </div>
  );
}
