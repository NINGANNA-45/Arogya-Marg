import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import type { DbUser } from "@/types/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "arogya-marg-super-secret-jwt-key-sih2026"
);
const JWT_EXPIRE_MINUTES = parseInt(process.env.JWT_EXPIRE_MINUTES || "1440");

// ─── Password hashing ─────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export async function createAccessToken(payload: {
  sub: string;
  role: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRE_MINUTES}m`)
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<{ sub: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub: string; role: string };
  } catch {
    return null;
  }
}

// ─── Get current user from request ───────────────────────────────────────────

export async function getCurrentUser(
  req: Request
): Promise<DbUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", payload.sub)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as DbUser;
}

// ─── Helpers for API routes ───────────────────────────────────────────────────

export function unauthorized(message = "Unauthorized") {
  return Response.json({ detail: message }, { status: 401 });
}

export function notFound(message = "Not found") {
  return Response.json({ detail: message }, { status: 404 });
}

export function badRequest(message: string) {
  return Response.json({ detail: message }, { status: 400 });
}
