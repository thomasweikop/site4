import { NextResponse } from "next/server";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import {
  createSuperadminLog,
  updateEditableQuestion,
  type EditableQuestion,
} from "@/lib/superadminStore";

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const body = (await request.json()) as EditableQuestion;

  if (!body.id || !body.question) {
    return NextResponse.json(
      { error: "Spørgsmålet er ugyldigt." },
      { status: 400 },
    );
  }

  const question = await updateEditableQuestion(body.id, body, admin.email);

  if (!question) {
    return NextResponse.json(
      { error: "Kunne ikke gemme spørgsmål." },
      { status: 500 },
    );
  }

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: admin.email,
    action: "updated_question",
    entityType: "question",
    entityId: body.id,
    payload: {
      id: body.id,
      category: body.category,
      weight: body.weight,
    },
  });

  return NextResponse.json({ ok: true, question });
}
