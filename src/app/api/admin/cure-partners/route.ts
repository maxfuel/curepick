import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth/get-user";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function assertAdmin() {
  const profile = await getProfile();
  return profile?.role === "admin";
}

export async function POST(req: NextRequest) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, password, full_name, languages, specialty_areas } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const adminClient = getAdminClient();

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Failed to create user" },
      { status: 500 }
    );
  }

  await adminClient
    .from("profiles")
    .update({ role: "cure_partner", full_name: full_name || null })
    .eq("id", authData.user.id);

  const langArr = languages
    ? languages.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];
  const specArr = specialty_areas
    ? specialty_areas.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  await adminClient.from("cure_partners").insert({
    profile_id: authData.user.id,
    full_name: full_name || null,
    languages: langArr,
    specialty_areas: specArr,
  });

  return NextResponse.json({ success: true });
}
