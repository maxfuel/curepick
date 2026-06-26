import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { CategoryCarousel } from "@/components/cards/CategoryCarousel";
import { HospitalCarousel } from "@/components/cards/HospitalCarousel";
import { SearchBar } from "@/components/ui/SearchBar";
import { CTAButton } from "@/components/ui/CTAButton";
import { WhatsAppButton, WeChatButton } from "@/components/ui/ContactButtons";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { readSiteSettings } from "@/lib/site-settings";

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

  const [
    { data: categories },
    { data: categoriesWithServices },
    { data: featuredServices },
    { data: featuredHospitals },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, image_url, services(count)")
      .order("sort_order"),
    supabase
      .from("categories")
      .select("id, slug, name, services(id, slug, name)")
      .order("sort_order"),
    supabase
      .from("services")
      .select("id, slug, name, description, image_url")
      .eq("is_featured", true)
      .order("sort_order")
      .limit(6),
    supabase
      .from("hospitals")
      .select("id, slug, name, city, hero_image_url, logo_url")
      .eq("is_featured", true)
      .limit(8),
  ]);

  const { hero_image_url: heroImageUrl } = await readSiteSettings();

  return (
    <div>
      {/* Hero Section */}
      <section className={`relative overflow-hidden py-20 sm:py-28 ${heroImageUrl ? "" : "bg-muted"}`}>
        {heroImageUrl && (
          <>
            <Image
              src={heroImageUrl}
              alt="Hero background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/55" />
          </>
        )}
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight whitespace-nowrap ${heroImageUrl ? "text-white" : ""}`}>
              {t("title")}
            </h1>
            <p className={`text-lg sm:text-xl ${heroImageUrl ? "text-white/80" : "text-muted-foreground"}`}>
              {t("subtitle")}
            </p>
            <div className="max-w-xl mx-auto">
              <SearchBar locale={locale} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Browse Categories */}
        {categories && categories.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6 text-center">{t("browseCategories")}</h2>
              <CategoryCarousel
                categories={(categories ?? []).map((category) => {
                  const serviceCount =
                    (category.services as unknown as { count: number }[])?.[0]
                      ?.count ?? 0;
                  return {
                    id: category.id,
                    slug: category.slug,
                    name: getLocalizedField(category.name, locale),
                    imageUrl: category.image_url,
                    servicesLabel: tCat("servicesCount", { count: serviceCount }),
                  };
                })}
              />
            </section>
          </>
        )}

        {/* Featured Hospitals Carousel */}
        {featuredHospitals && featuredHospitals.length > 0 && (
          <>
            <Separator />
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t("featuredHospitals")}</h2>
                <Link
                  href="/hospitals"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("viewAllHospitals")} &rarr;
                </Link>
              </div>
              <HospitalCarousel
                hospitals={featuredHospitals.map((h) => ({
                  id: h.id,
                  slug: h.slug,
                  name: getLocalizedField(h.name, locale),
                  city: h.city,
                  heroImageUrl: h.hero_image_url,
                  logoUrl: h.logo_url,
                }))}
              />
            </section>
          </>
        )}

        {/* Choose Specialties */}
        {categoriesWithServices && categoriesWithServices.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("chooseSpecialties")}</h2>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {categoriesWithServices.map((cat) => {
                  const catName = getLocalizedField(cat.name, locale);
                  const services = (
                    cat.services as Array<{ id: string; slug: string; name: unknown }>
                  ) ?? [];
                  return (
                    <div key={cat.id}>
                      <Link
                        href={`/categories/${cat.slug}`}
                        className="block font-bold text-sm hover:underline"
                      >
                        {catName}
                      </Link>
                      <div className="border-t my-2" />
                      <ul className="space-y-1">
                        {services.map((svc) => (
                          <li key={svc.id}>
                            <Link
                              href={`/services/${svc.slug}`}
                              className="text-sm text-muted-foreground hover:text-foreground"
                            >
                              {getLocalizedField(svc.name, locale)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
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

        {/* CTA Section */}
        <Separator />
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("ctaTitle")}</h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            {t("ctaSubtitle")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <CTAButton variant="large" />
            <WhatsAppButton />
            <WeChatButton />
          </div>
        </section>
      </div>
    </div>
  );
}
