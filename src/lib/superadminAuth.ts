import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findSuperadminUserByEmail } from "@/lib/superadminStore";

export const SUPERADMIN_COOKIE_NAME = "complycheck_superadmin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return (
    process.env.SUPERADMIN_SESSION_SECRET?.trim() ||
    createHash("sha256")
      .update(process.env.DATABASE_URL?.trim() || "complycheck-superadmin")
      .digest("hex")
  );
}

export function hashAdminPassword(password: string) {
  return createHash("sha256")
    .update(`complycheck-admin-v1:${password}`)
    .digest("hex");
}

export function createSuperadminToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS);
  const payload = `${normalizedEmail}.${expiresAt}`;
  const signature = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export function verifySuperadminToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [email, expiresAt, signature] = token.split(".");

  if (!email || !expiresAt || !signature) {
    return null;
  }

  const payload = `${email}.${expiresAt}`;
  const expectedSignature = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  const expires = Number(expiresAt);

  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    email,
    expiresAt: expires,
  };
}

export async function getAuthenticatedSuperadmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPERADMIN_COOKIE_NAME)?.value;
  const verified = verifySuperadminToken(token);

  if (!verified) {
    return null;
  }

  const user = await findSuperadminUserByEmail(verified.email);
  return user ? { email: user.email, id: user.id } : null;
}

export async function requireSuperadmin() {
  const user = await getAuthenticatedSuperadmin();

  if (!user) {
    redirect("/superadmin/login");
  }

  return user;
}

export function getSuperadminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
