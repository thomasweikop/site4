import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail/sendMail";
import { createSuperadminLog } from "@/lib/superadminStore";

type ContactBody = {
  name?: string;
  title?: string;
  email?: string;
  message?: string;
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

export async function POST(request: Request) {
  const body = (await request.json()) as ContactBody;
  const name = (body.name ?? "").trim();
  const title = (body.title ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Navn, email og besked er påkrævet." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email er ugyldig." }, { status: 400 });
  }

  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(title || "Ikke angivet");
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const text = `Ny besked fra NIS2 kontaktformular\n\nNavn: ${name}\nTitel: ${title || "Ikke angivet"}\nEmail: ${email}\n\nBesked:\n${message}`;
  const html = `
    <p>Ny besked fra NIS2 kontaktformular</p>
    <p><strong>Navn:</strong> ${safeName}</p>
    <p><strong>Titel:</strong> ${safeTitle}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Besked:</strong></p>
    <p>${safeMessage}</p>
  `;

  const result = await sendMail({
    to: process.env.NIS2_CONTACT_EMAIL || "thomas.weikop@gmail.com",
    subject: `NIS2 kontakt fra ${name}`,
    text,
    html,
    fromName: "ComplyCheck",
    replyToEmail: email,
    replyToName: name,
  });

  if (!result.sent) {
    return NextResponse.json({ error: "Mailen kunne ikke sendes." }, { status: 500 });
  }

  await createSuperadminLog({
    actorType: "user",
    actorEmail: email,
    action: "submitted_contact_form",
    entityType: "contact_request",
    entityId: email,
    payload: {
      name,
      title,
      email,
      message,
    },
  });

  return NextResponse.json({ ok: true });
}
