import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: referralId } = await params;
  const now = new Date().toISOString();

  const { data: ref } = await supabaseAdmin.from("referrals").select("*").eq("id", referralId).single();
  if (!ref) return notFound("Referral not found");

  await supabaseAdmin.from("referrals").update({ status: "ARRIVED", arrived_at: now }).eq("id", referralId);

  const { data: cp } = await supabaseAdmin.from("care_paths").select("id,current_state").eq("patient_id", ref.patient_id).single();
  if (cp) {
    const old = cp.current_state;
    await supabaseAdmin.from("care_paths").update({ current_state: "ARRIVED", next_best_action: "Initiate treatment protocol", updated_at: now }).eq("id", cp.id);
    await supabaseAdmin.from("patients").update({ current_state: "ARRIVED", current_facility_id: ref.destination_facility_id, updated_at: now }).eq("id", ref.patient_id);
    await supabaseAdmin.from("carepath_events").insert({
      id: crypto.randomUUID(), carepath_id: cp.id, from_state: old, to_state: "ARRIVED",
      event_type: "PATIENT_ARRIVED", description: "Patient arrived at destination facility",
      performed_by: user.id, event_metadata: {}, created_at: now,
    });
  }

  const { data: updated } = await supabaseAdmin.from("referrals").select("*").eq("id", referralId).single();
  return Response.json(updated);
}
