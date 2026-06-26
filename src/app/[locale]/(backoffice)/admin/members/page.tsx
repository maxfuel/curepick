import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { MembersClient } from "./MembersClient";

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const locale = await getLocale();

  const [{ data: members }, { data: hospitals }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, role, hospital_id, created_at, hospitals(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("hospitals")
      .select("id, name")
      .order("name"),
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">회원 관리</h1>
        <span className="text-sm text-muted-foreground">
          총 {members?.length ?? 0}명
        </span>
      </div>
      <MembersClient
        members={(members ?? []) as Parameters<typeof MembersClient>[0]["members"]}
        hospitals={hospitals ?? []}
        locale={locale}
      />
    </div>
  );
}
