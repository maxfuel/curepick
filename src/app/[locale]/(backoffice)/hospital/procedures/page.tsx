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

export default async function HospitalProceduresPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("hospital.procedures");

  const { data: hospitalProcedures } = await supabase
    .from("hospital_procedures")
    .select("*, procedures(name)")
    .eq("hospital_id", profile!.hospital_id!)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colProcedure")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colCost")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colVolume")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colWaiting")}</th>
            </tr>
          </thead>
          <tbody>
            {hospitalProcedures && hospitalProcedures.length > 0 ? (
              hospitalProcedures.map((hp) => {
                const procedureName = hp.procedures
                  ? getLocalizedString(
                      (hp.procedures as { name: Json }).name
                    )
                  : "—";
                const costStr =
                  hp.cost_min != null && hp.cost_max != null
                    ? `${hp.cost_currency ?? "USD"} ${hp.cost_min.toLocaleString()} – ${hp.cost_max.toLocaleString()}`
                    : "—";
                return (
                  <tr
                    key={hp.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{procedureName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{costStr}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {hp.annual_volume != null
                        ? t("cases", { count: hp.annual_volume })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {hp.waiting_time_days != null
                        ? t("days", { days: hp.waiting_time_days })
                        : "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {t("noProcedures")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditRequestForm section="Procedures" />
    </div>
  );
}
