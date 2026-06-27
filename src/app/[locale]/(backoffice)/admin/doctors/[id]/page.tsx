import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import { DoctorPhotoInput } from "@/components/backoffice/admin/DoctorPhotoInput";
import { LanguageTagPicker } from "@/components/backoffice/admin/LanguageTagPicker";
import { updateDoctor } from "@/lib/actions/admin-doctors";
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

export default async function EditDoctorPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.doctors");

  const [{ data: doctor }, { data: hospitals }] = await Promise.all([
    supabase.from("doctors").select("*").eq("id", id).single(),
    supabase.from("hospitals").select("id, name").order("name->en"),
  ]);

  if (!doctor) notFound();

  const handleUpdate = updateDoctor.bind(null, id);

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{t("editDoctor")}: {getEn(doctor.name)}</h1>
      <form action={handleUpdate} className="space-y-4">
        <MultilingualInput name="name" label={t("fieldName")} value={getMultilingual(doctor.name)} />
        <MultilingualInput name="specialty" label={t("fieldSpecialty")} value={getMultilingual(doctor.specialty)} />
        <MultilingualInput name="bio" label={t("fieldBio")} multiline value={getMultilingual(doctor.bio)} />

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldHospital")}</label>
          <select name="hospital_id" className="w-full rounded-md border bg-background px-3 py-2 text-sm" defaultValue={doctor.hospital_id ?? ""}>
            <option value="">{t("noHospital")}</option>
            {hospitals?.map((h) => (
              <option key={h.id} value={h.id}>{getEn(h.name)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldSlug")}</label>
            <input name="slug" type="text" defaultValue={doctor.slug ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldExperience")}</label>
            <input name="experience_years" type="number" min="0" defaultValue={doctor.experience_years ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldLanguages")}</label>
          <LanguageTagPicker name="languages" defaultValue={(doctor.languages as string[] | null) ?? []} />
        </div>

        <DoctorPhotoInput currentPhotoUrl={doctor.photo_url} />

        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t("save")}
          </button>
          <a href={`/${locale}/admin/doctors`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
            {t("cancel")}
          </a>
        </div>
      </form>
    </div>
  );
}
