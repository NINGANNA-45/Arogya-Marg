import { getCurrentUser, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();
  const { password_hash: _, ...userOut } = user;
  return Response.json(userOut);
}
