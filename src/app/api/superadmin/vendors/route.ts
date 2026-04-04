import { NextResponse } from "next/server";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import {
  createSuperadminLog,
  updateEditableVendor,
  type EditableVendor,
} from "@/lib/superadminStore";

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const body = (await request.json()) as EditableVendor;

  if (!body?.key || !body?.name) {
    return NextResponse.json(
      { error: "Specialisten er ugyldig." },
      { status: 400 },
    );
  }

  const vendor = await updateEditableVendor(body.key, body, admin.email);

  if (!vendor) {
    return NextResponse.json(
      { error: "Kunne ikke gemme specialist." },
      { status: 500 },
    );
  }

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: admin.email,
    action: "updated_vendor",
    entityType: "vendor",
    entityId: body.key,
    payload: {
      key: body.key,
      name: body.name,
      type: body.type,
    },
  });

  return NextResponse.json({ ok: true, vendor });
}
