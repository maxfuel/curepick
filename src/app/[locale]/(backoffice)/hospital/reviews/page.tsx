import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HospitalReviewsPage({ params }: Props) {
  const { locale } = await params;
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("hospital.reviews");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, title, rating, status, is_verified, created_at, user_id")
    .eq("hospital_id", profile!.hospital_id!)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const total = reviews?.length ?? 0;
  const verified = reviews?.filter((r) => r.is_verified).length ?? 0;
  const avgRating =
    total > 0
      ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : "—";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("avgRating")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgRating}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("totalReviews")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("verifiedReviews")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{verified}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colTitle")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colAuthor")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colRating")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colDate")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{review.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {review.user_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{review.rating}</span>
                    <span className="text-muted-foreground">/5</span>
                    {review.is_verified && (
                      <Badge variant="secondary" className="ml-2">
                        {t("verified")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(review.created_at!).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${locale}/hospital/reviews/${review.id}`}
                      className="text-primary text-xs hover:underline"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t("noReviews")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
