import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { CTAButton } from "@/components/ui/CTAButton";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return buildMetadata({
    title: "Curepick — Find the Right Care in Korea",
    description: t("subtitle"),
    locale,
    path: "",
    isHome: true,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: "home" });
  const tCat = await getTranslations({ locale, namespace: "categories" });

  // Fetch intents, categories, featured services, and featured hospitals in parallel
  const [
    { data: intents },
    { data: categories },
    { data: featuredServices },
    { data: featuredHospitals },
  ] = await Promise.all([
    supabase
      .from("intents")
      .select("id, name, slug, sort_order")
      .order("sort_order"),
    supabase
      .from("categories")
      .select("id, slug, name, image_url, services(count)")
      .order("sort_order")
      .limit(8),
    supabase
      .from("services")
      .select("id, slug, name, description, image_url")
      .eq("is_featured", true)
      .order("sort_order")
      .limit(6),
    supabase
      .from("hospitals")
      .select("id, slug, name, city, logo_url, languages")
      .eq("is_featured", true)
      .limit(6),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-muted py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              {t("subtitle")}
            </p>
            <div className="max-w-xl mx-auto">
              <SearchBar locale={locale} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Intent Section */}
        {intents && intents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-center mb-8">
              {t("intentSection")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {intents.map((intent) => (
                <Link
                  key={intent.id}
                  href={`/categories`}
                  className="flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-colors hover:bg-muted/50"
                >
                  <span className="text-3xl">
                    {intentEmoji(intent.slug)}
                  </span>
                  <span className="font-semibold text-sm">
                    {getLocalizedField(intent.name, locale)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Category Grid */}
        {categories && categories.length > 0 && (
          <>
            <Separator />
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t("browseCategories")}</h2>
                <Link
                  href="/categories"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("viewAllCategories")} &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => {
                  const serviceCount =
                    (category.services as unknown as { count: number }[])?.[0]
                      ?.count ?? 0;
                  return (
                    <CategoryCard
                      key={category.id}
                      slug={category.slug}
                      name={getLocalizedField(category.name, locale)}
                      imageUrl={category.image_url}
                      servicesLabel={tCat("servicesCount", {
                        count: serviceCount,
                      })}
                    />
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Featured Services */}
        {featuredServices && featuredServices.length > 0 && (
          <>
            <Separator />
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {t("featuredServices")}
                </h2>
                <Link
                  href="/categories"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("viewAllServices")} &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredServices.map((service) => {
                  const name = getLocalizedField(service.name, locale);
                  const desc = getLocalizedField(service.description, locale);
                  return (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="group block rounded-xl border overflow-hidden transition-shadow hover:shadow-md"
                    >
                      {service.image_url && (
                        <div className="relative aspect-[16/9] w-full overflow-hidden">
                          <Image
                            src={service.image_url}
                            alt={name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-semibold">{name}</h3>
                        {desc && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {desc}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Featured Hospitals */}
        {featuredHospitals && featuredHospitals.length > 0 && (
          <>
            <Separator />
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {t("featuredHospitals")}
                </h2>
                <Link
                  href="/categories"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("viewAllHospitals")} &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredHospitals.map((hospital) => {
                  const name = getLocalizedField(hospital.name, locale);
                  return (
                    <Link
                      key={hospital.id}
                      href={`/hospitals/${hospital.slug}`}
                      className="flex items-start gap-4 rounded-xl border p-6 transition-colors hover:bg-muted/50"
                    >
                      {hospital.logo_url && (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={hospital.logo_url}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold">{name}</h3>
                        {hospital.city && (
                          <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {hospital.city}
                          </p>
                        )}
                        {hospital.languages &&
                          hospital.languages.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {hospital.languages.map((lang) => (
                                <Badge
                                  key={lang}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* CTA Section */}
        <Separator />
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("ctaTitle")}</h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            {t("ctaSubtitle")}
          </p>
          <div className="mt-6">
            <CTAButton variant="large" />
          </div>
        </section>
      </div>
    </div>
  );
}

function intentEmoji(slug: string): string {
  const map: Record<string, string> = {
    treat: "\u{1F3E5}",
    improve: "\u{2728}",
    "look-better": "\u{1F48E}",
    "live-longer": "\u{1F331}",
  };
  return map[slug] || "\u{2695}";
}
