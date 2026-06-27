import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import { DoctorPhotoInput } from "@/components/backoffice/admin/DoctorPhotoInput";
import { LanguageTagPicker } from "@/components/backoffice/admin/LanguageTagPicker";
import { createDoctor } from "@/lib/actions/admin-doctors";
import { SaveForm } from "@/components/ui/SaveForm";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ hospital_id?: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

export default async function NewDoctorPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { hospital_id } = await searchParams;
  const supabase = await createClient();
  const t = await getTranslations("admin.doctors");

  const { data: hospitals } = await supabase.from("hospitals").select("id, name").order("name->en");

  async function handleCreate(formData: FormData) {
    "use server";
    await createDoctor(formData);
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{t("newDoctor")}</h1>
      <SaveForm action={handleCreate} cancelHref={`/${locale}/admin/doctors`} saveLabel={t("create")} cancelLabel={t("cancel")}>
        <MultilingualInput name="name" label={t("fieldName")} />
        <MultilingualInput name="specialty" label={t("fieldSpecialty")} />
        <MultilingualInput name="bio" label={t("fieldBio")} multiline />

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldHospital")}</label>
          <select name="hospital_id" defaultValue={hospital_id ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">{t("noHospital")}</option>
            {hospitals?.map((h) => (
              <option key={h.id} value={h.id}>{getEn(h.name)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldSlug")}</label>
            <input
              name="slug"
              type="text"
              placeholder="auto-generated if empty"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldExperience")}</label>
            <input name="experience_years" type="number" min="0" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldLanguages")}</label>
          <LanguageTagPicker name="languages" />
        </div>

        <DoctorPhotoInput />
      </SaveForm>
    </div>
  );
}
