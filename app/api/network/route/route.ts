import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import type { DbFacility, FacilityStatus } from "@/types/db";

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlam = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlam / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function scoreFacility(
  f: DbFacility,
  requirements: {
    needs_icu: boolean;
    needs_oxygen: boolean;
    needs_blood: boolean;
    specialty?: string;
    diagnostics: string[];
  },
  distKm: number
) {
  if (f.status === "OFFLINE") {
    return {
      score: 0,
      match_pct: 0,
      distance_km: Math.round(distKm * 10) / 10,
      travel_time_min: 999,
      reasons: [],
      disqualifiers: ["Facility offline"],
    };
  }

  let score = 0;
  const reasons: string[] = [];
  const disqualifiers: string[] = [];

  if (f.status === "CRITICAL") { score -= 30; disqualifiers.push("Facility at critical capacity"); }

  const availBeds = f.total_beds - f.occupied_beds;
  if (availBeds > 5) { score += 20; reasons.push(`${availBeds} beds available`); }
  else if (availBeds > 0) { score += 10; reasons.push(`Only ${availBeds} beds available`); }
  else disqualifiers.push("No beds available");

  if (requirements.needs_icu) {
    const availIcu = f.icu_beds - f.icu_occupied;
    if (availIcu > 0) { score += 25; reasons.push(`ICU available (${availIcu} beds)`); }
    else { score -= 25; disqualifiers.push("No ICU available"); }
  }

  if (requirements.needs_oxygen) {
    if (f.oxygen_available) { score += 15; reasons.push("Oxygen available"); }
    else { score -= 20; disqualifiers.push("No oxygen supply"); }
  } else if (f.oxygen_available) score += 10;

  if (requirements.needs_blood) {
    if (f.blood_bank) { score += 15; reasons.push("Blood bank available"); }
    else { score -= 10; disqualifiers.push("No blood bank"); }
  } else if (f.blood_bank) score += 5;

  if (requirements.specialty) {
    if ((f.specialists ?? []).includes(requirements.specialty)) {
      score += 20; reasons.push(`${requirements.specialty} specialist available`);
    } else {
      score -= 15; disqualifiers.push(`${requirements.specialty} specialist not available`);
    }
  }

  const reqDiag = requirements.diagnostics;
  if (reqDiag.length > 0) {
    const matched = reqDiag.filter((d) => (f.diagnostics ?? []).includes(d));
    score += Math.floor((matched.length / reqDiag.length) * 15);
    if (matched.length) reasons.push(`Diagnostics: ${matched.join(", ")}`);
  }

  if (distKm < 10) { score += 15; reasons.push(`${distKm.toFixed(1)} km away`); }
  else if (distKm < 30) score += 5;
  else if (distKm > 60) score -= 10;

  return {
    score,
    match_pct: Math.max(0, Math.min(100, score + 50)),
    distance_km: Math.round(distKm * 10) / 10,
    travel_time_min: Math.floor((distKm / 50) * 60),
    reasons,
    disqualifiers,
  };
}

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const originLat = parseFloat(searchParams.get("origin_lat") || "0");
  const originLng = parseFloat(searchParams.get("origin_lng") || "0");
  const needsIcu = searchParams.get("needs_icu") === "true";
  const needsOxygen = searchParams.get("needs_oxygen") === "true";
  const needsBlood = searchParams.get("needs_blood") === "true";
  const specialty = searchParams.get("specialty") ?? undefined;
  const diagnosticsParam = searchParams.get("diagnostics");
  const facilityType = searchParams.get("facility_type");

  const requirements = {
    needs_icu: needsIcu,
    needs_oxygen: needsOxygen,
    needs_blood: needsBlood,
    specialty,
    diagnostics: diagnosticsParam ? diagnosticsParam.split(",").map((d) => d.trim()) : [],
  };

  let query = supabaseAdmin.from("facilities").select("*").eq("is_active", true);
  if (facilityType) query = query.eq("type", facilityType);

  const { data: facilities, error } = await query;
  if (error) return Response.json({ detail: error.message }, { status: 500 });

  const results = (facilities as DbFacility[])
    .map((f) => {
      const dist = haversine(originLat, originLng, f.lat, f.lng);
      if (dist > 100) return null;
      const scoring = scoreFacility(f, requirements, dist);
      return {
        facility: {
          id: f.id, name: f.name, type: f.type, status: f.status,
          lat: f.lat, lng: f.lng, readiness_score: f.readiness_score,
          total_beds: f.total_beds, occupied_beds: f.occupied_beds,
          icu_beds: f.icu_beds, icu_occupied: f.icu_occupied,
          oxygen_available: f.oxygen_available, blood_bank: f.blood_bank,
          diagnostics: f.diagnostics ?? [], specialists: f.specialists ?? [],
        },
        ...scoring,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.match_pct - a.match_pct || a.distance_km - b.distance_km)
    .slice(0, 5);

  return Response.json(results);
}
