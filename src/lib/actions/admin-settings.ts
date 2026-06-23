"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth/get-user";
import { readSiteSettings, writeSiteSettings } from "@/lib/site-settings";

const BUCKET = "site-assets";

async function ensureBucket() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: true });
  }
}

export async function updateHeroImage(formData: FormData) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden");

  const file = formData.get("hero_file") as File | null;
  if (!file || file.size === 0) return;

  await ensureBucket();

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `hero/hero-bg-${Date.now()}.${ext}`;

  const { data, error } = await admin.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || `image/${ext}`,
      upsert: true,
    });

  if (error || !data) throw new Error(error?.message ?? "Upload failed");

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(data.path);

  writeSiteSettings({ hero_image_url: publicUrl });

  revalidatePath("/");
  revalidatePath("/en");
}

export async function removeHeroImage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden");

  writeSiteSettings({ hero_image_url: null });

  revalidatePath("/");
  revalidatePath("/en");
}
