import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ANSWER_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  ROLE_OPTIONS,
  SCAN_QUESTIONS,
  calculateScanResult,
  type ScanAnswers,
  type ScanProfile,
} from "@/lib/nis2Scan";
import { processReportUnlock } from "@/lib/processReportUnlock";
import { createDbReportSession, isReportDatabaseConfigured } from "@/lib/reportSessionStore";
import { createSuperadminLog } from "@/lib/superadminStore";

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildRandomProfile(): ScanProfile {
  return {
    companySize: pickRandom(COMPANY_SIZE_OPTIONS).value,
    industry: pickRandom(INDUSTRY_OPTIONS).value,
    role: pickRandom(ROLE_OPTIONS).value,
  };
}

function buildRandomAnswers(): ScanAnswers {
  return Object.fromEntries(
    SCAN_QUESTIONS.map((question) => [question.id, pickRandom(ANSWER_OPTIONS).value]),
  );
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isReportDatabaseConfigured()) {
    return NextResponse.redirect(origin, 307);
  }

  const sessionId = randomUUID();
  const profile = buildRandomProfile();
  const answers = buildRandomAnswers();
  const company = "xyz";
  const name = "xyz";
  const title = "xyz";
  const email = "a@weikop.dk";

  const session = await createDbReportSession({
    id: sessionId,
    profile,
    answers,
    source: "footer-random-analysis",
  });

  if (!session) {
    return NextResponse.redirect(origin, 307);
  }

  const result = calculateScanResult(answers, profile);

  const unlockOutcome = await processReportUnlock({
    sessionId,
    company,
    name,
    title,
    email,
    phone: "",
    message: "Random footer test genereret via linket i footeren.",
    score: result.percentage,
    status: result.band.status,
    profileSummary: result.profileSummary,
    weakestDimensions: result.weakestDimensions.map(
      (dimension) => `${dimension.label}: ${dimension.percentage}%`,
    ),
    blockers: result.blockers.map((blocker) => blocker.question),
    executiveSummary: result.executiveSummary,
    nextSteps: result.nextSteps,
  });

  if (!unlockOutcome.ok) {
    return NextResponse.redirect(`${origin}/result/${sessionId}/anbefalinger`, 307);
  }

  await createSuperadminLog({
    actorType: "system",
    action: "generated_qtest",
    entityType: "report_session",
    entityId: sessionId,
    payload: {
      sessionId,
      source: "footer-random-analysis",
      company,
      name,
      title,
      email,
      profile,
    },
  });

  return NextResponse.redirect(`${origin}/result/${sessionId}`, 307);
}
