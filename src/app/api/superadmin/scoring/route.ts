import { NextResponse } from "next/server";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import {
  createSuperadminLog,
  updateEditableScoringConfig,
  type EditableScoringConfig,
} from "@/lib/superadminStore";

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const body = (await request.json()) as EditableScoringConfig;

  if (!body?.answerPoints || !body?.scoreBands) {
    return NextResponse.json(
      { error: "Scoring er ugyldig." },
      { status: 400 },
    );
  }

  const config = await updateEditableScoringConfig(body, admin.email);

  if (!config) {
    return NextResponse.json(
      { error: "Kunne ikke gemme scoring." },
      { status: 500 },
    );
  }

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: admin.email,
    action: "updated_scoring",
    entityType: "scoring",
    entityId: "default",
    payload: body,
  });

  return NextResponse.json({ ok: true, config });
}
