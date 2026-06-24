import { createClient } from "@/lib/supabase/server";
import CommissionFilters from "./CommissionFilters";
import MarkPaidButton from "./MarkPaidButton";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}

const PAGE_SIZE = 30;

export default async function AdminCommissionsPage({ params, searchParams }: Props) {
  await params;
  const sp = await searchParams;
  const statusFilter = sp.status ?? "";
  const page = Math.max(1, Number(sp.page ?? "1"));

  const supabase = await createClient();

  let query = supabase
    .from("commissions")
    .select(
      "id, amount, currency, status, paid_at, created_at, cases(patient_name), agents(company_name, profiles(email, full_name))",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: commissions, count } = await query;

  const pendingTotal = (commissions ?? [])
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + (c.amount ?? 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Commissions</h1>
        <div className="text-right text-sm">
          <div className="text-muted-foreground">Pending on this page</div>
          <div className="font-semibold text-lg">USD {pendingTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="mb-4">
        <CommissionFilters currentStatus={statusFilter} />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Agent</th>
              <th className="text-left px-4 py-3 font-medium">Patient</th>
              <th className="text-left px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
              <th className="text-left px-4 py-3 font-medium">Paid At</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(commissions ?? []).length > 0 ? (commissions ?? []).map((c) => {
              const agent = c.agents as { company_name: string | null; profiles: { email: string | null; full_name: string | null } | null } | null;
              const caseInfo = c.cases as { patient_name: string } | null;
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>{agent?.profiles?.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{agent?.company_name ?? agent?.profiles?.email ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{caseInfo?.patient_name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">{c.amount} {c.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.paid_at ? new Date(c.paid_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.status === "pending" && <MarkPaidButton commissionId={c.id} />}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No commissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{count ?? 0} total records</p>
    </div>
  );
}
