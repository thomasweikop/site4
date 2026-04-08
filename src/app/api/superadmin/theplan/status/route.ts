import { NextResponse } from "next/server";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import {
  type TheplanOutreachStatus,
  upsertTheplanStatus,
} from "@/lib/theplanStore";
import { createSuperadminLog } from "@/lib/superadminStore";

const VALID_STATUSES = new Set<TheplanOutreachStatus>([
  "not_contacted",
  "draft_ready",
  "contacted",
  "follow_up",
  "responded",
  "qualified",
]);

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const body = (await request.json()) as {
    vendorKey?: string;
    company?: string;
    status?: TheplanOutreachStatus;
    note?: string;
  };

  if (!body.vendorKey || !body.status || !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Ugyldig statusopdatering." }, { status: 400 });
  }

  const record = await upsertTheplanStatus({
    vendorKey: body.vendorKey,
    status: body.status,
    note: body.note,
    actorEmail: admin.email,
  });

  if (!record) {
    return NextResponse.json({ error: "Kunne ikke gemme status." }, { status: 500 });
  }

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: admin.email,
    action: "updated_theplan_status",
    entityType: "theplan",
    entityId: body.vendorKey,
    payload: {
      vendorKey: body.vendorKey,
      company: body.company,
      status: body.status,
      note: body.note ?? "",
    },
  });

  return NextResponse.json({ ok: true, record });
}
