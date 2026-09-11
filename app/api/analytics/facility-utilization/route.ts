import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { data: facilities, error } = await supabaseAdmin
    .from("facilities")
    .select("id,name,type,total_beds,occupied_beds,readiness_score,status")
    .eq("is_active", true);

  if (error) return Response.json({ detail: error.message }, { status: 500 });

  return Response.json(
    (facilities ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      total_beds: f.total_beds,
      occupied_beds: f.occupied_beds,
      occupancy_pct:
        Math.round(f.total_beds > 0 ? (f.occupied_beds / f.total_beds) * 1000 : 0) / 10,
      readiness_score: f.readiness_score,
      status: f.status,
    }))
  );
}
