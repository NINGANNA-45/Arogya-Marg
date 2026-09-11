import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import type { FacilityType, FacilityStatus } from "@/types/db";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  let query = supabaseAdmin.from("facilities").select("*").eq("is_active", true);

  if (type) query = query.eq("type", type as FacilityType);
  if (status) query = query.eq("status", status as FacilityStatus);

  const { data, error } = await query;
  if (error) return Response.json({ detail: error.message }, { status: 500 });
  return Response.json(data);
}
