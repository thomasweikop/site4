import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import {
  applyTheplanImport,
  previewTheplanImport,
} from "@/lib/theplanStore";
import { createSuperadminLog } from "@/lib/superadminStore";

function workbookToSheets(fileBuffer: ArrayBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: "array" });

  return workbook.SheetNames.map((name) => {
    const worksheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });

    return {
      name,
      rows,
    };
  });
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const formData = await request.formData();
  const mode = formData.get("mode") === "apply" ? "apply" : "preview";
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Excel-fil mangler." }, { status: 400 });
  }

  const sheets = workbookToSheets(await file.arrayBuffer());
  const result =
    mode === "apply"
      ? await applyTheplanImport(sheets, admin.email)
      : await previewTheplanImport(sheets);

  if (mode === "apply") {
    await createSuperadminLog({
      actorType: "superadmin",
      actorEmail: admin.email,
      action: "imported_theplan_excel",
      entityType: "theplan",
      entityId: file.name,
      payload: {
        rowsSeen: result.rowsSeen,
        changedRecords: result.changedRecords,
        changedFields: result.changedFields,
        sheetsFound: result.sheetsFound,
        changes: result.changes,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    mode,
    result,
  });
}
