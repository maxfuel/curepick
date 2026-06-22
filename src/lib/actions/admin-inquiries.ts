"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function adminUpdateInquiryStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/inquiries");
}
