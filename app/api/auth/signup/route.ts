import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword, badRequest } from "@/lib/auth";
import type { RoleEnum } from "@/types/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, role, facility_id } = body;

  if (!name || !email || !password || !role) {
    return badRequest("name, email, password and role are required");
  }

  // Check existing
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return Response.json({ detail: "Email already registered" }, { status: 400 });
  }

  const empId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      id: crypto.randomUUID(),
      employee_id: empId,
      name,
      email,
      password_hash: passwordHash,
      role: role as RoleEnum,
      facility_id: facility_id ?? null,
      is_active: true,
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    return Response.json({ detail: error?.message ?? "Failed to create user" }, { status: 500 });
  }

  const { password_hash: _, ...userOut } = data;
  return Response.json(userOut, { status: 201 });
}
