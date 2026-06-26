import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { updateHospitalProcedure } from "@/lib/actions/hospital-procedures";
import { ProcedureForm } from "@/components/backoffice/hospital/ProcedureForm";
import { notFound, redirect } from "next/navigation";
import type { Json } from "@/lib/types/database";

interface Props { params: Promise<{ id: string }> }

function getStr(json: unknown, lang: string): string {
  if (!json || typeof json !== "object" || Array.isArray(json)) return "";
  return ((json as Record<string, string>)[lang]) ?? "";
}

export default async function EditProcedurePage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile?.hospital_id) redirect("/hospital/dashboard");

  const supabase = await createClient();

  const { data: hp } = await (supabase
    .from("hospital_procedures") as any)
    .select("*, procedures(id, name)")
    .eq("id", id)
    .single();

  if (!hp || hp.hospital_id !== profile.hospital_id) notFound();

  const proc = hp.procedures as { id: string; name: unknown } | null;
  const procedureName = proc
    ? (getLocalizedField(proc.name as Json, "ko") || getLocalizedField(proc.name as Json, "en"))
    : "—";

  const bullets = ((hp.differentiator_bullets ?? []) as Array<{ ko?: string; en?: string }>)
    .map((b) => ({ ko: b.ko ?? "", en: b.en ?? "" }));

  const boundAction = updateHospitalProcedure.bind(null, id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">당사시술 수정</h1>
      <ProcedureForm
        procedures={[]}
        action={boundAction}
        isEdit
        defaultValues={{
          procedureId: proc?.id ?? "",
          procedureName,
          nameKo: getStr(hp.name, "ko"),
          nameEn: getStr(hp.name, "en"),
          costMin: hp.cost_min != null ? String(hp.cost_min) : "",
          costMax: hp.cost_max != null ? String(hp.cost_max) : "",
          costCurrency: hp.cost_currency ?? "KRW",
          differentiatorSummaryKo: getStr(hp.differentiator_summary, "ko"),
          differentiatorSummaryEn: getStr(hp.differentiator_summary, "en"),
          bullets,
        }}
      />
    </div>
  );
}
