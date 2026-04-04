import { NextResponse } from "next/server";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import {
  updateSubmittedUser,
  type SubmittedUserRecord,
} from "@/lib/superadminStore";

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const body = (await request.json()) as {
    sessionId?: string;
    lead?: SubmittedUserRecord["lead"];
  };

  if (!body.sessionId || !body.lead?.company || !body.lead?.name || !body.lead?.email) {
    return NextResponse.json(
      { error: "Brugerdata er ugyldige." },
      { status: 400 },
    );
  }

  const user = await updateSubmittedUser(body.sessionId, body.lead, admin.email);

  if (!user) {
    return NextResponse.json(
      { error: "Kunne ikke gemme bruger." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, user });
}
