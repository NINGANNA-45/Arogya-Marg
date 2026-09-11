import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: followupId } = await params;
  const body = await req.json();

  const now = new Date().toISOString();
  const updateData: Record<string, any> = {
    status: "COMPLETED",
    completed_at: now,
  };

  if ("notes" in body) updateData.notes = body.notes;
  if ("vitals" in body) updateData.vitals = body.vitals;
  if ("medication_adherence" in body) updateData.medication_adherence = body.medication_adherence;
  if ("recovery_status" in body) updateData.recovery_status = body.recovery_status;

  const { data, error } = await supabaseAdmin
    .from("follow_ups")
    .update(updateData)
    .eq("id", followupId)
    .select()
    .single();

  if (error || !data) {
    return notFound("Follow-up not found");
  }

  return Response.json(data);
}
