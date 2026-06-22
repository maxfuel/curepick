import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "@/components/reviews/CommentSection";

interface ReviewDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

export default async function ReviewDetailPage({
  params,
}: ReviewDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const user = await getUser();

  const { data: review } = await supabase
    .from("reviews")
    .select("*, hospitals(name)")
    .eq("id", id)
    .single();

  if (!review || (review.status !== "approved" && review.user_id !== user?.id)) {
    notFound();
  }

  // Fetch author profile separately since there's no direct FK
  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", review.user_id)
    .single();

  // Fetch comments with commenter profiles
  const { data: rawComments } = await supabase
    .from("review_comments")
    .select("id, content, created_at, user_id")
    .eq("review_id", id)
    .order("created_at", { ascending: true });

  // Fetch commenter profiles
  const commenterIds = [...new Set((rawComments ?? []).map((c) => c.user_id))];
  const { data: commenterProfiles } =
    commenterIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("id", commenterIds)
      : { data: [] };

  const profileMap = new Map(
    (commenterProfiles ?? []).map((p) => [p.id, p])
  );

  const comments = (rawComments ?? []).map((c) => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    profiles: profileMap.get(c.user_id) ?? null,
  }));

  return (
    <ReviewDetailContent
      review={{
        id: review.id,
        title: review.title,
        content: review.content,
        rating: review.rating,
        media: review.media,
        is_verified: review.is_verified,
        created_at: review.created_at,
        hospitals: review.hospitals,
        authorName: authorProfile?.full_name ?? null,
      }}
      comments={comments}
      locale={locale}
      isLoggedIn={!!user}
    />
  );
}

function ReviewDetailContent({
  review,
  comments,
  locale,
  isLoggedIn,
}: {
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
  comments: {
    id: string;
    content: string;
    created_at: string | null;
    profiles: { full_name: string | null; role: string | null } | null;
  }[];
  locale: string;
  isLoggedIn: boolean;
}) {
  const t = useTranslations("reviews");

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

          <h1 className="text-2xl font-bold">{review.title}</h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {review.authorName && <span>{review.authorName}</span>}
            {review.hospitals && (
              <>
                <span>·</span>
                <span>
                  {getLocalizedName(review.hospitals.name, locale)}
                </span>
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
          {review.content}
        </div>

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
          isLoggedIn={isLoggedIn}
          locale={locale}
        />
      </div>
    </div>
  );
}
