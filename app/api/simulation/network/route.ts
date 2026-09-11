import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const [
    { data: facilities },
    { data: ambulances },
    { data: referrals },
    { data: patients },
  ] = await Promise.all([
    supabaseAdmin.from("facilities").select("*").eq("is_active", true),
    supabaseAdmin.from("ambulances").select("*").eq("is_active", true),
    supabaseAdmin
      .from("referrals")
      .select("*")
      .in("status", ["PENDING", "ACCEPTED", "EN_ROUTE"])
      .limit(20),
    supabaseAdmin
      .from("patients")
      .select("id,name,risk_level,current_state,village")
      .in("risk_level", ["HIGH", "CRITICAL"])
      .eq("is_active", true)
      .limit(10),
  ]);

  return Response.json({
    facilities: facilities ?? [],
    ambulances: ambulances ?? [],
    referrals: referrals ?? [],
    high_risk_patients: (patients ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      risk_level: p.risk_level,
      current_state: p.current_state,
      village: p.village,
    })),
  });
}
