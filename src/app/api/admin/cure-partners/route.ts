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

function splitComma(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((s: string) => s.trim()).filter(Boolean);
}

export async function POST(req: NextRequest) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    email, password, full_name,
    languages, specialty_areas, service_regions, certifications, partner_hospitals,
    protocol_features,
    title_en, title_ko, bio_en, bio_ko,
    nationality, base_country,
    years_experience, patient_count,
    contact_whatsapp, contact_wechat,
    vip_level, photo_url, intro_video_url,
  } = body;

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

  const titleJson: Record<string, string> = {};
  if (title_en) titleJson.en = title_en;
  if (title_ko) titleJson.ko = title_ko;

  const bioJson: Record<string, string> = {};
  if (bio_en) bioJson.en = bio_en;
  if (bio_ko) bioJson.ko = bio_ko;

  await adminClient.from("cure_partners").insert({
    profile_id: authData.user.id,
    full_name: full_name || null,
    languages: splitComma(languages),
    specialty_areas: splitComma(specialty_areas),
    service_regions: splitComma(service_regions),
    certifications: splitComma(certifications),
    partner_hospitals: splitComma(partner_hospitals),
    protocol_features: Array.isArray(protocol_features) ? protocol_features : splitComma(protocol_features),
    title: Object.keys(titleJson).length ? titleJson : null,
    bio: Object.keys(bioJson).length ? bioJson : null,
    nationality: nationality || null,
    base_country: base_country || null,
    years_experience: years_experience ? parseInt(years_experience) : null,
    patient_count: patient_count ? parseInt(patient_count) : 0,
    contact_whatsapp: contact_whatsapp || null,
    contact_wechat: contact_wechat || null,
    vip_level: vip_level || "standard",
    photo_url: photo_url || null,
    intro_video_url: intro_video_url || null,
  });

  return NextResponse.json({ success: true });
}
