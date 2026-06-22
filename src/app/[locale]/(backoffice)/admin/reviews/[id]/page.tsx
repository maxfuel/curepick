import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  approveReview,
  rejectReview,
  deleteReview,
  toggleVerified,
  deleteComment,
} from "@/lib/actions/admin-reviews";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

export default async function AdminReviewDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.reviews");

  const { data: review } = await supabase
    .from("reviews")
    .select("*, hospitals(name)")
    .eq("id", id)
    .single();

  if (!review) notFound();

  const { data: comments } = await supabase
    .from("review_comments")
    .select("id, content, user_id, created_at")
    .eq("review_id", id)
    .order("created_at");

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/reviews`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {t("backToList")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("detailTitle")}</h1>
      </div>

      {/* Review info */}
      <dl className="rounded-lg border divide-y">
        <div className="flex px-4 py-3">
          <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">{t("fieldAuthor")}</dt>
          <dd className="text-sm">{review.user_id?.slice(0, 8)}</dd>
        </div>
        <div className="flex px-4 py-3">
          <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">{t("fieldHospital")}</dt>
          <dd className="text-sm">{review.hospitals ? getEn((review.hospitals as { name: Json }).name) : "—"}</dd>
        </div>
        <div className="flex px-4 py-3">
          <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">{t("fieldRating")}</dt>
          <dd className="text-sm">{"★".repeat(review.rating ?? 0)}</dd>
        </div>
        <div className="flex px-4 py-3">
          <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">{t("fieldStatus")}</dt>
          <dd className="text-sm">{review.status}</dd>
        </div>
        <div className="flex px-4 py-3">
          <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">{t("fieldVerified")}</dt>
          <dd className="text-sm">{review.is_verified ? "✓" : "—"}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground mb-2">{t("fieldTitle")}</dt>
          <dd className="text-sm font-medium">{review.title ?? "—"}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground mb-2">{t("fieldContent")}</dt>
          <dd className="text-sm whitespace-pre-wrap">{review.content ?? "—"}</dd>
        </div>
      </dl>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {review.status === "pending" && (
          <>
            <form action={approveReview.bind(null, id)}>
              <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                {t("approve")}
              </button>
            </form>
            <form action={rejectReview.bind(null, id)}>
              <button type="submit" className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
                {t("reject")}
              </button>
            </form>
          </>
        )}
        {review.status === "approved" && (
          <form action={rejectReview.bind(null, id)}>
            <button type="submit" className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
              {t("reject")}
            </button>
          </form>
        )}
        {review.status === "rejected" && (
          <form action={approveReview.bind(null, id)}>
            <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              {t("approve")}
            </button>
          </form>
        )}
        <form action={toggleVerified.bind(null, id, review.is_verified ?? false)}>
          <button type="submit" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
            {review.is_verified ? t("unverify") : t("verify")}
          </button>
        </form>
        <form action={deleteReview.bind(null, id)}>
          <button type="submit" className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
            {t("delete")}
          </button>
        </form>
      </div>

      {/* Comments */}
      {comments && comments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("comments")}</h2>
          <div className="rounded-lg border divide-y">
            {comments.map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{c.user_id?.slice(0, 8)} · {new Date(c.created_at!).toLocaleDateString()}</p>
                  <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                </div>
                <form action={deleteComment.bind(null, c.id)} className="shrink-0">
                  <button type="submit" className="text-destructive text-xs hover:underline">
                    {t("deleteComment")}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
