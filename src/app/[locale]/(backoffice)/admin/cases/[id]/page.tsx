import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AssignCurePartnerForm from "./AssignCurePartnerForm";
import AddCaseNoteForm from "./AddCaseNoteForm";

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

export default async function AdminCaseDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: caseData }, { data: curePartners }, { data: notes }, { data: commission }] =
    await Promise.all([
      supabase
        .from("cases")
        .select(
          "*, hospitals(id, name), agents(id, company_name, commission_rate, profiles(email, full_name)), cure_partners(id, full_name), services(name), procedures(name)"
        )
        .eq("id", id)
        .single(),
      supabase.from("cure_partners").select("id, full_name").eq("status", "active"),
      supabase
        .from("case_notes")
        .select("id, content, created_at, profiles(full_name, email)")
        .eq("case_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("commissions").select("id, amount, currency, status, paid_at").eq("case_id", id).maybeSingle(),
    ]);

  if (!caseData) notFound();

  const hospital = caseData.hospitals as { id: string; name: Record<string, string> } | null;
  const agent = caseData.agents as {
    id: string;
    company_name: string | null;
    commission_rate: number | null;
    profiles: { email: string | null; full_name: string | null } | null;
  } | null;
  const cp = caseData.cure_partners as { id: string; full_name: string | null } | null;
  const service = caseData.services as { name: Record<string, string> } | null;
  const procedure = caseData.procedures as { name: Record<string, string> } | null;

  const STATUS_STEPS = ["lead", "qualified", "confirmed", "arrived", "in_treatment", "completed"];
  const currentIdx = STATUS_STEPS.indexOf(caseData.status ?? "lead");

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{caseData.patient_name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{caseData.patient_email}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[caseData.status ?? "lead"] ?? ""}`}>
          {caseData.status ?? "lead"}
        </span>
      </div>

      {/* Status timeline */}
      <div className="rounded-xl border p-4">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Pipeline
        </h2>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                i < currentIdx
                  ? "bg-green-100 text-green-700"
                  : i === currentIdx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {i < currentIdx && <span>✓</span>}
                {s.replace("_", " ")}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <span className="text-muted-foreground text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Patient
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{caseData.patient_name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{caseData.patient_email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{caseData.patient_phone ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Nationality</dt><dd>{caseData.patient_nationality ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Service</dt><dd>{service?.name?.en ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Procedure</dt><dd>{procedure?.name?.en ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Hospital</dt><dd>{hospital?.name?.en ?? "—"}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Partners
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Agent</dt>
              <dd>{agent?.company_name ?? agent?.profiles?.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Commission Rate</dt>
              <dd>{agent?.commission_rate != null ? `${agent.commission_rate}%` : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cure Partner</dt>
              <dd>{cp?.full_name ?? <span className="italic text-muted-foreground">Unassigned</span>}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Assign Cure Partner */}
      <div className="rounded-xl border p-4">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Assign Cure Partner
        </h2>
        <AssignCurePartnerForm
          caseId={id}
          currentCurePartnerId={cp?.id ?? null}
          curePartners={(curePartners ?? []).map((cp) => ({ id: cp.id, full_name: cp.full_name ?? "" }))}
        />
      </div>

      {/* Commission */}
      {commission && (
        <div className="rounded-xl border p-4">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Commission
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-lg">{commission.amount} {commission.currency}</span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              commission.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {commission.status}
            </span>
            {commission.paid_at && (
              <span className="text-muted-foreground text-xs">
                Paid: {new Date(commission.paid_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Case Notes */}
      <div className="rounded-xl border p-4 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Case Notes
        </h2>
        <div className="space-y-3">
          {(notes ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground italic">No notes yet</p>
          )}
          {(notes ?? []).map((n) => {
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
        <AddCaseNoteForm caseId={id} />
      </div>
    </div>
  );
}
