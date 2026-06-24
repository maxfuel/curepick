"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-user";

const STATUS_TIMESTAMPS: Record<string, string> = {
  arrived: "arrived_at",
  in_treatment: "in_treatment_at",
  completed: "completed_at",
};

const VALID_NEXT: Record<string, string> = {
  confirmed: "arrived",
  arrived: "in_treatment",
  in_treatment: "completed",
};

async function getCurePartner() {
  const profile = await getProfile();
  if (!profile || profile.role !== "cure_partner") throw new Error("Forbidden");
  const supabase = await createClient();
  const { data: cp } = await supabase
    .from("cure_partners")
    .select("id")
    .eq("profile_id", profile.id)
    .single();
  if (!cp) throw new Error("Cure Partner record not found");
  return { profile, cp, supabase };
}

export async function updateCaseStatus(caseId: string, newStatus: string) {
  const { cp, supabase } = await getCurePartner();

  const { data: existing } = await supabase
    .from("cases")
    .select("id, status")
    .eq("id", caseId)
    .eq("cure_partner_id", cp.id)
    .single();

  if (!existing) throw new Error("Case not found or not assigned to you");

  const expectedNext = VALID_NEXT[existing.status ?? ""];
  if (expectedNext !== newStatus) throw new Error(`Invalid status transition: ${existing.status} → ${newStatus}`);

  const now = new Date().toISOString();
  const tsField = STATUS_TIMESTAMPS[newStatus];

  const { error } = await supabase
    .from("cases")
    .update({
      status: newStatus,
      ...(tsField ? { [tsField]: now } : {}),
    })
    .eq("id", caseId);

  if (error) throw new Error(error.message);
  revalidatePath(`/cure-partner/cases/${caseId}`);
}

export async function updateChecklist(caseId: string, checklist: Record<string, boolean>) {
  const { cp, supabase } = await getCurePartner();

  const { error } = await supabase
    .from("cases")
    .update({ checklist })
    .eq("id", caseId)
    .eq("cure_partner_id", cp.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/cure-partner/cases/${caseId}`);
}

export async function addCaseNote(caseId: string, content: string) {
  const { profile, cp, supabase } = await getCurePartner();

  const { data: caseRow } = await supabase
    .from("cases")
    .select("id")
    .eq("id", caseId)
    .eq("cure_partner_id", cp.id)
    .single();

  if (!caseRow) throw new Error("Case not found or not assigned to you");

  const { error } = await supabase.from("case_notes").insert({
    case_id: caseId,
    author_id: profile.id,
    content: content.trim(),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/cure-partner/cases/${caseId}`);
}

export async function completeCaseWithCommission(caseId: string) {
  const { cp, supabase } = await getCurePartner();

  const { data: caseRow } = await supabase
    .from("cases")
    .select("id, status, agent_id, agents(commission_rate)")
    .eq("id", caseId)
    .eq("cure_partner_id", cp.id)
    .single();

  if (!caseRow) throw new Error("Case not found or not assigned to you");
  if (caseRow.status !== "in_treatment") throw new Error("Case must be in_treatment to complete");

  const now = new Date().toISOString();
  const { error: caseError } = await supabase
    .from("cases")
    .update({ status: "completed", completed_at: now })
    .eq("id", caseId);

  if (caseError) throw new Error(caseError.message);

  const agentData = caseRow.agents as { commission_rate: number | null } | null;
  const rate = agentData?.commission_rate ?? 10;
  const amount = rate;

  await supabase.from("commissions").insert({
    case_id: caseId,
    agent_id: caseRow.agent_id,
    amount,
    currency: "USD",
    status: "pending",
  });

  revalidatePath(`/cure-partner/cases/${caseId}`);
}
