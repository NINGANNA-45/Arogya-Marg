import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: patientId } = await params;
  const body = await req.json();
  const now = new Date().toISOString();

  const { data: patient } = await supabaseAdmin
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single();

  if (!patient) return notFound("Patient not found");

  const { data, error } = await supabaseAdmin
    .from("encounters")
    .insert({
      id: crypto.randomUUID(),
      patient_id: patientId,
      facility_id: body.facility_id ?? null,
      doctor_id: user.id,
      encounter_type: body.encounter_type,
      chief_complaint: body.chief_complaint,
      diagnosis: body.diagnosis ?? null,
      treatment_notes: body.treatment_notes ?? null,
      encounter_date: now,
      created_at: now,
    })
    .select("*")
    .single();

  if (error || !data) {
    return Response.json({ detail: error?.message }, { status: 500 });
  }
  return Response.json(data, { status: 201 });
}
