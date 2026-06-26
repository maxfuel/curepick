/**
 * Creates all test accounts defined in scripts/test-accounts.json.
 * Run: node --env-file=.env.local scripts/create-test-users.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

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
  } catch {
    console.error("Could not load .env.local");
    process.exit(1);
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { accounts, password, portals } = JSON.parse(
  readFileSync(resolve(process.cwd(), "scripts/test-accounts.json"), "utf-8")
);

async function getExistingEmails() {
  const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
  return new Set((data?.users ?? []).map((u) => u.email));
}

async function createUser(email, fullName) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  await db.from("profiles").update({ full_name: fullName }).eq("id", data.user.id);
  return data.user.id;
}

async function main() {
  console.log("\n🔧 Curepick — Creating test accounts\n");
  const existing = await getExistingEmails();

  // ── Patients ─────────────────────────────────────────────────────────────
  console.log("👤 Patients");
  for (const u of accounts.patients) {
    if (existing.has(u.email)) { console.log(`  ⏭  ${u.email} (exists)`); continue; }
    try {
      const id = await createUser(u.email, u.full_name);
      await db.from("profiles").update({ role: "patient" }).eq("id", id);
      console.log(`  ✓  ${u.email}`);
    } catch (e) { console.error(`  ✗  ${u.email}: ${e.message}`); }
  }

  // ── Hospital Staff ────────────────────────────────────────────────────────
  console.log("\n🏥 Hospital Staff");
  for (const u of accounts.hospital_staff) {
    if (existing.has(u.email)) { console.log(`  ⏭  ${u.email} (exists)`); continue; }
    try {
      const id = await createUser(u.email, u.full_name);
      await db.from("profiles").update({ role: "hospital_staff", hospital_id: u.hospital_id }).eq("id", id);
      console.log(`  ✓  ${u.email} → ${u.hospital_name}`);
    } catch (e) { console.error(`  ✗  ${u.email}: ${e.message}`); }
  }

  // ── Admins ───────────────────────────────────────────────────────────────
  console.log("\n🛡️  Admins");
  for (const u of accounts.admins) {
    if (existing.has(u.email)) { console.log(`  ⏭  ${u.email} (exists)`); continue; }
    try {
      const id = await createUser(u.email, u.full_name);
      await db.from("profiles").update({ role: "admin" }).eq("id", id);
      console.log(`  ✓  ${u.email}`);
    } catch (e) { console.error(`  ✗  ${u.email}: ${e.message}`); }
  }

  // ── Cure Partners ─────────────────────────────────────────────────────────
  console.log("\n🩺 Cure Partners");
  for (const u of accounts.cure_partners) {
    if (existing.has(u.email)) { console.log(`  ⏭  ${u.email} (exists)`); continue; }
    try {
      const id = await createUser(u.email, u.full_name);
      await db.from("profiles").update({ role: "cure_partner" }).eq("id", id);
      await db.from("cure_partners").insert({
        profile_id: id,
        full_name: u.full_name,
        languages: u.languages,
        specialty_areas: u.specialty_areas,
        status: "active",
      });
      console.log(`  ✓  ${u.email}`);
    } catch (e) { console.error(`  ✗  ${u.email}: ${e.message}`); }
  }

  // ── Local Agents ──────────────────────────────────────────────────────────
  console.log("\n🌏 Local Agents (Partners)");
  for (const u of accounts.local_agents) {
    if (existing.has(u.email)) { console.log(`  ⏭  ${u.email} (exists)`); continue; }
    try {
      const id = await createUser(u.email, u.full_name);
      await db.from("profiles").update({ role: "local_agent" }).eq("id", id);
      await db.from("agents").insert({
        profile_id: id,
        company_name: u.company_name,
        country: u.country,
        commission_rate: u.commission_rate,
        status: "active",
      });
      console.log(`  ✓  ${u.email}`);
    } catch (e) { console.error(`  ✗  ${u.email}: ${e.message}`); }
  }

  console.log("\n✅ Done! Password for all accounts: " + password);
  console.log("\nPortals:");
  for (const [role, path] of Object.entries(portals)) {
    console.log(`  ${role.padEnd(14)} → ${path}`);
  }
  console.log();
}

main().catch((err) => { console.error(err); process.exit(1); });
