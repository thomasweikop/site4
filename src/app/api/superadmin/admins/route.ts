import { NextResponse } from "next/server";
import {
  getAuthenticatedSuperadmin,
  hashAdminPassword,
} from "@/lib/superadminAuth";
import {
  createSuperadminLog,
  createSuperadminUser,
  findSuperadminUserByEmail,
} from "@/lib/superadminStore";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email er ugyldig." }, { status: 400 });
  }

  if (password.trim().length < 6) {
    return NextResponse.json(
      { error: "Password skal være mindst 6 tegn." },
      { status: 400 },
    );
  }

  const existing = await findSuperadminUserByEmail(email);

  if (existing) {
    return NextResponse.json(
      { error: "Denne admin findes allerede." },
      { status: 409 },
    );
  }

  try {
    const created = await createSuperadminUser({
      email,
      passwordHash: hashAdminPassword(password),
    });

    if (!created) {
      return NextResponse.json(
        { error: "Kunne ikke oprette admin." },
        { status: 500 },
      );
    }

    await createSuperadminLog({
      actorType: "superadmin",
      actorEmail: admin.email,
      action: "created_admin",
      entityType: "superadmin_user",
      entityId: created.id,
      payload: { email: created.email },
    });

    return NextResponse.json({ ok: true, admin: created });
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke oprette admin." },
      { status: 500 },
    );
  }
}
