import { NextResponse } from "next/server";
import { processReportUnlock } from "@/lib/processReportUnlock";

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
  if (!sessionId || !company || !name || !email) {
    return NextResponse.json(
      { error: "Virksomhed, navn og email er påkrævet." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email er ugyldig." }, { status: 400 });
  }

  const outcome = await processReportUnlock({
    sessionId,
    company,
    name,
    title,
    email,
    phone,
    message,
    score: body.score,
    status: body.status,
    profileSummary,
    weakestDimensions,
    blockers,
    executiveSummary: body.executiveSummary,
    nextSteps,
  });

  if (!outcome.ok) {
    return NextResponse.json(
      { error: "Anbefalingerne kunne ikke sendes lige nu." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
