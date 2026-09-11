import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const { data: f, error } = await supabaseAdmin
    .from("facilities").select("*").eq("id", id).single();

  if (error || !f) return notFound("Facility not found");

  const availableBeds = f.total_beds - f.occupied_beds;
  const availableIcu = f.icu_beds - f.icu_occupied;
  const occupancy = f.total_beds > 0 ? (f.occupied_beds / f.total_beds) * 100 : 0;

  return Response.json({
    facility_id: id,
    readiness_score: f.readiness_score,
    status: f.status,
    available_beds: availableBeds,
    available_icu: availableIcu,
    occupancy_pct: Math.round(occupancy * 10) / 10,
    oxygen: f.oxygen_available,
    blood_bank: f.blood_bank,
    diagnostics: f.diagnostics ?? [],
    specialists: f.specialists ?? [],
  });
}
