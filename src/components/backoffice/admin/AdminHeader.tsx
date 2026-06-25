"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  hospital_staff: "Hospital Staff",
  cure_partner: "Cure Partner",
  local_agent: "Local Agent",
  patient: "Patient",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  hospital_staff: "bg-green-500/10 text-green-700 border-green-500/20",
  cure_partner: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  local_agent: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  patient: "bg-muted text-muted-foreground border-border",
};

interface AdminHeaderProps {
  email: string;
  role: string;
  fullName?: string | null;
}

export function AdminHeader({ email, role, fullName }: AdminHeaderProps) {
  const label = ROLE_LABELS[role] ?? role;
  const colorClass = ROLE_COLORS[role] ?? ROLE_COLORS.patient;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b bg-background/95 backdrop-blur px-6 py-2">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
        {label}
      </span>
      <span className="text-sm text-muted-foreground">
        {fullName ?? email}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          title="로그아웃"
          className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </header>
  );
}
