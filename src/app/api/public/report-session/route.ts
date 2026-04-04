import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type {
  CompanySizeValue,
  IndustryValue,
  RoleValue,
  ScanAnswers,
  ScanAnswerValue,
  ScanProfile,
} from "@/lib/nis2Scan";
import { createDbReportSession, isReportDatabaseConfigured } from "@/lib/reportSessionStore";
import { createSuperadminLog } from "@/lib/superadminStore";

type CreateSessionBody = {
  profile?: Partial<ScanProfile>;
  answers?: ScanAnswers;
  source?: string;
};

const VALID_COMPANY_SIZES = new Set<CompanySizeValue>([
  "50-99",
  "100-249",
  "250-500",
]);
const VALID_INDUSTRIES = new Set<IndustryValue>([
  "energy",
  "transport",
  "health",
  "finance",
  "saas",
  "other",
]);
const VALID_ROLES = new Set<RoleValue>([
  "cfo",
  "it",
  "security",
  "operations",
  "management",
]);
const VALID_ANSWERS = new Set<ScanAnswerValue>([
  "yes",
  "partial",
  "no",
  "unknown",
]);

function isValidProfile(profile?: Partial<ScanProfile>): profile is ScanProfile {
  return Boolean(
    profile &&
      VALID_COMPANY_SIZES.has(profile.companySize as CompanySizeValue) &&
      VALID_INDUSTRIES.has(profile.industry as IndustryValue) &&
      VALID_ROLES.has(profile.role as RoleValue),
  );
}

function isValidAnswers(answers?: ScanAnswers) {
  if (!answers) {
    return false;
  }

  return Object.values(answers).every((answer) =>
    VALID_ANSWERS.has(answer as ScanAnswerValue),
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateSessionBody;

  if (!isValidProfile(body.profile) || !isValidAnswers(body.answers)) {
    return NextResponse.json(
      { error: "Profil eller svar er ugyldige." },
      { status: 400 },
    );
  }

  const profile = body.profile as ScanProfile;
  const answers = body.answers as ScanAnswers;

  if (!isReportDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL mangler for database-backed sessions." },
      { status: 503 },
    );
  }

  const session = await createDbReportSession({
    id: randomUUID(),
    profile,
    answers,
    source: body.source?.trim() || "scan",
  });

  if (!session) {
    return NextResponse.json(
      { error: "Sessionen kunne ikke gemmes i databasen." },
      { status: 500 },
    );
  }

  await createSuperadminLog({
    actorType: "user",
    action: "created_report_session",
    entityType: "report_session",
    entityId: session.id,
    payload: {
      sessionId: session.id,
      source: session.source,
      profile: session.profile,
      answers: session.answers,
    },
  });

  return NextResponse.json({
    id: session.id,
    createdAt: session.createdAt,
  });
}
