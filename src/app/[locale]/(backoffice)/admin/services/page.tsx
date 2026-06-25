import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createCategory, deleteCategory, deleteService } from "@/lib/actions/admin-services";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
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

function getKo(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).ko as string) || "";
  }
  return String(val);
}

export default async function AdminServicesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { tab: rawTab } = await searchParams;
  const tab = rawTab === "services" ? "services" : "categories";

  const supabase = await createClient();
  const t = await getTranslations("admin.services");

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("services").select("id, name, slug, is_featured, category_id, sort_order").order("sort_order"),
  ]);

  const servicesByCategory = new Map<string | null, typeof services>();
  services?.forEach((s) => {
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
      </div>

      {/* ── Categories Tab ── */}
      {tab === "categories" && (
        <div className="space-y-6">
          {/* Category list table */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium w-12">순서</th>
                  <th className="text-left px-4 py-2 font-medium">이름 (EN)</th>
                  <th className="text-left px-4 py-2 font-medium">이름 (KO)</th>
                  <th className="text-left px-4 py-2 font-medium">Slug</th>
                  <th className="px-4 py-2 w-28" />
                </tr>
              </thead>
              <tbody>
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="px-4 py-2 text-muted-foreground text-xs font-mono">
                        #{cat.sort_order}
                      </td>
                      <td className="px-4 py-2 font-medium">{getEn(cat.name)}</td>
                      <td className="px-4 py-2 text-muted-foreground">{getKo(cat.name)}</td>
                      <td className="px-4 py-2 text-muted-foreground font-mono text-xs">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-2 flex gap-3 justify-end">
                        <Link
                          href={`/${locale}/admin/services/categories/${cat.id}`}
                          className="text-primary text-xs hover:underline"
                        >
                          수정
                        </Link>
                        <form action={deleteCategory.bind(null, cat.id)} className="inline">
                          <button
                            type="submit"
                            className="text-destructive text-xs hover:underline"
                          >
                            삭제
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      카테고리가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Create category form */}
          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold mb-3">카테고리 추가</h2>
            <form action={createCategory} className="space-y-3">
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
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
                >
                  {t("addCategory")}
                </button>
              </div>
            </form>
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left px-4 py-2 font-medium">{t("colName")}</th>
                      <th className="text-left px-4 py-2 font-medium">{t("colSlug")}</th>
                      <th className="text-left px-4 py-2 font-medium">순서</th>
                      <th className="text-left px-4 py-2 font-medium">{t("colFeatured")}</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {catServices.length > 0 ? (
                      catServices.map((svc) => (
                        <tr key={svc.id} className="border-b last:border-0 hover:bg-muted/10">
                          <td className="px-4 py-2">{getEn(svc.name)}</td>
                          <td className="px-4 py-2 text-muted-foreground font-mono text-xs">
                            {svc.slug}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground text-xs">
                            {svc.sort_order}
                          </td>
                          <td className="px-4 py-2">{svc.is_featured ? "✓" : ""}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <Link
                              href={`/${locale}/admin/services/${svc.id}`}
                              className="text-primary text-xs hover:underline"
                            >
                              {t("edit")}
                            </Link>
                            <form action={deleteService.bind(null, svc.id)} className="inline">
                              <button
                                type="submit"
                                className="text-destructive text-xs hover:underline"
                              >
                                {t("delete")}
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-muted-foreground text-xs">
                          {t("noServices")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
