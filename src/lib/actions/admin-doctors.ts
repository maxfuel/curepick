"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { parseMultilingual } from "@/lib/utils/multilingual";

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const DOCTOR_BUCKET = "doctor-images";

async function ensureDoctorBucket() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === DOCTOR_BUCKET)) {
    await admin.storage.createBucket(DOCTOR_BUCKET, { public: true });
  }
}

async function uploadImage(file: File, path: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  await ensureDoctorBucket();
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const ext = file.name.split(".").pop() ?? "jpg";
  const { data, error } = await admin.storage
    .from(DOCTOR_BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || `image/${ext}`,
      upsert: true,
    });
  if (error || !data) return null;
  return admin.storage.from(DOCTOR_BUCKET).getPublicUrl(data.path).data.publicUrl;
}

export async function createDoctor(formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en ?? "");
  const specialty = parseMultilingual(formData.get("specialty") as string);
  const bio = parseMultilingual(formData.get("bio") as string);
  const hospital_id = (formData.get("hospital_id") as string) || null;
  const experience_years = formData.get("experience_years") ? Number(formData.get("experience_years")) : null;
  const langRaw = formData.get("languages") as string;
  const languages = langRaw ? langRaw.split(",").map((s) => s.trim()).filter(Boolean) : null;

  const photoFile = formData.get("photo_file") as File | null;
  let photo_url = null;
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split(".").pop() ?? "jpg";
    photo_url = await uploadImage(photoFile, `photos/${slug}-${Date.now()}.${ext}`);
  }

  await supabase.from("doctors").insert({
    name, slug, specialty, bio, hospital_id, experience_years, languages, photo_url,
  });
  revalidatePath("/admin/doctors");
}

export async function updateDoctor(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en ?? "");
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
    const ext = photoFile.name.split(".").pop() ?? "jpg";
    const photo_url = await uploadImage(photoFile, `photos/${slug}-${Date.now()}.${ext}`);
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
