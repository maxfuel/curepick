/**
 * Upload a hero background image to Supabase Storage and set it in site_settings.
 * Usage: node --env-file=.env.local scripts/upload-hero-image.mjs <path-to-image>
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, basename, extname } from "path";

function loadEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  } catch { process.exit(1); }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "site-assets";

const imagePath = process.argv[2];
if (!imagePath) {
  console.error("Usage: node --env-file=.env.local scripts/upload-hero-image.mjs <image-path>");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Create bucket if needed
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    const { error } = await admin.storage.createBucket(BUCKET, { public: true });
    if (error) { console.error("Bucket creation failed:", error.message); process.exit(1); }
    console.log(`  ✓ Created bucket: ${BUCKET}`);
  }

  // Upload image
  const absPath = resolve(imagePath);
  const fileBuffer = readFileSync(absPath);
  const ext = extname(absPath).slice(1) || "jpg";
  const storagePath = `hero/hero-bg-${Date.now()}.${ext}`;

  const { data, error } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType: `image/${ext}`, upsert: true });

  if (error || !data) { console.error("Upload failed:", error?.message); process.exit(1); }

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(data.path);
  console.log(`  ✓ Uploaded: ${publicUrl}`);

  // Save to site_settings
  const { error: dbError } = await admin
    .from("site_settings")
    .upsert({ key: "hero_image_url", value: publicUrl, updated_at: new Date().toISOString() });

  if (dbError) { console.error("DB update failed:", dbError.message); process.exit(1); }

  console.log(`  ✓ Hero image set in site_settings`);
  console.log(`\n✅ Done! Visit http://localhost:3000 to see the result.\n`);
}

main().catch(console.error);
