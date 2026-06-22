import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { OfficialReplyForm } from "./OfficialReplyForm";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ReviewDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("hospital.reviews");

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .eq("hospital_id", profile!.hospital_id!)
    .single();

  if (!review) notFound();

  const { data: comments } = await supabase
    .from("review_comments")
    .select("id, content, created_at, user_id")
    .eq("review_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}/hospital/reviews`} className="hover:underline">
          {t("title")}
        </Link>
        <span>/</span>
        <span className="truncate max-w-xs">{review.title}</span>
      </div>

      <div className="rounded-lg border p-4 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-semibold">{review.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {review.user_id.slice(0, 8)} · {new Date(review.created_at!).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{review.rating}/5</span>
            {review.is_verified && (
              <Badge variant="secondary">{t("verified")}</Badge>
            )}
          </div>
        </div>
        <p className="text-sm leading-relaxed">{review.content}</p>
      </div>

      {comments && comments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">{t("comments")}</h3>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border p-3 bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {comment.user_id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at!).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <OfficialReplyForm reviewId={review.id} />
    </div>
  );
}
