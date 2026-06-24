"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCase } from "@/lib/actions/partner-cases";

interface Props {
  locale: string;
  hospitals: { id: string; name: string }[];
  services: { id: string; name: string }[];
}

export default function NewCaseForm({ locale, hospitals, services }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createCase(fd);
        router.push(`/${locale}/partner/cases`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create case");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Patient Name *</label>
          <input name="patient_name" type="text" required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Patient Email *</label>
          <input name="patient_email" type="email" required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Phone</label>
          <input name="patient_phone" type="tel" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Nationality</label>
          <input name="patient_nationality" type="text" placeholder="e.g. Singapore" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-sm font-medium">Hospital *</label>
          <select name="hospital_id" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Select hospital…</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-sm font-medium">Service (optional)</label>
          <select name="service_id" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Select service…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Register Case"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
