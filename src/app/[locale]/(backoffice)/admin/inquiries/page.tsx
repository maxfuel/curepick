import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Json } from "@/lib/types/database";
import InquiryFilters from "./InquiryFilters";

const SOURCE_COLORS: Record<string, string> = {
  patient:        "bg-muted text-muted-foreground border-border",
  local_agent:    "bg-orange-500/10 text-orange-700 border-orange-500/20",
  cure_partner:   "bg-purple-500/10 text-purple-700 border-purple-500/20",
  hospital_staff: "bg-green-500/10 text-green-700 border-green-500/20",
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; hospital?: string; service?: string; source?: string; page?: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

const PAGE_SIZE = 50;

export default async function AdminInquiriesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status: statusFilter, hospital: hospitalFilter, service: serviceFilter, source: sourceFilter, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const supabase = await createClient();
  const t = await getTranslations("admin.inquiries");

  let query = (supabase as any)
    .from("inquiries")
    .select("id, name, email, phone, nationality, status, created_at, hospital_id, service_id, submitter_role", { count: "exact" });

  if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter);
  if (hospitalFilter) query = query.eq("hospital_id", hospitalFilter);
  if (serviceFilter) query = query.eq("service_id", serviceFilter);
  if (sourceFilter) query = query.eq("submitter_role", sourceFilter);

  const { data: inquiries, count } = await query
    .order("created_at", { ascending: false })
    .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

  const [{ data: hospitals }, { data: services }, { data: categories }] = await Promise.all([
    supabase.from("hospitals").select("id, name").order("name->en"),
    supabase.from("services").select("id, name, category_id").order("sort_order"),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);

  const hospitalMap = new Map(hospitals?.map((h) => [h.id, getEn(h.name)]) ?? []);
  const serviceMap = new Map(services?.map((s) => [s.id, getEn(s.name)]) ?? []);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const sourceOptions = [
    { value: "patient",        label: t("sourcePatient") },
    { value: "local_agent",    label: t("sourceLocalAgent") },
    { value: "cure_partner",   label: t("sourceCurePartner") },
    { value: "hospital_staff", label: t("sourceHospitalStaff") },
  ];

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = {
      status: statusFilter,
      hospital: hospitalFilter,
      service: serviceFilter,
      source: sourceFilter,
      page: String(currentPage),
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "all") sp.set(k, v); });
    const qs = sp.toString();
    return `/${locale}/admin/inquiries${qs ? `?${qs}` : ""}`;
  };

  const statuses = ["all", "new", "contacted", "closed"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Status tabs */}
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
              {t(s as "all" | "new" | "contacted" | "closed")}
            </Link>
          ))}
        </div>

        <InquiryFilters
          hospitals={hospitals?.map((h) => ({ id: h.id, name: getEn(h.name) })) ?? []}
          services={services?.map((s) => ({ id: s.id, name: getEn(s.name), category_id: s.category_id ?? undefined })) ?? []}
          categories={categories?.map((c) => ({ id: c.id, label: getEn(c.name) })) ?? []}
          currentHospital={hospitalFilter ?? ""}
          currentService={serviceFilter ?? ""}
          currentSource={sourceFilter ?? ""}
          labelAllHospitals={t("allHospitals")}
          labelAllServices={t("allServices")}
          labelAllSources={t("allSources")}
          sourceOptions={sourceOptions}
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colName")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colEmail")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colPhone")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colNationality")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colHospital")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colService")}</th>
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
                  <td className="px-4 py-3 text-muted-foreground">{inq.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inq.nationality ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inq.hospital_id ? hospitalMap.get(inq.hospital_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inq.service_id ? serviceMap.get(inq.service_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const role = (inq as any).submitter_role ?? "patient";
                      const colorClass = SOURCE_COLORS[role] ?? SOURCE_COLORS.patient;
                      const labelKey = role === "local_agent" ? "sourceLocalAgent"
                        : role === "cure_partner" ? "sourceCurePartner"
                        : role === "hospital_staff" ? "sourceHospitalStaff"
                        : "sourcePatient";
                      return (
                        <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
                          {t(labelKey as any)}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      inq.status === "new" ? "bg-blue-100 text-blue-700" :
                      inq.status === "contacted" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {inq.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inq.created_at!).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${locale}/admin/inquiries/${inq.id}`}
                      className="text-primary text-xs hover:underline"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                  {t("noInquiries")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          {currentPage > 1 && (
            <Link href={buildHref({ page: String(currentPage - 1) })} className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
              {t("prev")}
            </Link>
          )}
          <span className="px-3 py-1 text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={buildHref({ page: String(currentPage + 1) })} className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
              {t("next")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
