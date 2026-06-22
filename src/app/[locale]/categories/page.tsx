import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { CategoryCard } from "@/components/cards/CategoryCard";
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

  const [{ data: intents }, { data: categories }] = await Promise.all([
    supabase
      .from("intents")
      .select("id, name, slug, sort_order")
      .order("sort_order"),
    supabase
      .from("categories")
      .select("id, slug, name, image_url, intent_id, services(count)")
      .order("sort_order"),
  ]);

  const intentMap = new Map<
    string,
    {
      name: string;
      categories: NonNullable<typeof categories>;
    }
  >();

  for (const intent of intents ?? []) {
    intentMap.set(intent.id, {
      name: getLocalizedField(intent.name, locale),
      categories: [],
    });
  }

  for (const category of categories ?? []) {
    if (category.intent_id && intentMap.has(category.intent_id)) {
      intentMap.get(category.intent_id)!.categories.push(category);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-12">
        {Array.from(intentMap.entries()).map(([intentId, intent]) => {
          if (intent.categories.length === 0) return null;
          return (
            <section key={intentId}>
              <h2 className="text-2xl font-bold mb-6">{intent.name}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {intent.categories.map((category) => {
                  const serviceCount =
                    (category.services as unknown as { count: number }[])?.[0]
                      ?.count ?? 0;
                  return (
                    <CategoryCard
                      key={category.id}
                      slug={category.slug}
                      name={getLocalizedField(category.name, locale)}
                      imageUrl={category.image_url}
                      servicesLabel={t("servicesCount", {
                        count: serviceCount,
                      })}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
