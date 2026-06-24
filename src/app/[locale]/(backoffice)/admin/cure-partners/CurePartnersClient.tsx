"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deactivateCurePartner } from "@/lib/actions/admin-cure-partners";

interface CurePartnerRow {
  id: string;
  full_name: string | null;
  languages: string[] | null;
  specialty_areas: string[] | null;
  status: string | null;
  created_at: string | null;
  profiles: { email: string | null } | null;
}

export default function CurePartnersClient({ initialCurePartners }: { initialCurePartners: CurePartnerRow[] }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    const fd = new FormData(e.currentTarget);
    const body = {
      email: fd.get("email"),
      password: fd.get("password"),
      full_name: fd.get("full_name"),
      languages: fd.get("languages"),
      specialty_areas: fd.get("specialty_areas"),
    };
    const res = await fetch("/api/admin/cure-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setFormSuccess(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      const { error } = await res.json();
      setFormError(error ?? "Failed to create cure partner");
    }
  }

  function handleDeactivate(cpId: string) {
    if (!confirm("Deactivate this Cure Partner?")) return;
    startTransition(async () => {
      await deactivateCurePartner(cpId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Full Name</th>
              <th className="text-left px-4 py-3 font-medium">Languages</th>
              <th className="text-left px-4 py-3 font-medium">Specialties</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {initialCurePartners.length > 0 ? initialCurePartners.map((cp) => (
              <tr key={cp.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">{cp.profiles?.email ?? "—"}</td>
                <td className="px-4 py-3">{cp.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {cp.languages?.join(", ") ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {cp.specialty_areas?.join(", ") ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    cp.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {cp.status ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {cp.status === "active" && (
                    <button
                      disabled={isPending}
                      onClick={() => handleDeactivate(cp.id)}
                      className="text-destructive text-xs hover:underline disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No Cure Partners yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border p-4 max-w-lg space-y-4">
        <h2 className="text-lg font-semibold">Create Cure Partner Account</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email *</label>
              <input name="email" type="email" required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password *</label>
              <input name="password" type="password" required minLength={8} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <input name="full_name" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Languages (comma-separated)</label>
              <input name="languages" type="text" placeholder="e.g. English, Korean, Chinese" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Specialty Areas (comma-separated)</label>
              <input name="specialty_areas" type="text" placeholder="e.g. Beauty, Dental, Oncology" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {formSuccess && <p className="text-sm text-green-600">Cure Partner created successfully</p>}
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Create Cure Partner
          </button>
        </form>
      </div>
    </div>
  );
}
