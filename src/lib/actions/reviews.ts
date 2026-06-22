"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createReview(data: {
  hospitalId: string;
  procedureId?: string;
  rating: number;
  title: string;
  content: string;
  mediaUrls?: string[];
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    hospital_id: data.hospitalId,
    procedure_id: data.procedureId || null,
    rating: data.rating,
    title: data.title,
    content: data.content,
    media: data.mediaUrls && data.mediaUrls.length > 0 ? data.mediaUrls : null,
    status: "pending",
    is_verified: false,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/reviews");
  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/reviews");
  revalidatePath("/my");
  return { success: true };
}

export async function updateReview(
  reviewId: string,
  data: {
    rating: number;
    title: string;
    content: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      rating: data.rating,
      title: data.title,
      content: data.content,
    })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/reviews/${reviewId}`);
  revalidatePath("/reviews");
  revalidatePath("/my");
  return { success: true };
}

export async function createComment(reviewId: string, content: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("review_comments").insert({
    review_id: reviewId,
    user_id: user.id,
    content,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/reviews/${reviewId}`);
  return { success: true };
}
