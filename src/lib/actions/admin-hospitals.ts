"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { parseMultilingual } from "@/lib/utils/multilingual";

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const HOSPITAL_BUCKET = "hospital-images";

async function ensureHospitalBucket() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === HOSPITAL_BUCKET)) {
    await admin.storage.createBucket(HOSPITAL_BUCKET, { public: true });
  }
}

async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
  if (!file || file.size === 0) return null;

  await ensureHospitalBucket();

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const ext = file.name.split(".").pop() ?? "jpg";
  const { data, error } = await admin.storage
    .from(bucket)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || `image/${ext}`,
      upsert: true,
    });
  if (error || !data) return null;
  const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}

export async function createHospital(formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slugRaw = (formData.get("slug") as string).trim();
  const slug = slugRaw ? slugify(slugRaw) : slugify(name.en ?? "");
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
  const slugRaw = (formData.get("slug") as string).trim();
  const slug = slugRaw ? slugify(slugRaw) : slugify(name.en ?? "");
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
  const founded_year = formData.get("founded_year") ? Number(formData.get("founded_year")) : null;
  const annual_patients = formData.get("annual_patients") ? Number(formData.get("annual_patients")) : null;

  const logoFile = formData.get("logo_file") as File | null;
  const heroFile = formData.get("hero_file") as File | null;
  const updates: Record<string, unknown> = {
    name, slug, description, address, city, accreditation,
    international_center, phone, email, website, is_featured, languages,
    founded_year, annual_patients,
  };

  if (logoFile && logoFile.size > 0) {
    const logo_url = await uploadImage(logoFile, "hospital-images", `logos/${slug}-${Date.now()}.${logoFile.name.split(".").pop()}`);
    if (logo_url) updates.logo_url = logo_url;
  }
  if (heroFile && heroFile.size > 0) {
    const hero_url = await uploadImage(heroFile, "hospital-images", `heroes/${slug}-${Date.now()}.${heroFile.name.split(".").pop()}`);
    if (hero_url) updates.hero_image_url = hero_url;
  }

  await (supabase.from("hospitals") as any).update(updates).eq("id", id);
  revalidatePath("/admin/hospitals");
  revalidatePath(`/hospitals/${slug}`);
}

// ── Video management ──────────────────────────────────────────────────────────

export async function addHospitalVideo(hospitalId: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string) || "";
  const url = (formData.get("url") as string) || "";
  const type = (formData.get("type") as string) || "youtube";
  if (!url) return;

  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("videos, slug")
    .eq("id", hospitalId)
    .single();

  const current = (hospital?.videos as unknown[]) ?? [];
  await (supabase.from("hospitals") as any)
    .update({ videos: [...current, { title, url, type }] })
    .eq("id", hospitalId);

  revalidatePath("/admin/hospitals");
  if (hospital?.slug) revalidatePath(`/hospitals/${hospital.slug}`);
}

export async function removeHospitalVideo(hospitalId: string, index: number) {
  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("videos, slug")
    .eq("id", hospitalId)
    .single();

  const current = ((hospital?.videos as unknown[]) ?? []).filter((_, i) => i !== index);
  await (supabase.from("hospitals") as any)
    .update({ videos: current })
    .eq("id", hospitalId);

  revalidatePath("/admin/hospitals");
  if (hospital?.slug) revalidatePath(`/hospitals/${hospital.slug}`);
}

// ── Gallery management ────────────────────────────────────────────────────────

export async function addHospitalGalleryImage(hospitalId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("image_file") as File | null;
  if (!file || file.size === 0) return;

  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("gallery_images, slug")
    .eq("id", hospitalId)
    .single();

  const ext = file.name.split(".").pop();
  const url = await uploadImage(file, "hospital-images", `gallery/${hospitalId}-${Date.now()}.${ext}`);
  if (!url) return;

  const current = (hospital?.gallery_images as string[]) ?? [];
  await (supabase.from("hospitals") as any)
    .update({ gallery_images: [...current, url] })
    .eq("id", hospitalId);

  revalidatePath("/admin/hospitals");
  if (hospital?.slug) revalidatePath(`/hospitals/${hospital.slug}`);
}

