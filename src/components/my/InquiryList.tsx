"use client";

import { useTranslations } from "next-intl";
import type { Tables } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";

interface InquiryListProps {
  inquiries: (Tables<"inquiries"> & {
    hospitals: { name: unknown } | null;
    services: { name: unknown } | null;
  })[];
  locale: string;
}

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

export function InquiryList({ inquiries, locale }: InquiryListProps) {
  const t = useTranslations("myPage");

  if (inquiries.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        {t("noInquiries")}
      </p>
    );
  }

  const statusMap: Record<string, string> = {
    new: t("statusNew"),
    contacted: t("statusContacted"),
    closed: t("statusClosed"),
  };

  const statusVariant: Record<
    string,
    "default" | "secondary" | "outline"
  > = {
    new: "default",
    contacted: "secondary",
    closed: "outline",
  };

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <div
          key={inquiry.id}
          className="rounded-xl border p-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {inquiry.hospitals && (
                <p className="font-medium">
                  {getLocalizedName(inquiry.hospitals.name, locale)}
                </p>
              )}
              {inquiry.services && (
                <p className="text-sm text-muted-foreground">
                  {getLocalizedName(inquiry.services.name, locale)}
                </p>
              )}
              {inquiry.message && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {inquiry.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {inquiry.created_at
                  ? new Date(inquiry.created_at).toLocaleDateString(locale)
                  : ""}
              </p>
            </div>
            <Badge variant={statusVariant[inquiry.status ?? "new"] ?? "default"}>
              {statusMap[inquiry.status ?? "new"] ?? inquiry.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
