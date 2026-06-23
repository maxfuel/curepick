/**
 * One-time script to create test accounts for local development.
 * Run: node --env-file=.env.local scripts/create-test-users.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually as fallback for Node < 20
function loadEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return; // already loaded via --env-file
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  } catch {
    console.error("Could not load .env.local — pass env vars manually.");
    process.exit(1);
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_USERS = [
  {
    email: "admin@test.curepick.com",
    password: "Admin1234!",
    full_name: "Admin Test",
    role: "admin",
    hospital_id: null,
  },
  {
    email: "hospital@test.curepick.com",
    password: "Hospital1234!",
    full_name: "Hospital Staff Test",
    role: "hospital_staff",
    hospital_id: "FIRST", // replaced dynamically below
  },
  {
    email: "user@test.curepick.com",
    password: "User1234!",
    full_name: "User Test",
    role: null,
    hospital_id: null,
  },
];

async function getFirstHospitalId() {
  const { data, error } = await adminClient
    .from("hospitals")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  if (error || !data) {
    console.warn("No hospitals found in DB — hospital_staff will have no hospital_id");
    return null;
  }
  const name = typeof data.name === "object" ? (data.name.en ?? JSON.stringify(data.name)) : data.name;
  console.log(`  → Assigning hospital: "${name}" (${data.id})`);
  return data.id;
}

async function createOrSkipUser(user) {
  // Check if already exists
  const { data: existing } = await adminClient.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === user.email);

  if (found) {
    console.log(`  ⏭  ${user.email} already exists — skipping`);
    return;
  }

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });

  if (authError || !authData?.user) {
    console.error(`  ✗  Failed to create ${user.email}: ${authError?.message}`);
    return;
  }

  const userId = authData.user.id;

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      role: user.role,
      full_name: user.full_name,
      hospital_id: user.hospital_id,
    })
    .eq("id", userId);

  if (profileError) {
    console.error(`  ✗  Profile update failed for ${user.email}: ${profileError.message}`);
    return;
  }

  console.log(`  ✓  ${user.email} created (role: ${user.role})`);
}

async function main() {
  console.log("\n🔧 Curepick — Creating test users\n");

  const firstHospitalId = await getFirstHospitalId();
  for (const user of TEST_USERS) {
    if (user.hospital_id === "FIRST") user.hospital_id = firstHospitalId;
  }

  for (const user of TEST_USERS) {
    process.stdout.write(`Creating ${user.email}...\n`);
    await createOrSkipUser(user);
  }

  console.log("\n✅ Done!\n");
  console.log("Test accounts:");
  console.log("  admin@test.curepick.com      / Admin1234!    → /en/admin");
  console.log("  hospital@test.curepick.com   / Hospital1234! → /en/hospital");
  console.log("  user@test.curepick.com       / User1234!     → /en/my\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