export async function removeHospitalGalleryImage(hospitalId: string, url: string) {
  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("gallery_images, slug")
    .eq("id", hospitalId)
    .single();

  const current = ((hospital?.gallery_images as string[]) ?? []).filter((u) => u !== url);
  await (supabase.from("hospitals") as any)
    .update({ gallery_images: current })
    .eq("id", hospitalId);

  revalidatePath("/admin/hospitals");
  if (hospital?.slug) revalidatePath(`/hospitals/${hospital.slug}`);
}

// ── Awards management ─────────────────────────────────────────────────────────

export async function addHospitalAward(hospitalId: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string) || "";
  const year = formData.get("year") ? Number(formData.get("year")) : undefined;
  const description = (formData.get("description") as string) || undefined;
  if (!title) return;

  const imageFile = formData.get("image_file") as File | null;
  let image_url: string | undefined;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    image_url = await uploadImage(imageFile, "hospital-images", `awards/${hospitalId}-${Date.now()}.${ext}`) ?? undefined;
  }

  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("awards, slug")
    .eq("id", hospitalId)
    .single();

  const current = (hospital?.awards as unknown[]) ?? [];
  await (supabase.from("hospitals") as any)
    .update({ awards: [...current, { title, year, description, image_url }] })
    .eq("id", hospitalId);

  revalidatePath("/admin/hospitals");
  if (hospital?.slug) revalidatePath(`/hospitals/${hospital.slug}`);
}

export async function removeHospitalAward(hospitalId: string, index: number) {
  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("awards, slug")
    .eq("id", hospitalId)
    .single();

  const current = ((hospital?.awards as unknown[]) ?? []).filter((_, i) => i !== index);
  await (supabase.from("hospitals") as any)
    .update({ awards: current })
    .eq("id", hospitalId);

  revalidatePath("/admin/hospitals");
  if (hospital?.slug) revalidatePath(`/hospitals/${hospital.slug}`);
}

export async function updateHospitalLogo(hospitalId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("logo_file") as File | null;
  if (!file || file.size === 0) return;

  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("slug").eq("id", hospitalId).single();

  const ext = file.name.split(".").pop();
  const url = await uploadImage(file, "hospital-images", `logos/${hospital?.slug ?? hospitalId}-${Date.now()}.${ext}`);
  if (!url) return;

  await (supabase.from("hospitals") as any).update({ logo_url: url }).eq("id", hospitalId);
  revalidatePath("/admin/hospitals");
  if (hospital?.slug) revalidatePath(`/hospitals/${hospital.slug}`);
}

export async function updateHospitalHero(hospitalId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("hero_file") as File | null;
  if (!file || file.size === 0) return;

  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("slug").eq("id", hospitalId).single();

  const ext = file.name.split(".").pop();
  const url = await uploadImage(file, "hospital-images", `heroes/${hospital?.slug ?? hospitalId}-${Date.now()}.${ext}`);
  if (!url) return;

  await (supabase.from("hospitals") as any).update({ hero_image_url: url }).eq("id", hospitalId);
  revalidatePath("/admin/hospitals");
  if (hospital?.slug) revalidatePath(`/hospitals/${hospital.slug}`);
}

export async function deleteHospital(id: string) {
  const supabase = await createClient();
  await supabase.from("hospitals").delete().eq("id", id);
  revalidatePath("/admin/hospitals");
}

// ── Doctor / Medical Team management ─────────────────────────────────────────

export async function addDoctor(hospitalId: string, formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const specialty = parseMultilingual(formData.get("specialty") as string);
  const experience_years = formData.get("experience_years") ? Number(formData.get("experience_years")) : null;
  const langRaw = formData.get("languages") as string;
  const languages = langRaw ? langRaw.split(",").map((s) => s.trim()).filter(Boolean) : null;
  const slug = slugify(name.en || "doctor") + "-" + hospitalId.slice(0, 4) + "-" + Date.now();

  const photoFile = formData.get("photo_file") as File | null;
  let photo_url: string | null = null;
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop();
    photo_url = await uploadImage(photoFile, "hospital-images", `doctors/${hospitalId}-${Date.now()}.${ext}`);
  }

  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("slug").eq("id", hospitalId).single();

  await supabase.from("doctors").insert({
    hospital_id: hospitalId,
    name,
    slug,
    specialty,
    experience_years,
    languages,
    photo_url,
  });

  revalidatePath("/admin/hospitals");
  if (hospital?.slug) revalidatePath(`/hospitals/${hospital.slug}`);
}

export async function removeDoctor(doctorId: string) {
  const supabase = await createClient();
  await supabase.from("doctors").delete().eq("id", doctorId);
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
