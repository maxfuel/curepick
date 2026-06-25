import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createCategory, deleteCategory, deleteService } from "@/lib/actions/admin-services";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

export default async function AdminServicesPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.services");

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("services").select("id, name, slug, is_featured, category_id").order("sort_order"),
  ]);

  const servicesByCategory = new Map<string | null, typeof services>();
  services?.forEach((s) => {
    const key = s.category_id;
    if (!servicesByCategory.has(key)) servicesByCategory.set(key, []);
    servicesByCategory.get(key)!.push(s);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Link
          href={`/${locale}/admin/services/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("newService")}
        </Link>
      </div>

      {/* Category management */}
      <div className="mb-8 rounded-lg border p-4">
        <h2 className="text-sm font-semibold mb-3">{t("categories")}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
              <span className="text-muted-foreground text-xs mr-1">#{cat.sort_order}</span>
              <span>{getEn(cat.name)}</span>
              <form action={deleteCategory.bind(null, cat.id)}>
                <button type="submit" className="ml-1 text-muted-foreground hover:text-destructive text-xs">
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
        <form action={createCategory} className="flex gap-2 items-end">
          <div className="flex-1">
            <MultilingualInput name="name" label={t("categoryName")} />
          </div>
          <div className="pb-1">
            <input
              name="slug"
              placeholder="slug (auto)"
              className="rounded-md border bg-background px-3 py-2 text-sm w-32"
            />
          </div>
          <div className="pb-1">
            <input
              type="number"
              name="sort_order"
              defaultValue={0}
              min={0}
              placeholder="순서"
              className="rounded-md border bg-background px-3 py-2 text-sm w-20"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/70 whitespace-nowrap"
          >
            {t("addCategory")}
          </button>
        </form>
      </div>

      {/* Services by category */}
      <div className="space-y-6">
        {categories?.map((cat) => {
          const catServices = servicesByCategory.get(cat.id) ?? [];
          return (
            <div key={cat.id} className="rounded-lg border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 font-semibold text-sm">
                {getEn(cat.name)}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left px-4 py-2 font-medium">{t("colName")}</th>
                    <th className="text-left px-4 py-2 font-medium">{t("colSlug")}</th>
                    <th className="text-left px-4 py-2 font-medium">{t("colFeatured")}</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {catServices.length > 0 ? (
                    catServices.map((svc) => (
                      <tr key={svc.id} className="border-b last:border-0 hover:bg-muted/10">
                        <td className="px-4 py-2">{getEn(svc.name)}</td>
                        <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{svc.slug}</td>
                        <td className="px-4 py-2">{svc.is_featured ? "✓" : ""}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <Link
                            href={`/${locale}/admin/services/${svc.id}`}
                            className="text-primary text-xs hover:underline"
                          >
                            {t("edit")}
                          </Link>
                          <form action={deleteService.bind(null, svc.id)} className="inline">
                            <button type="submit" className="text-destructive text-xs hover:underline">
                              {t("delete")}
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-muted-foreground text-xs">{t("noServices")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
