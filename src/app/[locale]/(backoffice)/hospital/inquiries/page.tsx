import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const SOURCE_COLORS: Record<string, string> = {
  patient:        "bg-muted text-muted-foreground border-border",
  local_agent:    "bg-orange-500/10 text-orange-700 border-orange-500/20",
  cure_partner:   "bg-purple-500/10 text-purple-700 border-purple-500/20",
  hospital_staff: "bg-green-500/10 text-green-700 border-green-500/20",
};

const SOURCE_LABELS: Record<string, string> = {
  patient: "고객",
  local_agent: "로컬파트너",
  cure_partner: "큐어파트너",
  hospital_staff: "병원스테프",
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}

function statusVariant(status: string | null) {
  if (status === "new") return "default";
  if (status === "contacted") return "secondary";
  return "outline";
}

export default async function HospitalInquiriesPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { status: filterStatus, page: pageParam } = await searchParams;
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("hospital.inquiries");

  const page = parseInt(pageParam ?? "1", 10);
  const pageSize = 50;
  const from = (page - 1) * pageSize;

  let query = (supabase as any)
    .from("inquiries")
    .select("id, name, email, status, created_at, submitter_role", { count: "exact" })
    .eq("hospital_id", profile!.hospital_id!)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (filterStatus) {
    query = query.eq("status", filterStatus);
  }

  const { data: inquiries, count } = await query;

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  const statuses = ["new", "contacted", "closed"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      <div className="flex gap-2 mb-4">
        <Link
          href={`/${locale}/hospital/inquiries`}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !filterStatus
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          {t("all")}
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/${locale}/hospital/inquiries?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filterStatus === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {t(s)}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colName")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colEmail")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colSource")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colStatus")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colDate")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {inquiries && inquiries.length > 0 ? (
              inquiries.map((inq: any) => (
                <tr key={inq.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{inq.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inq.email}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const role = (inq as any).submitter_role ?? "patient";
                      return (
                        <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${SOURCE_COLORS[role] ?? SOURCE_COLORS.patient}`}>
                          {SOURCE_LABELS[role] ?? "고객"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(inq.status)}>
                      {inq.status ?? "new"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inq.created_at!).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${locale}/hospital/inquiries/${inq.id}`}
                      className="text-primary text-xs hover:underline"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {t("noInquiries")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/${locale}/hospital/inquiries?page=${p}${filterStatus ? `&status=${filterStatus}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
