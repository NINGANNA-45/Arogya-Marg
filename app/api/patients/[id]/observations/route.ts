import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

// GET /api/patients/[id]/observations
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: patientId } = await params;

  const { data, error } = await supabaseAdmin
    .from("observations")
    .select("*")
    .eq("patient_id", patientId)
    .order("recorded_at", { ascending: false })
    .limit(20);

  if (error) return Response.json({ detail: error.message }, { status: 500 });
  return Response.json(data);
}

// POST /api/patients/[id]/observations
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: patientId } = await params;
  const body = await req.json();
  const now = new Date().toISOString();

  // Verify patient exists
  const { data: patient } = await supabaseAdmin
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single();

  if (!patient) return notFound("Patient not found");

  const { data, error } = await supabaseAdmin
    .from("observations")
    .insert({
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
      risk_indicators: body.risk_indicators ?? [],
      recorded_by: user.id,
      recorded_at: now,
    })
    .select("*")
    .single();

  if (error || !data) {
    return Response.json({ detail: error?.message }, { status: 500 });
  }
  return Response.json(data, { status: 201 });
}
