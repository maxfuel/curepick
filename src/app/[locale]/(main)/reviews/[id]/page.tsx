import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { ReviewDetailClient } from "@/components/reviews/ReviewDetailClient";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

interface ReviewDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: ReviewDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const supabase = await createClient();
  const { data: review } = await supabase
    .from("reviews")
    .select("title, content")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!review) return {};

  return buildMetadata({
    title: review.title,
    description: review.content.slice(0, 160),
    locale,
    path: `/reviews/${id}`,
  });
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
    .select(
      "*, hospitals(name), review_translations(locale, title, content)"
    )
    .eq("id", id)
    .single();

  if (
    !review ||
    (review.status !== "approved" && review.user_id !== user?.id)
  ) {
    notFound();
  }

  // Extract cached translation for current locale
  const reviewTranslations = review.review_translations as unknown as
    | Array<{ locale: string; title: string; content: string }>
    | null
    | undefined;
  const cachedTranslation =
    reviewTranslations?.find((t) => t.locale === locale) ?? null;

  // Fetch author profile
  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", review.user_id)
    .single();

  // Fetch comments with translation cache
  const { data: rawComments } = await supabase
    .from("review_comments")
    .select(
      "id, content, created_at, user_id, review_comment_translations(locale, content)"
    )
    .eq("review_id", id)
    .order("created_at", { ascending: true });

  // Fetch commenter profiles
  const commenterIds = [
    ...new Set((rawComments ?? []).map((c) => c.user_id)),
  ];
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

  // Build comment translations map keyed by comment ID
  const commentTranslations: Record<string, { content: string } | null> = {};
  for (const c of rawComments ?? []) {
    const cTranslations = c.review_comment_translations as unknown as
      | Array<{ locale: string; content: string }>
      | null
      | undefined;
    const cached = cTranslations?.find((t) => t.locale === locale) ?? null;
    commentTranslations[c.id] = cached ? { content: cached.content } : null;
  }

  return (
    <ReviewDetailClient
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
      cachedTranslation={
        cachedTranslation
          ? { title: cachedTranslation.title, content: cachedTranslation.content }
          : null
      }
      comments={comments}
      commentTranslations={commentTranslations}
      locale={locale}
      isLoggedIn={!!user}
    />
  );
}
