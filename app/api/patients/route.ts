import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import type { RiskEnum, CarePathState, GenderEnum } from "@/types/db";

// ─── NBA map ──────────────────────────────────────────────────────────────────
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

function genPatientId(count: number) {
  return `AM-PAT-2026-${String(count).padStart(5, "0")}`;
}
function genCareId(count: number) {
  return `CARE-2026-${String(count).padStart(5, "0")}`;
}

// ─── GET /api/patients ────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const risk = searchParams.get("risk");
  const state = searchParams.get("state");
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabaseAdmin
    .from("patients")
    .select("id,patient_id,care_id,name,age,gender,village,risk_level,current_state,is_pregnant,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(skip, skip + limit - 1);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,patient_id.ilike.%${search}%,village.ilike.%${search}%`
    );
  }
  if (risk) query = query.eq("risk_level", risk as RiskEnum);
  if (state) query = query.eq("current_state", state as CarePathState);

  const { data, error } = await query;
  if (error) return Response.json({ detail: error.message }, { status: 500 });
  return Response.json(data);
}

// ─── POST /api/patients ───────────────────────────────────────────────────────
export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const body = await req.json();

  // Count existing patients to generate IDs
  const { count } = await supabaseAdmin
    .from("patients")
    .select("*", { count: "exact", head: true });
  const next = (count ?? 0) + 1;

  const patientId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Insert patient
  const { data: patient, error: pErr } = await supabaseAdmin
    .from("patients")
    .insert({
      id: patientId,
      patient_id: genPatientId(next),
      care_id: genCareId(next),
      name: body.name,
      age: body.age,
      gender: body.gender as GenderEnum,
      phone: body.phone ?? null,
      village: body.village,
      district: "Pune",
      household_id: body.household_id ?? null,
      asha_id: user.role === "ASHA" ? user.id : null,
      known_conditions: body.known_conditions ?? [],
      is_pregnant: body.is_pregnant ?? false,
      trimester: body.trimester ?? null,
      medications: body.medications ?? [],
      allergies: body.allergies ?? [],
      prev_hospitalization: body.prev_hospitalization ?? false,
      risk_level: body.risk_level ?? "LOW",
      risk_factors: body.risk_factors ?? [],
      current_state: "IDENTIFIED",
      consent_given: body.consent_given ?? false,
      consent_date: body.consent_given ? now : null,
      is_active: true,
      created_at: now,
    })
    .select("*")
    .single();

  if (pErr || !patient) {
    return Response.json({ detail: pErr?.message ?? "Failed to create patient" }, { status: 500 });
  }

  // Insert initial observation if vitals provided
  if (body.temperature || body.pulse || body.spo2) {
    await supabaseAdmin.from("observations").insert({
      id: crypto.randomUUID(),
      patient_id: patientId,
      temperature: body.temperature ?? null,
      pulse: body.pulse ?? null,
      resp_rate: body.resp_rate ?? null,
      spo2: body.spo2 ?? null,
      bp_systolic: body.bp_systolic ?? null,
      bp_diastolic: body.bp_diastolic ?? null,
      weight: body.weight ?? null,
      symptoms: body.symptoms ?? [],
      risk_indicators: [],
      recorded_by: user.id,
      recorded_at: now,
    });
  }

  // Create CarePath
  const carePathId = crypto.randomUUID();
  await supabaseAdmin.from("care_paths").insert({
    id: carePathId,
    patient_id: patientId,
    current_state: "IDENTIFIED",
    next_best_action: NBA_MAP["IDENTIFIED"],
    responsible_user_id: user.id,
    is_active: true,
    started_at: now,
  });

  // Initial CarePath event
  await supabaseAdmin.from("carepath_events").insert({
    id: crypto.randomUUID(),
    carepath_id: carePathId,
    from_state: null,
    to_state: "IDENTIFIED",
    event_type: "PATIENT_CREATED",
    description: `Patient registered by ${user.name}`,
    performed_by: user.id,
    event_metadata: {},
    created_at: now,
  });

  // Audit
  await supabaseAdmin.from("audit_events").insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    patient_id: patientId,
    event_type: "PATIENT_CREATED",
    entity_type: "Patient",
    entity_id: patientId,
    description: `Patient ${body.name} created`,
    created_at: now,
  });

  return Response.json(patient, { status: 201 });
}
