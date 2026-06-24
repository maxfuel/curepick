"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";

async function assertAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden");
}

export async function updateAgent(
  agentId: string,
  data: { commission_rate?: number; status?: string; company_name?: string; country?: string }
) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("agents").update(data).eq("id", agentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/agents");
}

export async function deactivateAgent(agentId: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("agents")
    .update({ status: "inactive" })
    .eq("id", agentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/agents");
}
