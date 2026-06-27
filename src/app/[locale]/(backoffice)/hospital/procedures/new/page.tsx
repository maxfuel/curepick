import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { createHospitalProcedure } from "@/lib/actions/hospital-procedures";
import { ProcedureForm } from "@/components/backoffice/hospital/ProcedureForm";
import { redirect } from "next/navigation";
import type { Json } from "@/lib/types/database";

export default async function NewProcedurePage() {
  const profile = await getProfile();
  if (!profile?.hospital_id) redirect("/hospital/dashboard");

  const supabase = await createClient();

  const { data: existingHps } = await (supabase
    .from("hospital_procedures") as any)
    .select("procedure_id")
    .eq("hospital_id", profile.hospital_id);

  const existingIds = new Set((existingHps ?? []).map((hp: any) => hp.procedure_id as string));

  const { data: procedures } = await (supabase
    .from("procedures") as any)
    .select("id, name, sort_order, services(name, sort_order, categories(name, sort_order))")
    .order("sort_order");

  const available = (procedures ?? [])
    .filter((p: any) => !existingIds.has(p.id))
    .map((p: any) => ({
      id: p.id as string,
      name: getLocalizedField(p.name as Json, "ko") || getLocalizedField(p.name as Json, "en"),
      serviceName: getLocalizedField(p.services?.name as Json, "ko") || getLocalizedField(p.services?.name as Json, "en"),
      categoryName: getLocalizedField(p.services?.categories?.name as Json, "ko") || getLocalizedField(p.services?.categories?.name as Json, "en"),
      sortOrder: (p.sort_order as number) ?? 999,
      serviceSort: (p.services?.sort_order as number) ?? 999,
      categorySort: (p.services?.categories?.sort_order as number) ?? 999,
    }))
    .sort((a: any, b: any) => {
      if (a.categorySort !== b.categorySort) return a.categorySort - b.categorySort;
      if (a.serviceSort !== b.serviceSort) return a.serviceSort - b.serviceSort;
      return a.sortOrder - b.sortOrder;
    });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">당사시술 추가</h1>
      <ProcedureForm procedures={available} action={createHospitalProcedure} />
    </div>
  );
}
