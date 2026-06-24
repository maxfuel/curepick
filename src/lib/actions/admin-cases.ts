"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";

async function assertAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden");
  return profile;
}

export async function assignCurePartner(caseId: string, curePartnerId: string | null) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("cases")
    .update({ cure_partner_id: curePartnerId || null })
    .eq("id", caseId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cases");
  revalidatePath(`/admin/cases/${caseId}`);
}

export async function adminUpdateCaseStatus(caseId: string, status: string) {
  await assertAdmin();
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("cases")
    .update({
      status,
      ...(status === "arrived" && { arrived_at: now }),
      ...(status === "in_treatment" && { in_treatment_at: now }),
      ...(status === "completed" && { completed_at: now }),
    })
    .eq("id", caseId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cases");
  revalidatePath(`/admin/cases/${caseId}`);
}

export async function adminAddCaseNote(caseId: string, content: string) {
  const profile = await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("case_notes").insert({
    case_id: caseId,
    author_id: profile.id,
    content,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/cases/${caseId}`);
}
