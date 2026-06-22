import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { EditRequestForm } from "@/components/backoffice/hospital/EditRequestForm";
import type { Json } from "@/lib/types/database";

function getLocalizedString(value: Json | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return (obj.en as string) || (obj.ko as string) || "";
  }
  return "";
}

export default async function HospitalDoctorsPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("hospital.doctors");

  const { data: doctors } = await supabase
    .from("doctors")
    .select("*")
    .eq("hospital_id", profile!.hospital_id!)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colName")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colSpecialty")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colExperience")}</th>
            </tr>
          </thead>
          <tbody>
            {doctors && doctors.length > 0 ? (
              doctors.map((doc) => (
                <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {getLocalizedString(doc.name)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getLocalizedString(doc.specialty)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {doc.experience_years != null
                      ? t("years", { years: doc.experience_years })
                      : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {t("noDoctors")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditRequestForm section="Doctors" />
    </div>
  );
}
