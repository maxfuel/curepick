import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/server";
import { getUser, getProfile } from "@/lib/auth/get-user";
import { InquiryForm } from "@/components/inquiry/InquiryForm";

interface InquiryPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    service?: string;
    hospital?: string;
    procedure?: string;
  }>;
}

export default async function InquiryPage({
  params,
  searchParams,
}: InquiryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const user = await getUser();
  const profile = user ? await getProfile() : null;

  const supabase = await createClient();

  const [{ data: services }, { data: hospitals }, { data: categories }] = await Promise.all([
    supabase.from("services").select("id, name, category_id").order("sort_order"),
    supabase.from("hospitals").select("id, name").order("name"),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);

  return (
    <InquiryPageContent
      profile={profile}
      services={services ?? []}
      hospitals={hospitals ?? []}
      categories={categories ?? []}
      locale={locale}
      defaultServiceId={sp.service}
      defaultHospitalId={sp.hospital}
    />
  );
}

function InquiryPageContent({
  profile,
  services,
  hospitals,
  categories,
  locale,
  defaultServiceId,
  defaultHospitalId,
}: {
  profile: { full_name: string | null; email: string | null; phone: string | null; nationality: string | null } | null;
  services: { id: string; name: unknown; category_id?: string | null }[];
  hospitals: { id: string; name: unknown }[];
  categories: { id: string; name: unknown }[];
  locale: string;
  defaultServiceId?: string;
  defaultHospitalId?: string;
}) {
  const t = useTranslations("inquiry");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <InquiryForm
          profile={profile}
          services={services}
          hospitals={hospitals}
          categories={categories}
          locale={locale}
          defaultServiceId={defaultServiceId}
          defaultHospitalId={defaultHospitalId}
        />
      </div>
    </div>
  );
}
