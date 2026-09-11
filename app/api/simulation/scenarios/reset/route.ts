import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  // Reset all active simulations
  await supabaseAdmin
    .from("simulation_scenarios")
    .update({ is_active: false, activated_at: null })
    .eq("is_active", true);

  // Reset Wagholi to READY
  await supabaseAdmin
    .from("facilities")
    .update({
      status: "READY",
      icu_beds: 4,
      icu_occupied: 2,
      oxygen_available: true,
      readiness_score: 78,
    })
    .eq("id", "fac-003");

  return Response.json({ message: "All simulations reset" });
}
