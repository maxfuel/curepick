import { createClient } from "@/lib/supabase/server";

export default async function AdminMembersPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("id, email, full_name, nationality, phone, created_at")
    .eq("role", "patient")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">회원 관리</h1>
        <span className="text-sm text-muted-foreground">
          총 {members?.length ?? 0}명
        </span>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">이름</th>
              <th className="text-left px-4 py-3 font-medium">이메일</th>
              <th className="text-left px-4 py-3 font-medium">국적</th>
              <th className="text-left px-4 py-3 font-medium">전화번호</th>
              <th className="text-left px-4 py-3 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody>
            {members && members.length > 0 ? (
              members.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{m.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.nationality ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(m.created_at!).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  등록된 회원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
