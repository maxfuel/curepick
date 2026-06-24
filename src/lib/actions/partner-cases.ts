"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";

async function getAgent() {
  const profile = await getProfile();
  if (!profile || profile.role !== "local_agent") throw new Error("Forbidden");
  const supabase = await createClient();
  const { data: agent } = await supabase
    .from("agents")
    .select("id, commission_rate")
    .eq("profile_id", profile.id)
    .single();
  if (!agent) throw new Error("Agent record not found");
  return { profile, agent, supabase };
}

export async function createCase(formData: FormData) {
  const { agent, supabase } = await getAgent();

  const patient_name = String(formData.get("patient_name") ?? "").trim();
  const patient_email = String(formData.get("patient_email") ?? "").trim();
  const patient_phone = (formData.get("patient_phone") as string) || null;
  const patient_nationality = (formData.get("patient_nationality") as string) || null;
  const hospital_id = String(formData.get("hospital_id") ?? "");
  const service_id = (formData.get("service_id") as string) || null;
  const procedure_id = (formData.get("procedure_id") as string) || null;

  if (!patient_name || !patient_email || !hospital_id) {
    throw new Error("patient_name, patient_email, hospital_id are required");
  }

  const { error } = await supabase.from("cases").insert({
    agent_id: agent.id,
    hospital_id,
    patient_name,
    patient_email,
    patient_phone,
    patient_nationality,
    service_id,
    procedure_id,
    source: "agent",
    status: "lead",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/partner/cases");
}
