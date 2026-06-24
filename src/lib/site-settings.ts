import { createClient } from "@supabase/supabase-js";

interface SiteSettings {
  hero_image_url: string | null;
}

const DEFAULTS: SiteSettings = {
  hero_image_url: null,
};

// Singleton row — the table is constrained to a single row with id = 1.
const SETTINGS_ID = 1;

// Public read uses the anon key (RLS allows SELECT). Reads happen in server
// components, so no cookie/session scope is required.
function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Writes use the service role key (bypasses RLS) — only called from admin server actions.
function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await anonClient()
      .from("site_settings")
      .select("hero_image_url")
      .eq("id", SETTINGS_ID)
      .maybeSingle();
    if (error || !data) return DEFAULTS;
    return { ...DEFAULTS, ...data };
  } catch {
    return DEFAULTS;
  }
}

export async function writeSiteSettings(patch: Partial<SiteSettings>): Promise<void> {
  await serviceClient()
    .from("site_settings")
    .upsert({ id: SETTINGS_ID, ...patch, updated_at: new Date().toISOString() });
}
