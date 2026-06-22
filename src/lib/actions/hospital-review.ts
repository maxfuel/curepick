"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addOfficialReply(reviewId: string, content: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // is_official column added by migration 009_backoffice.sql (run manually in Supabase dashboard)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("review_comments") as any).insert({
    review_id: reviewId,
    user_id: user.id,
    content,
    is_official: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/hospital/reviews");
  return { success: true };
}
