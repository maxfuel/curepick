import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createService } from "@/lib/actions/admin-services";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import { SaveForm } from "@/components/ui/SaveForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewServicePage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.services");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order");

  async function handleCreate(formData: FormData) {
    "use server";
    await createService(formData);
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}/admin/services`} className="hover:underline">
          {t("title")}
        </Link>
        <span>/</span>
        <span>{t("newService")}</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6">{t("newService")}</h1>

      <SaveForm action={handleCreate} cancelHref={`/${locale}/admin/services`} saveLabel={t("save")} cancelLabel={t("cancel")} className="space-y-4">
        <MultilingualInput name="name" label={t("fieldName")} />
        <div>
          <label className="text-sm font-medium">{t("fieldSlug")}</label>
          <input
            name="slug"
            placeholder="auto-generated from EN name if empty"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <MultilingualInput name="description" label={t("fieldDescription")} multiline />
        <MultilingualInput name="overview" label={t("fieldOverview")} multiline />
        <div>
          <label className="text-sm font-medium">{t("fieldCategory")}</label>
          <select
            name="category_id"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("noCategory")}</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {typeof cat.name === "object" && cat.name !== null
                  ? ((cat.name as Record<string, unknown>).en as string)
                  : String(cat.name)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">노출 순서</label>
          <input
            type="number"
            name="sort_order"
            defaultValue={0}
            min={0}
            className="mt-1 w-24 rounded-md border bg-background px-3 py-2 text-sm block"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" value="on" />
          {t("fieldFeatured")}
        </label>
      </SaveForm>
    </div>
  );
}
