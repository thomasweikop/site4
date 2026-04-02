import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail/sendMail";

type UnlockBody = {
  sessionId?: string;
  company?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  score?: number;
  status?: string;
  profileSummary?: string[];
  weakestDimensions?: string[];
  blockers?: string[];
  partnerRecommendations?: string[];
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

function buildList(label: string, values: string[]) {
  if (values.length === 0) {
    return "";
  }

  return `${label}:\n- ${values.join("\n- ")}`;
}

function buildHtmlList(label: string, values: string[]) {
  if (values.length === 0) {
    return "";
  }

  return `<p><strong>${escapeHtml(label)}:</strong></p><ul>${values
    .map((value) => `<li>${escapeHtml(value)}</li>`)
    .join("")}</ul>`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as UnlockBody;
  const sessionId = (body.sessionId ?? "").trim();
  const company = (body.company ?? "").trim();
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const message = (body.message ?? "").trim();
  const profileSummary = (body.profileSummary ?? []).filter(Boolean);
  const weakestDimensions = (body.weakestDimensions ?? []).filter(Boolean);
  const blockers = (body.blockers ?? []).filter(Boolean);
  const partnerRecommendations = (body.partnerRecommendations ?? []).filter(
    Boolean,
  );

  if (!sessionId || !name || !email) {
    return NextResponse.json(
      { error: "Session, navn og email er påkrævet." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email er ugyldig." }, { status: 400 });
  }

  const safeCompany = escapeHtml(company || "Ikke angivet");
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Ikke angivet");
  const safeMessage = escapeHtml(message || "Ingen ekstra besked.").replace(
    /\n/g,
    "<br />",
  );

  const text = [
    "Ny unlock af NIS2-rapport",
    "",
    `Session: ${sessionId}`,
    `Virksomhed: ${company || "Ikke angivet"}`,
    `Navn: ${name}`,
    `Email: ${email}`,
    `Telefon: ${phone || "Ikke angivet"}`,
    `Score: ${body.score ?? "Ukendt"}%`,
    `Status: ${body.status ?? "Ukendt"}`,
    "",
    buildList("Profil", profileSummary),
    buildList("Laveste dimensioner", weakestDimensions),
    buildList("Blockers", blockers),
    buildList("Partneranbefalinger", partnerRecommendations),
    "",
    "Besked:",
    message || "Ingen ekstra besked.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Ny unlock af NIS2-rapport</p>
    <p><strong>Session:</strong> ${escapeHtml(sessionId)}</p>
    <p><strong>Virksomhed:</strong> ${safeCompany}</p>
    <p><strong>Navn:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Telefon:</strong> ${safePhone}</p>
    <p><strong>Score:</strong> ${body.score ?? "Ukendt"}%</p>
    <p><strong>Status:</strong> ${escapeHtml(body.status ?? "Ukendt")}</p>
    ${buildHtmlList("Profil", profileSummary)}
    ${buildHtmlList("Laveste dimensioner", weakestDimensions)}
    ${buildHtmlList("Blockers", blockers)}
    ${buildHtmlList("Partneranbefalinger", partnerRecommendations)}
    <p><strong>Besked:</strong></p>
    <p>${safeMessage}</p>
  `;

  const result = await sendMail({
    to: process.env.NIS2_CONTACT_EMAIL || "thomas.weikop@gmail.com",
    subject: `NIS2 rapport unlock fra ${name}`,
    text,
    html,
    fromName: "ComplyCheck",
    replyToEmail: email,
    replyToName: name,
  });

  if (!result.sent) {
    return NextResponse.json(
      { error: "Rapporten kunne ikke låses op lige nu." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
