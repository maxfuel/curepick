import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createCategory, createProcedure } from "@/lib/actions/admin-services";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import { SaveForm } from "@/components/ui/SaveForm";
import { CategoriesSortableTable } from "@/components/backoffice/admin/CategoriesSortableTable";
import { ServiceGroupSortableTable } from "@/components/backoffice/admin/ServiceGroupSortableTable";
import { ProceduresSortableTable } from "@/components/backoffice/admin/ProceduresSortableTable";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

type ProcedureRow = { id: string; name: Json | null; slug: string | null; sort_order: number | null };
type ServiceRow = {
  id: string;
  name: Json | null;
  slug: string | null;
  is_featured: boolean | null;
  category_id: string | null;
  sort_order: number | null;
  procedures: ProcedureRow[];
};

export default async function AdminServicesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { tab: rawTab } = await searchParams;
  const tab =
    rawTab === "services" ? "services" : rawTab === "procedures" ? "procedures" : "categories";

  const supabase = await createClient();
  const t = await getTranslations("admin.services");

  const [{ data: categories }, { data: rawServices }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("services")
      .select("id, name, slug, is_featured, category_id, sort_order, procedures(id, name, slug, sort_order)")
      .order("sort_order"),
  ]);

  const services = (rawServices ?? []) as ServiceRow[];

  const servicesByCategory = new Map<string | null, ServiceRow[]>();
  services.forEach((s) => {
    const key = s.category_id;
    if (!servicesByCategory.has(key)) servicesByCategory.set(key, []);
    servicesByCategory.get(key)!.push(s);
  });

  const tabBase = `/${locale}/admin/services`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        {tab === "services" && (
          <Link
            href={`/${locale}/admin/services/new`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("newService")}
          </Link>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        <Link
          href={`${tabBase}?tab=categories`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "categories"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          카테고리 관리
        </Link>
        <Link
          href={`${tabBase}?tab=services`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "services"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          서비스 관리
        </Link>
        <Link
          href={`${tabBase}?tab=procedures`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "procedures"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          시술 관리
        </Link>
      </div>

      {/* ── Categories Tab ── */}
      {tab === "categories" && (
        <div className="space-y-6">
          <div className="rounded-lg border overflow-hidden">
            <CategoriesSortableTable categories={categories ?? []} locale={locale} />
          </div>
          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold mb-3">카테고리 추가</h2>
            <SaveForm action={createCategory} saveLabel={t("addCategory")} className="space-y-3" resetOnSuccess>
              <MultilingualInput name="name" label={t("categoryName")} />
              <div className="flex gap-2 items-center">
                <input
                  name="slug"
                  placeholder="slug (자동 생성)"
                  className="rounded-md border bg-background px-3 py-2 text-sm w-48"
                />
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={0}
                  min={0}
                  placeholder="순서"
                  className="rounded-md border bg-background px-3 py-2 text-sm w-20"
                />
              </div>
            </SaveForm>
          </div>
        </div>
      )}

      {/* ── Services Tab ── */}
      {tab === "services" && (
        <div className="space-y-6">
          {categories?.map((cat) => {
            const catServices = servicesByCategory.get(cat.id) ?? [];
            return (
              <div key={cat.id} className="rounded-lg border overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 font-semibold text-sm flex items-center gap-2">
                  <span className="text-muted-foreground text-xs font-normal font-mono">
                    #{cat.sort_order}
                  </span>
                  {getEn(cat.name)}
                </div>
                <ServiceGroupSortableTable
                  services={catServices}
                  locale={locale}
                  editLabel={t("edit")}
                  deleteLabel={t("delete")}
                  noServicesLabel={t("noServices")}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Procedures Tab ── */}
      {tab === "procedures" && (
        <div className="space-y-6">
          {categories?.map((cat) => {
            const catServices = servicesByCategory.get(cat.id) ?? [];
            if (catServices.length === 0) return null;
            return (
              <div key={cat.id} className="rounded-lg border overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 font-semibold text-sm">
                  {getEn(cat.name)}
                </div>
                <div className="divide-y">
                  {catServices.map((svc) => (
                    <div key={svc.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{getEn(svc.name)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({svc.procedures.length}개)
                          </span>
                        </div>
                        <Link
                          href={`/${locale}/admin/services/${svc.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          서비스 편집 →
                        </Link>
                      </div>
                      <div className="rounded-lg border overflow-hidden mb-3">
                        <ProceduresSortableTable
                          procedures={svc.procedures}
                          deleteLabel={t("delete")}
                          noProceduresLabel={t("noProcedures")}
                        />
                      </div>
                      <form
                        action={createProcedure}
                        className="space-y-2 rounded-lg border p-3 bg-muted/20"
                      >
                        <input type="hidden" name="service_id" value={svc.id} />
                        <MultilingualInput name="name" label={t("procName")} />
                        <div className="flex gap-2">
                          <input
                            name="slug"
                            placeholder="slug (자동 생성)"
                            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/70 whitespace-nowrap cursor-pointer"
                          >
                            {t("addProcedure")}
                          </button>
                        </div>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
