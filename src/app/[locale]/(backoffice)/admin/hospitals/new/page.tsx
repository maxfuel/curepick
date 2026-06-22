import { getTranslations } from "next-intl/server";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import { createHospital } from "@/lib/actions/admin-hospitals";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewHospitalPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin.hospitals");

  async function handleCreate(formData: FormData) {
    "use server";
    await createHospital(formData);
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{t("newHospital")}</h1>
      <form action={handleCreate} className="space-y-4" encType="multipart/form-data">
        <MultilingualInput name="name" label={t("fieldName")} />
        <MultilingualInput name="description" label={t("fieldDescription")} multiline />
        <MultilingualInput name="address" label={t("fieldAddress")} />

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
            <label className="text-sm font-medium">{t("fieldCity")}</label>
            <input name="city" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldPhone")}</label>
            <input name="phone" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldEmail")}</label>
            <input name="email" type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldWebsite")}</label>
          <input name="website" type="url" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldAccreditation")}</label>
          <input name="accreditation" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldLanguages")}</label>
          <input
            name="languages"
            type="text"
            placeholder="en, ko, zh, ja"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t("fieldLogo")}</label>
          <input name="logo_file" type="file" accept="image/*" className="w-full text-sm" />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input name="is_featured" type="checkbox" />
            {t("fieldFeatured")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="international_center" type="checkbox" />
            {t("fieldInternational")}
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("create")}
          </button>
          <a
            href={`/${locale}/admin/hospitals`}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t("cancel")}
          </a>
        </div>
      </form>
    </div>
  );
}
