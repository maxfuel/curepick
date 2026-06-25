"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth/get-user";

const HOSPITAL_BUCKET = "hospital-images";

async function uploadImage(file: File, path: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const ext = file.name.split(".").pop() ?? "jpg";
  const { data, error } = await admin.storage
    .from(HOSPITAL_BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || `image/${ext}`,
      upsert: true,
    });
  if (error || !data) return null;
  return admin.storage.from(HOSPITAL_BUCKET).getPublicUrl(data.path).data.publicUrl;
}

function revalidateHospital(slug: string | null) {
  revalidatePath("/hospital/media");
  if (slug) revalidatePath(`/hospitals/${slug}`);
}

export async function updateHospitalLogo(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("slug")
    .eq("id", profile.hospital_id)
    .single();

  const file = formData.get("logo_file") as File | null;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop();
  const url = await uploadImage(file, `logos/${hospital?.slug ?? profile.hospital_id}-${Date.now()}.${ext}`);
  if (!url) return;

  await (supabase.from("hospitals") as any)
    .update({ logo_url: url })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function updateHospitalHero(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("slug")
    .eq("id", profile.hospital_id)
    .single();

  const file = formData.get("hero_file") as File | null;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop();
  const url = await uploadImage(file, `heroes/${hospital?.slug ?? profile.hospital_id}-${Date.now()}.${ext}`);
  if (!url) return;

  await (supabase.from("hospitals") as any)
    .update({ hero_image_url: url })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function addHospitalGalleryImage(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("gallery_images, slug")
    .eq("id", profile.hospital_id)
    .single();

  const file = formData.get("image_file") as File | null;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop();
  const url = await uploadImage(file, `gallery/${profile.hospital_id}-${Date.now()}.${ext}`);
  if (!url) return;

  const current = (hospital?.gallery_images as string[]) ?? [];
  await (supabase.from("hospitals") as any)
    .update({ gallery_images: [...current, url] })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function removeHospitalGalleryImage(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("gallery_images, slug")
    .eq("id", profile.hospital_id)
    .single();

  const imageUrl = formData.get("image_url") as string;
  const current = ((hospital?.gallery_images as string[]) ?? []).filter((u) => u !== imageUrl);

  await (supabase.from("hospitals") as any)
    .update({ gallery_images: current })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function addHospitalVideo(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("videos, slug")
    .eq("id", profile.hospital_id)
    .single();

  const title = (formData.get("title") as string) || "";
  const url = (formData.get("url") as string) || "";
  const type = (formData.get("type") as string) || "general";
  if (!url) return;

  const current = (hospital?.videos as unknown[]) ?? [];
  await (supabase.from("hospitals") as any)
    .update({ videos: [...current, { title, url, type }] })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function removeHospitalVideo(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("videos, slug")
    .eq("id", profile.hospital_id)
    .single();

  const index = Number(formData.get("index"));
  const current = ((hospital?.videos as unknown[]) ?? []).filter((_, i) => i !== index);

  await (supabase.from("hospitals") as any)
    .update({ videos: current })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}
