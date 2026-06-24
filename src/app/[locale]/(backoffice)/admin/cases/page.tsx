import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CaseFilters from "./CaseFilters";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  arrived: "bg-orange-100 text-orange-700",
  in_treatment: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const PAGE_SIZE = 30;

export default async function AdminCasesPage({ params, searchParams }: Props) {
  await params;
  const sp = await searchParams;
  const statusFilter = sp.status ?? "";
  const page = Math.max(1, Number(sp.page ?? "1"));

  const supabase = await createClient();

  let query = supabase
    .from("cases")
    .select(
      "id, patient_name, patient_email, patient_nationality, status, created_at, hospitals(name), agents(company_name, profiles(email)), cure_partners(full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: cases, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Cases</h1>
        <span className="text-sm text-muted-foreground">{count ?? 0} total</span>
      </div>

      <div className="mb-4">
        <CaseFilters currentStatus={statusFilter} />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Patient</th>
              <th className="text-left px-4 py-3 font-medium">Hospital</th>
              <th className="text-left px-4 py-3 font-medium">Agent</th>
              <th className="text-left px-4 py-3 font-medium">Cure Partner</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(cases ?? []).length > 0 ? (
              (cases ?? []).map((c) => {
                const hospital = c.hospitals as { name: Record<string, string> } | null;
                const agent = c.agents as { company_name: string | null; profiles: { email: string | null } | null } | null;
                const cp = c.cure_partners as { full_name: string | null } | null;
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.patient_name}</div>
                      <div className="text-xs text-muted-foreground">{c.patient_email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {hospital?.name?.en ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {agent?.company_name ?? agent?.profiles?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cp?.full_name ?? <span className="italic text-xs">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status ?? "lead"] ?? ""}`}>
                        {c.status ?? "lead"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`./cases/${c.id}`} className="text-primary text-xs hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No cases found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 text-sm">
          {page > 1 && (
            <Link href={`?status=${statusFilter}&page=${page - 1}`} className="px-3 py-1 rounded border hover:bg-muted">
              Previous
            </Link>
          )}
          <span className="text-muted-foreground">Page {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`?status=${statusFilter}&page=${page + 1}`} className="px-3 py-1 rounded border hover:bg-muted">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
