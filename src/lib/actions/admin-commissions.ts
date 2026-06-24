"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";

async function assertAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden");
}

export async function markCommissionPaid(commissionId: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("commissions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", commissionId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/commissions");
}
