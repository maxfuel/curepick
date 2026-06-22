import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { EditReviewForm } from "@/components/reviews/EditReviewForm";

interface EditReviewPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createClient();
  const { data: review } = await supabase
    .from("reviews")
    .select("id, rating, title, content, user_id")
    .eq("id", id)
    .single();

  if (!review || review.user_id !== user.id) {
    notFound();
  }

  return <EditReviewPageContent review={review} locale={locale} />;
}

function EditReviewPageContent({
  review,
  locale,
}: {
  review: { id: string; rating: number; title: string; content: string };
  locale: string;
}) {
  const t = useTranslations("reviews");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{t("editTitle")}</h1>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <EditReviewForm
          reviewId={review.id}
          initialRating={review.rating}
          initialTitle={review.title}
          initialContent={review.content}
          locale={locale}
        />
      </div>
    </div>
  );
}
