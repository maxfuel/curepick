"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { parseMultilingual } from "@/lib/utils/multilingual";

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en ?? "");
  await supabase.from("categories").insert({ name, slug });
  revalidatePath("/admin/services");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/services");
}

// ─── Services ────────────────────────────────────────────────────────────────

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en ?? "");
  const description = parseMultilingual(formData.get("description") as string);
  const overview = parseMultilingual(formData.get("overview") as string);
  const category_id = (formData.get("category_id") as string) || null;
  const is_featured = formData.get("is_featured") === "on";
  await supabase.from("services").insert({ name, slug, description, overview, category_id, is_featured });
  revalidatePath("/admin/services");
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en ?? "");
  const description = parseMultilingual(formData.get("description") as string);
  const overview = parseMultilingual(formData.get("overview") as string);
  const category_id = (formData.get("category_id") as string) || null;
  const is_featured = formData.get("is_featured") === "on";
  await supabase
    .from("services")
    .update({ name, slug, description, overview, category_id, is_featured })
    .eq("id", id);
  revalidatePath("/admin/services");
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin/services");
}

// ─── Procedures ──────────────────────────────────────────────────────────────

export async function createProcedure(formData: FormData) {
  const supabase = await createClient();
  const name = parseMultilingual(formData.get("name") as string);
  const slug = (formData.get("slug") as string) || slugify(name.en ?? "");
  const service_id = formData.get("service_id") as string;
  await supabase.from("procedures").insert({ name, slug, service_id });
  revalidatePath("/admin/services");
}

export async function deleteProcedure(id: string) {
  const supabase = await createClient();
  await supabase.from("procedures").delete().eq("id", id);
  revalidatePath("/admin/services");
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export async function createFaq(formData: FormData) {
  const supabase = await createClient();
  const question = parseMultilingual(formData.get("question") as string);
  const answer = parseMultilingual(formData.get("answer") as string);
  const service_id = formData.get("service_id") as string;
  await supabase.from("faqs").insert({ question, answer, service_id });
  revalidatePath("/admin/services");
}

export async function deleteFaq(id: string) {
  const supabase = await createClient();
  await supabase.from("faqs").delete().eq("id", id);
  revalidatePath("/admin/services");
}
