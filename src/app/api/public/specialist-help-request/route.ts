import { NextResponse } from "next/server";
import {
  VENDOR_TYPE_META,
  type VendorType,
} from "@/lib/nis2BuildPack";
import { sendMail } from "@/lib/mail/sendMail";
import {
  getDbReportSession,
  markDbReportUnlocked,
} from "@/lib/reportSessionStore";
import { createSuperadminLog } from "@/lib/superadminStore";

type SpecialistHelpBody = {
  sessionId?: string;
  company?: string;
  name?: string;
  title?: string;
  email?: string;
  selectedAreas?: string[];
  selectedTracks?: VendorType[];
};

const VALID_TRACKS = new Set<VendorType>([
  "legal",
  "grc",
  "technical",
  "soc",
  "audit",
]);

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
  const body = (await request.json()) as SpecialistHelpBody;
  const sessionId = (body.sessionId ?? "").trim();
  const company = (body.company ?? "").trim();
  const name = (body.name ?? "").trim();
  const title = (body.title ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const selectedAreas = (body.selectedAreas ?? [])
    .map((area) => area.trim())
    .filter(Boolean);
  const selectedTracks = (body.selectedTracks ?? []).filter((track) =>
    VALID_TRACKS.has(track),
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

  if (selectedAreas.length === 0) {
    return NextResponse.json(
      { error: "Vælg mindst ét område." },
      { status: 400 },
    );
  }

  if (selectedTracks.length === 0) {
    return NextResponse.json(
      { error: "Vælg mindst ét specialistspor." },
      { status: 400 },
    );
  }

  const selectedTrackLabels = selectedTracks.map(
    (track) => VENDOR_TYPE_META[track].label,
  );

  const internalText = [
    "Ny anmodning om specialist-hjælp",
    "",
    `Session: ${sessionId}`,
    `Virksomhed: ${company}`,
    `Navn: ${name}`,
    `Titel: ${title || "Ikke angivet"}`,
    `Email: ${email}`,
    "",
    "ComplyCheck skal bruge valgene nedenfor som grundlag for næste specialistoverblik.",
    "",
    buildList("Valgte områder", selectedAreas),
    buildList("Valgte specialistspor", selectedTrackLabels),
  ]
    .filter(Boolean)
    .join("\n");

  const internalHtml = `
    <p>Ny anmodning om specialist-hjælp</p>
    <p><strong>Session:</strong> ${escapeHtml(sessionId)}</p>
    <p><strong>Virksomhed:</strong> ${escapeHtml(company)}</p>
    <p><strong>Navn:</strong> ${escapeHtml(name)}</p>
    <p><strong>Titel:</strong> ${escapeHtml(title || "Ikke angivet")}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p>ComplyCheck skal bruge valgene nedenfor som grundlag for næste specialistoverblik.</p>
    ${buildHtmlList("Valgte områder", selectedAreas)}
    ${buildHtmlList("Valgte specialistspor", selectedTrackLabels)}
  `;

  const internalResult = await sendMail({
    to: process.env.NIS2_CONTACT_EMAIL || "thomas.weikop@gmail.com",
    subject: `Specialist-hjælp for ${company}`,
    text: internalText,
    html: internalHtml,
    fromName: "ComplyCheck",
    replyToEmail: email,
    replyToName: name,
  });

  if (!internalResult.sent) {
    return NextResponse.json(
      { error: "Mailen kunne ikke sendes." },
      { status: 500 },
    );
  }

  const userText = [
    `Hej ${name},`,
    "",
    "ComplyCheck har modtaget ønsket om hjælp til at identificere specialister.",
    "Vi bruger de valgte områder og specialistspor som grundlag for næste specialistoverblik på email.",
    "",
    buildList("Valgte områder", selectedAreas),
    buildList("Valgte specialistspor", selectedTrackLabels),
    "",
    "Det bliver sendt til:",
    `Virksomhed: ${company}`,
    `Navn: ${name}`,
    `Titel: ${title || "Ikke angivet"}`,
    `Email: ${email}`,
  ]
    .filter(Boolean)
    .join("\n");

  const userHtml = `
    <p>Hej ${escapeHtml(name)},</p>
    <p>ComplyCheck har modtaget ønsket om hjælp til at identificere specialister.</p>
    <p>Vi bruger de valgte områder og specialistspor som grundlag for næste specialistoverblik på email.</p>
    ${buildHtmlList("Valgte områder", selectedAreas)}
    ${buildHtmlList("Valgte specialistspor", selectedTrackLabels)}
    <p><strong>Det bliver sendt til</strong></p>
    <p><strong>Virksomhed:</strong> ${escapeHtml(company)}<br />
    <strong>Navn:</strong> ${escapeHtml(name)}<br />
    <strong>Titel:</strong> ${escapeHtml(title || "Ikke angivet")}<br />
    <strong>Email:</strong> ${escapeHtml(email)}</p>
  `;

  const userResult = await sendMail({
    to: email,
    subject: `Specialist-hjælp for ${company}`,
    text: userText,
    html: userHtml,
    fromName: "ComplyCheck",
  });

  if (!userResult.sent) {
    return NextResponse.json(
      { error: "Bekræftelsesmailen kunne ikke sendes." },
      { status: 500 },
    );
  }

  const existingSession = await getDbReportSession(sessionId);

  await markDbReportUnlocked(sessionId, {
    company,
    name,
    title,
    email,
    phone: existingSession?.unlockLead?.phone ?? "",
    message: existingSession?.unlockLead?.message ?? "",
  });

  await createSuperadminLog({
    actorType: "user",
    actorEmail: email,
    action: "requested_specialist_help",
    entityType: "report_session",
    entityId: sessionId,
    payload: {
      sessionId,
      company,
      name,
      title,
      email,
      selectedAreas,
      selectedTracks,
    },
  });

  return NextResponse.json({ ok: true });
}
