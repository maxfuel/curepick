import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  updateService,
  createProcedure,
  deleteProcedure,
  createFaq,
  deleteFaq,
} from "@/lib/actions/admin-services";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

function asMultilingual(val: Json | null | undefined) {
  if (!val || typeof val !== "object" || Array.isArray(val)) {
    return { en: "", ko: "", zh: "", ja: "" };
  }
  const o = val as Record<string, unknown>;
  return {
    en: (o.en as string) ?? "",
    ko: (o.ko as string) ?? "",
    zh: (o.zh as string) ?? "",
    ja: (o.ja as string) ?? "",
  };
}

export default async function EditServicePage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.services");

  const [{ data: service }, { data: categories }, { data: procedures }, { data: faqs }] =
    await Promise.all([
      supabase.from("services").select("*").eq("id", id).single(),
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase.from("procedures").select("*").eq("service_id", id).order("sort_order"),
      supabase.from("faqs").select("*").eq("service_id", id).order("sort_order"),
    ]);

  if (!service) notFound();

  const updateAction = updateService.bind(null, id);

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}/admin/services`} className="hover:underline">
          {t("title")}
        </Link>
        <span>/</span>
        <span className="truncate max-w-xs">{getEn(service.name)}</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6">{t("editService")}</h1>

      <form action={updateAction} className="space-y-4 mb-10">
        <MultilingualInput name="name" label={t("fieldName")} value={asMultilingual(service.name)} />
        <div>
          <label className="text-sm font-medium">{t("fieldSlug")}</label>
          <input
            name="slug"
            defaultValue={service.slug}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <MultilingualInput
          name="description"
          label={t("fieldDescription")}
          value={asMultilingual(service.description)}
          multiline
        />
        <MultilingualInput
          name="overview"
          label={t("fieldOverview")}
          value={asMultilingual(service.overview)}
          multiline
        />
        <div>
          <label className="text-sm font-medium">{t("fieldCategory")}</label>
          <select
            name="category_id"
            defaultValue={service.category_id ?? ""}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("noCategory")}</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getEn(cat.name)}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={service.is_featured ?? false}
          />
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

      {/* Procedures section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">{t("procedures")}</h2>
        <div className="rounded-lg border overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2 font-medium">{t("colName")}</th>
                <th className="text-left px-4 py-2 font-medium">{t("colSlug")}</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {procedures && procedures.length > 0 ? (
                procedures.map((proc) => (
                  <tr key={proc.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{getEn(proc.name)}</td>
                    <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{proc.slug}</td>
                    <td className="px-4 py-2">
                      <form action={deleteProcedure.bind(null, proc.id)} className="inline">
                        <button type="submit" className="text-destructive text-xs hover:underline">
                          {t("delete")}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-muted-foreground text-xs">
                    {t("noProcedures")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <form action={createProcedure} className="space-y-2 rounded-lg border p-3 bg-muted/20">
          <input type="hidden" name="service_id" value={id} />
          <MultilingualInput name="name" label={t("procName")} />
          <input
            name="slug"
            placeholder="slug (auto)"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/70"
          >
            {t("addProcedure")}
          </button>
        </form>
      </section>

      {/* FAQs section */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t("faqs")}</h2>
        <div className="space-y-2 mb-4">
          {faqs && faqs.length > 0 ? (
            faqs.map((faq) => (
              <div key={faq.id} className="rounded-lg border p-3 flex justify-between gap-4">
                <div className="text-sm">
                  <p className="font-medium">{getEn(faq.question)}</p>
                  <p className="text-muted-foreground mt-1">{getEn(faq.answer)}</p>
                </div>
                <form action={deleteFaq.bind(null, faq.id)} className="shrink-0">
                  <button type="submit" className="text-destructive text-xs hover:underline">
                    {t("delete")}
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t("noFaqs")}</p>
          )}
        </div>
        <form action={createFaq} className="space-y-2 rounded-lg border p-3 bg-muted/20">
          <input type="hidden" name="service_id" value={id} />
          <MultilingualInput name="question" label={t("faqQuestion")} />
          <MultilingualInput name="answer" label={t("faqAnswer")} multiline />
          <button
            type="submit"
            className="rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/70"
          >
            {t("addFaq")}
          </button>
        </form>
      </section>
    </div>
  );
}
