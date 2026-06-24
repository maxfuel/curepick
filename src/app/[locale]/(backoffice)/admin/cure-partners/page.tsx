import { createClient } from "@/lib/supabase/server";
import CurePartnersClient from "./CurePartnersClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminCurePartnersPage({ params }: Props) {
  await params;
  const supabase = await createClient();

  const { data: curePartners } = await supabase
    .from("cure_partners")
    .select("id, full_name, languages, specialty_areas, service_regions, status, vip_level, contact_whatsapp, nationality, base_country, created_at, profiles(email)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Cure Partners</h1>
      <CurePartnersClient initialCurePartners={curePartners ?? []} />
    </div>
  );
}
