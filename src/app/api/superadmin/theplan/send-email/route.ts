import { NextResponse } from "next/server";
import { getAuthenticatedSuperadmin } from "@/lib/superadminAuth";
import { sendMail } from "@/lib/mail/sendMail";
import { createSuperadminLog } from "@/lib/superadminStore";
import {
  createTheplanCommunicationLog,
  getTheplanDataset,
  updateTheplanOverride,
  upsertTheplanStatus,
} from "@/lib/theplanStore";

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToHtml(text: string) {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

function mergeEmailList(existing: string[], nextEmail: string) {
  return [...new Set([nextEmail, ...existing])];
}

export async function POST(request: Request) {
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

  await updateTheplanOverride(
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

  const result = await sendMail({
    to: recipientEmail,
    subject,
    text: emailDraft,
    html: textToHtml(emailDraft),
    fromName: "ComplyCheck",
  });

  if (!result.sent) {
    return NextResponse.json(
      { error: "Mailen kunne ikke sendes." },
      { status: 500 },
    );
  }

  const entry = await createTheplanCommunicationLog({
    vendorKey,
    company,
    channel: "email",
    direction: "outbound",
    recipientEmail,
    subject,
    content: emailDraft,
    actorEmail: admin.email,
    provider: result.provider,
    providerMessageId: result.providerMessageId,
  });

  const status = await upsertTheplanStatus({
    vendorKey,
    status: "contacted",
    actorEmail: admin.email,
  });

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail: admin.email,
    action: "sent_theplan_email",
    entityType: "theplan",
    entityId: vendorKey,
    payload: {
      vendorKey,
      company,
      recipientEmail,
      subject,
      provider: result.provider ?? "",
      providerMessageId: result.providerMessageId ?? "",
    },
  });

  return NextResponse.json({
    ok: true,
    entry,
    status,
  });
}
