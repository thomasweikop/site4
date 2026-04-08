import { NextResponse } from "next/server";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import { createTheplanCommunicationLog } from "@/lib/theplanStore";
import { createSuperadminLog } from "@/lib/superadminStore";

const VALID_CHANNELS = new Set(["email", "linkedin", "call", "note"]);
const VALID_DIRECTIONS = new Set(["outbound", "inbound", "internal"]);

export async function POST(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const body = (await request.json()) as {
    vendorKey?: string;
    company?: string;
    channel?: "email" | "linkedin" | "call" | "note";
    direction?: "outbound" | "inbound" | "internal";
    recipientEmail?: string;
    subject?: string;
    content?: string;
  };

  if (
    !body.vendorKey ||
    !body.company ||
    !body.channel ||
    !body.direction ||
    !VALID_CHANNELS.has(body.channel) ||
    !VALID_DIRECTIONS.has(body.direction)
  ) {
    return NextResponse.json({ error: "Ugyldig kommunikationslog." }, { status: 400 });
  }

  const entry = await createTheplanCommunicationLog({
    vendorKey: body.vendorKey,
    company: body.company,
    channel: body.channel,
    direction: body.direction,
    recipientEmail: body.recipientEmail,
    subject: body.subject,
    content: body.content,
    actorEmail: admin.email,
  });

  if (!entry) {
    return NextResponse.json({ error: "Kunne ikke gemme kommunikation." }, { status: 500 });
  }

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: admin.email,
    action: "logged_theplan_communication",
    entityType: "theplan",
    entityId: body.vendorKey,
    payload: {
      vendorKey: body.vendorKey,
      company: body.company,
      channel: body.channel,
      direction: body.direction,
      recipientEmail: body.recipientEmail ?? "",
      subject: body.subject ?? "",
    },
  });

  return NextResponse.json({ ok: true, entry });
}
