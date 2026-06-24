import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  arrived: "bg-orange-100 text-orange-700",
  in_treatment: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const STATUSES = ["lead", "qualified", "confirmed", "arrived", "in_treatment", "completed"];

export default async function PartnerDashboardPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: agentRow } = await supabase
    .from("agents")
    .select("id, commission_rate")
    .eq("profile_id", profile!.id)
    .single();

  if (!agentRow) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Your agent record is not set up yet. Contact admin.</p>
      </div>
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [statusCounts, { data: recentCases }, { data: monthlyCommissions }] = await Promise.all([
    Promise.all(
      STATUSES.map((s) =>
        supabase
          .from("cases")
          .select("id", { count: "exact", head: true })
          .eq("agent_id", agentRow.id)
          .eq("status", s)
          .then(({ count }) => ({ status: s, count: count ?? 0 }))
      )
    ),
    supabase
      .from("cases")
      .select("id, patient_name, status, created_at, hospitals(name)")
      .eq("agent_id", agentRow.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("commissions")
      .select("amount")
      .eq("agent_id", agentRow.id)
      .gte("created_at", startOfMonth),
  ]);

  const monthlyTotal = (monthlyCommissions ?? []).reduce((s, c) => s + (c.amount ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Status count cards */}
      <div className="grid grid-cols-3 gap-3">
        {statusCounts.map(({ status, count }) => (
          <div key={status} className="rounded-xl border p-4 flex flex-col gap-1">
            <span className={`inline-flex self-start rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? ""}`}>
              {status.replace("_", " ")}
            </span>
            <span className="text-2xl font-semibold">{count}</span>
          </div>
        ))}
      </div>

      {/* Monthly commission */}
      <div className="rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">Estimated Commission This Month</p>
        <p className="text-3xl font-semibold mt-1">USD {monthlyTotal.toFixed(2)}</p>
      </div>

      {/* Recent cases */}
      <div className="rounded-xl border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Recent Cases</h2>
          <Link href="../partner/cases" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y">
          {(recentCases ?? []).length === 0 && (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">No cases yet</p>
          )}
          {(recentCases ?? []).map((c) => {
            const hospital = c.hospitals as { name: Record<string, string> } | null;
            return (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{c.patient_name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{hospital?.name?.en ?? ""}</span>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status ?? "lead"] ?? ""}`}>
                  {c.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
