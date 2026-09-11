import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("patients")
    .select("*")
    .or(`id.eq.${id},patient_id.eq.${id}`)
    .single();

  if (error || !data) return notFound("Patient not found");
  return Response.json(data);
}
