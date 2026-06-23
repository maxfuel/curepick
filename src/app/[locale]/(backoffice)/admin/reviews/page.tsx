import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { approveReview, rejectReview } from "@/lib/actions/admin-reviews";
import type { Json } from "@/lib/types/database";
import ReviewFilters from "./ReviewFilters";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; hospital?: string; rating?: string; page?: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

const PAGE_SIZE = 50;

export default async function AdminReviewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status: statusFilter, hospital: hospitalFilter, rating: ratingFilter, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const supabase = await createClient();
  const t = await getTranslations("admin.reviews");

  let query = supabase
    .from("reviews")
    .select("id, title, user_id, hospital_id, rating, status, is_verified, created_at", { count: "exact" });

  if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter);
  if (hospitalFilter) query = query.eq("hospital_id", hospitalFilter);
  if (ratingFilter) query = query.eq("rating", Number(ratingFilter));

  const { data: reviews, count } = await query
    .order("created_at", { ascending: false })
    .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

  const { data: hospitals } = await supabase.from("hospitals").select("id, name").order("name->en");
  const hospitalMap = new Map(hospitals?.map((h) => [h.id, getEn(h.name)]) ?? []);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { status: statusFilter, hospital: hospitalFilter, rating: ratingFilter, page: String(currentPage), ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "all") sp.set(k, v); });
    const qs = sp.toString();
    return `/${locale}/admin/reviews${qs ? `?${qs}` : ""}`;
  };

  const statuses = ["all", "pending", "approved", "rejected"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex gap-1">
          {statuses.map((s) => (
            <Link
              key={s}
              href={buildHref({ status: s, page: "1" })}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                (statusFilter ?? "all") === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {t(s as "all" | "pending" | "approved" | "rejected")}
            </Link>
          ))}
        </div>
        <ReviewFilters
          hospitals={hospitals?.map((h) => ({ id: h.id, name: getEn(h.name) })) ?? []}
          currentHospital={hospitalFilter ?? ""}
          currentRating={ratingFilter ?? ""}
          labelAllHospitals={t("allHospitals")}
          labelAllRatings={t("allRatings")}
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colTitle")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colAuthor")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colHospital")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colRating")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colStatus")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colDate")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {reviews && reviews.length > 0 ? reviews.map((rev) => (
              <tr key={rev.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium max-w-xs truncate">{rev.title ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{rev.user_id?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-muted-foreground">{rev.hospital_id ? hospitalMap.get(rev.hospital_id) ?? "—" : "—"}</td>
                <td className="px-4 py-3">{"★".repeat(rev.rating ?? 0)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    rev.status === "approved" ? "bg-green-100 text-green-700" :
                    rev.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{rev.status}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(rev.created_at!).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/${locale}/admin/reviews/${rev.id}`} className="text-primary text-xs hover:underline">{t("view")}</Link>
                  {rev.status === "pending" && (
                    <>
                      <form action={approveReview.bind(null, rev.id)} className="inline">
                        <button type="submit" className="text-green-600 text-xs hover:underline">{t("approve")}</button>
                      </form>
                      <form action={rejectReview.bind(null, rev.id)} className="inline">
                        <button type="submit" className="text-destructive text-xs hover:underline">{t("reject")}</button>
                      </form>
                    </>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t("noReviews")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          {currentPage > 1 && <Link href={buildHref({ page: String(currentPage - 1) })} className="rounded-md border px-3 py-1 text-sm hover:bg-muted">{t("prev")}</Link>}
          <span className="px-3 py-1 text-sm text-muted-foreground">{currentPage} / {totalPages}</span>
          {currentPage < totalPages && <Link href={buildHref({ page: String(currentPage + 1) })} className="rounded-md border px-3 py-1 text-sm hover:bg-muted">{t("next")}</Link>}
        </div>
      )}
    </div>
  );
}
