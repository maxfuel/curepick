import { createClient } from "@/lib/supabase/client";

export async function uploadReviewMedia(
  file: File,
  userId: string
): Promise<string> {
  const supabase = createClient();

  const ext = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("review-media")
    .upload(fileName, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("review-media").getPublicUrl(fileName);

  return publicUrl;
}
