import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";
import type { FacilityStatus } from "@/types/db";

// GET /api/facilities/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("facilities").select("*").eq("id", id).single();

  if (error || !data) return notFound("Facility not found");
  return Response.json(data);
}

// PATCH /api/facilities/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const body = await req.json();
  const now = new Date().toISOString();

  const { data: facility } = await supabaseAdmin
    .from("facilities").select("*").eq("id", id).single();
  if (!facility) return notFound("Facility not found");

  // Apply updates
  const updated = { ...facility, ...body };

  // Recalculate readiness score
  let score = 100;
  const status = (body.status ?? facility.status) as FacilityStatus;
  if (status === "LIMITED") score -= 30;
  else if (status === "CRITICAL") score -= 60;
  else if (status === "OFFLINE") score = 0;

  const oxygenAvailable = body.oxygen_available ?? facility.oxygen_available;
  if (!oxygenAvailable) score -= 20;

  const totalBeds = body.total_beds ?? facility.total_beds;
  const occupiedBeds = body.occupied_beds ?? facility.occupied_beds;
  if (totalBeds > 0 && occupiedBeds / totalBeds > 0.9) score -= 15;

  const updates: Record<string, unknown> = { ...body, readiness_score: Math.max(0, score), updated_at: now };

  const { data: result, error } = await supabaseAdmin
    .from("facilities").update(updates).eq("id", id).select("*").single();

  if (error || !result) return Response.json({ detail: error?.message }, { status: 500 });

  // Audit
  await supabaseAdmin.from("audit_events").insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    event_type: "FACILITY_UPDATED",
    entity_type: "Facility",
    entity_id: id,
    description: `Facility ${facility.name} updated`,
    created_at: now,
  });

  return Response.json(result);
}
