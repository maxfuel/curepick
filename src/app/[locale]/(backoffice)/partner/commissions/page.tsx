import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function PartnerCommissionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = sp.status ?? "pending";

  const profile = await getProfile();
  const supabase = await createClient();

  const { data: agentRow } = await supabase
    .from("agents")
    .select("id, commission_rate")
    .eq("profile_id", profile!.id)
    .single();

  if (!agentRow) {
    return <div className="p-6"><p className="text-muted-foreground">Agent record not found.</p></div>;
  }

  const [{ data: commissions }, { data: totals }] = await Promise.all([
    supabase
      .from("commissions")
      .select("id, amount, currency, status, paid_at, created_at, cases(patient_name, status)")
      .eq("agent_id", agentRow.id)
      .eq("status", tab)
      .order("created_at", { ascending: false }),
    supabase
      .from("commissions")
      .select("amount, status")
      .eq("agent_id", agentRow.id),
  ]);

  const pendingTotal = (totals ?? []).filter((c) => c.status === "pending").reduce((s, c) => s + (c.amount ?? 0), 0);
  const paidTotal = (totals ?? []).filter((c) => c.status === "paid").reduce((s, c) => s + (c.amount ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Commissions</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Commission Rate</p>
          <p className="text-2xl font-semibold mt-1">{agentRow.commission_rate ?? 10}%</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-semibold mt-1">USD {pendingTotal.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Paid (All Time)</p>
          <p className="text-2xl font-semibold mt-1">USD {paidTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["pending", "paid"].map((s) => (
          <Link
            key={s}
            href={`?status=${s}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              tab === s ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Patient</th>
              <th className="text-left px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">
                {tab === "paid" ? "Paid At" : "Created At"}
              </th>
            </tr>
          </thead>
          <tbody>
            {(commissions ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No {tab} commissions
                </td>
              </tr>
            ) : (commissions ?? []).map((c) => {
              const caseData = c.cases as { patient_name: string; status: string } | null;
              const date = tab === "paid" ? c.paid_at : c.created_at;
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{caseData?.patient_name ?? "—"}</td>
                  <td className="px-4 py-3">{c.currency ?? "USD"} {Number(c.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {date ? new Date(date).toLocaleDateString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
