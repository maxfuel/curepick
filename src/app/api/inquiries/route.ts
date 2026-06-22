import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { inquirySchema } from "@/lib/validations/inquiry";
import { sendInquiryNotification } from "@/lib/email/send-inquiry-notification";

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, phone, nationality, serviceId, hospitalId, message } =
    parsed.data;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("inquiries").insert({
    name,
    email,
    phone: phone || null,
    nationality: nationality || null,
    service_id: serviceId || null,
    hospital_id: hospitalId || null,
    message: message || null,
    user_id: user?.id || null,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch hospital contact info for notification (non-blocking)
  let hospitalEmail: string | undefined;
  let hospitalName: string | undefined;
  if (hospitalId) {
    const { data: hospital } = await supabase
      .from("hospitals")
      .select("email, name")
      .eq("id", hospitalId)
      .single();
    hospitalEmail = hospital?.email ?? undefined;
    hospitalName =
      typeof hospital?.name === "object" && hospital.name !== null
        ? (hospital.name as Record<string, string>)["en"] ?? undefined
        : undefined;
  }

  sendInquiryNotification({ name, email, message, hospitalId, hospitalEmail, hospitalName }).catch(
    console.error
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
