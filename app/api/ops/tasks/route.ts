import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let query = supabaseAdmin
    .from("care_tasks")
    .select("*")
    .eq("assigned_to", user.id)
    .order("due_at", { ascending: true })
    .limit(50);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return Response.json({ detail: error.message }, { status: 500 });
  }

  return Response.json(data || []);
}
