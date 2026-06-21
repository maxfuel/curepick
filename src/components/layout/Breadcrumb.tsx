"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const TRANSLATABLE_SEGMENTS = [
  "categories",
  "services",
  "hospitals",
  "doctors",
  "inquiry",
  "reviews",
] as const;

type TranslatableSegment = (typeof TRANSLATABLE_SEGMENTS)[number];

function isTranslatable(segment: string): segment is TranslatableSegment {
  return TRANSLATABLE_SEGMENTS.includes(segment as TranslatableSegment);
}

export function PageBreadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("breadcrumb");

  // Don't show breadcrumb on homepage
  if (pathname === "/") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-6 py-3">
      <BreadcrumbRoot>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>
              {t("home")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment, index) => {
            const href = `/${segments.slice(0, index + 1).join("/")}`;
            const isLast = index === segments.length - 1;
            const label = isTranslatable(segment)
              ? t(segment)
              : decodeURIComponent(segment).replace(/-/g, " ");

            return (
              <span key={href} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="capitalize">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link href={href} />}
                      className="capitalize"
                    >
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            );
          })}
        </BreadcrumbList>
      </BreadcrumbRoot>
    </div>
  );
}
