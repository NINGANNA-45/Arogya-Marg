import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import type { CarePathState } from "@/types/db";

const STATES: CarePathState[] = [
  "IDENTIFIED", "TRIAGED", "CONSULTED", "REFERRAL_CREATED",
  "FACILITY_ACCEPTED", "EN_ROUTE", "ARRIVED", "TREATED",
  "FOLLOW_UP_DUE", "CLOSED",
];

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const results = await Promise.all(
    STATES.map(async (state) => {
      const { count } = await supabaseAdmin
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("current_state", state);
      return { state, count: count ?? 0 };
    })
  );

  return Response.json(results);
}
