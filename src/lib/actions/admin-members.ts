"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth/get-user";

const VALID_ROLES = ["patient", "hospital_staff", "cure_partner", "local_agent"] as const;
type AssignableRole = (typeof VALID_ROLES)[number];

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function assertAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden");
}

export async function updateUserRole(
  userId: string,
  newRole: AssignableRole,
  hospitalId?: string | null
) {
  await assertAdmin();

  if (!VALID_ROLES.includes(newRole)) throw new Error("Invalid role");

  const adminClient = getAdminClient();

  const update: Record<string, unknown> = { role: newRole };
  if (newRole === "hospital_staff") {
    update.hospital_id = hospitalId ?? null;
  } else {
    update.hospital_id = null;
  }

  const { error } = await adminClient
    .from("profiles")
    .update(update)
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/members");
}
