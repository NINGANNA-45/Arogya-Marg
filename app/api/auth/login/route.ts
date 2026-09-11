import { supabaseAdmin } from "@/lib/supabase";
import { verifyPassword, createAccessToken, badRequest } from "@/lib/auth";
import type { DbUser } from "@/types/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return badRequest("Email and password are required");
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return Response.json({ detail: "Invalid credentials" }, { status: 401 });
  }

  const user = data as DbUser;
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return Response.json({ detail: "Invalid credentials" }, { status: 401 });
  }

  // Update last_login
  await supabaseAdmin
    .from("users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", user.id);

  const token = await createAccessToken({ sub: user.id, role: user.role });

  const { password_hash: _, ...userOut } = user;
  return Response.json({ access_token: token, token_type: "bearer", user: userOut });
}
