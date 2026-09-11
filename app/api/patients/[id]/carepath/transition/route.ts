import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";
import type { CarePathState } from "@/types/db";

const NBA_MAP: Record<CarePathState, string> = {
  IDENTIFIED: "Complete triage assessment",
  TRIAGED: "Schedule PHC consultation",
  CONSULTATION_PENDING: "Complete PHC consultation",
  CONSULTED: "Create referral if required",
  REFERRAL_CREATED: "Await facility acceptance",
  FACILITY_ACCEPTED: "Arrange patient transport",
  EN_ROUTE: "Confirm patient arrival at destination",
  ARRIVED: "Initiate treatment protocol",
  TREATED: "Create discharge and reverse referral",
  BACK_REFERRED: "Schedule ASHA follow-up",
  FOLLOW_UP_DUE: "Complete ASHA follow-up visit",
  CLOSED: "Care journey complete",
  STUCK: "Review patient status",
  NO_SHOW: "Follow up on missed appointment",
  ESCALATED: "Escalate to senior staff",
  FACILITY_UNAVAILABLE: "Find alternative facility",
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: patientId } = await params;
  const body = await req.json();
  const { to_state, event_type, description, metadata } = body as {
    to_state: CarePathState;
    event_type: string;
    description?: string;
    metadata?: Record<string, unknown>;
  };

  const now = new Date().toISOString();

  // Get carepath
  const { data: cp, error: cpErr } = await supabaseAdmin
    .from("care_paths")
    .select("*")
    .eq("patient_id", patientId)
    .single();

  if (cpErr || !cp) return notFound("CarePath not found");

  const oldState = cp.current_state as CarePathState;
  const isClosed = to_state === "CLOSED";

  // Update carepath
  await supabaseAdmin
    .from("care_paths")
    .update({
      current_state: to_state,
      next_best_action: NBA_MAP[to_state] ?? "Review patient status",
      updated_at: now,
      ...(isClosed ? { is_active: false, closed_at: now } : {}),
    })
    .eq("id", cp.id);

  // Update patient
  await supabaseAdmin
    .from("patients")
    .update({ current_state: to_state, updated_at: now })
    .eq("id", patientId);

  // Insert carepath event
  await supabaseAdmin.from("carepath_events").insert({
    id: crypto.randomUUID(),
    carepath_id: cp.id,
    from_state: oldState,
    to_state,
    event_type,
    description: description ?? null,
    performed_by: user.id,
    event_metadata: metadata ?? {},
    created_at: now,
  });

  // Audit
  await supabaseAdmin.from("audit_events").insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    patient_id: patientId,
    event_type,
    entity_type: "CarePath",
    entity_id: cp.id,
    description: `State transition: ${oldState} → ${to_state}`,
    old_value: { state: oldState },
    new_value: { state: to_state },
    created_at: now,
  });

  // Fetch updated carepath with events
  const { data: updated } = await supabaseAdmin
    .from("care_paths")
    .select("*, events:carepath_events(*)")
    .eq("id", cp.id)
    .single();

  return Response.json(updated);
}
