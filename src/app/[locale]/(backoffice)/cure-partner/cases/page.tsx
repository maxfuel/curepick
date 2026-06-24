import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";
import Link from "next/link";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-yellow-100 text-yellow-700",
  arrived: "bg-orange-100 text-orange-700",
  in_treatment: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

export default async function CurePartnerCasesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const tab = sp.tab ?? "active";

  const profile = await getProfile();
  const supabase = await createClient();

  const { data: cpRow } = await supabase
    .from("cure_partners")
    .select("id")
    .eq("profile_id", profile!.id)
    .single();

  if (!cpRow) {
    return <div className="p-6"><p className="text-muted-foreground">Cure Partner record not found.</p></div>;
  }

  const activeStatuses = ["confirmed", "arrived", "in_treatment"];
  const completedStatuses = ["completed"];
  const statuses = tab === "active" ? activeStatuses : completedStatuses;

  const { data: cases } = await supabase
    .from("cases")
    .select("id, patient_name, patient_nationality, status, arrived_at, created_at, hospitals(name), agents(profiles(full_name, email))")
    .eq("cure_partner_id", cpRow.id)
    .in("status", statuses)
    .order("arrived_at", { ascending: false });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">My Cases</h1>

      <div className="flex gap-2">
        {["active", "completed"].map((t) => (
          <Link
            key={t}
            href={`?tab=${t}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              tab === t ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
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
              <th className="text-left px-4 py-3 font-medium">Agent</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Arrival</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(cases ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No {tab} cases
                </td>
              </tr>
            ) : (cases ?? []).map((c) => {
              const hospital = c.hospitals as { name: Record<string, string> } | null;
              const agentProfile = (c.agents as { profiles: { full_name: string | null; email: string | null } | null } | null)?.profiles;
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.patient_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.patient_nationality ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{hospital?.name?.en ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{agentProfile?.full_name ?? agentProfile?.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                      {c.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.arrived_at ? new Date(c.arrived_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/${locale}/cure-partner/cases/${c.id}`} className="text-primary text-xs hover:underline">
                      View
                    </Link>
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
