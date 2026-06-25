import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-user";
import { BackofficeShell } from "@/components/backoffice/BackofficeShell";
import { AdminSidebar } from "@/components/backoffice/admin/AdminSidebar";
import { AdminHeader } from "@/components/backoffice/admin/AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") {
    redirect(`/${locale}/login`);
  }

  return (
    <BackofficeShell sidebar={<AdminSidebar locale={locale} />}>
      <AdminHeader email={profile.email!} role={profile.role!} fullName={profile.full_name} />
      {children}
    </BackofficeShell>
  );
}
