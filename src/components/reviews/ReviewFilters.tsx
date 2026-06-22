"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

interface ReviewFiltersProps {
  categories: { id: string; name: unknown; slug: string }[];
  hospitals: { id: string; name: unknown }[];
  locale: string;
  selectedRating?: string;
  selectedHospital?: string;
  selectedCategory?: string;
}

export function ReviewFilters({
  categories,
  hospitals,
  locale,
  selectedRating,
  selectedHospital,
  selectedCategory,
}: ReviewFiltersProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={selectedRating ?? ""}
        onChange={(e) => updateFilter("rating", e.target.value)}
      >
        <option value="">{t("allRatings")}</option>
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={String(r)}>
            {t("stars", { count: r })}
          </option>
        ))}
      </select>

      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={selectedCategory ?? ""}
        onChange={(e) => updateFilter("category", e.target.value)}
      >
        <option value="">{t("allCategories")}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {getLocalizedName(c.name, locale)}
          </option>
        ))}
      </select>

      <select
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={selectedHospital ?? ""}
        onChange={(e) => updateFilter("hospital", e.target.value)}
      >
        <option value="">{t("allHospitals")}</option>
        {hospitals.map((h) => (
          <option key={h.id} value={h.id}>
            {getLocalizedName(h.name, locale)}
          </option>
        ))}
      </select>
    </div>
  );
}
