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
  executiveSummary?: string;
  nextSteps?: string[];
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
  const nextSteps = (body.nextSteps ?? []).filter(Boolean);
  const partnerRecommendations = (body.partnerRecommendations ?? []).filter(
    Boolean,
  );

  if (!sessionId || !company || !name || !email) {
    return NextResponse.json(
      { error: "Virksomhed, navn og email er påkrævet." },
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

  const internalText = [
    "Ny unlock af NIS2-rapport",
    "",
    `Session: ${sessionId}`,
    `Virksomhed: ${company}`,
    `Navn: ${name}`,
    `Email: ${email}`,
    `Telefon: ${phone || "Ikke angivet"}`,
    `Score: ${body.score ?? "Ukendt"}%`,
    `Status: ${body.status ?? "Ukendt"}`,
    "",
    body.executiveSummary ? `Resume: ${body.executiveSummary}` : "",
    "",
    buildList("Profil", profileSummary),
    buildList("Laveste dimensioner", weakestDimensions),
    buildList("Blockers", blockers),
    buildList("Næste skridt", nextSteps),
    buildList("Partneranbefalinger", partnerRecommendations),
    "",
    "Besked:",
    message || "Ingen ekstra besked.",
  ]
    .filter(Boolean)
    .join("\n");

  const internalHtml = `
    <p>Ny unlock af NIS2-rapport</p>
    <p><strong>Session:</strong> ${escapeHtml(sessionId)}</p>
    <p><strong>Virksomhed:</strong> ${safeCompany}</p>
    <p><strong>Navn:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Telefon:</strong> ${safePhone}</p>
    <p><strong>Score:</strong> ${body.score ?? "Ukendt"}%</p>
    <p><strong>Status:</strong> ${escapeHtml(body.status ?? "Ukendt")}</p>
    ${
      body.executiveSummary
        ? `<p><strong>Resume:</strong> ${escapeHtml(body.executiveSummary)}</p>`
        : ""
    }
    ${buildHtmlList("Profil", profileSummary)}
    ${buildHtmlList("Laveste dimensioner", weakestDimensions)}
    ${buildHtmlList("Blockers", blockers)}
    ${buildHtmlList("Næste skridt", nextSteps)}
    ${buildHtmlList("Partneranbefalinger", partnerRecommendations)}
    <p><strong>Besked:</strong></p>
    <p>${safeMessage}</p>
  `;

  const internalResult = await sendMail({
    to: process.env.NIS2_CONTACT_EMAIL || "thomas.weikop@gmail.com",
    subject: `NIS2 rapport unlock fra ${name}`,
    text: internalText,
    html: internalHtml,
    fromName: "ComplyCheck",
    replyToEmail: email,
    replyToName: name,
  });

  if (!internalResult.sent) {
    return NextResponse.json(
      { error: "Rapporten kunne ikke låses op lige nu." },
      { status: 500 },
    );
  }

  const userText = [
    `Hej ${name},`,
    "",
    "Virksomhedens NIS2-rapport er nu klar.",
    "",
    `Virksomhed: ${company}`,
    `Samlet score: ${body.score ?? "Ukendt"}%`,
    `Status: ${body.status ?? "Ukendt"}`,
    "",
    body.executiveSummary ?? "",
    "",
    buildList("Laveste dimensioner", weakestDimensions),
    buildList("Eventuelle blockers", blockers),
    buildList("Første anbefalede skridt", nextSteps),
    buildList("Prioriterede konsulentprofiler", partnerRecommendations),
    "",
    "Rapporten er lavet som et første modenhedsbillede og bør læses som beslutningsgrundlag for næste prioritering.",
  ]
    .filter(Boolean)
    .join("\n");

  const userHtml = `
    <p>Hej ${safeName},</p>
    <p>Virksomhedens NIS2-rapport er nu klar.</p>
    <p><strong>Virksomhed:</strong> ${safeCompany}</p>
    <p><strong>Samlet score:</strong> ${body.score ?? "Ukendt"}%</p>
    <p><strong>Status:</strong> ${escapeHtml(body.status ?? "Ukendt")}</p>
    ${
      body.executiveSummary
        ? `<p><strong>Resume:</strong> ${escapeHtml(body.executiveSummary)}</p>`
        : ""
    }
    ${buildHtmlList("Laveste dimensioner", weakestDimensions)}
    ${buildHtmlList("Eventuelle blockers", blockers)}
    ${buildHtmlList("Første anbefalede skridt", nextSteps)}
    ${buildHtmlList("Prioriterede konsulentprofiler", partnerRecommendations)}
    <p>Rapporten er lavet som et første modenhedsbillede og bør læses som beslutningsgrundlag for næste prioritering.</p>
  `;

  const userResult = await sendMail({
    to: email,
    subject: "Virksomhedens NIS2-rapport er klar",
    text: userText,
    html: userHtml,
    fromName: "ComplyCheck",
  });

  if (!userResult.sent) {
    return NextResponse.json(
      { error: "Rapporten kunne ikke sendes til email lige nu." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
