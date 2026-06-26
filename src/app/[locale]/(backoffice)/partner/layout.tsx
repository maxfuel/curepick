import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-user";
import { BackofficeShell } from "@/components/backoffice/BackofficeShell";
import { PartnerSidebar } from "@/components/backoffice/partner/PartnerSidebar";
import { AdminHeader } from "@/components/backoffice/admin/AdminHeader";

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PartnerLayout({ children, params }: Props) {
  const { locale } = await params;
  const profile = await getProfile();

  if (!profile || profile.role !== "local_agent") {
    redirect(`/${locale}/login`);
  }

  return (
    <BackofficeShell sidebar={<PartnerSidebar locale={locale} />}>
      <AdminHeader email={profile.email!} role={profile.role!} fullName={profile.full_name} />
      {children}
    </BackofficeShell>
  );
}
