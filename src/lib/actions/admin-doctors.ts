"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function parseMultilingual(raw: string | null) {
  if (!raw) return { en: "", ko: "", zh: "", ja: "" };
  try { return JSON.parse(raw); } catch { return { en: raw, ko: raw, zh: raw, ja: raw }; }
}

async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error || !data) return null;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}

export async function createDoctor(formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en);
  const specialty = parseMultilingual(formData.get("specialty") as string);
  const bio = parseMultilingual(formData.get("bio") as string);
  const hospital_id = (formData.get("hospital_id") as string) || null;
  const experience_years = formData.get("experience_years") ? Number(formData.get("experience_years")) : null;
  const langRaw = formData.get("languages") as string;
  const languages = langRaw ? langRaw.split(",").map((s) => s.trim()).filter(Boolean) : null;

  const photoFile = formData.get("photo_file") as File | null;
  let photo_url = null;
  if (photoFile && photoFile.size > 0) {
    photo_url = await uploadImage(photoFile, "doctor-images", `photos/${slug}-${Date.now()}.${photoFile.name.split(".").pop()}`);
  }

  await supabase.from("doctors").insert({
    name, slug, specialty, bio, hospital_id, experience_years, languages, photo_url,
  });
  revalidatePath("/admin/doctors");
}

export async function updateDoctor(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en);
  const specialty = parseMultilingual(formData.get("specialty") as string);
  const bio = parseMultilingual(formData.get("bio") as string);
  const hospital_id = (formData.get("hospital_id") as string) || null;
  const experience_years = formData.get("experience_years") ? Number(formData.get("experience_years")) : null;
  const langRaw = formData.get("languages") as string;
  const languages = langRaw ? langRaw.split(",").map((s) => s.trim()).filter(Boolean) : null;

  const updates: Record<string, unknown> = {
    name, slug, specialty, bio, hospital_id, experience_years, languages,
  };

  const photoFile = formData.get("photo_file") as File | null;
  if (photoFile && photoFile.size > 0) {
    const photo_url = await uploadImage(photoFile, "doctor-images", `photos/${slug}-${Date.now()}.${photoFile.name.split(".").pop()}`);
    if (photo_url) updates.photo_url = photo_url;
  }

  await (supabase.from("doctors") as any).update(updates).eq("id", id);
  revalidatePath("/admin/doctors");
}

export async function deleteDoctor(id: string) {
  const supabase = await createClient();
  await supabase.from("doctors").delete().eq("id", id);
  revalidatePath("/admin/doctors");
}
