import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-yellow-100 text-yellow-700",
  arrived: "bg-orange-100 text-orange-700",
  in_treatment: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const ACTIVE_STATUSES = ["confirmed", "arrived", "in_treatment"];

export default async function CurePartnerDashboardPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: cpRow } = await supabase
    .from("cure_partners")
    .select("id, full_name")
    .eq("profile_id", profile!.id)
    .single();

  if (!cpRow) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Your Cure Partner record is not set up yet. Contact admin.</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeCounts, { data: recentCases }] = await Promise.all([
    Promise.all(
      ACTIVE_STATUSES.map((s) =>
        supabase
          .from("cases")
          .select("id", { count: "exact", head: true })
          .eq("cure_partner_id", cpRow.id)
          .eq("status", s)
          .then(({ count }) => ({ status: s, count: count ?? 0 }))
      )
    ),
    supabase
      .from("cases")
      .select("id, patient_name, patient_nationality, status, arrived_at, hospitals(name)")
      .eq("cure_partner_id", cpRow.id)
      .in("status", [...ACTIVE_STATUSES, "completed"])
      .order("arrived_at", { ascending: false })
      .limit(5),
  ]);

  const totalActive = activeCounts.reduce((s, c) => s + c.count, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {cpRow.full_name ?? "Cure Partner"}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here&apos;s an overview of your assigned cases.</p>
      </div>

      {/* Active case counts */}
      <div className="grid grid-cols-3 gap-4">
        {activeCounts.map(({ status, count }) => (
          <div key={status} className="rounded-xl border p-4">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? ""}`}>
              {status.replace("_", " ")}
            </span>
            <p className="text-3xl font-semibold mt-2">{count}</p>
          </div>
        ))}
      </div>

      {/* Total active badge */}
      <div className="rounded-xl border p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Active Cases</p>
          <p className="text-3xl font-semibold mt-1">{totalActive}</p>
        </div>
        <Link
          href="../cure-partner/cases"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          View All Cases
        </Link>
      </div>

      {/* Recent cases */}
      <div className="rounded-xl border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <Link href="../cure-partner/cases" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y">
          {(recentCases ?? []).length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">No assigned cases yet</p>
          ) : (recentCases ?? []).map((c) => {
            const hospital = c.hospitals as { name: Record<string, string> } | null;
            return (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{c.patient_name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {c.patient_nationality ? `${c.patient_nationality} · ` : ""}
                    {hospital?.name?.en ?? ""}
                  </span>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                  {c.status?.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
