import { NextResponse } from "next/server";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import { rollbackTheplanImport } from "@/lib/theplanStore";
import { createSuperadminLog, listSuperadminLogs } from "@/lib/superadminStore";

export async function POST(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const body = (await request.json()) as {
    logId?: number;
  };

  if (!body.logId) {
    return NextResponse.json({ error: "Log-id mangler." }, { status: 400 });
  }

  const logs = await listSuperadminLogs(300);
  const log = logs.find(
    (item) =>
      item.id === body.logId && item.action === "imported_theplan_excel",
  );

  if (!log) {
    return NextResponse.json({ error: "Importlog ikke fundet." }, { status: 404 });
  }

  const changes = Array.isArray(log.payload?.changes)
    ? (log.payload?.changes as Array<{
        vendorKey: string;
        fieldDiffs: Array<{
          field: string;
          previousRaw: unknown;
        }>;
      }>)
    : [];

  if (changes.length === 0) {
    return NextResponse.json(
      { error: "Ingen rollback-data fundet for denne import." },
      { status: 400 },
    );
  }

  const result = await rollbackTheplanImport(changes, admin.email);

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: admin.email,
    action: "rolled_back_theplan_import",
    entityType: "theplan",
    entityId: String(body.logId),
    payload: {
      sourceLogId: body.logId,
      rolledBackRecords: result.rolledBackRecords,
      rolledBackFields: result.rolledBackFields,
    },
  });

  return NextResponse.json({
    ok: true,
    result,
  });
}
