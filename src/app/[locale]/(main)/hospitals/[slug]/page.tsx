import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { locales } from "@/config/i18n";
import { PriceRange } from "@/components/ui/PriceRange";
import { Badge } from "@/components/ui/badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { VideoGallery } from "@/components/hospitals/VideoGallery";
import { PhotoGallery } from "@/components/hospitals/PhotoGallery";
import { ReadMoreText } from "@/components/hospitals/ReadMoreText";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Database } from "@/lib/types/database";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildHospitalJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import {
  MapPin, Phone, Mail, Globe, Shield, Users, Activity,
  Clock, Languages, Star, Award, CalendarDays, HeartPulse,
  Video, Images, ChevronRight,
} from "lucide-react";
import type { HospitalVideo } from "@/components/hospitals/VideoGallery";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

interface Award {
  title: string;
  year?: number;
  description?: string;
  image_url?: string;
}

// ─── grouped procedures ───────────────────────────────────────────────────────
interface GroupedService {
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  categoryName: string;
  procedures: {
    id: string;
    slug: string;
    name: string;
    costMin: number | null;
    costMax: number | null;
    currency: string | null;
    annualVolume: number | null;
    specialistCount: number | null;
    waitingDays: number | null;
    evidenceScore: number | null;
  }[];
}

// ─── SSG ─────────────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: hospitals } = await supabase.from("hospitals").select("slug");
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const h of hospitals ?? []) params.push({ locale, slug: h.slug });
  }
  return params;
}

