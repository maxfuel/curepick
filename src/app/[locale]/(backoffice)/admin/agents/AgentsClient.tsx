"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deactivateAgent } from "@/lib/actions/admin-agents";

interface AgentRow {
  id: string;
  company_name: string | null;
  country: string | null;
  commission_rate: number | null;
  status: string | null;
  created_at: string | null;
  profiles: { email: string | null; full_name: string | null } | null;
}

export default function AgentsClient({ initialAgents }: { initialAgents: AgentRow[] }) {
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
      company_name: fd.get("company_name"),
      country: fd.get("country"),
      commission_rate: fd.get("commission_rate"),
    };
    const res = await fetch("/api/admin/agents", {
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
      setFormError(error ?? "Failed to create agent");
    }
  }

  function handleDeactivate(agentId: string) {
    if (!confirm("Deactivate this agent?")) return;
    startTransition(async () => {
      await deactivateAgent(agentId);
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
              <th className="text-left px-4 py-3 font-medium">Name / Company</th>
              <th className="text-left px-4 py-3 font-medium">Country</th>
              <th className="text-left px-4 py-3 font-medium">Commission</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {initialAgents.length > 0 ? initialAgents.map((a) => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">{a.profiles?.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <div>{a.profiles?.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{a.company_name ?? ""}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{a.country ?? "—"}</td>
                <td className="px-4 py-3">{a.commission_rate != null ? `${a.commission_rate}%` : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {a.status ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  {a.status === "active" && (
                    <button
                      disabled={isPending}
                      onClick={() => handleDeactivate(a.id)}
                      className="text-destructive text-xs hover:underline disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No agents yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border p-4 max-w-lg space-y-4">
        <h2 className="text-lg font-semibold">Create Agent Account</h2>
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
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <input name="full_name" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Company Name</label>
              <input name="company_name" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Country</label>
              <input name="country" type="text" placeholder="e.g. Singapore" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Commission Rate (%)</label>
              <input name="commission_rate" type="number" step="0.5" min="0" max="100" defaultValue="10" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {formSuccess && <p className="text-sm text-green-600">Agent created successfully</p>}
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Create Agent
          </button>
        </form>
      </div>
    </div>
  );
}
