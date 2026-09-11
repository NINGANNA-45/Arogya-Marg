import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: notifId } = await params;

  await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notifId)
    .eq("user_id", user.id);

  return Response.json({ status: "ok" });
}
