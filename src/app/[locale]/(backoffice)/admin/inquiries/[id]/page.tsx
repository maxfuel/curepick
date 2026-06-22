import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { InquiryStatusForm } from "./InquiryStatusForm";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

export default async function AdminInquiryDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.inquiries");

  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("*, hospitals(name), services(name)")
    .eq("id", id)
    .single();

  if (!inquiry) notFound();

  const fields: Array<{ label: string; value: string | null | undefined }> = [
    { label: t("fieldName"), value: inquiry.name },
    { label: t("fieldEmail"), value: inquiry.email },
    { label: t("fieldPhone"), value: inquiry.phone },
    { label: t("fieldNationality"), value: inquiry.nationality },
    {
      label: t("fieldHospital"),
      value: inquiry.hospitals ? getEn((inquiry.hospitals as { name: Json }).name) : "—",
    },
    {
      label: t("fieldService"),
      value: inquiry.services ? getEn((inquiry.services as { name: Json }).name) : "—",
    },
    {
      label: t("fieldDate"),
      value: inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : "—",
    },
  ];

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/inquiries`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t("backToList")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("detailTitle")}</h1>
      </div>

      <dl className="rounded-lg border divide-y">
        {fields.map((f) => (
          <div key={f.label} className="flex px-4 py-3">
            <dt className="w-36 shrink-0 text-sm font-medium text-muted-foreground">{f.label}</dt>
            <dd className="text-sm">{f.value ?? "—"}</dd>
          </div>
        ))}
        <div className="px-4 py-3">
          <dt className="text-sm font-medium text-muted-foreground mb-2">{t("fieldMessage")}</dt>
          <dd className="text-sm whitespace-pre-wrap">{inquiry.message ?? "—"}</dd>
        </div>
      </dl>

      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="text-sm font-semibold">{t("changeStatus")}</h2>
        <div className="flex items-center gap-3">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            inquiry.status === "new" ? "bg-blue-100 text-blue-700" :
            inquiry.status === "contacted" ? "bg-yellow-100 text-yellow-700" :
            "bg-green-100 text-green-700"
          }`}>
            {inquiry.status}
          </span>
          <InquiryStatusForm id={id} currentStatus={inquiry.status ?? "new"} />
        </div>
      </div>
    </div>
  );
}
