import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";
import type { ReferralStatus, ReferralUrgency } from "@/types/db";

function genReferralCode(count: number) {
  return `REF-2026-${String(count).padStart(5, "0")}`;
}

// ─── GET /api/referrals ───────────────────────────────────────────────────────
export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const urgency = searchParams.get("urgency");
  const facilityId = searchParams.get("facility_id");
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabaseAdmin
    .from("referrals")
    .select("*")
    .order("created_at", { ascending: false })
    .range(skip, skip + limit - 1);

  if (status) query = query.eq("status", status as ReferralStatus);
  if (urgency) query = query.eq("urgency", urgency as ReferralUrgency);
  if (facilityId) {
    query = query.or(
      `destination_facility_id.eq.${facilityId},origin_facility_id.eq.${facilityId}`
    );
  }

  const { data, error } = await query;
  if (error) return Response.json({ detail: error.message }, { status: 500 });
  return Response.json(data);
}

// ─── POST /api/referrals ──────────────────────────────────────────────────────
export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const now = new Date().toISOString();
  const expectedArrival = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  // Check patient exists
  const { data: patient } = await supabaseAdmin
    .from("patients")
    .select("id")
    .eq("id", body.patient_id)
    .single();
  if (!patient) return notFound("Patient not found");

  // Check destination facility
  const { data: dest } = await supabaseAdmin
    .from("facilities")
    .select("id,name")
    .eq("id", body.destination_facility_id)
    .single();
  if (!dest) return notFound("Destination facility not found");

  // Count for code generation
  const { count } = await supabaseAdmin
    .from("referrals")
    .select("*", { count: "exact", head: true });
  const next = (count ?? 0) + 1;

  const referralId = crypto.randomUUID();

  const { data: ref, error } = await supabaseAdmin
    .from("referrals")
    .insert({
      id: referralId,
      referral_code: genReferralCode(next),
      patient_id: body.patient_id,
      origin_facility_id: body.origin_facility_id ?? null,
      destination_facility_id: body.destination_facility_id,
      referred_by: user.id,
      status: "PENDING",
      urgency: body.urgency ?? "ROUTINE",
      reason: body.reason,
      clinical_notes: body.clinical_notes ?? null,
      required_specialty: body.required_specialty ?? null,
      expected_arrival: expectedArrival,
      is_rerouted: false,
      created_at: now,
    })
    .select("*")
    .single();

  if (error || !ref) {
    return Response.json({ detail: error?.message }, { status: 500 });
  }

  // Transition CarePath
  const { data: cp } = await supabaseAdmin
    .from("care_paths")
    .select("id,current_state")
    .eq("patient_id", body.patient_id)
    .single();

  if (cp) {
    const oldState = cp.current_state;
    await supabaseAdmin
      .from("care_paths")
      .update({ current_state: "REFERRAL_CREATED", next_best_action: "Await facility acceptance", updated_at: now })
      .eq("id", cp.id);

    await supabaseAdmin.from("patients").update({ current_state: "REFERRAL_CREATED", updated_at: now }).eq("id", body.patient_id);

    await supabaseAdmin.from("carepath_events").insert({
      id: crypto.randomUUID(),
      carepath_id: cp.id,
      from_state: oldState,
      to_state: "REFERRAL_CREATED",
      event_type: "REFERRAL_CREATED",
      description: `Referral to ${dest.name} created`,
      performed_by: user.id,
      event_metadata: {},
      created_at: now,
    });
  }

  // Create task
  await supabaseAdmin.from("care_tasks").insert({
    id: crypto.randomUUID(),
    patient_id: body.patient_id,
    assigned_to: user.id,
    title: `Confirm referral acceptance from ${dest.name}`,
    task_type: "REFERRAL_CONFIRM",
    status: "OPEN",
    priority: "HIGH",
    due_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    created_at: now,
  });

  // Audit
  await supabaseAdmin.from("audit_events").insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    patient_id: body.patient_id,
    event_type: "REFERRAL_CREATED",
    entity_type: "Referral",
    description: `Referral created to ${dest.name}`,
    created_at: now,
  });

  return Response.json(ref, { status: 201 });
}
