import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { locales } from "@/config/i18n";
import { HospitalCard } from "@/components/cards/HospitalCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const category of categories ?? []) {
      params.push({ locale, slug: category.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!category) return {};

  return {
    title: getLocalizedField(category.name, locale),
    description: getLocalizedField(category.description, locale),
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: "categories" });
  const tServices = await getTranslations({ locale, namespace: "services" });

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("id, slug, name, description, image_url")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  // Fetch services for this category
  const { data: services } = await supabase
    .from("services")
    .select("id, slug, name, description, image_url")
    .eq("category_id", category.id)
    .order("sort_order");

  // Fetch procedures for services in this category
  const serviceIds = (services ?? []).map((s) => s.id);
  const { data: procedures } = serviceIds.length
    ? await supabase
        .from("procedures")
        .select("id, name, slug, service_id")
        .in("service_id", serviceIds)
        .order("sort_order")
    : { data: [] };

  // Fetch featured hospitals via hospital_procedures
  const procedureIds = (procedures ?? []).map((p) => p.id);
  let featuredHospitals: Array<{
    hospital: {
      slug: string;
      name: unknown;
      city: string | null;
      logo_url: string | null;
      languages: string[] | null;
    };
    cost_min: number | null;
    cost_max: number | null;
    cost_currency: string | null;
    annual_volume: number | null;
    specialist_count: number | null;
    waiting_time_days: number | null;
    evidence_score: number | null;
    languages: string[] | null;
  }> = [];

  if (procedureIds.length > 0) {
    const { data: hp } = await supabase
      .from("hospital_procedures")
      .select(
        "hospital_id, cost_min, cost_max, cost_currency, annual_volume, specialist_count, waiting_time_days, evidence_score, languages, hospitals(slug, name, city, logo_url, languages)"
      )
      .in("procedure_id", procedureIds)
      .eq("is_featured", true)
      .limit(6);

    // Deduplicate by hospital_id
    const seen = new Set<string>();
    for (const item of hp ?? []) {
      if (item.hospital_id && !seen.has(item.hospital_id)) {
        seen.add(item.hospital_id);
        const hospital = item.hospitals as unknown as {
          slug: string;
          name: unknown;
          city: string | null;
          logo_url: string | null;
          languages: string[] | null;
        };
        if (hospital) {
          featuredHospitals.push({
            hospital,
            cost_min: item.cost_min,
            cost_max: item.cost_max,
            cost_currency: item.cost_currency,
            annual_volume: item.annual_volume,
            specialist_count: item.specialist_count,
            waiting_time_days: item.waiting_time_days,
            evidence_score: item.evidence_score,
            languages: item.languages,
          });
        }
      }
    }
  }

  const categoryName = getLocalizedField(category.name, locale);
  const categoryDescription = getLocalizedField(category.description, locale);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-muted py-16">
        {category.image_url && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={category.image_url}
              alt={categoryName}
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {categoryName}
          </h1>
          {categoryDescription && (
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {categoryDescription}
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Services Grid */}
        {services && services.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {tServices("procedures")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="block rounded-xl border p-6 transition-colors hover:bg-muted/50"
                >
                  <h3 className="font-semibold">
                    {getLocalizedField(service.name, locale)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {getLocalizedField(service.description, locale)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Popular Procedures */}
        {procedures && procedures.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t("popularProcedures")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {procedures.map((procedure) => (
                  <Badge key={procedure.id} variant="secondary">
                    {getLocalizedField(procedure.name, locale)}
                  </Badge>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Featured Providers */}
        {featuredHospitals.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t("featuredProviders")}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredHospitals.map((item, index) => (
                  <HospitalCard
                    key={index}
                    slug={item.hospital.slug}
                    name={getLocalizedField(item.hospital.name, locale)}
                    city={item.hospital.city}
                    logoUrl={item.hospital.logo_url}
                    costMin={item.cost_min}
                    costMax={item.cost_max}
                    costCurrency={item.cost_currency}
                    annualVolume={item.annual_volume}
                    specialistCount={item.specialist_count}
                    waitingTimeDays={item.waiting_time_days}
                    evidenceScore={item.evidence_score}
                    languages={item.languages ?? item.hospital.languages}
                    translations={{
                      viewHospital: tServices("viewHospital"),
                      annualVolume: tServices("annualVolume", {
                        count: item.annual_volume ?? 0,
                      }),
                      specialists: tServices("specialists", {
                        count: item.specialist_count ?? 0,
                      }),
                      waitingDays: tServices("waitingDays", {
                        days: item.waiting_time_days ?? 0,
                      }),
                      evidenceScore: tServices("evidenceScore"),
                    }}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
