import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import { getTheplanDataset } from "@/lib/theplanStore";

function serializeValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(" | ");
  }

  if (typeof value === "boolean") {
    return value ? "Ja" : "Nej";
  }

  return value ?? "";
}

function toSheetRows<T extends Record<string, unknown>>(items: T[]) {
  return items.map((item) =>
    Object.fromEntries(
      Object.entries(item).map(([key, value]) => [key, serializeValue(value)]),
    ),
  );
}

function buildWorkbook(
  kind: string,
  dataset: Awaited<ReturnType<typeof getTheplanDataset>>,
) {
  const workbook = XLSX.utils.book_new();

  if (kind === "base") {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(toSheetRows(dataset.leads)),
      "Theplan Base",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(toSheetRows(dataset.contacts)),
      "Kontaktspor",
    );

    return {
      workbook,
      filename: "theplan-base.xlsx",
    };
  }

  if (kind === "all") {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(toSheetRows(dataset.leads)),
      "Theplan Base",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(toSheetRows(dataset.contacts)),
      "Kontaktspor",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(toSheetRows(dataset.warmSignals)),
      "Flows",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(toSheetRows(dataset.drafts)),
      "Tekster",
    );

    return {
      workbook,
      filename: "theplan-alt-samlet.xlsx",
    };
  }

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(toSheetRows(dataset.warmSignals)),
    "Flows",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(toSheetRows(dataset.drafts)),
    "Tekster",
  );

  return {
    workbook,
    filename: "theplan-flows-og-tekster.xlsx",
  };
}

export async function GET(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedKind = searchParams.get("kind");
  const kind =
    requestedKind === "base" || requestedKind === "all" ? requestedKind : "flows";
  const dataset = await getTheplanDataset();
  const { workbook, filename } = buildWorkbook(kind, dataset);
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
