"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/types/database";
import { deleteReview } from "@/lib/actions/reviews";

interface MyReviewListProps {
  reviews: (Tables<"reviews"> & {
    hospitals: { name: unknown } | null;
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

export function MyReviewList({ reviews, locale }: MyReviewListProps) {
  const t = useTranslations("myPage");

  if (reviews.length === 0) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-muted-foreground">{t("noReviews")}</p>
        <Button render={<Link href="/reviews/write" />} nativeButton={false}>
          {t("writeReview")}
        </Button>
      </div>
    );
  }

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm(t("confirmDelete"))) return;
    await deleteReview(reviewId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" render={<Link href="/reviews/write" />} nativeButton={false}>
          {t("writeReview")}
        </Button>
      </div>

      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl border p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                {review.status && (
                  <Badge variant="outline">{review.status}</Badge>
                )}
              </div>
              <Link
                href={`/reviews/${review.id}`}
                className="font-medium hover:underline"
              >
                {review.title}
              </Link>
              {review.hospitals && (
                <p className="text-sm text-muted-foreground">
                  {getLocalizedName(review.hospitals.name, locale)}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {review.created_at
                  ? new Date(review.created_at).toLocaleDateString(locale)
                  : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="xs"
                render={<Link href={`/reviews/${review.id}/edit`} />}
                nativeButton={false}
              >
                {t("editReview")}
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleDelete(review.id)}
              >
                {t("deleteReview")}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
