"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function deactivateAccount(userId: string) {
  const adminClient = getAdminClient();
  await adminClient.auth.admin.deleteUser(userId);
  revalidatePath("/admin/accounts");
}
