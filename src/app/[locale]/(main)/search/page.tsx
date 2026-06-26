import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { getLangLabel } from "@/config/i18n";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/SearchBar";
import { MapPin } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = await getTranslations({ locale, namespace: "search" });

  return {
    title: q ? t("resultsFor", { query: q }) : t("results"),
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "search" });
  const query = q?.trim() || "";

  let services: Array<{
    slug: string;
    name: unknown;
    description: unknown;
    image_url: string | null;
  }> = [];
  let hospitals: Array<{
    slug: string;
    name: unknown;
    city: string | null;
    logo_url: string | null;
    languages: string[] | null;
  }> = [];
  let doctors: Array<{
    slug: string;
    name: unknown;
    specialty: unknown;
    photo_url: string | null;
    experience_years: number | null;
  }> = [];

  if (query.length >= 2) {
    const supabase = await createClient();
    const pattern = `%${query}%`;

    const orPattern = `name->>en.ilike.${pattern},name->>ko.ilike.${pattern},name->>zh.ilike.${pattern},name->>ja.ilike.${pattern}`;

    const [
      { data: svcData },
      { data: hospData },
      { data: docData },
    ] = await Promise.all([
      supabase
        .from("services")
        .select("slug, name, description, image_url")
        .or(orPattern)
        .limit(10),
      supabase
        .from("hospitals")
        .select("slug, name, city, logo_url, languages")
        .or(orPattern)
        .limit(10),
      supabase
        .from("doctors")
        .select("slug, name, specialty, photo_url, experience_years")
        .or(orPattern)
        .limit(10),
    ]);

    services = svcData ?? [];
    hospitals = hospData ?? [];
    doctors = docData ?? [];
  }

  const totalResults = services.length + hospitals.length + doctors.length;

  function highlightMatch(text: string): React.ReactNode {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar locale={locale} />
      </div>

      {query && (
        <h1 className="text-2xl font-bold mb-8">
          {t("resultsFor", { query })}
        </h1>
      )}

      {query && totalResults === 0 && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            {t("noResults", { query })}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("noResultsHint")}
          </p>
        </div>
      )}

      <div className="space-y-12">
        {/* Services */}
        {services.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {t("servicesSection")}
              <Badge variant="secondary">{services.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const name = getLocalizedField(service.name, locale);
                const desc = getLocalizedField(service.description, locale);
                return (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="block rounded-xl border p-6 transition-colors hover:bg-muted/50"
                  >
                    <h3 className="font-semibold">{highlightMatch(name)}</h3>
                    {desc && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {desc}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Hospitals */}
        {hospitals.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {t("hospitalsSection")}
              <Badge variant="secondary">{hospitals.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hospitals.map((hospital) => {
                const name = getLocalizedField(hospital.name, locale);
                return (
                  <Link
                    key={hospital.slug}
                    href={`/hospitals/${hospital.slug}`}
                    className="flex items-start gap-4 rounded-xl border p-6 transition-colors hover:bg-muted/50"
                  >
                    {hospital.logo_url && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={hospital.logo_url}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {highlightMatch(name)}
                      </h3>
                      {hospital.city && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {hospital.city}
                        </p>
                      )}
                      {hospital.languages && hospital.languages.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {hospital.languages.map((lang) => (
                            <Badge
                              key={lang}
                              variant="outline"
                              className="text-xs"
                            >
                              {getLangLabel(lang)}
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
        )}

        {/* Doctors */}
        {doctors.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {t("doctorsSection")}
              <Badge variant="secondary">{doctors.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => {
                const name = getLocalizedField(doctor.name, locale);
                const specialty = getLocalizedField(doctor.specialty, locale);
                return (
                  <Link
                    key={doctor.slug}
                    href={`/doctors/${doctor.slug}`}
                    className="flex items-start gap-4 rounded-xl border p-6 transition-colors hover:bg-muted/50"
                  >
                    {doctor.photo_url && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={doctor.photo_url}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {highlightMatch(name)}
                      </h3>
                      {specialty && (
                        <p className="text-sm text-muted-foreground">
                          {specialty}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
