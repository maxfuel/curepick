import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-user";
import { BackofficeShell } from "@/components/backoffice/BackofficeShell";
import { HospitalSidebar } from "@/components/backoffice/hospital/HospitalSidebar";

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

  return (
    <BackofficeShell sidebar={<HospitalSidebar locale={locale} />}>
      {children}
    </BackofficeShell>
  );
}
