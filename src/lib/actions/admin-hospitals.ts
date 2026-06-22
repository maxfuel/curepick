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

export async function createHospital(formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en);
  const description = parseMultilingual(formData.get("description") as string);
  const address = parseMultilingual(formData.get("address") as string);
  const city = (formData.get("city") as string) || null;
  const accreditation = (formData.get("accreditation") as string) || null;
  const international_center = formData.get("international_center") === "on";
  const phone = (formData.get("phone") as string) || null;
  const email = (formData.get("email") as string) || null;
  const website = (formData.get("website") as string) || null;
  const is_featured = formData.get("is_featured") === "on";
  const langRaw = formData.get("languages") as string;
  const languages = langRaw ? langRaw.split(",").map((s) => s.trim()).filter(Boolean) : null;

  const logoFile = formData.get("logo_file") as File | null;
  let logo_url = null;
  if (logoFile && logoFile.size > 0) {
    logo_url = await uploadImage(logoFile, "hospital-images", `logos/${slug}-${Date.now()}.${logoFile.name.split(".").pop()}`);
  }

  await supabase.from("hospitals").insert({
    name, slug, description, address, city, accreditation,
    international_center, phone, email, website, is_featured, languages, logo_url,
  });
  revalidatePath("/admin/hospitals");
}

export async function updateHospital(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en);
  const description = parseMultilingual(formData.get("description") as string);
  const address = parseMultilingual(formData.get("address") as string);
  const city = (formData.get("city") as string) || null;
  const accreditation = (formData.get("accreditation") as string) || null;
  const international_center = formData.get("international_center") === "on";
  const phone = (formData.get("phone") as string) || null;
  const email = (formData.get("email") as string) || null;
  const website = (formData.get("website") as string) || null;
  const is_featured = formData.get("is_featured") === "on";
  const langRaw = formData.get("languages") as string;
  const languages = langRaw ? langRaw.split(",").map((s) => s.trim()).filter(Boolean) : null;

  const logoFile = formData.get("logo_file") as File | null;
  const updates: Record<string, unknown> = {
    name, slug, description, address, city, accreditation,
    international_center, phone, email, website, is_featured, languages,
  };

  if (logoFile && logoFile.size > 0) {
    const logo_url = await uploadImage(logoFile, "hospital-images", `logos/${slug}-${Date.now()}.${logoFile.name.split(".").pop()}`);
    if (logo_url) updates.logo_url = logo_url;
  }

  await (supabase.from("hospitals") as any).update(updates).eq("id", id);
  revalidatePath("/admin/hospitals");
}

export async function deleteHospital(id: string) {
  const supabase = await createClient();
  await supabase.from("hospitals").delete().eq("id", id);
  revalidatePath("/admin/hospitals");
}

export async function upsertHospitalProcedure(formData: FormData) {
  const supabase = await createClient();
  const hospital_id = formData.get("hospital_id") as string;
  const procedure_id = formData.get("procedure_id") as string;
  const cost_min = formData.get("cost_min") ? Number(formData.get("cost_min")) : null;
  const cost_max = formData.get("cost_max") ? Number(formData.get("cost_max")) : null;
  const cost_currency = (formData.get("cost_currency") as string) || "USD";
  const annual_volume = formData.get("annual_volume") ? Number(formData.get("annual_volume")) : null;
  const specialist_count = formData.get("specialist_count") ? Number(formData.get("specialist_count")) : null;
  const waiting_time_days = formData.get("waiting_time_days") ? Number(formData.get("waiting_time_days")) : null;

  await supabase.from("hospital_procedures").upsert(
    { hospital_id, procedure_id, cost_min, cost_max, cost_currency, annual_volume, specialist_count, waiting_time_days },
    { onConflict: "hospital_id,procedure_id" }
  );
  revalidatePath("/admin/hospitals");
}

export async function removeHospitalProcedure(id: string) {
  const supabase = await createClient();
  await supabase.from("hospital_procedures").delete().eq("id", id);
  revalidatePath("/admin/hospitals");
}
