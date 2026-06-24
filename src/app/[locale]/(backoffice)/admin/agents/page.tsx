import { createClient } from "@/lib/supabase/server";
import AgentsClient from "./AgentsClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminAgentsPage({ params }: Props) {
  await params;
  const supabase = await createClient();

  const { data: agents } = await supabase
    .from("agents")
    .select("id, company_name, country, commission_rate, status, created_at, profiles(email, full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Agents</h1>
      <AgentsClient initialAgents={agents ?? []} />
    </div>
  );
}
