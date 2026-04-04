import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAuthenticatedSuperadmin,
  SUPERADMIN_COOKIE_NAME,
} from "@/lib/superadminAuth";
import { createSuperadminLog } from "@/lib/superadminStore";

export async function POST() {
  const user = await getAuthenticatedSuperadmin();
  const cookieStore = await cookies();
  cookieStore.delete(SUPERADMIN_COOKIE_NAME);

  if (user) {
    await createSuperadminLog({
      actorType: "superadmin",
      actorEmail: user.email,
      action: "logout",
      entityType: "superadmin_user",
      entityId: user.id,
      payload: { email: user.email },
    });
  }

  return NextResponse.json({ ok: true });
}
