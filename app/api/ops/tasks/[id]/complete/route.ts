import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: taskId } = await params;

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("care_tasks")
    .update({ status: "COMPLETED", completed_at: now })
    .eq("id", taskId)
    .select()
    .single();

  if (error || !data) {
    return notFound("Task not found");
  }

  return Response.json(data);
}
