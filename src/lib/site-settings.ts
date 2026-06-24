import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

interface SiteSettings {
  hero_image_url: string | null;
}

const DEFAULTS: SiteSettings = { hero_image_url: null };

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const readSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const admin = getAdminClient();
    const { data } = await admin.from("site_settings").select("key, value");
    if (!data) return DEFAULTS;
    const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
    return { hero_image_url: map.hero_image_url ?? null };
  },
  ["site-settings"],
  { tags: ["site-settings"] }
);

export async function writeSiteSettings(
  patch: Partial<SiteSettings>
): Promise<void> {
  const admin = getAdminClient();
  const entries = Object.entries(patch) as [string, string | null][];
  for (const [key, value] of entries) {
    await admin
      .from("site_settings")
      .upsert({ key, value: value ?? null }, { onConflict: "key" });
  }
}
