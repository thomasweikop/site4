import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail/sendMail";

type ActionRequestBody = {
  company?: string;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  consent?: boolean;
  sessionId?: string;
  areas?: string[];
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
  const body = (await request.json()) as ActionRequestBody;
  const company = (body.company ?? "").trim();
  const name = (body.name ?? "").trim();
  const title = (body.title ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const sessionId = (body.sessionId ?? "").trim();
  const areas = (body.areas ?? []).filter(Boolean);
  const consent = Boolean(body.consent);

  if (!company || !name || !email) {
    return NextResponse.json(
      { error: "Virksomhed, navn og email er påkrævet." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email er ugyldig." }, { status: 400 });
  }

  if (!consent) {
    return NextResponse.json(
      { error: "Samtykke til kontakt er påkrævet." },
      { status: 400 },
    );
  }

  const text = [
    "Ny henvendelse fra målrettede initiativer",
    "",
    `Virksomhed: ${company}`,
    `Navn: ${name}`,
    `Titel: ${title || "Ikke angivet"}`,
    `Email: ${email}`,
    `Telefon: ${phone || "Ikke angivet"}`,
    `Session: ${sessionId || "Ikke angivet"}`,
    "",
    "Virksomheden ønsker at modtage mere information og blive kontaktet af ComplyCheck eller relevante partnere.",
    "",
    areas.length > 0 ? `Fokusområder:\n- ${areas.join("\n- ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Ny henvendelse fra målrettede initiativer</p>
    <p><strong>Virksomhed:</strong> ${escapeHtml(company)}</p>
    <p><strong>Navn:</strong> ${escapeHtml(name)}</p>
    <p><strong>Titel:</strong> ${escapeHtml(title || "Ikke angivet")}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(phone || "Ikke angivet")}</p>
    <p><strong>Session:</strong> ${escapeHtml(sessionId || "Ikke angivet")}</p>
    <p>Virksomheden ønsker at modtage mere information og blive kontaktet af ComplyCheck eller relevante partnere.</p>
    ${
      areas.length > 0
        ? `<p><strong>Fokusområder:</strong></p><ul>${areas
            .map((area) => `<li>${escapeHtml(area)}</li>`)
            .join("")}</ul>`
        : ""
    }
  `;

  const result = await sendMail({
    to: process.env.NIS2_CONTACT_EMAIL || "thomas.weikop@gmail.com",
    subject: `Målrettede initiativer for ${company}`,
    text,
    html,
    fromName: "ComplyCheck",
    replyToEmail: email,
    replyToName: name,
  });

  if (!result.sent) {
    return NextResponse.json(
      { error: "Mailen kunne ikke sendes." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
