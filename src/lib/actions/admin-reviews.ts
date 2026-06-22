"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveReview(id: string) {
  const supabase = await createClient();
  await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function rejectReview(id: string) {
  const supabase = await createClient();
  await supabase.from("reviews").update({ status: "rejected" }).eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  const supabase = await createClient();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function toggleVerified(id: string, currentValue: boolean) {
  const supabase = await createClient();
  await supabase.from("reviews").update({ is_verified: !currentValue }).eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function deleteComment(id: string) {
  const supabase = await createClient();
  await supabase.from("review_comments").delete().eq("id", id);
  revalidatePath("/admin/reviews");
}
