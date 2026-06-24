import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";
import Link from "next/link";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  arrived: "bg-orange-100 text-orange-700",
  in_treatment: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

export default async function PartnerCasesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const statusFilter = sp.status ?? "";

  const profile = await getProfile();
  const supabase = await createClient();

  const { data: agentRow } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", profile!.id)
    .single();

  if (!agentRow) {
    return <div className="p-6"><p className="text-muted-foreground">Agent record not found.</p></div>;
  }

  let query = supabase
    .from("cases")
    .select("id, patient_name, patient_nationality, status, created_at, hospitals(name), cure_partners(full_name)")
    .eq("agent_id", agentRow.id)
    .order("created_at", { ascending: false });

  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: cases } = await query;

  const STATUSES = ["", "lead", "qualified", "confirmed", "arrived", "in_treatment", "completed"];
  const LABELS: Record<string, string> = {
    "": "All", lead: "Lead", qualified: "Qualified", confirmed: "Confirmed",
    arrived: "Arrived", in_treatment: "In Treatment", completed: "Completed",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Cases</h1>
        <Link
          href={`/${locale}/partner/cases/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Case
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s ? `?status=${s}` : "?"}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Patient</th>
              <th className="text-left px-4 py-3 font-medium">Nationality</th>
              <th className="text-left px-4 py-3 font-medium">Hospital</th>
              <th className="text-left px-4 py-3 font-medium">Cure Partner</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(cases ?? []).length > 0 ? (cases ?? []).map((c) => {
              const hospital = c.hospitals as { name: Record<string, string> } | null;
              const cp = c.cure_partners as { full_name: string | null } | null;
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.patient_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.patient_nationality ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{hospital?.name?.en ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {cp?.full_name ?? <span className="italic text-xs">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status ?? "lead"] ?? ""}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/${locale}/partner/cases/${c.id}`} className="text-primary text-xs hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No cases found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
