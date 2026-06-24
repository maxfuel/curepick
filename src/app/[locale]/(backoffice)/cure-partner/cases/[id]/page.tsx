import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";
import { notFound } from "next/navigation";
import { StatusUpdateButton } from "./StatusUpdateButton";
import { ChecklistPanel } from "./ChecklistPanel";
import { AddNoteForm } from "./AddNoteForm";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-yellow-100 text-yellow-700",
  arrived: "bg-orange-100 text-orange-700",
  in_treatment: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const STATUS_STEPS = ["confirmed", "arrived", "in_treatment", "completed"];

export default async function CurePartnerCaseDetailPage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: cpRow } = await supabase
    .from("cure_partners")
    .select("id")
    .eq("profile_id", profile!.id)
    .single();

  if (!cpRow) notFound();

  const { data: caseData } = await supabase
    .from("cases")
    .select("*, hospitals(name, phone, address), agents(company_name, profiles(full_name, email)), services(name), procedures(name)")
    .eq("id", id)
    .eq("cure_partner_id", cpRow.id)
    .single();

  if (!caseData) notFound();

  const { data: notes } = await supabase
    .from("case_notes")
    .select("id, content, created_at, profiles(full_name, email)")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const hospital = caseData.hospitals as { name: Record<string, string>; phone: string | null } | null;
  const agentData = caseData.agents as { company_name: string | null; profiles: { full_name: string | null; email: string | null } | null } | null;
  const service = caseData.services as { name: Record<string, string> } | null;
  const procedure = caseData.procedures as { name: Record<string, string> } | null;

  const checklist = (caseData.checklist as Record<string, boolean> | null) ?? {};
  const currentIdx = STATUS_STEPS.indexOf(caseData.status ?? "confirmed");

  const whatsappHref = caseData.patient_phone
    ? `https://wa.me/${caseData.patient_phone.replace(/\D/g, "")}`
    : null;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{caseData.patient_name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {caseData.patient_email}
            {caseData.patient_nationality ? ` · ${caseData.patient_nationality}` : ""}
          </p>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#128C7E] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          )}
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[caseData.status ?? ""] ?? "bg-muted text-muted-foreground"}`}>
          {caseData.status?.replace("_", " ")}
        </span>
      </div>

      {/* Pipeline */}
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
        <div className="mt-4">
          <StatusUpdateButton caseId={id} currentStatus={caseData.status ?? "confirmed"} />
        </div>
      </div>

      {/* Details grid */}
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
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agent</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{agentData?.profiles?.full_name ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="truncate ml-2">{agentData?.profiles?.email ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Company</dt><dd>{agentData?.company_name ?? "—"}</dd></div>
          </dl>
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-xl border p-4 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service Checklist</h2>
        <ChecklistPanel caseId={id} initialChecklist={checklist} />
      </div>

      {/* Timestamps */}
      {(caseData.arrived_at || caseData.in_treatment_at || caseData.completed_at) && (
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline</h2>
          <dl className="space-y-1 text-sm">
            {caseData.arrived_at && (
              <div className="flex justify-between"><dt className="text-muted-foreground">Arrived</dt><dd>{new Date(caseData.arrived_at).toLocaleString()}</dd></div>
            )}
            {caseData.in_treatment_at && (
              <div className="flex justify-between"><dt className="text-muted-foreground">Treatment Started</dt><dd>{new Date(caseData.in_treatment_at).toLocaleString()}</dd></div>
            )}
            {caseData.completed_at && (
              <div className="flex justify-between"><dt className="text-muted-foreground">Completed</dt><dd>{new Date(caseData.completed_at).toLocaleString()}</dd></div>
            )}
          </dl>
        </div>
      )}

      {/* Case Notes */}
      <div className="rounded-xl border p-4 space-y-4">
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
        <AddNoteForm caseId={id} />
      </div>
    </div>
  );
}
