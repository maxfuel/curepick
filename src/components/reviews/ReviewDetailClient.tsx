"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TranslateButton } from "./TranslateButton";
import { CommentSection } from "./CommentSection";

interface ReviewDetailClientProps {
  review: {
    id: string;
    title: string;
    content: string;
    rating: number;
    media: unknown;
    is_verified: boolean | null;
    created_at: string | null;
    hospitals: { name: unknown } | null;
    authorName: string | null;
  };
  cachedTranslation: { title: string; content: string } | null;
  comments: {
    id: string;
    content: string;
    created_at: string | null;
    profiles: { full_name: string | null; role: string | null } | null;
  }[];
  commentTranslations: Record<string, { content: string } | null>;
  locale: string;
  isLoggedIn: boolean;
}

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

export function ReviewDetailClient({
  review,
  cachedTranslation,
  comments,
  commentTranslations,
  locale,
  isLoggedIn,
}: ReviewDetailClientProps) {
  const t = useTranslations("reviews");
  const [translation, setTranslation] = useState<{
    title: string;
    content: string;
  } | null>(cachedTranslation);
  const [showTranslation, setShowTranslation] = useState(!!cachedTranslation);

  const displayTitle =
    showTranslation && translation ? translation.title : review.title;
  const displayContent =
    showTranslation && translation ? translation.content : review.content;

  const mediaUrls = Array.isArray(review.media)
    ? (review.media as string[])
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <article className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-5 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            {review.is_verified && (
              <Badge variant="secondary">{t("verified")}</Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold">{displayTitle}</h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {review.authorName && <span>{review.authorName}</span>}
            {review.hospitals && (
              <>
                <span>·</span>
                <span>{getLocalizedName(review.hospitals.name, locale)}</span>
              </>
            )}
            {review.created_at && (
              <>
                <span>·</span>
                <span>
                  {new Date(review.created_at).toLocaleDateString(locale)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {displayContent}
        </div>

        <TranslateButton
          type="review"
          id={review.id}
          locale={locale}
          translation={translation}
          showTranslation={showTranslation}
          onTranslated={(data) =>
            setTranslation(data as { title: string; content: string })
          }
          onToggle={setShowTranslation}
        />

        {mediaUrls.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {mediaUrls.map((url, i) => (
              <div
                key={i}
                className="h-48 overflow-hidden rounded-lg bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </article>

      <div className="mt-8 border-t pt-8">
        <CommentSection
          reviewId={review.id}
          comments={comments}
          commentTranslations={commentTranslations}
          isLoggedIn={isLoggedIn}
          locale={locale}
        />
      </div>
    </div>
  );
}
