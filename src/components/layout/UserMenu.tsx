"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function UserMenu() {
  const t = useTranslations("common");

  // TODO: Replace with actual auth state from Supabase in Phase 6
  const isLoggedIn = false;

  if (isLoggedIn) {
    return (
      <Button variant="ghost" size="icon-sm">
        <User className="size-4" />
        <span className="sr-only">{t("myPage")}</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" render={<Link href="/login" />}>
        {t("login")}
      </Button>
      <Button size="sm" render={<Link href="/signup" />}>
        {t("signup")}
      </Button>
    </div>
  );
}