// ─── Metadata ────────────────────────────────────────────────────────────────
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HospitalDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: "hospitals" });
  const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });

  // ── Fetch hospital (all columns incl. new ones)
  const { data: hospital } = await supabase
    .from("hospitals")
    .select(
      "id, slug, name, description, address, city, accreditation, international_center, languages, phone, email, website, logo_url, hero_image_url, founded_year, annual_patients, videos, gallery_images, awards"
    )
    .eq("slug", slug)
    .single();

  if (!hospital) notFound();

  // ── Fetch procedures + doctors in parallel
  const [{ data: hospitalProcedures }, { data: doctors }, { data: reviews }] =
    await Promise.all([
      supabase
        .from("hospital_procedures")
        .select(
          "id, annual_volume, specialist_count, waiting_time_days, cost_min, cost_max, cost_currency, evidence_score, procedures(id, slug, name, service_id)"
        )
        .eq("hospital_id", hospital.id),
      supabase
        .from("doctors")
        .select("id, slug, name, specialty, experience_years, photo_url, languages")
        .eq("hospital_id", hospital.id),
      supabase
        .from("reviews")
        .select("id, rating, title, content, is_verified, created_at")
        .eq("hospital_id", hospital.id)
        .eq("status", "approved")
        .order("is_verified", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  // ── Group procedures by service
  const procServiceIds = [
    ...new Set(
      (hospitalProcedures ?? [])
        .map((hp) => (hp.procedures as unknown as { service_id?: string } | null)?.service_id)
        .filter(Boolean) as string[]
    ),
  ];

  const { data: services } = procServiceIds.length
    ? await supabase
        .from("services")
        .select("id, slug, name, category_id, categories(id, name)")
        .in("id", procServiceIds)
    : { data: [] };

  // Build grouped structure
  const serviceMap = new Map(
    (services ?? []).map((s) => [
      s.id,
      {
        slug: s.slug,
        name: getLocalizedField(s.name, locale),
        categoryName: getLocalizedField(
          (s.categories as unknown as { name: unknown } | null)?.name ?? {},
          locale
        ),
      },
    ])
  );

  const grouped = new Map<string, GroupedService>();
  for (const hp of hospitalProcedures ?? []) {
    const proc = hp.procedures as unknown as {
      id: string; slug: string; name: unknown; service_id: string | null;
    } | null;
    if (!proc?.service_id) continue;
    const svc = serviceMap.get(proc.service_id);
    if (!svc) continue;

    if (!grouped.has(proc.service_id)) {
      grouped.set(proc.service_id, {
        serviceId: proc.service_id,
        serviceSlug: svc.slug,
        serviceName: svc.name,
        categoryName: svc.categoryName,
        procedures: [],
      });
    }
    grouped.get(proc.service_id)!.procedures.push({
      id: proc.id,
      slug: proc.slug,
      name: getLocalizedField(proc.name, locale),
      costMin: hp.cost_min,
      costMax: hp.cost_max,
      currency: hp.cost_currency,
      annualVolume: hp.annual_volume,
      specialistCount: hp.specialist_count,
      waitingDays: hp.waiting_time_days,
      evidenceScore: hp.evidence_score,
    });
  }
  const groupedServices = [...grouped.values()];

  // ── Computed helpers
  const hospitalName = getLocalizedField(hospital.name, locale);
  const hospitalDescription = getLocalizedField(hospital.description, locale);
  const hospitalAddress = getLocalizedField(hospital.address, locale);

  const videos = (hospital.videos as HospitalVideo[] | null) ?? [];
  const galleryImages = (hospital.gallery_images as string[] | null) ?? [];
  const awards = (hospital.awards as Award[] | null) ?? [];

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  // ── JSON-LD
  const hospitalJsonLd = buildHospitalJsonLd(hospital, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tBreadcrumb("home"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}` },
    { name: tBreadcrumb("hospitals"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/hospitals` },
    { name: hospitalName },
  ]);

  // ── Section visibility flags
  const hasVideos = videos.length > 0;
  const hasGallery = galleryImages.length > 0;
  const hasServices = groupedServices.length > 0;
  const hasDoctors = (doctors ?? []).length > 0;
  const hasAwards = awards.length > 0;
  const hasReviews = (reviews ?? []).length > 0;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hospitalJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative min-h-[480px] flex items-end bg-gray-900">
        {hospital.hero_image_url && (
          <Image
            src={hospital.hero_image_url}
            alt={hospitalName}
            fill
            priority
            className="object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

        <div className="relative container mx-auto px-4 pb-10 pt-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            {/* Left: identity */}
            <div className="flex items-start gap-5">
              {hospital.logo_url && (
                <div className="relative hidden shrink-0 sm:block">
                  <div className="relative size-20 overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 shadow-lg">
                    <Image src={hospital.logo_url} alt={hospitalName} fill className="object-cover" sizes="80px" />
                  </div>
                </div>
              )}
              <div>
                {hospital.city && (
                  <div className="flex items-center gap-1.5 text-sm text-white/70 mb-2">
                    <MapPin className="size-3.5" />
                    {hospital.city}
                    {hospital.accreditation && (
                      <>
                        <span className="mx-1 text-white/30">·</span>
                        <Shield className="size-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{hospital.accreditation}</span>
                      </>
                    )}
                  </div>
                )}
                <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
                  {hospitalName}
                </h1>

                {/* Quick stat pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {hospital.founded_year && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                      <CalendarDays className="size-3.5" />
                      Est. {hospital.founded_year}
                    </span>
                  )}
                  {hospital.annual_patients && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                      <HeartPulse className="size-3.5" />
                      {hospital.annual_patients.toLocaleString()}+ patients/year
                    </span>
                  )}
                  {doctors && doctors.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                      <Users className="size-3.5" />
                      {doctors.length} doctors
                    </span>
                  )}
                  {hospital.international_center && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      <Globe className="size-3.5" />
                      International Center
                    </span>
                  )}
                  {avgRating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      <Star className="size-3.5 fill-white" />
                      {avgRating}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: CTA card */}
            <div className="shrink-0">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 min-w-[220px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
                  Free Consultation
                </p>
                <CTAButton hospitalId={hospital.id} variant="large" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION NAV
      ════════════════════════════════════════ */}
      <nav className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { href: "#about", label: "Overview" },
              hasVideos && { href: "#videos", label: "Videos" },
              hasGallery && { href: "#gallery", label: "Gallery" },
              hasServices && { href: "#services", label: "Services & Pricing" },
              hasDoctors && { href: "#doctors", label: "Doctors" },
              hasAwards && { href: "#awards", label: "Awards" },
              hasReviews && { href: "#reviews", label: "Reviews" },
              { href: "#contact", label: "Contact" },
            ]
              .filter(Boolean)
              .map((item) => {
                if (!item) return null;
                const i = item as { href: string; label: string };
                return (
                  <a
                    key={i.href}
                    href={i.href}
                    className="shrink-0 scroll-smooth px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-primary"
                  >
                    {i.label}
                  </a>
                );
              })}
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════ */}
      <div className="container mx-auto px-4 py-10 space-y-16">

        {/* ── Stats Bar ───────────────────────────────────── */}
        {(hospital.founded_year || hospital.annual_patients || (doctors?.length ?? 0) > 0 || hasServices || (hospital.languages?.length ?? 0) > 0) && (
          <div className="grid grid-cols-2 divide-x divide-y rounded-2xl border bg-card overflow-hidden sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
            {hospital.founded_year && (
              <StatCell icon={<CalendarDays className="size-5 text-primary" />} value={String(hospital.founded_year)} label="Founded" />
            )}
            {hospital.annual_patients && (
              <StatCell icon={<HeartPulse className="size-5 text-rose-500" />} value={hospital.annual_patients.toLocaleString() + "+"} label="Patients / Year" />
            )}
            {(doctors?.length ?? 0) > 0 && (
              <StatCell icon={<Users className="size-5 text-sky-500" />} value={String(doctors!.length)} label="Specialists" />
            )}
            {hasServices && (
              <StatCell icon={<Activity className="size-5 text-violet-500" />} value={String(hospitalProcedures?.length ?? 0)} label="Procedures" />
            )}
            {(hospital.languages?.length ?? 0) > 0 && (
              <StatCell icon={<Languages className="size-5 text-emerald-500" />} value={String(hospital.languages!.length)} label="Languages" />
            )}
          </div>
        )}

        {/* ── About ───────────────────────────────────────── */}
        {hospitalDescription && (
          <section id="about" className="scroll-mt-20">
            <SectionHeader icon={<Shield className="size-5" />} title="About the Hospital" />
            <ReadMoreText text={hospitalDescription} maxLength={600} />
          </section>
        )}

        {/* ── Video Gallery ───────────────────────────────── */}
        {hasVideos && (
          <section id="videos" className="scroll-mt-20">
            <SectionHeader icon={<Video className="size-5" />} title="Hospital Videos" count={videos.length} />
            <VideoGallery videos={videos} />
          </section>
        )}

        {/* ── Photo Gallery ──────────────────────────────── */}
        {hasGallery && (
          <section id="gallery" className="scroll-mt-20">
            <SectionHeader icon={<Images className="size-5" />} title="Photo Gallery" count={galleryImages.length} />
            <PhotoGallery images={galleryImages} alt={hospitalName} />
          </section>
        )}

        {/* ── Services & Pricing ──────────────────────────── */}
        {hasServices && (
          <section id="services" className="scroll-mt-20">
            <SectionHeader icon={<Activity className="size-5" />} title="Services & Pricing" />
            <div className="space-y-8">
              {groupedServices.map((group) => (
                <div key={group.serviceId} className="rounded-2xl border overflow-hidden">
                  {/* Service header */}
                  <div className="flex items-center justify-between bg-muted/60 px-5 py-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {group.categoryName}
                      </p>
                      <h3 className="font-semibold text-base">{group.serviceName}</h3>
                    </div>
                    <Link
                      href={`/services/${group.serviceSlug}`}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Service details <ChevronRight className="size-3.5" />
                    </Link>
                  </div>

                  {/* Procedures table */}
                  <div className="divide-y">
                    {group.procedures.map((proc) => (
                      <div
                        key={proc.id}
                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/services/${group.serviceSlug}`}
                            className="font-medium hover:text-primary hover:underline transition-colors"
                          >
                            {proc.name}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {proc.annualVolume != null && (
                              <span className="flex items-center gap-1">
                                <Activity className="size-3" />
                                {proc.annualVolume.toLocaleString()} cases/yr
                              </span>
                            )}
                            {proc.specialistCount != null && (
                              <span className="flex items-center gap-1">
                                <Users className="size-3" />
                                {proc.specialistCount} specialists
                              </span>
                            )}
                            {proc.waitingDays != null && (
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                ~{proc.waitingDays}d wait
                              </span>
                            )}
                            {proc.evidenceScore != null && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                Evidence {proc.evidenceScore}/10
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <PriceRange
                            costMin={proc.costMin}
                            costMax={proc.costMax}
                            currency={proc.currency}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Inquiry CTA */}
            <div className="mt-6 rounded-xl bg-primary/5 border border-primary/20 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">Need a personalised quote?</p>
                <p className="text-sm text-muted-foreground">We'll match you to the right procedure and package.</p>
              </div>
              <CTAButton hospitalId={hospital.id} />
            </div>
          </section>
        )}

        {/* ── Doctors ─────────────────────────────────────── */}
        {hasDoctors && (
          <section id="doctors" className="scroll-mt-20">
            <SectionHeader icon={<Users className="size-5" />} title={t("ourDoctors")} count={doctors!.length} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors!.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  slug={doctor.slug}
                  name={getLocalizedField(doctor.name, locale)}
                  photoUrl={doctor.photo_url}
                  specialty={getLocalizedField(doctor.specialty, locale) || null}
                  experienceYears={doctor.experience_years}
                  languages={doctor.languages}
                  translations={{
                    experience: t("experience", { years: doctor.experience_years ?? 0 }),
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Awards & Accreditations ─────────────────────── */}
        {hasAwards && (
          <section id="awards" className="scroll-mt-20">
            <SectionHeader icon={<Award className="size-5" />} title="Awards & Accreditations" count={awards.length} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {awards.map((award, i) => (
                <div key={i} className="flex gap-4 rounded-xl border bg-card p-5">
                  {award.image_url ? (
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                      <Image src={award.image_url} alt={award.title} fill className="object-contain" sizes="56px" />
                    </div>
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="size-7 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-snug">{award.title}</p>
                    {award.year && (
                      <p className="text-xs text-muted-foreground mt-0.5">{award.year}</p>
                    )}
                    {award.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{award.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Accreditation (text) & International ────────── */}
        {(hospital.accreditation || hospital.international_center || (hospital.languages?.length ?? 0) > 0) && (
          <section className="scroll-mt-20">
            <SectionHeader icon={<Globe className="size-5" />} title={t("internationalServices")} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hospital.accreditation && (
                <InfoCard icon={<Shield className="size-5 text-emerald-500" />} title={t("accreditation")}>
                  {hospital.accreditation}
                </InfoCard>
              )}
              {hospital.international_center && (
                <InfoCard icon={<Globe className="size-5 text-sky-500" />} title={t("internationalCenter")}>
                  {t("internationalCenterYes")}
                </InfoCard>
              )}
              {(hospital.languages?.length ?? 0) > 0 && (
                <InfoCard icon={<Languages className="size-5 text-violet-500" />} title={t("supportedLanguages")}>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {hospital.languages!.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                    ))}
                  </div>
                </InfoCard>
              )}
            </div>
          </section>
        )}

        {/* ── Reviews ─────────────────────────────────────── */}
        {hasReviews && (
          <section id="reviews" className="scroll-mt-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Star className="size-5 text-yellow-500 fill-yellow-500" />
                <h2 className="text-xl font-bold">Patient Reviews</h2>
                {avgRating && (
                  <span className="rounded-full bg-yellow-50 border border-yellow-200 px-3 py-0.5 text-sm font-bold text-yellow-700">
                    ★ {avgRating}
                  </span>
                )}
              </div>
              <Link href={`/reviews?hospital=${hospital.id}`} className="text-sm text-primary hover:underline">
                See all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews!.map((review) => (
                <Link
                  key={review.id}
                  href={`/reviews/${review.id}`}
                  className="block rounded-xl border bg-card p-5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    {review.is_verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString(locale, { year: "numeric", month: "short" })
                        : ""}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm leading-snug">{review.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{review.content}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Contact & CTA ───────────────────────────────── */}
        {(hospitalAddress || hospital.phone || hospital.email || hospital.website) && (
          <section id="contact" className="scroll-mt-20">
            <SectionHeader icon={<MapPin className="size-5" />} title={t("locationContact")} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hospitalAddress && (
                <InfoCard icon={<MapPin className="size-4 text-muted-foreground" />} title={t("address")}>
                  {hospitalAddress}
                </InfoCard>
              )}
              {hospital.phone && (
                <InfoCard icon={<Phone className="size-4 text-muted-foreground" />} title={t("phone")}>
                  <a href={`tel:${hospital.phone}`} className="text-primary hover:underline">
                    {hospital.phone}
                  </a>
                </InfoCard>
              )}
              {hospital.email && (
                <InfoCard icon={<Mail className="size-4 text-muted-foreground" />} title={t("email")}>
                  <a href={`mailto:${hospital.email}`} className="text-primary hover:underline break-all">
                    {hospital.email}
                  </a>
                </InfoCard>
              )}
              {hospital.website && (
                <InfoCard icon={<Globe className="size-4 text-muted-foreground" />} title={t("website")}>
                  <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                    {hospital.website.replace(/^https?:\/\//, "")}
                  </a>
                </InfoCard>
              )}
            </div>
          </section>
        )}

        {/* ── Final CTA ───────────────────────────────────── */}
        <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to book your treatment?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Get a free personalised quote from {hospitalName}. Our team will connect you within 24 hours.
          </p>
          <CTAButton hospitalId={hospital.id} variant="large" />
        </section>
      </div>
    </>
  );
}

// ─── Sub-components (server) ─────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <span className="text-primary">{icon}</span>
      <h2 className="text-xl font-bold">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

function StatCell({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-5 text-center">
      {icon}
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}
