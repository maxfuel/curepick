import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { locales, getLangLabel } from "@/config/i18n";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CTAButton } from "@/components/ui/CTAButton";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { Metadata } from "next";
import { Building2, Users, BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildPhysicianJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: doctors } = await supabase.from("doctors").select("slug");

  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const doctor of doctors ?? []) {
      params.push({ locale, slug: doctor.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: doctor } = await supabase
    .from("doctors")
    .select("name, specialty, photo_url")
    .eq("slug", slug)
    .single();

  if (!doctor) return {};

  const name = getLocalizedField(doctor.name, locale);
  const specialty = getLocalizedField(doctor.specialty, locale);

  const safeImage = doctor.photo_url?.includes("/storage/v1/object/public/")
    ? doctor.photo_url
    : null;

  return buildMetadata({
    title: name,
    description: specialty ? `${name} — ${specialty}` : name,
    locale,
    path: `/doctors/${slug}`,
    image: safeImage,
  });
}

export default async function DoctorDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const t = await getTranslations({ locale, namespace: "doctors" });

  // Fetch doctor
  const { data: doctor } = await supabase
    .from("doctors")
    .select(
      "id, slug, name, specialty, experience_years, bio, photo_url, languages, publications, hospital_id"
    )
    .eq("slug", slug)
    .single();

  if (!doctor) notFound();

  // Only Supabase Storage URLs are allowed by next/image remotePatterns.
  // If photo_url is set to an external URL, Image would throw at render time → 500.
  const safePhotoUrl = doctor.photo_url?.includes("/storage/v1/object/public/")
    ? doctor.photo_url
    : null;

  // Fetch hospital info and hospital's procedures in parallel
  const [{ data: hospital }, { data: hospitalProcedures }] = await Promise.all([
    doctor.hospital_id
      ? supabase
          .from("hospitals")
          .select("id, slug, name, logo_url")
          .eq("id", doctor.hospital_id)
          .single()
      : Promise.resolve({ data: null }),
    doctor.hospital_id
      ? supabase
          .from("hospital_procedures")
          .select("id, procedures(id, slug, name, service_id)")
          .eq("hospital_id", doctor.hospital_id)
      : Promise.resolve({ data: null }),
  ]);

  const doctorName = getLocalizedField(doctor.name, locale);
  const doctorSpecialty = getLocalizedField(doctor.specialty, locale);
  const doctorBio = getLocalizedField(doctor.bio, locale);
  const hospitalName = hospital
    ? getLocalizedField(hospital.name, locale)
    : "";

  const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });
  const physicianJsonLd = buildPhysicianJsonLd(doctor, hospitalName ?? "", locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tBreadcrumb("home"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}` },
    { name: tBreadcrumb("doctors"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/doctors` },
    { name: doctorName },
  ]);

  // Parse publications (Json field — expected to be an array of objects with title, journal, year, url)
  const publications = Array.isArray(doctor.publications)
    ? (doctor.publications as Array<{
        title?: string;
        journal?: string;
        year?: number;
        url?: string;
      }>)
    : [];

  // Deduplicate procedures
  const procedureMap = new Map<
    string,
    { id: string; slug: string; name: string; service_id: string | null }
  >();
  for (const hp of hospitalProcedures ?? []) {
    const proc = hp.procedures as unknown as {
      id: string;
      slug: string;
      name: unknown;
      service_id: string | null;
    } | null;
    if (proc && !procedureMap.has(proc.id)) {
      procedureMap.set(proc.id, {
        id: proc.id,
        slug: proc.slug,
        name: getLocalizedField(proc.name, locale),
        service_id: proc.service_id ?? null,
      });
    }
  }
  const procedures = Array.from(procedureMap.values());

  // Fetch service slugs for procedure links
  const serviceIds = [...new Set(procedures.map((p) => p.service_id).filter(Boolean))] as string[];
  const { data: procServices } = serviceIds.length
    ? await supabase.from("services").select("id, slug").in("id", serviceIds)
    : { data: [] };
  const procServiceSlugMap = new Map((procServices ?? []).map((s) => [s.id, s.slug]));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div>
      {/* Profile Hero */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {safePhotoUrl ? (
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={safePhotoUrl}
                  alt={doctorName}
                  fill
                  className="object-cover"
                  sizes="128px"
                  priority
                />
              </div>
            ) : (
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-background">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {doctorName}
              </h1>
              {doctorSpecialty && (
                <p className="mt-2 text-lg text-muted-foreground">
                  {doctorSpecialty}
                </p>
              )}
              {hospital && (
                <Link
                  href={`/hospitals/${hospital.slug}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Building2 className="h-4 w-4" />
                  {t("affiliatedHospital")}: {hospitalName}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Experience & Career */}
        {(doctor.experience_years != null || doctorBio) && (
          <section>
            <h2 className="text-2xl font-bold mb-4">
              {t("experienceAndCareer")}
            </h2>
            {doctor.experience_years != null && (
              <p className="text-muted-foreground mb-4">
                {t("yearsOfExperience", { years: doctor.experience_years })}
              </p>
            )}
            {doctorBio && (
              <>
                <h3 className="font-semibold mb-2">{t("biography")}</h3>
                <div className="prose max-w-none text-muted-foreground whitespace-pre-line">
                  {doctorBio}
                </div>
              </>
            )}
          </section>
        )}

        {/* Specialty Procedures */}
        {procedures.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t("specialtyProcedures")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {procedures.map((proc) => {
                  const serviceSlug = proc.service_id ? procServiceSlugMap.get(proc.service_id) : null;
                  return serviceSlug ? (
                    <Link
                      key={proc.id}
                      href={`/services/${serviceSlug}`}
                      className="inline-flex items-center rounded-full border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 hover:underline"
                    >
                      {proc.name}
                    </Link>
                  ) : (
                    <Badge key={proc.id} variant="secondary" className="text-sm">
                      {proc.name}
                    </Badge>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Publications */}
        {publications.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t("publications")}
              </h2>
              <div className="space-y-3">
                {publications.map((pub, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border p-4"
                  >
                    <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      {pub.url ? (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {pub.title}
                        </a>
                      ) : (
                        <p className="font-medium">{pub.title}</p>
                      )}
                      {(pub.journal || pub.year) && (
                        <p className="text-sm text-muted-foreground">
                          {[pub.journal, pub.year].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Supported Languages */}
        {doctor.languages && doctor.languages.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t("supportedLanguages")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((lang) => (
                  <Badge key={lang} variant="secondary">
                    {getLangLabel(lang)}
                  </Badge>
                ))}
              </div>
            </section>
          </>
        )}

        {/* CTA */}
        <Separator />
        <section className="text-center py-8">
          <CTAButton
            hospitalId={doctor.hospital_id ?? undefined}
            variant="large"
          />
        </section>
      </div>
    </div>
    </>
  );
}
