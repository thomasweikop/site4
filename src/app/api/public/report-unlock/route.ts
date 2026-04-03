import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail/sendMail";
import {
  buildFullRecommendationUrl,
  buildSessionSpecialistsUrl,
} from "@/lib/reportLinks";
import { markDbReportUnlocked } from "@/lib/reportSessionStore";

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
  reportSnapshot?: string;
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
  const reportSnapshot = (body.reportSnapshot ?? "").trim();
  const fullRecommendationUrl = reportSnapshot
    ? buildFullRecommendationUrl(sessionId, reportSnapshot)
    : "";
  const specialistsUrl = buildSessionSpecialistsUrl(sessionId);

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
    "Ny unlock af NIS2-anbefalinger",
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
    buildList("Initielle anbefalinger", nextSteps),
    buildList("Partneranbefalinger", partnerRecommendations),
    fullRecommendationUrl ? `Fuld anbefaling: ${fullRecommendationUrl}` : "",
    `Specialist liste: ${specialistsUrl}`,
    "",
    "Besked:",
    message || "Ingen ekstra besked.",
  ]
    .filter(Boolean)
    .join("\n");

  const internalHtml = `
    <p>Ny unlock af NIS2-anbefalinger</p>
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
    ${buildHtmlList("Initielle anbefalinger", nextSteps)}
    ${buildHtmlList("Partneranbefalinger", partnerRecommendations)}
    ${
      fullRecommendationUrl
        ? `<p><strong>Fuld anbefaling:</strong> <a href="${escapeHtml(fullRecommendationUrl)}">${escapeHtml(fullRecommendationUrl)}</a></p>`
        : ""
    }
    <p><strong>Specialist liste:</strong> <a href="${escapeHtml(specialistsUrl)}">${escapeHtml(specialistsUrl)}</a></p>
    <p><strong>Besked:</strong></p>
    <p>${safeMessage}</p>
  `;

  const internalResult = await sendMail({
    to: process.env.NIS2_CONTACT_EMAIL || "thomas.weikop@gmail.com",
    subject: `NIS2 anbefalinger unlock fra ${name}`,
    text: internalText,
    html: internalHtml,
    fromName: "ComplyCheck",
    replyToEmail: email,
    replyToName: name,
  });

  if (!internalResult.sent) {
    return NextResponse.json(
      { error: "Anbefalingerne kunne ikke låses op lige nu." },
      { status: 500 },
    );
  }

  const userText = [
    `Hej ${name},`,
    "",
    `NIS2 anbefalinger for ${company}`,
    "",
    `Virksomhed: ${company}`,
    `Samlet score: ${body.score ?? "Ukendt"}%`,
    `Status: ${body.status ?? "Ukendt"}`,
    "",
    body.executiveSummary ?? "",
    "",
    buildList("Laveste dimensioner", weakestDimensions),
    buildList("Eventuelle blockers", blockers),
    buildList("Initielle anbefalinger", nextSteps),
    buildList("Prioriterede konsulentprofiler", partnerRecommendations),
    "",
    "Se mere detaljerede anbefalinger",
    fullRecommendationUrl || "",
    "",
    "Anbefalede specialister",
    specialistsUrl,
    "",
    "Anbefalingerne er lavet som et første modenhedsbillede og bør læses som beslutningsgrundlag for næste prioritering.",
  ]
    .filter(Boolean)
    .join("\n");

  const buttonBaseStyle =
    "display:inline-block;padding:12px 18px;border:1px solid #cfd6cc;font-weight:600;text-decoration:none;margin-right:12px;margin-top:8px;";
  const fullRecommendationButton = fullRecommendationUrl
    ? `<a href="${escapeHtml(fullRecommendationUrl)}" style="${buttonBaseStyle}background:#073832;color:#ffffff;border-color:#073832;">Se mere detaljerede anbefalinger</a>`
    : "";
  const specialistButton = `<a href="${escapeHtml(specialistsUrl)}" style="${buttonBaseStyle}background:#ffffff;color:#073832;">Specialist liste</a>`;

  const userHtml = `
    <p>Hej ${safeName},</p>
    <p><strong>NIS2 anbefalinger for ${safeCompany}</strong></p>
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
    ${buildHtmlList("Initielle anbefalinger", nextSteps)}
    ${buildHtmlList("Prioriterede konsulentprofiler", partnerRecommendations)}
    <p><strong>Se mere detaljerede anbefalinger</strong></p>
    <p>
      ${fullRecommendationButton}
    </p>
    <p><strong>Anbefalede specialister</strong></p>
    <p>
      ${specialistButton}
    </p>
    <p>Anbefalingerne er lavet som et første modenhedsbillede og bør læses som beslutningsgrundlag for næste prioritering.</p>
  `;

  const userResult = await sendMail({
    to: email,
    subject: `NIS2 anbefalinger for ${company}`,
    text: userText,
    html: userHtml,
    fromName: "ComplyCheck",
  });

  if (!userResult.sent) {
    return NextResponse.json(
      { error: "Anbefalingerne kunne ikke sendes til email lige nu." },
      { status: 500 },
    );
  }

  await markDbReportUnlocked(sessionId, {
    company,
    name,
    email,
    phone,
    message,
  });

  return NextResponse.json({ ok: true });
}
