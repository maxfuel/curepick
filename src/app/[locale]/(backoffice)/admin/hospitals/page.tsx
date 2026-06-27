import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { deleteHospital } from "@/lib/actions/admin-hospitals";
import { DeleteButton } from "@/components/ui/DeleteButton";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string }>;
}

function getLang(val: Json | null | undefined, lang: string): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>)[lang] as string) || "";
  }
  return String(val);
}

export default async function AdminHospitalsPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.hospitals");

  const { data: hospitals } = await supabase
    .from("hospitals")
    .select("id, name, slug, city, is_featured")
    .order("name->en");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Link
          href={`/${locale}/admin/hospitals/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("newHospital")}
        </Link>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colName")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colCity")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colFeatured")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {hospitals && hospitals.length > 0 ? (
              hospitals.map((h) => (
                <tr key={h.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className="font-medium">{getLang(h.name, "ko") || getLang(h.name, "en")}</span>
                    {getLang(h.name, "ko") && getLang(h.name, "en") && (
                      <span className="block text-xs text-muted-foreground">{getLang(h.name, "en")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{h.city ?? "—"}</td>
                  <td className="px-4 py-3">{h.is_featured ? "✓" : ""}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/${locale}/admin/hospitals/${h.id}`}
                        className="text-primary text-xs hover:underline"
                      >
                        {t("edit")}
                      </Link>
                      <DeleteButton action={deleteHospital.bind(null, h.id)} label={t("delete")} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  {t("noHospitals")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
