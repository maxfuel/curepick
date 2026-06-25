import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

function StatCard({
  label,
  value,
  href,
  highlight,
  arrow,
}: {
  label: string;
  value: number;
  href?: string;
  highlight?: boolean;
  arrow?: boolean;
}) {
  const inner = (
    <div
      className={`rounded-lg border bg-card p-4 transition-colors ${
        href ? "hover:bg-muted/50 cursor-pointer" : ""
      } ${highlight ? "border-primary/40 bg-primary/5" : ""}`}
    >
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {label}
        {arrow && <ArrowRight className="w-3 h-3" />}
      </p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? "text-primary" : ""}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalInquiries },
    { count: newInquiries },
    { count: casesPre },
    { count: casesDuring },
    { count: casesPost },
    { count: totalPatients },
    { count: totalAgents },
    { count: totalCurePartners },
    { count: completedCases },
    { count: totalReviews },
    { count: newReviews },
  ] = await Promise.all([
    supabase.from("inquiries").select("id", { count: "exact", head: true }),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("cases").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("cases").select("id", { count: "exact", head: true }).in("status", ["arrived", "in_treatment"]),
    supabase.from("cases").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "patient"),
    supabase.from("agents").select("id", { count: "exact", head: true }),
    supabase.from("cure_partners").select("id", { count: "exact", head: true }),
    supabase.from("cases").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
  ]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">대시보드</h1>

      {/* ── 실시간 보드 ── */}
      <section className="rounded-xl border bg-muted/20 p-5 space-y-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          실시간 보드
        </h2>

        {/* 문의 */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">문의</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="신규문의"
              value={newInquiries ?? 0}
              href={`/${locale}/admin/inquiries?status=new`}
              highlight={(newInquiries ?? 0) > 0}
            />
            <StatCard
              label="전체문의"
              value={totalInquiries ?? 0}
              href={`/${locale}/admin/inquiries`}
            />
          </div>
        </div>

        {/* 고객진행 확정 */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">고객진행 확정</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              label="출국전"
              value={casesPre ?? 0}
              href={`/${locale}/admin/cases?status=confirmed`}
            />
            <StatCard
              label="체류중"
              value={casesDuring ?? 0}
              href={`/${locale}/admin/cases?status=in_treatment`}
              highlight={(casesDuring ?? 0) > 0}
            />
            <StatCard
              label="출국후"
              value={casesPost ?? 0}
              href={`/${locale}/admin/cases?status=completed`}
            />
          </div>
        </div>
      </section>

      {/* ── 당사 비지니스 현황 ── */}
      <section className="rounded-xl border bg-muted/20 p-5 space-y-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          당사 비지니스 현황
        </h2>

        {/* 현황 */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">현황</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="회원수" value={totalPatients ?? 0} />
            <StatCard
              label="로컬에이전트"
              value={totalAgents ?? 0}
              href={`/${locale}/admin/agents`}
            />
            <StatCard
              label="큐어파트너"
              value={totalCurePartners ?? 0}
              href={`/${locale}/admin/cure-partners`}
            />
            <StatCard
              label="서비스 완료건"
              value={completedCases ?? 0}
              href={`/${locale}/admin/cases?status=completed`}
            />
          </div>
        </div>

        {/* 리뷰 */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">리뷰</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="전체 리뷰"
              value={totalReviews ?? 0}
              href={`/${locale}/admin/reviews`}
            />
            <StatCard
              label="신규 리뷰 (30일)"
              value={newReviews ?? 0}
              href={`/${locale}/admin/reviews`}
              arrow
              highlight={(newReviews ?? 0) > 0}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
