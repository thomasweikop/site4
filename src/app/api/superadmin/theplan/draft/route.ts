import { NextResponse } from "next/server";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import { createSuperadminLog } from "@/lib/superadminStore";
import { getTheplanDataset, updateTheplanOverride } from "@/lib/theplanStore";

type Body = {
  vendorKey?: string;
  company?: string;
  recipientEmail?: string;
  subject?: string;
  emailDraft?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function mergeEmailList(existing: string[], nextEmail: string) {
  return [...new Set([nextEmail, ...existing])];
}

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedSuperadmin();

  if (!admin) {
    return NextResponse.json({ error: "Ikke autoriseret." }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  const vendorKey = (body.vendorKey ?? "").trim();
  const company = (body.company ?? "").trim();
  const recipientEmail = (body.recipientEmail ?? "").trim().toLowerCase();
  const subject = (body.subject ?? "").trim();
  const emailDraft = (body.emailDraft ?? "").trim();

  if (!vendorKey || !company) {
    return NextResponse.json({ error: "Virksomhed mangler." }, { status: 400 });
  }

  if (!recipientEmail || !isValidEmail(recipientEmail)) {
    return NextResponse.json({ error: "Modtager-email er ugyldig." }, { status: 400 });
  }

  if (!subject || !emailDraft) {
    return NextResponse.json({ error: "Emne og mailtekst er påkrævet." }, { status: 400 });
  }

  const dataset = await getTheplanDataset();
  const currentContact = dataset.contacts.find((item) => item.vendorKey === vendorKey);

  const record = await updateTheplanOverride(
    vendorKey,
    {
      primaryEmail: recipientEmail,
      primaryContact: recipientEmail,
      genericEmails: mergeEmailList(currentContact?.genericEmails ?? [], recipientEmail),
      allEmails: mergeEmailList(currentContact?.allEmails ?? [], recipientEmail),
      suggestedSubject: subject,
      emailDraft,
    },
    admin.email,
  );

  if (!record) {
    return NextResponse.json({ error: "Kunne ikke gemme draft." }, { status: 500 });
  }

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: admin.email,
    action: "saved_theplan_email_draft",
    entityType: "theplan",
    entityId: vendorKey,
    payload: {
      vendorKey,
      company,
      recipientEmail,
      subject,
    },
  });

  return NextResponse.json({
    ok: true,
    saved: {
      recipientEmail,
      subject,
      emailDraft,
    },
  });
}
