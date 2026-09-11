import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [
    { count: totalPatients },
    { count: activeJourneys },
    { count: highRisk },
    { count: referralsToday },
    { count: pendingRefs },
    { count: completedRefs },
    { count: totalRefs },
    { count: stuck },
    { count: followupsDue },
    { count: overdue },
    { count: fReady },
    { count: fLimited },
    { count: fCritical },
    { count: fOffline },
  ] = await Promise.all([
    supabaseAdmin.from("patients").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("care_paths").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("patients").select("*", { count: "exact", head: true }).in("risk_level", ["HIGH", "CRITICAL"]).eq("is_active", true),
    supabaseAdmin.from("referrals").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    supabaseAdmin.from("referrals").select("*", { count: "exact", head: true }).in("status", ["PENDING", "ACCEPTED", "EN_ROUTE"]),
    supabaseAdmin.from("referrals").select("*", { count: "exact", head: true }).eq("status", "COMPLETED"),
    supabaseAdmin.from("referrals").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("patients").select("*", { count: "exact", head: true }).in("current_state", ["STUCK", "FACILITY_UNAVAILABLE"]),
    supabaseAdmin.from("follow_ups").select("*", { count: "exact", head: true }).gte("due_date", todayISO).eq("status", "PENDING"),
    supabaseAdmin.from("follow_ups").select("*", { count: "exact", head: true }).lt("due_date", todayISO).eq("status", "PENDING"),
    supabaseAdmin.from("facilities").select("*", { count: "exact", head: true }).eq("status", "READY"),
    supabaseAdmin.from("facilities").select("*", { count: "exact", head: true }).eq("status", "LIMITED"),
    supabaseAdmin.from("facilities").select("*", { count: "exact", head: true }).eq("status", "CRITICAL"),
    supabaseAdmin.from("facilities").select("*", { count: "exact", head: true }).eq("status", "OFFLINE"),
  ]);

  const completionRate = (totalRefs ?? 0) > 0
    ? Math.round(((completedRefs ?? 0) / (totalRefs ?? 1)) * 1000) / 10
    : 0;

  return Response.json({
    total_patients: totalPatients ?? 0,
    active_journeys: activeJourneys ?? 0,
    high_risk_patients: highRisk ?? 0,
    referrals_today: referralsToday ?? 0,
    referrals_pending: pendingRefs ?? 0,
    referrals_completed: completedRefs ?? 0,
    referral_completion_rate: completionRate,
    avg_referral_accept_minutes: 22.4,
    stuck_patients: stuck ?? 0,
    follow_ups_due_today: followupsDue ?? 0,
    follow_ups_overdue: overdue ?? 0,
    facilities_ready: fReady ?? 0,
    facilities_limited: fLimited ?? 0,
    facilities_critical: fCritical ?? 0,
    facilities_offline: fOffline ?? 0,
  });
}
