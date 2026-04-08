import { sendMail } from "@/lib/mail/sendMail";
import {
  buildResultUrl,
  getSiteUrl,
} from "@/lib/reportLinks";
import { markDbReportUnlocked } from "@/lib/reportSessionStore";
import { createSuperadminLog } from "@/lib/superadminStore";

export type ProcessReportUnlockInput = {
  sessionId: string;
  company: string;
  name: string;
  title?: string;
  email: string;
  phone?: string;
  message?: string;
  score?: number;
  status?: string;
  profileSummary?: string[];
  weakestDimensions?: string[];
  blockers?: string[];
  executiveSummary?: string;
  nextSteps?: string[];
};

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

function trimExecutiveSummary(summary?: string) {
  if (!summary) {
    return "";
  }

  return summary.replace(/^Virksomhedens samlede score er \d+%\.\s*/u, "").trim();
}

export async function processReportUnlock(input: ProcessReportUnlockInput) {
  const sessionId = input.sessionId.trim();
  const company = input.company.trim();
  const name = input.name.trim();
  const title = (input.title ?? "").trim();
  const email = input.email.trim().toLowerCase();
  const phone = (input.phone ?? "").trim();
  const message = (input.message ?? "").trim();
  const profileSummary = (input.profileSummary ?? []).filter(Boolean);
  const weakestDimensions = (input.weakestDimensions ?? []).filter(Boolean);
  const blockers = (input.blockers ?? []).filter(Boolean);
  const nextSteps = (input.nextSteps ?? []).filter(Boolean);
  const nextStepsWithContact = [
    ...nextSteps,
    "Tag kontakt ekspert på området.",
  ];
  const trimmedExecutiveSummary = trimExecutiveSummary(input.executiveSummary);
  const resultUrl = buildResultUrl(sessionId);
  const actionRequestUrl = `${getSiteUrl()}/kontakt`;

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
    "Ny bestilling af NIS2-anbefalinger",
    "",
    `Session: ${sessionId}`,
    `Virksomhed: ${company}`,
    `Navn: ${name}`,
    `Titel: ${title || "Ikke angivet"}`,
    `Email: ${email}`,
    `Telefon: ${phone || "Ikke angivet"}`,
    `Score: ${input.score ?? "Ukendt"}%`,
    `Status: ${input.status ?? "Ukendt"}`,
    "",
    input.executiveSummary ? `Resume: ${input.executiveSummary}` : "",
    "",
    buildList("Profil", profileSummary),
    buildList("Laveste dimensioner", weakestDimensions),
    buildList("Blockers", blockers),
    buildList("Initielle anbefalinger", nextStepsWithContact),
    resultUrl ? `Resultat: ${resultUrl}` : "",
    "",
    "Besked:",
    message || "Ingen ekstra besked.",
  ]
    .filter(Boolean)
    .join("\n");

  const internalHtml = `
    <p>Ny bestilling af NIS2-anbefalinger</p>
    <p><strong>Session:</strong> ${escapeHtml(sessionId)}</p>
    <p><strong>Virksomhed:</strong> ${safeCompany}</p>
    <p><strong>Navn:</strong> ${safeName}</p>
    <p><strong>Titel:</strong> ${safeTitle}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Telefon:</strong> ${safePhone}</p>
    <p><strong>Score:</strong> ${input.score ?? "Ukendt"}%</p>
    <p><strong>Status:</strong> ${escapeHtml(input.status ?? "Ukendt")}</p>
    ${
      input.executiveSummary
        ? `<p><strong>Resume:</strong> ${escapeHtml(input.executiveSummary)}</p>`
        : ""
    }
    ${buildHtmlList("Profil", profileSummary)}
    ${buildHtmlList("Laveste dimensioner", weakestDimensions)}
    ${buildHtmlList("Blockers", blockers)}
    ${buildHtmlList("Initielle anbefalinger", nextStepsWithContact)}
    ${
      resultUrl
        ? `<p><strong>Resultat:</strong> <a href="${escapeHtml(resultUrl)}">${escapeHtml(resultUrl)}</a></p>`
        : ""
    }
    <p><strong>Besked:</strong></p>
    <p>${safeMessage}</p>
  `;

  const internalResult = await sendMail({
    to: process.env.NIS2_CONTACT_EMAIL || "thomas.weikop@gmail.com",
    subject: `NIS2 anbefalinger bestilt af ${name}`,
    text: internalText,
    html: internalHtml,
    fromName: "ComplyCheck",
    replyToEmail: email,
    replyToName: name,
  });

  if (!internalResult.sent) {
    return { ok: false as const, error: "internal_send_failed" };
  }

  const userText = [
    `Hej ${name},`,
    "",
    "Du har gennemført en initial NIS2 test.",
    "Her får du et kort resume og link til analysen.",
    "",
    trimmedExecutiveSummary ? `Resume: ${trimmedExecutiveSummary}` : "",
    "",
    buildList("Initielle anbefalinger", nextStepsWithContact),
    "",
    buildList("Laveste dimensioner", weakestDimensions),
    "",
    "Se resultat af analysen",
    resultUrl,
    "",
    "Information om virksomheden:",
    `Virksomhed: ${company}`,
    `Navn: ${name}`,
    `Titel: ${title || "Ikke angivet"}`,
    `Email: ${email}`,
    "",
    "Anbefalingerne er lavet som et første modenhedsbillede og bør læses som beslutningsgrundlag for videre prioritering.",
    "Vi hjælper gerne med assessment samt udvælgelse af specialister.",
    "Kontakt os via formularen her:",
    actionRequestUrl,
    "",
    "Christian",
    "Team ComplyCheck.dk",
  ]
    .filter(Boolean)
    .join("\n");

  const buttonBaseStyle =
    "display:inline-block;padding:12px 18px;border:1px solid #cfd6cc;font-weight:600;text-decoration:none;margin-right:12px;margin-top:8px;";
  const resultButton = resultUrl
    ? `<a href="${escapeHtml(resultUrl)}" style="${buttonBaseStyle}background:#073832;color:#ffffff;border-color:#073832;">Se resultat af analysen</a>`
    : "";
  const actionRequestLink = actionRequestUrl
    ? `<a href="${escapeHtml(actionRequestUrl)}">${escapeHtml(actionRequestUrl)}</a>`
    : "";

  const userHtml = `
    <p>Hej ${safeName},</p>
    <p>Du har gennemført en initial NIS2 test.<br />Her får du et kort resume og link til analysen.</p>
    ${
      trimmedExecutiveSummary
        ? `<p><strong>Resume:</strong> ${escapeHtml(trimmedExecutiveSummary)}</p>`
        : ""
    }
    ${buildHtmlList("Initielle anbefalinger", nextStepsWithContact)}
    ${buildHtmlList("Laveste dimensioner", weakestDimensions)}
    <p>${resultButton}</p>
    <p><strong>Information om virksomheden:</strong><br />
    <strong>Virksomhed:</strong> ${safeCompany}<br />
    <strong>Navn:</strong> ${safeName}<br />
    <strong>Titel:</strong> ${safeTitle}<br />
    <strong>Email:</strong> ${safeEmail}</p>
    <p>Anbefalingerne er lavet som et første modenhedsbillede og bør læses som beslutningsgrundlag for videre prioritering.</p>
    <p>Vi hjælper gerne med assessment samt udvælgelse af specialister.</p>
    <p>Kontakt os via formularen her:<br />${actionRequestLink}</p>
    <p>Christian<br />Team ComplyCheck.dk</p>
  `;

  const userResult = await sendMail({
    to: email,
    subject: `NIS2 anbefalinger for ${company}`,
    text: userText,
    html: userHtml,
    fromName: "ComplyCheck",
  });

  if (!userResult.sent) {
    return { ok: false as const, error: "user_send_failed" };
  }

  await markDbReportUnlocked(sessionId, {
    company,
    name,
    title,
    email,
    phone,
    message,
  });

  await createSuperadminLog({
    actorType: "user",
    actorEmail: email,
    action: "ordered_recommendations",
    entityType: "report_session",
    entityId: sessionId,
    payload: {
      sessionId,
      company,
      name,
      title,
      email,
      phone,
      score: input.score,
      profileSummary,
    },
  });

  return { ok: true as const };
}
