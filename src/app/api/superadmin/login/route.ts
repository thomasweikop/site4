import { NextResponse } from "next/server";
import {
  createSuperadminToken,
  getSuperadminCookieOptions,
  hashAdminPassword,
  SUPERADMIN_COOKIE_NAME,
} from "@/lib/superadminAuth";
import {
  createSuperadminLog,
  findSuperadminUserByEmail,
  isSuperadminDatabaseConfigured,
} from "@/lib/superadminStore";

type LoginBody = {
  email?: string;
  password?: string;
};

function createErrorRedirect(request: Request, message: string, status = 303) {
  const url = new URL("/superadmin/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, status);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!isSuperadminDatabaseConfigured()) {
    const error = "DATABASE_URL mangler for superadmin.";
    return isJson
      ? NextResponse.json({ error }, { status: 503 })
      : createErrorRedirect(request, error);
  }

  let email = "";
  let password = "";

  if (isJson) {
    const body = (await request.json()) as LoginBody;
    email = (body.email ?? "").trim().toLowerCase();
    password = body.password ?? "";
  } else {
    const formData = await request.formData();
    email = String(formData.get("email") ?? "").trim().toLowerCase();
    password = String(formData.get("password") ?? "");
  }

  if (!email || !password) {
    const error = "Email og password er påkrævet.";
    return isJson
      ? NextResponse.json({ error }, { status: 400 })
      : createErrorRedirect(request, error);
  }

  const user = await findSuperadminUserByEmail(email);

  if (!user || user.password_hash !== hashAdminPassword(password)) {
    const error = "Forkert login.";
    return isJson
      ? NextResponse.json({ error }, { status: 401 })
      : createErrorRedirect(request, error);
  }

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: user.email,
    action: "login",
    entityType: "superadmin_user",
    entityId: user.id,
    payload: { email: user.email },
  });

  const response = isJson
    ? NextResponse.json({ ok: true, email: user.email })
    : NextResponse.redirect(new URL("/superadmin", request.url), 303);

  response.cookies.set(
    SUPERADMIN_COOKIE_NAME,
    createSuperadminToken(user.email),
    getSuperadminCookieOptions(),
  );

  return response;
}
