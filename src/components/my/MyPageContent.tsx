"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Tables } from "@/lib/types/database";
import { ProfileForm } from "./ProfileForm";
import { InquiryList } from "./InquiryList";
import { MyReviewList } from "./MyReviewList";
import { Button } from "@/components/ui/button";

interface MyPageContentProps {
  profile: Tables<"profiles"> | null;
  inquiries: (Tables<"inquiries"> & {
    hospitals: { name: unknown } | null;
    services: { name: unknown } | null;
  })[];
  reviews: (Tables<"reviews"> & {
    hospitals: { name: unknown } | null;
  })[];
  locale: string;
}

type Tab = "profile" | "inquiries" | "reviews";

export function MyPageContent({
  profile,
  inquiries,
  reviews,
  locale,
}: MyPageContentProps) {
  const t = useTranslations("myPage");
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: t("profileTab") },
    { id: "inquiries", label: t("inquiriesTab") },
    { id: "reviews", label: t("reviewsTab") },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      <div className="mb-6 flex gap-2 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className={`rounded-none border-b-2 ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "profile" && <ProfileForm profile={profile} />}
      {activeTab === "inquiries" && (
        <InquiryList inquiries={inquiries} locale={locale} />
      )}
      {activeTab === "reviews" && (
        <MyReviewList reviews={reviews} locale={locale} />
      )}
    </div>
  );
}
