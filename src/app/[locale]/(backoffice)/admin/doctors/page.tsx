import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { deleteDoctor } from "@/lib/actions/admin-doctors";
import { DeleteButton } from "@/components/ui/DeleteButton";
import type { Json } from "@/lib/types/database";
import HospitalFilter from "./HospitalFilter";

interface Props {
  params: Promise<{ locale: string; }>
  searchParams: Promise<{ hospital?: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

export default async function AdminDoctorsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { hospital: hospitalFilter } = await searchParams;
  const supabase = await createClient();
  const t = await getTranslations("admin.doctors");

  const [{ data: doctors }, { data: hospitals }] = await Promise.all([
    hospitalFilter
      ? supabase.from("doctors").select("id, name, specialty, hospital_id, experience_years").eq("hospital_id", hospitalFilter)
      : supabase.from("doctors").select("id, name, specialty, hospital_id, experience_years").order("name->en"),
    supabase.from("hospitals").select("id, name").order("name->en"),
  ]);

  const hospitalMap = new Map(hospitals?.map((h) => [h.id, getEn(h.name)]) ?? []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Link
          href={`/${locale}/admin/doctors/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("newDoctor")}
        </Link>
      </div>

      <div className="mb-4">
        <HospitalFilter
          hospitals={hospitals?.map((h) => ({ id: h.id, name: getEn(h.name) })) ?? []}
          current={hospitalFilter ?? ""}
          label={t("allHospitals")}
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colName")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colSpecialty")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colHospital")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colExperience")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {doctors && doctors.length > 0 ? (
              doctors.map((doc) => (
                <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{getEn(doc.name)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getEn(doc.specialty)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {doc.hospital_id ? hospitalMap.get(doc.hospital_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {doc.experience_years != null ? `${doc.experience_years}yr` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/${locale}/admin/doctors/${doc.id}`}
                        className="text-primary text-xs hover:underline"
                      >
                        {t("edit")}
                      </Link>
                      <DeleteButton action={deleteDoctor.bind(null, doc.id)} label={t("delete")} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t("noDoctors")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
