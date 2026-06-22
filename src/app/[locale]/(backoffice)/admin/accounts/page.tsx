import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { AccountsClient } from "./AccountsClient";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string }>;
}

export interface AccountRow {
  id: string;
  email: string | null;
  full_name: string | null;
  hospital_id: string | null;
  created_at: string | null;
  hospitals: { name: Json } | null;
}

export interface HospitalOption {
  id: string;
  name: Json;
}

export default async function AdminAccountsPage({ params }: Props) {
  await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.accounts");

  const [{ data: accounts }, { data: hospitals }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, hospital_id, created_at, hospitals(name)")
      .eq("role", "hospital_staff")
      .order("created_at", { ascending: false }),
    supabase.from("hospitals").select("id, name").order("name->en"),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>
      <AccountsClient
        initialAccounts={(accounts as unknown as AccountRow[]) ?? []}
        hospitals={(hospitals as HospitalOption[]) ?? []}
      />
    </div>
  );
}
