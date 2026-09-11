import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { data, error } = await supabaseAdmin
    .from("simulation_scenarios")
    .select("*");

  if (error) return Response.json({ detail: error.message }, { status: 500 });
  return Response.json(data ?? []);
}
