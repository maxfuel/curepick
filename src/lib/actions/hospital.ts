"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionState = { error?: string; success?: boolean } | null;

export async function submitEditRequest(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, hospital_id")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.hospital_id) return { error: "Profile not found" };

  const message = formData.get("message") as string;
  const section = formData.get("section") as string;

  const { error } = await supabase.from("inquiries").insert({
    name: profile.full_name || "Hospital Staff",
    email: profile.email || user.email || "",
    hospital_id: profile.hospital_id,
    user_id: user.id,
    message: `[Edit Request - ${section}] ${message}`,
    status: "new",
  });

  if (error) return { error: error.message };

  revalidatePath("/hospital");
  return { success: true };
}
