import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import {
  updateHospital,
  upsertHospitalProcedure,
  removeHospitalProcedure,
} from "@/lib/actions/admin-hospitals";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

function getMultilingual(val: Json | null | undefined) {
  if (!val || typeof val !== "object" || Array.isArray(val)) return {};
  return val as Record<string, string>;
}

function getEn(val: Json | null | undefined): string {
  const m = getMultilingual(val);
  return m.en ?? "";
}

export default async function EditHospitalPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.hospitals");

  const [{ data: hospital }, { data: allProcedures }, { data: hospitalProcs }] = await Promise.all([
    supabase.from("hospitals").select("*").eq("id", id).single(),
    supabase.from("procedures").select("id, name").order("name->en"),
    supabase
      .from("hospital_procedures")
      .select("id, procedure_id, cost_min, cost_max, cost_currency, annual_volume, specialist_count, waiting_time_days, procedures(name)")
      .eq("hospital_id", id),
  ]);

  if (!hospital) notFound();

  const handleUpdate = updateHospital.bind(null, id);

  const assignedProcedureIds = new Set(hospitalProcs?.map((hp) => hp.procedure_id) ?? []);
  const availableProcedures = allProcedures?.filter((p) => !assignedProcedureIds.has(p.id)) ?? [];

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold">{t("editHospital")}: {getEn(hospital.name)}</h1>

      {/* Edit form */}
      <form action={handleUpdate} className="space-y-4">
        <MultilingualInput name="name" label={t("fieldName")} value={getMultilingual(hospital.name)} />
        <MultilingualInput name="description" label={t("fieldDescription")} multiline value={getMultilingual(hospital.description)} />
        <MultilingualInput name="address" label={t("fieldAddress")} value={getMultilingual(hospital.address)} />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldSlug")}</label>
            <input name="slug" type="text" defaultValue={hospital.slug ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldCity")}</label>
            <input name="city" type="text" defaultValue={hospital.city ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldPhone")}</label>
            <input name="phone" type="text" defaultValue={hospital.phone ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldEmail")}</label>
            <input name="email" type="email" defaultValue={hospital.email ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldWebsite")}</label>
          <input name="website" type="url" defaultValue={hospital.website ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldAccreditation")}</label>
          <input name="accreditation" type="text" defaultValue={hospital.accreditation ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldLanguages")}</label>
          <input
            name="languages"
            type="text"
            defaultValue={(hospital.languages as string[] | null)?.join(", ") ?? ""}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldLogo")} (leave empty to keep current)</label>
          <input name="logo_file" type="file" accept="image/*" className="w-full text-sm" />
          {hospital.logo_url && (
            <p className="text-xs text-muted-foreground">Current: {hospital.logo_url}</p>
          )}
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input name="is_featured" type="checkbox" defaultChecked={hospital.is_featured ?? false} />
            {t("fieldFeatured")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="international_center" type="checkbox" defaultChecked={hospital.international_center ?? false} />
            {t("fieldInternational")}
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t("save")}
          </button>
          <a href={`/${locale}/admin/hospitals`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
            {t("cancel")}
          </a>
        </div>
      </form>

      {/* Hospital Procedures */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("procedures")}</h2>

        {/* Assigned procedures */}
        {hospitalProcs && hospitalProcs.length > 0 && (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-3 py-2 font-medium">{t("colProcedure")}</th>
                  <th className="text-left px-3 py-2 font-medium">{t("colCost")}</th>
                  <th className="text-left px-3 py-2 font-medium">{t("colVolume")}</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {hospitalProcs.map((hp) => {
                  const procName = hp.procedures
                    ? getEn((hp.procedures as { name: Json }).name)
                    : hp.procedure_id;
                  return (
                    <tr key={hp.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{procName}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {hp.cost_min != null ? `${hp.cost_currency} ${hp.cost_min}–${hp.cost_max}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {hp.annual_volume ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        <form action={removeHospitalProcedure.bind(null, hp.id)} className="inline">
                          <button type="submit" className="text-destructive text-xs hover:underline">
                            {t("remove")}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add procedure form */}
        {availableProcedures.length > 0 && (
          <form action={upsertHospitalProcedure} className="rounded-lg border p-4 space-y-3">
            <input type="hidden" name="hospital_id" value={id} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="text-sm font-medium">{t("addProcedure")}</label>
                <select name="procedure_id" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">{t("selectProcedure")}</option>
                  {availableProcedures.map((p) => (
                    <option key={p.id} value={p.id}>{getEn(p.name)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("colCostMin")}</label>
                <input name="cost_min" type="number" min="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("colCostMax")}</label>
                <input name="cost_max" type="number" min="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("colCurrency")}</label>
                <input name="cost_currency" type="text" defaultValue="USD" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("colVolume")}</label>
                <input name="annual_volume" type="number" min="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <button type="submit" className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80">
              {t("addProcedureBtn")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
