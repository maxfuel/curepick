import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { BackofficeShell } from "@/components/backoffice/BackofficeShell";
import { HospitalSidebar } from "@/components/backoffice/hospital/HospitalSidebar";
import { AdminHeader } from "@/components/backoffice/admin/AdminHeader";

interface HospitalLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function HospitalLayout({
  children,
  params,
}: HospitalLayoutProps) {
  const { locale } = await params;
  const profile = await getProfile();

  if (!profile || profile.role !== "hospital_staff") {
    redirect(`/${locale}/login`);
  }

  const supabase = await createClient();
  const { data: hospital } = profile.hospital_id
    ? await supabase
        .from("hospitals")
        .select("name")
        .eq("id", profile.hospital_id)
        .single()
    : { data: null };

  return (
    <BackofficeShell sidebar={<HospitalSidebar locale={locale} />}>
      <AdminHeader
        email={profile.email!}
        role={profile.role!}
        fullName={profile.full_name}
        subtitle={hospital ? getLocalizedField(hospital.name, locale) || null : null}
      />
      {children}
    </BackofficeShell>
  );
}
