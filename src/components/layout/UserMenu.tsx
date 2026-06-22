"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth/actions";

export function UserMenu() {
  const t = useTranslations("common");
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="size-7 animate-pulse rounded-full bg-muted" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/my" />} nativeButton={false}>
          <User className="size-4" />
          <span className="sr-only">{t("myPage")}</span>
        </Button>
        <form action={signOut}>
          <Button variant="ghost" size="icon-sm" type="submit">
            <LogOut className="size-4" />
            <span className="sr-only">{t("logout")}</span>
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" render={<Link href="/login" />} nativeButton={false}>
        {t("login")}
      </Button>
      <Button size="sm" render={<Link href="/signup" />} nativeButton={false}>
        {t("signup")}
      </Button>
    </div>
  );
}
