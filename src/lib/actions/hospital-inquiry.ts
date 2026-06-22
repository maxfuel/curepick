"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateInquiryStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/hospital/inquiries");
  return { success: true };
}
