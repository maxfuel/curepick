import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewFilters } from "@/components/reviews/ReviewFilters";
import { Suspense } from "react";

interface ReviewsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    rating?: string;
    hospital?: string;
    category?: string;
  }>;
}

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

export default async function ReviewsPage({
  params,
  searchParams,
}: ReviewsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const supabase = await createClient();

  // Fetch filter options
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  const { data: hospitals } = await supabase
    .from("hospitals")
    .select("id, name")
    .order("name");

  // Resolve category → procedure IDs for filtering
  let categoryProcedureIds: string[] | null = null;
  if (sp.category) {
    const { data: matchedCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", sp.category)
      .single();

    if (matchedCategory) {
      const { data: services } = await supabase
        .from("services")
        .select("id")
        .eq("category_id", matchedCategory.id);

      const serviceIds = (services ?? []).map((s) => s.id);

      if (serviceIds.length > 0) {
        const { data: procedures } = await supabase
          .from("procedures")
          .select("id")
          .in("service_id", serviceIds);
        categoryProcedureIds = (procedures ?? []).map((p) => p.id);
      } else {
        categoryProcedureIds = [];
      }
    }
  }

  let query = supabase
    .from("reviews")
    .select("*, hospitals(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (sp.rating) {
    query = query.eq("rating", parseInt(sp.rating));
  }
  if (sp.hospital) {
    query = query.eq("hospital_id", sp.hospital);
  }
  if (categoryProcedureIds !== null) {
    if (categoryProcedureIds.length === 0) {
      // No procedures in category → no results
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("procedure_id", categoryProcedureIds);
    }
  }

  const { data: reviews } = await query;

  // Fetch author profiles
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds)
      : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name])
  );

  const reviewsWithAuthors = (reviews ?? []).map((r) => ({
    ...r,
    authorName: profileMap.get(r.user_id) ?? null,
  }));

  return (
    <ReviewsPageContent
      reviews={reviewsWithAuthors}
      categories={categories ?? []}
      hospitals={hospitals ?? []}
      locale={locale}
      selectedRating={sp.rating}
      selectedHospital={sp.hospital}
      selectedCategory={sp.category}
    />
  );
}

function ReviewsPageContent({
  reviews,
  categories,
  hospitals,
  locale,
  selectedRating,
  selectedHospital,
  selectedCategory,
}: {
  reviews: {
    id: string;
    title: string;
    content: string;
    rating: number;
    media: unknown;
    is_verified: boolean | null;
    created_at: string | null;
    hospitals: { name: unknown } | null;
    authorName: string | null;
  }[];
  categories: { id: string; name: unknown; slug: string }[];
  hospitals: { id: string; name: unknown }[];
  locale: string;
  selectedRating?: string;
  selectedHospital?: string;
  selectedCategory?: string;
}) {
  const t = useTranslations("reviews");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button render={<Link href="/reviews/write" />}>
          {t("writeReview")}
        </Button>
      </div>

      <Suspense>
        <ReviewFilters
          categories={categories}
          hospitals={hospitals}
          locale={locale}
          selectedRating={selectedRating}
          selectedHospital={selectedHospital}
          selectedCategory={selectedCategory}
        />
      </Suspense>

      {reviews.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {t("noReviews")}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
