import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createService } from "@/lib/actions/admin-services";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";

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

      <form action={handleCreate} className="space-y-4">
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" value="on" />
          {t("fieldFeatured")}
        </label>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("save")}
          </button>
          <Link
            href={`/${locale}/admin/services`}
            className="rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/70"
          >
            {t("cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
