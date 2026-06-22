import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/reviews/ReviewForm";

interface WriteReviewPageProps {
  params: Promise<{ locale: string }>;
}

export default async function WriteReviewPage({
  params,
}: WriteReviewPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createClient();

  const { data: hospitals } = await supabase
    .from("hospitals")
    .select("id, name")
    .order("name");

  const { data: procedures } = await supabase
    .from("procedures")
    .select("id, name, service_id")
    .order("sort_order");

  return (
    <WriteReviewContent
      hospitals={hospitals ?? []}
      procedures={procedures ?? []}
      locale={locale}
    />
  );
}

function WriteReviewContent({
  hospitals,
  procedures,
  locale,
}: {
  hospitals: { id: string; name: unknown }[];
  procedures: { id: string; name: unknown; service_id: string | null }[];
  locale: string;
}) {
  const t = useTranslations("reviews");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{t("writeTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("writeSubtitle")}</p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <ReviewForm
          hospitals={hospitals}
          procedures={procedures}
          locale={locale}
        />
      </div>
    </div>
  );
}
