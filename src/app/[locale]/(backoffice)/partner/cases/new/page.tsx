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

  const [{ data: hospitals }, { data: services }] = await Promise.all([
    supabase.from("hospitals").select("id, name").order("name->en"),
    supabase.from("services").select("id, name").order("name->en"),
  ]);

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Register New Case</h1>
      <NewCaseForm
        locale={locale}
        hospitals={(hospitals ?? []).map((h) => ({ id: h.id, name: getEn(h.name) }))}
        services={(services ?? []).map((s) => ({ id: s.id, name: getEn(s.name) }))}
      />
    </div>
  );
}
