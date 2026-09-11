import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id: scenarioId } = await params;

  const { data: scenario, error: scenErr } = await supabaseAdmin
    .from("simulation_scenarios")
    .select("*")
    .eq("id", scenarioId)
    .single();

  if (scenErr || !scenario) {
    return notFound("Scenario not found");
  }

  const now = new Date().toISOString();
  await supabaseAdmin
    .from("simulation_scenarios")
    .update({ is_active: true, activated_at: now })
    .eq("id", scenarioId);

  const affectedReferrals: string[] = [];
  const actions: string[] = [];
  let updatedFacility = null;
  let alternatives: unknown[] = [];

  if (scenario.target_facility_id) {
    const { data: facility } = await supabaseAdmin
      .from("facilities")
      .select("*")
      .eq("id", scenario.target_facility_id)
      .single();

    if (facility) {
      const config = (scenario.config as Record<string, any>) || {};
      const oldStatus = facility.status;

      const facilityUpdates: Record<string, any> = {};
      if ("status" in config) facilityUpdates.status = config.status;
      if ("oxygen_available" in config) facilityUpdates.oxygen_available = config.oxygen_available;
      if ("icu_beds" in config) {
        facilityUpdates.icu_beds = config.icu_beds;
        facilityUpdates.icu_occupied = config.icu_occupied ?? facility.icu_occupied;
      }
      if ("occupied_beds" in config) facilityUpdates.occupied_beds = config.occupied_beds;

      const newReadiness = Math.max(0, (facility.readiness_score || 100) - 40);
      facilityUpdates.readiness_score = newReadiness;

      const { data: facUpdated } = await supabaseAdmin
        .from("facilities")
        .update(facilityUpdates)
        .eq("id", facility.id)
        .select()
        .single();

      updatedFacility = facUpdated || { ...facility, ...facilityUpdates };
      actions.push(`Updated ${facility.name} status to ${facilityUpdates.status || facility.status}`);

      // Find affected referrals
      const { data: refs } = await supabaseAdmin
        .from("referrals")
        .select("*")
        .eq("destination_facility_id", facility.id)
        .in("status", ["PENDING", "ACCEPTED", "EN_ROUTE"]);

      if (refs && refs.length > 0) {
        for (const ref of refs) {
          affectedReferrals.push(ref.referral_code);

          // Create urgent task
          await supabaseAdmin.from("care_tasks").insert({
            patient_id: ref.patient_id,
            assigned_to: user.id,
            title: `URGENT: Reroute referral ${ref.referral_code} — ${facility.name} unavailable`,
            task_type: "SIMULATION_REROUTE",
            status: "OPEN",
            priority: "URGENT",
            due_at: now,
            related_referral_id: ref.id,
          });
          actions.push(`Created reroute task for referral ${ref.referral_code}`);

          // Mark patient as FACILITY_UNAVAILABLE
          await supabaseAdmin
            .from("patients")
            .update({ current_state: "FACILITY_UNAVAILABLE" })
            .eq("id", ref.patient_id);

          const { data: cp } = await supabaseAdmin
            .from("care_paths")
            .select("*")
            .eq("patient_id", ref.patient_id)
            .single();

          if (cp) {
            const oldState = cp.current_state;
            await supabaseAdmin
              .from("care_paths")
              .update({
                current_state: "FACILITY_UNAVAILABLE",
                next_best_action: `Find alternative facility — ${facility.name} unavailable`,
              })
              .eq("id", cp.id);

            await supabaseAdmin.from("care_path_events").insert({
              carepath_id: cp.id,
              from_state: oldState,
              to_state: "FACILITY_UNAVAILABLE",
              event_type: "FACILITY_FAILURE_DETECTED",
              description: `Facility ${facility.name} became unavailable: ${scenario.name}`,
              performed_by: user.id,
            });
          }
        }
      }

      // Find alternatives
      const { data: alts } = await supabaseAdmin
        .from("facilities")
        .select("*")
        .neq("id", facility.id)
        .in("status", ["READY", "LIMITED"])
        .eq("is_active", true)
        .limit(3);

      alternatives = alts || [];

      // Audit event
      await supabaseAdmin.from("audit_events").insert({
        user_id: user.id,
        event_type: "SIMULATION_ACTIVATED",
        entity_type: "Facility",
        entity_id: facility.id,
        description: `Simulation scenario activated: ${scenario.name}`,
        old_value: { status: oldStatus },
        new_value: { status: facilityUpdates.status || facility.status },
      });
    }
  }

  return Response.json({
    scenario_name: scenario.name,
    affected_referrals: affectedReferrals,
    affected_facility: updatedFacility,
    alternative_facilities: alternatives,
    actions_taken: actions,
    notifications_created: affectedReferrals.length,
  });
}
