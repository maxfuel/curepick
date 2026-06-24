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

  const { email, password, full_name, company_name, country, commission_rate } = await req.json();
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
    .update({ role: "local_agent", full_name: full_name || null })
    .eq("id", authData.user.id);

  await adminClient.from("agents").insert({
    profile_id: authData.user.id,
    company_name: company_name || null,
    country: country || null,
    commission_rate: commission_rate ? Number(commission_rate) : 10,
  });

  return NextResponse.json({ success: true });
}
