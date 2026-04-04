import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail/sendMail";
import {
  buildResultUrl,
  buildSpecialistHelpUrl,
} from "@/lib/reportLinks";
import { markDbReportUnlocked } from "@/lib/reportSessionStore";

type UnlockBody = {
  sessionId?: string;
  company?: string;
  name?: string;
  title?: string;
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
  const title = (body.title ?? "").trim();
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
  const specialistHelpUrl = reportSnapshot
    ? buildSpecialistHelpUrl(sessionId, reportSnapshot)
    : "";
  const resultUrl = buildResultUrl(sessionId);

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
  const safeTitle = escapeHtml(title || "Ikke angivet");
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
    `Titel: ${title || "Ikke angivet"}`,
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
    resultUrl ? `Resultat: ${resultUrl}` : "",
    specialistHelpUrl ? `Specialist-hjælp: ${specialistHelpUrl}` : "",
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
    <p><strong>Titel:</strong> ${safeTitle}</p>
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
      resultUrl
        ? `<p><strong>Resultat:</strong> <a href="${escapeHtml(resultUrl)}">${escapeHtml(resultUrl)}</a></p>`
        : ""
    }
    ${
      specialistHelpUrl
        ? `<p><strong>Specialist-hjælp:</strong> <a href="${escapeHtml(specialistHelpUrl)}">${escapeHtml(specialistHelpUrl)}</a></p>`
        : ""
    }
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
    "Se analysens resultat",
    resultUrl,
    "",
    "Ønsker virksomheden hjælp til at identificere specialister der kan hjælpe på de vigtigste områder?",
    "Vælg hvilke områder og specialistspor der ønskes hjælp indenfor. Så sender ComplyCheck næste specialistoverblik på email.",
    specialistHelpUrl || "",
    "",
    "Det bliver sendt til:",
    `Virksomhed: ${company}`,
    `Navn: ${name}`,
    `Titel: ${title || "Ikke angivet"}`,
    `Email: ${email}`,
    "",
    "Anbefalingerne er lavet som et første modenhedsbillede og bør læses som beslutningsgrundlag for næste prioritering.",
  ]
    .filter(Boolean)
    .join("\n");

  const buttonBaseStyle =
    "display:inline-block;padding:12px 18px;border:1px solid #cfd6cc;font-weight:600;text-decoration:none;margin-right:12px;margin-top:8px;";
  const resultButton = resultUrl
    ? `<a href="${escapeHtml(resultUrl)}" style="${buttonBaseStyle}background:#073832;color:#ffffff;border-color:#073832;">Se analysens resultat</a>`
    : "";
  const specialistHelpButton = specialistHelpUrl
    ? `<a href="${escapeHtml(specialistHelpUrl)}" style="${buttonBaseStyle}background:#ffffff;color:#073832;">Vælg specialist-hjælp</a>`
    : "";

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
    <p><strong>Se analysens resultat</strong></p>
    <p>
      ${resultButton}
    </p>
    <p><strong>Ønsker virksomheden hjælp til at identificere specialister der kan hjælpe på de vigtigste områder?</strong></p>
    <p>Vælg hvilke områder og specialistspor der ønskes hjælp indenfor. Så sender ComplyCheck næste specialistoverblik på email.</p>
    <p>
      ${specialistHelpButton}
    </p>
    <p><strong>Det bliver sendt til</strong></p>
    <p><strong>Virksomhed:</strong> ${safeCompany}<br />
    <strong>Navn:</strong> ${safeName}<br />
    <strong>Titel:</strong> ${safeTitle}<br />
    <strong>Email:</strong> ${safeEmail}</p>
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
    title,
    email,
    phone,
    message,
  });

  return NextResponse.json({ ok: true });
}
