import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { InquiryStatusForm } from "./InquiryStatusForm";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InquiryDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("hospital.inquiries");

  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .eq("hospital_id", profile!.hospital_id!)
    .single();

  if (!inquiry) notFound();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}/hospital/inquiries`} className="hover:underline">
          {t("title")}
        </Link>
        <span>/</span>
        <span>{inquiry.name}</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6">{t("detailTitle")}</h1>

      <div className="rounded-lg border p-4 space-y-3 mb-6">
        <Row label={t("colName")} value={inquiry.name} />
        <Row label={t("colEmail")} value={inquiry.email} />
        {inquiry.phone && <Row label={t("phone")} value={inquiry.phone} />}
        {inquiry.nationality && (
          <Row label={t("nationality")} value={inquiry.nationality} />
        )}
        {inquiry.message && <Row label={t("message")} value={inquiry.message} />}
        <Row
          label={t("colDate")}
          value={new Date(inquiry.created_at!).toLocaleString()}
        />
      </div>

      <InquiryStatusForm id={inquiry.id} currentStatus={inquiry.status ?? "new"} locale={locale} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 text-sm">
      <span className="w-28 shrink-0 font-medium text-muted-foreground">{label}</span>
      <span className="flex-1 whitespace-pre-wrap">{value}</span>
    </div>
  );
}
