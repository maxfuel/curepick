"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";

async function assertAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden");
}

export async function updateCurePartner(
  curePartnerId: string,
  data: { full_name?: string; languages?: string[]; specialty_areas?: string[]; status?: string }
) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("cure_partners").update(data).eq("id", curePartnerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cure-partners");
}

export async function deactivateCurePartner(curePartnerId: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("cure_partners")
    .update({ status: "inactive" })
    .eq("id", curePartnerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cure-partners");
}
