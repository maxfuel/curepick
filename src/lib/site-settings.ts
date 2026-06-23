import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const SETTINGS_FILE = join(process.cwd(), "data", "site-settings.json");

interface SiteSettings {
  hero_image_url: string | null;
}

const DEFAULTS: SiteSettings = {
  hero_image_url: null,
};

export function readSiteSettings(): SiteSettings {
  try {
    if (!existsSync(SETTINGS_FILE)) return DEFAULTS;
    const raw = readFileSync(SETTINGS_FILE, "utf-8");
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function writeSiteSettings(patch: Partial<SiteSettings>): void {
  const current = readSiteSettings();
  const updated = { ...current, ...patch };
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
}
