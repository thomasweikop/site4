import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSuperadminToken,
  getSuperadminCookieOptions,
  hashAdminPassword,
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

export async function POST(request: Request) {
  if (!isSuperadminDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL mangler for superadmin." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as LoginBody;
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email og password er påkrævet." },
      { status: 400 },
    );
  }

  const user = await findSuperadminUserByEmail(email);

  if (!user || user.password_hash !== hashAdminPassword(password)) {
    return NextResponse.json(
      { error: "Forkert login." },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(
    "complycheck_superadmin",
    createSuperadminToken(user.email),
    getSuperadminCookieOptions(),
  );

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: user.email,
    action: "login",
    entityType: "superadmin_user",
    entityId: user.id,
    payload: { email: user.email },
  });

  return NextResponse.json({ ok: true, email: user.email });
}
