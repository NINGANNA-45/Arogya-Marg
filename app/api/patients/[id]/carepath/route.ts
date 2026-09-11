import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: patientId } = await params;

  const { data: cp, error } = await supabaseAdmin
    .from("care_paths")
    .select("*, events:carepath_events(*)")
    .eq("patient_id", patientId)
    .single();

  if (error || !cp) return notFound("CarePath not found");
  return Response.json(cp);
}
