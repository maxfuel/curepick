import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { CategoriesMegaMenu } from "@/components/categories/CategoriesMegaMenu";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categories" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: "categories" });

  const [{ data: intentsRaw }, { data: categoriesRaw }] = await Promise.all([
    supabase.from("intents").select("id, name, sort_order").order("sort_order"),
    (supabase.from("categories") as any)
      .select(`
        id, slug, name, intent_id,
        services(
          id, slug, name, sort_order,
          procedures(id, slug, name, sort_order)
        )
      `)
      .order("sort_order"),
  ]);

  const intents = (intentsRaw ?? []).map((i: any) => ({
    id: i.id,
    name: getLocalizedField(i.name, locale),
  }));

  const categories = (categoriesRaw ?? []).map((cat: any) => ({
    id: cat.id,
    slug: cat.slug,
    name: getLocalizedField(cat.name, locale),
    intentId: cat.intent_id ?? null,
    services: ((cat.services ?? []) as any[])
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((svc: any) => ({
        id: svc.id,
        slug: svc.slug,
        name: getLocalizedField(svc.name, locale),
        procedures: ((svc.procedures ?? []) as any[])
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((proc: any) => ({
            id: proc.id,
            slug: proc.slug,
            name: getLocalizedField(proc.name, locale),
          })),
      })),
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <CategoriesMegaMenu
        categories={categories}
        intents={intents}
        viewAllLabel={t("viewAll")}
      />
    </div>
  );
}
