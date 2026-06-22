import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { locales } from "@/config/i18n";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function db() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = db();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const locale of locales) {
    entries.push({ url: `${BASE_URL}/${locale}`, changeFrequency: "weekly", priority: 1.0 });
    entries.push({ url: `${BASE_URL}/${locale}/categories`, changeFrequency: "weekly", priority: 0.8 });
    entries.push({ url: `${BASE_URL}/${locale}/search`, changeFrequency: "monthly", priority: 0.5 });
  }

  // Dynamic pages — fetch slug/id lists in parallel
  const [
    { data: hospitals, error: eH },
    { data: services, error: eS },
    { data: categories, error: eC },
    { data: doctors, error: eD },
    { data: reviews, error: eR },
  ] = await Promise.all([
    supabase.from("hospitals").select("slug"),
    supabase.from("services").select("slug"),
    supabase.from("categories").select("slug"),
    supabase.from("doctors").select("slug"),
    supabase.from("reviews").select("id").eq("status", "approved"),
  ]);

  if (eH) console.error("sitemap: hospitals fetch failed", eH.message);
  if (eS) console.error("sitemap: services fetch failed", eS.message);
  if (eC) console.error("sitemap: categories fetch failed", eC.message);
  if (eD) console.error("sitemap: doctors fetch failed", eD.message);
  if (eR) console.error("sitemap: reviews fetch failed", eR.message);

  for (const locale of locales) {
    for (const h of hospitals ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/hospitals/${h.slug}`, changeFrequency: "weekly", priority: 0.9 });
    }
    for (const s of services ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/services/${s.slug}`, changeFrequency: "weekly", priority: 0.9 });
    }
    for (const c of categories ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/categories/${c.slug}`, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const d of doctors ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/doctors/${d.slug}`, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const r of reviews ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/reviews/${r.id}`, changeFrequency: "weekly", priority: 0.6 });
    }
  }

  return entries;
}
