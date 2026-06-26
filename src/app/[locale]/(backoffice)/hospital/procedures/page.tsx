import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedField } from "@/lib/utils/i18n-field";
import { deleteHospitalProcedure } from "@/lib/actions/hospital-procedures";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Json } from "@/lib/types/database";

export default async function HospitalProceduresPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: hospitalProcedures } = await (supabase
    .from("hospital_procedures") as any)
    .select("id, cost_min, cost_max, cost_currency, name, procedures(name)")
    .eq("hospital_id", profile!.hospital_id!)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">시술 정보</h1>
        <Link href="/hospital/procedures/new" className={buttonVariants()}>
          + 당사시술 추가
        </Link>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">시술명</th>
              <th className="text-left px-4 py-3 font-medium">가격 범위</th>
              <th className="text-right px-4 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {hospitalProcedures && hospitalProcedures.length > 0 ? (
              hospitalProcedures.map((hp: any) => {
                const customName = hp.name
                  ? (getLocalizedField(hp.name as Json, "ko") || getLocalizedField(hp.name as Json, "en"))
                  : null;
                const globalName = hp.procedures?.name
                  ? (getLocalizedField(hp.procedures.name as Json, "ko") || getLocalizedField(hp.procedures.name as Json, "en"))
                  : "—";
                const displayName = customName || globalName;
                const costStr =
                  hp.cost_min != null && hp.cost_max != null
                    ? `${hp.cost_currency ?? "KRW"} ${Number(hp.cost_min).toLocaleString()} – ${Number(hp.cost_max).toLocaleString()}`
                    : "—";

                return (
                  <tr key={hp.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{displayName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{costStr}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/hospital/procedures/${hp.id}/edit`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          수정
                        </Link>
                        <form action={deleteHospitalProcedure}>
                          <input type="hidden" name="id" value={hp.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            삭제
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  등록된 당사시술이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
