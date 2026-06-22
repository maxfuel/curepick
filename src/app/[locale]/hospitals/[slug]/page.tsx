import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { locales } from "@/config/i18n";
import { PriceRange } from "@/components/ui/PriceRange";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CTAButton } from "@/components/ui/CTAButton";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildHospitalJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  Users,
  Activity,
  Clock,
  Languages,
  Star,
} from "lucide-react";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: hospitals } = await supabase
    .from("hospitals")
    .select("slug");

  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const hospital of hospitals ?? []) {
      params.push({ locale, slug: hospital.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: hospital } = await supabase
    .from("hospitals")
    .select("name, description, hero_image_url")
    .eq("slug", slug)
    .single();

  if (!hospital) return {};

  return buildMetadata({
    title: getLocalizedField(hospital.name, locale),
    description: getLocalizedField(hospital.description, locale),
    locale,
    path: `/hospitals/${slug}`,
    image: hospital.hero_image_url,
  });
}

export default async function HospitalDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: "hospitals" });
  const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });

  // Fetch hospital
  const { data: hospital } = await supabase
    .from("hospitals")
    .select(
      "id, slug, name, description, address, city, accreditation, international_center, languages, phone, email, website, logo_url, hero_image_url"
    )
    .eq("slug", slug)
    .single();

  if (!hospital) notFound();

  // Fetch hospital_procedures with procedure details, and doctors in parallel
  const [{ data: hospitalProcedures }, { data: doctors }] = await Promise.all([
    supabase
      .from("hospital_procedures")
      .select(
        "id, procedure_id, annual_volume, specialist_count, waiting_time_days, cost_min, cost_max, cost_currency, evidence_score, languages, intl_patient_support, procedures(id, slug, name, description)"
      )
      .eq("hospital_id", hospital.id),
    supabase
      .from("doctors")
      .select(
        "id, slug, name, specialty, experience_years, photo_url, languages"
      )
      .eq("hospital_id", hospital.id),
  ]);

  const hospitalName = getLocalizedField(hospital.name, locale);
  const hospitalDescription = getLocalizedField(hospital.description, locale);
  const hospitalAddress = getLocalizedField(hospital.address, locale);

  const hospitalJsonLd = buildHospitalJsonLd(hospital, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tBreadcrumb("home"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}` },
    { name: tBreadcrumb("hospitals"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/hospitals` },
    { name: hospitalName },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hospitalJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div>
      {/* Hero Section */}
      <section className="relative bg-muted py-16">
        {hospital.hero_image_url && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={hospital.hero_image_url}
              alt={hospitalName}
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}
        <div className="container relative mx-auto px-4 text-center">
          {hospital.logo_url && (
            <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-xl">
              <Image
                src={hospital.logo_url}
                alt={hospitalName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {hospitalName}
          </h1>
          {hospital.city && (
            <p className="mt-2 flex items-center justify-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {hospital.city}
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Overview */}
        {hospitalDescription && (
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("overview")}</h2>
            <div className="prose max-w-none text-muted-foreground whitespace-pre-line">
              {hospitalDescription}
            </div>
          </section>
        )}

        {/* Strengths & Accreditation */}
        {(hospital.accreditation || hospital.international_center) && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("strengths")}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {hospital.accreditation && (
                  <div className="flex items-start gap-3 rounded-xl border p-6">
                    <Shield className="h-6 w-6 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold">{t("accreditation")}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {hospital.accreditation}
                      </p>
                    </div>
                  </div>
                )}
                {hospital.international_center && (
                  <div className="flex items-start gap-3 rounded-xl border p-6">
                    <Languages className="h-6 w-6 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold">
                        {t("internationalCenter")}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("internationalCenterYes")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Supported Procedures */}
        {hospitalProcedures && hospitalProcedures.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t("supportedProcedures")}
              </h2>
              <div className="space-y-4">
                {hospitalProcedures.map((hp) => {
                  const procedure = hp.procedures as unknown as {
                    id: string;
                    slug: string;
                    name: unknown;
                    description: unknown;
                  } | null;
                  const procedureDesc = procedure
                    ? getLocalizedField(procedure.description, locale)
                    : "";
                  if (!procedure) return null;

                  return (
                    <div
                      key={hp.id}
                      className="rounded-xl border p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-semibold">
                            {getLocalizedField(procedure.name, locale)}
                          </h3>
                          {procedureDesc && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {procedureDesc}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <PriceRange
                            costMin={hp.cost_min}
                            costMax={hp.cost_max}
                            currency={hp.cost_currency}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {hp.annual_volume != null && (
                          <span className="flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5" />
                            {t("annualVolume", { count: hp.annual_volume })}
                          </span>
                        )}
                        {hp.specialist_count != null && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {t("specialists", { count: hp.specialist_count })}
                          </span>
                        )}
                        {hp.waiting_time_days != null && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {t("waitingDays", { days: hp.waiting_time_days })}
                          </span>
                        )}
                        {hp.evidence_score != null && (
                          <Badge variant="secondary">
                            {t("evidenceScore")}: {hp.evidence_score}/10
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Doctors */}
        {doctors && doctors.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("ourDoctors")}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    slug={doctor.slug}
                    name={getLocalizedField(doctor.name, locale)}
                    photoUrl={doctor.photo_url}
                    specialty={getLocalizedField(doctor.specialty, locale) || null}
                    experienceYears={doctor.experience_years}
                    languages={doctor.languages}
                    translations={{
                      experience: t("experience", {
                        years: doctor.experience_years ?? 0,
                      }),
                    }}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* International Services */}
        {hospital.languages && hospital.languages.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t("internationalServices")}
              </h2>
              <div className="rounded-xl border p-6">
                <h3 className="font-semibold mb-3">
                  {t("supportedLanguages")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.languages.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Location & Contact */}
        {(hospitalAddress || hospital.phone || hospital.email || hospital.website) && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t("locationContact")}
              </h2>
              <div className="rounded-xl border p-6 space-y-4">
                {hospitalAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("address")}</p>
                      <p className="text-sm text-muted-foreground">
                        {hospitalAddress}
                      </p>
                    </div>
                  </div>
                )}
                {hospital.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("phone")}</p>
                      <a
                        href={`tel:${hospital.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {hospital.phone}
                      </a>
                    </div>
                  </div>
                )}
                {hospital.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("email")}</p>
                      <a
                        href={`mailto:${hospital.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {hospital.email}
                      </a>
                    </div>
                  </div>
                )}
                {hospital.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("website")}</p>
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {hospital.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Patient Reviews */}
        <Separator />
        <section>
          <HospitalReviews hospitalId={hospital.id} locale={locale} />
        </section>

        {/* CTA */}
        <Separator />
        <section className="text-center py-8">
          <CTAButton hospitalId={hospital.id} variant="large" />
        </section>
      </div>
    </div>
    </>
  );
}

async function HospitalReviews({
  hospitalId,
  locale,
}: {
  hospitalId: string;
  locale: string;
}) {
  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: "reviews" });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("hospital_id", hospitalId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!reviews || reviews.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("hospitalReviews")}</h2>
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
              <span className="text-xs text-muted-foreground">
                {review.created_at
                  ? new Date(review.created_at).toLocaleDateString(locale)
                  : ""}
              </span>
            </div>
            <h3 className="font-medium">{review.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {review.content}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
