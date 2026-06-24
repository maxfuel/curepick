"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const navItems = [
  { key: "dashboard", href: "/cure-partner/dashboard" },
  { key: "cases", href: "/cure-partner/cases" },
] as const;

export function CurePartnerSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations("curePartner.nav");

  return (
    <nav className="flex flex-col gap-1 p-3">
      <div className="px-3 py-3 mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cure Partner Portal
        </p>
      </div>
      {navItems.map((item) => {
        const href = `/${locale}${item.href}`;
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={item.key}
            href={href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
