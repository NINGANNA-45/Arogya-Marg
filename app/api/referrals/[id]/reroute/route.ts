import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

function genReferralCode(count: number) {
  return `REF-2026-${String(count).padStart(5, "0")}`;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: referralId } = await params;
  const body = await req.json();
  const { new_destination_facility_id, reason } = body;
  const now = new Date().toISOString();

  const { data: ref } = await supabaseAdmin.from("referrals").select("*").eq("id", referralId).single();
  if (!ref) return notFound("Referral not found");

  const { data: newDest } = await supabaseAdmin.from("facilities").select("id,name").eq("id", new_destination_facility_id).single();
  if (!newDest) return notFound("New facility not found");

  // Mark current as rerouted
  await supabaseAdmin.from("referrals").update({ status: "REROUTED", is_rerouted: true }).eq("id", referralId);

  // Count for code
  const { count } = await supabaseAdmin.from("referrals").select("*", { count: "exact", head: true });
  const next = (count ?? 0) + 1;
  const newRefId = crypto.randomUUID();

  const { data: newRef, error } = await supabaseAdmin
    .from("referrals")
    .insert({
      id: newRefId,
      referral_code: genReferralCode(next),
      patient_id: ref.patient_id,
      origin_facility_id: ref.origin_facility_id,
      destination_facility_id: new_destination_facility_id,
      referred_by: user.id,
      status: "PENDING",
      urgency: ref.urgency,
      reason: `REROUTED: ${reason}`,
      clinical_notes: ref.clinical_notes,
      required_specialty: ref.required_specialty,
      previous_referral_id: referralId,
      expected_arrival: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      is_rerouted: false,
      created_at: now,
    })
    .select("*")
    .single();

  if (error || !newRef) return Response.json({ detail: error?.message }, { status: 500 });

  // Task + audit
  await supabaseAdmin.from("care_tasks").insert({
    id: crypto.randomUUID(),
    patient_id: ref.patient_id,
    assigned_to: user.id,
    title: `Confirm rerouted referral acceptance — ${newDest.name}`,
    task_type: "REFERRAL_REROUTE_CONFIRM",
    status: "OPEN",
    priority: "URGENT",
    due_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    related_referral_id: newRefId,
    created_at: now,
  });

  await supabaseAdmin.from("audit_events").insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    patient_id: ref.patient_id,
    event_type: "REFERRAL_REROUTED",
    entity_type: "Referral",
    entity_id: referralId,
    description: `Rerouted to ${newDest.name}: ${reason}`,
    created_at: now,
  });

  return Response.json(newRef);
}
