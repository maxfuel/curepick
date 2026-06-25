import { createClient } from "@/lib/supabase/server";
import NewCaseForm from "./NewCaseForm";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string }>;
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

export default async function NewCasePage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  const [{ data: hospitals }, { data: services }, { data: categories }] = await Promise.all([
    supabase.from("hospitals").select("id, name").order("name->en"),
    supabase.from("services").select("id, name, category_id").order("sort_order").order("name->en"),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);

  const serviceGroups = (categories ?? []).map((cat) => ({
    categoryId: cat.id,
    categoryLabel: getEn(cat.name),
    services: (services ?? [])
      .filter((s) => s.category_id === cat.id)
      .map((s) => ({ id: s.id, name: getEn(s.name) })),
  })).filter((g) => g.services.length > 0);

  const categorizedIds = new Set(serviceGroups.flatMap((g) => g.services.map((s) => s.id)));
  const uncategorized = (services ?? [])
    .filter((s) => !categorizedIds.has(s.id))
    .map((s) => ({ id: s.id, name: getEn(s.name) }));
  if (uncategorized.length > 0) {
    serviceGroups.push({ categoryId: "other", categoryLabel: "Other", services: uncategorized });
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Register New Case</h1>
      <NewCaseForm
        locale={locale}
        hospitals={(hospitals ?? []).map((h) => ({ id: h.id, name: getEn(h.name) }))}
        serviceGroups={serviceGroups}
      />
    </div>
  );
}
