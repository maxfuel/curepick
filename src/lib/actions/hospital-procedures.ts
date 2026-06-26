"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

function buildJsonField(ko: string, en: string): Record<string, string> | null {
  if (!ko.trim() && !en.trim()) return null;
  const obj: Record<string, string> = {};
  if (ko.trim()) obj.ko = ko.trim();
  if (en.trim()) obj.en = en.trim();
  return obj;
}

export async function createHospitalProcedure(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const procedureId = formData.get("procedure_id") as string;
  if (!procedureId) return;

  const nameKo = (formData.get("name_ko") as string) ?? "";
  const nameEn = (formData.get("name_en") as string) ?? "";
  const costMin = formData.get("cost_min") ? Number(formData.get("cost_min")) : null;
  const costMax = formData.get("cost_max") ? Number(formData.get("cost_max")) : null;
  const costCurrency = (formData.get("cost_currency") as string) || "KRW";
  const summaryKo = (formData.get("differentiator_summary_ko") as string) ?? "";
  const summaryEn = (formData.get("differentiator_summary_en") as string) ?? "";
  const bulletsJson = (formData.get("differentiator_bullets") as string) || "[]";

  const supabase = await createClient();
  await (supabase.from("hospital_procedures") as any).insert({
    hospital_id: profile.hospital_id,
    procedure_id: procedureId,
    cost_min: costMin,
    cost_max: costMax,
    cost_currency: costCurrency,
    name: buildJsonField(nameKo, nameEn),
    differentiator_summary: buildJsonField(summaryKo, summaryEn),
    differentiator_bullets: JSON.parse(bulletsJson),
  });

  revalidatePath("/hospital/procedures");
}

export async function updateHospitalProcedure(id: string, formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();

  const { data: existing } = await (supabase.from("hospital_procedures") as any)
    .select("hospital_id")
    .eq("id", id)
    .single();
  if (existing?.hospital_id !== profile.hospital_id) return;

  const nameKo = (formData.get("name_ko") as string) ?? "";
  const nameEn = (formData.get("name_en") as string) ?? "";
  const costMin = formData.get("cost_min") ? Number(formData.get("cost_min")) : null;
  const costMax = formData.get("cost_max") ? Number(formData.get("cost_max")) : null;
  const costCurrency = (formData.get("cost_currency") as string) || "KRW";
  const summaryKo = (formData.get("differentiator_summary_ko") as string) ?? "";
  const summaryEn = (formData.get("differentiator_summary_en") as string) ?? "";
  const bulletsJson = (formData.get("differentiator_bullets") as string) || "[]";

  await (supabase.from("hospital_procedures") as any)
    .update({
      cost_min: costMin,
      cost_max: costMax,
      cost_currency: costCurrency,
      name: buildJsonField(nameKo, nameEn),
      differentiator_summary: buildJsonField(summaryKo, summaryEn),
      differentiator_bullets: JSON.parse(bulletsJson),
    })
    .eq("id", id);

  revalidatePath("/hospital/procedures");
}

export async function deleteHospitalProcedure(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const id = formData.get("id") as string;
  if (!id) return;

  const supabase = await createClient();

  const { data: existing } = await (supabase.from("hospital_procedures") as any)
    .select("hospital_id")
    .eq("id", id)
    .single();
  if (existing?.hospital_id !== profile.hospital_id) return;

  await (supabase.from("hospital_procedures") as any).delete().eq("id", id);

  revalidatePath("/hospital/procedures");
}
