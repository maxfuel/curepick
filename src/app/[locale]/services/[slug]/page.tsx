import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { locales } from "@/config/i18n";
import { HospitalCard } from "@/components/cards/HospitalCard";
import { FAQSection } from "@/components/ui/FAQSection";
import { CTAButton } from "@/components/ui/CTAButton";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
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
  const { data: services } = await supabase.from("services").select("slug");

  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const service of services ?? []) {
      params.push({ locale, slug: service.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!service) return {};

  return {
    title: getLocalizedField(service.name, locale),
    description: getLocalizedField(service.description, locale),
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: "services" });

  // Fetch service
  const { data: service } = await supabase
    .from("services")
    .select("id, slug, name, description, overview, image_url")
    .eq("slug", slug)
    .single();

  if (!service) notFound();

  // Fetch procedures, hospital_procedures, and FAQs in parallel
  const [
    { data: procedures },
    { data: faqs },
  ] = await Promise.all([
    supabase
      .from("procedures")
      .select("id, slug, name, description")
      .eq("service_id", service.id)
      .order("sort_order"),
    supabase
      .from("faqs")
      .select("question, answer, sort_order")
      .eq("service_id", service.id)
      .order("sort_order"),
  ]);

  // Fetch hospitals via hospital_procedures for procedures in this service
  const procedureIds = (procedures ?? []).map((p) => p.id);
  let hospitalEntries: Array<{
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
      .limit(9);

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
          hospitalEntries.push({
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

  const serviceName = getLocalizedField(service.name, locale);
  const serviceDescription = getLocalizedField(service.description, locale);
  const serviceOverview = getLocalizedField(service.overview, locale);

  const faqItems = (faqs ?? []).map((faq) => ({
    question: getLocalizedField(faq.question, locale),
    answer: getLocalizedField(faq.answer, locale),
  }));

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-muted py-16">
        {service.image_url && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={service.image_url}
              alt={serviceName}
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {serviceName}
          </h1>
          {serviceDescription && (
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {serviceDescription}
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Overview */}
        {serviceOverview && (
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("overview")}</h2>
            <div className="prose max-w-none text-muted-foreground whitespace-pre-line">
              {serviceOverview}
            </div>
          </section>
        )}

        {/* Procedures */}
        {procedures && procedures.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("procedures")}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {procedures.map((procedure) => (
                  <div
                    key={procedure.id}
                    className="rounded-xl border p-6"
                  >
                    <h3 className="font-semibold">
                      {getLocalizedField(procedure.name, locale)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getLocalizedField(procedure.description, locale)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Recommended Hospitals */}
        {hospitalEntries.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("hospitals")}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hospitalEntries.map((item, index) => (
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
                      viewHospital: t("viewHospital"),
                      annualVolume: t("annualVolume", {
                        count: item.annual_volume ?? 0,
                      }),
                      specialists: t("specialists", {
                        count: item.specialist_count ?? 0,
                      }),
                      waitingDays: t("waitingDays", {
                        days: item.waiting_time_days ?? 0,
                      }),
                      evidenceScore: t("evidenceScore"),
                    }}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* FAQ */}
        {faqItems.length > 0 && (
          <>
            <Separator />
            <FAQSection faqs={faqItems} title={t("faq")} />
          </>
        )}

        {/* Related Reviews */}
        <Separator />
        <section>
          <ServiceReviews
            procedureIds={procedureIds}
            locale={locale}
          />
        </section>

        {/* CTA */}
        <Separator />
        <section className="text-center py-8">
          <CTAButton serviceId={service.id} variant="large" />
        </section>
      </div>
    </div>
  );
}

async function ServiceReviews({
  procedureIds,
  locale,
}: {
  procedureIds: string[];
  locale: string;
}) {
  if (procedureIds.length === 0) return null;

  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: "reviews" });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, hospitals(name)")
    .in("procedure_id", procedureIds)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!reviews || reviews.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("serviceReviews")}</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Link
            key={review.id}
            href={`/reviews/${review.id}`}
            className="block rounded-xl border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              {review.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  {t("verified")}
                </Badge>
              )}
            </div>
            <h3 className="font-medium">{review.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {review.content}
            </p>
            {review.hospitals && (
              <p className="mt-1 text-xs text-muted-foreground">
                {getLocalizedField(review.hospitals.name, locale)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
