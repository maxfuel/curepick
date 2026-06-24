import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  arrived: "bg-orange-100 text-orange-700",
  in_treatment: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const STATUS_STEPS = ["lead", "qualified", "confirmed", "arrived", "in_treatment", "completed"];

export default async function PartnerCaseDetailPage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: agentRow } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", profile!.id)
    .single();

  if (!agentRow) notFound();

  const { data: caseData } = await supabase
    .from("cases")
    .select("*, hospitals(name, phone, address), cure_partners(full_name, languages, profiles(email)), services(name), procedures(name)")
    .eq("id", id)
    .eq("agent_id", agentRow.id)
    .single();

  if (!caseData) notFound();

  const { data: notes } = await supabase
    .from("case_notes")
    .select("id, content, created_at, profiles(full_name, email)")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const hospital = caseData.hospitals as { name: Record<string, string>; phone: string | null; address: Record<string, string> | null } | null;
  const cp = caseData.cure_partners as { full_name: string | null; languages: string[] | null; profiles: { email: string | null } | null } | null;
  const service = caseData.services as { name: Record<string, string> } | null;
  const procedure = caseData.procedures as { name: Record<string, string> } | null;

  const currentIdx = STATUS_STEPS.indexOf(caseData.status ?? "lead");

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{caseData.patient_name}</h1>
          <p className="text-muted-foreground text-sm">{caseData.patient_email} · {caseData.patient_nationality ?? ""}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[caseData.status ?? "lead"] ?? ""}`}>
          {caseData.status?.replace("_", " ")}
        </span>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pipeline</h2>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                i < currentIdx ? "bg-green-100 text-green-700" :
                i === currentIdx ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < currentIdx && <span>✓</span>}
                {s.replace("_", " ")}
              </div>
              {i < STATUS_STEPS.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hospital</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{hospital?.name?.en ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{hospital?.phone ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Service</dt><dd>{service?.name?.en ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Procedure</dt><dd>{procedure?.name?.en ?? "—"}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cure Partner</h2>
          {cp ? (
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{cp.full_name ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{cp.profiles?.email ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Languages</dt><dd>{cp.languages?.join(", ") ?? "—"}</dd></div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground italic">Not assigned yet</p>
          )}
        </div>
      </div>

      {/* Case notes */}
      <div className="rounded-xl border p-4 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Case Notes</h2>
        {(notes ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No notes yet</p>
        ) : (
          <div className="space-y-2">
            {notes!.map((n) => {
              const author = n.profiles as { full_name: string | null; email: string | null } | null;
              return (
                <div key={n.id} className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{author?.full_name ?? author?.email ?? "Unknown"}</span>
                    <span>{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{n.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
