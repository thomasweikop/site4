"use client";

import { useState } from "react";
import Nis2LeadForm from "../Nis2LeadForm";
import {
  ANSWER_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  ROLE_OPTIONS,
  SCAN_QUESTIONS,
  calculateScanResult,
  type CompanySizeValue,
  type IndustryValue,
  type RoleValue,
  type ScanAnswers,
  type ScanAnswerValue,
} from "@/lib/nis2Scan";

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

type ProfileState = {
  companySize?: CompanySizeValue;
  industry?: IndustryValue;
  role?: RoleValue;
};

export default function ScanExperience() {
  const [profile, setProfile] = useState<ProfileState>({});
  const [answers, setAnswers] = useState<ScanAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(-1);

  const profileComplete = Boolean(profile.companySize && profile.industry && profile.role);
  const isProfileStep = currentIndex < 0;
  const isShowingResults = currentIndex >= SCAN_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = isProfileStep
    ? null
    : SCAN_QUESTIONS[Math.min(currentIndex, SCAN_QUESTIONS.length - 1)];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const totalSteps = SCAN_QUESTIONS.length + 1;
  const progress = isShowingResults
    ? 100
    : Math.max(8, Math.round((((Math.max(currentIndex, 0)) + 1) / totalSteps) * 100));
  const result =
    answeredCount === SCAN_QUESTIONS.length && profileComplete
      ? calculateScanResult(answers, {
          companySize: profile.companySize!,
          industry: profile.industry!,
          role: profile.role!,
        })
      : null;

  function setAnswer(value: ScanAnswerValue) {
    if (!currentQuestion) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
  }

  function setProfileValue<K extends keyof ProfileState>(key: K, value: NonNullable<ProfileState[K]>) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function goNext() {
    if (isProfileStep) {
      if (!profileComplete) {
        return;
      }

      setCurrentIndex(0);
      return;
    }

    if (!currentQuestion || !currentAnswer) {
      return;
    }

    if (currentIndex === SCAN_QUESTIONS.length - 1) {
      setCurrentIndex(SCAN_QUESTIONS.length);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function goBack() {
    if (isShowingResults) {
      setCurrentIndex(SCAN_QUESTIONS.length - 1);
      return;
    }

    if (isProfileStep) {
      return;
    }

    if (currentIndex === 0) {
      setCurrentIndex(-1);
      return;
    }

    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function jumpTo(index: number) {
    setCurrentIndex(index);
  }

  function restart() {
    setProfile({});
    setAnswers({});
    setCurrentIndex(-1);
  }

  if (isShowingResults && result) {
    const contextLines = [
      ...result.profileSummary,
      `Score: ${result.percentage}%`,
      `Status: ${result.band.status}`,
      `Risiko: ${result.band.risk}`,
      ...result.gaps.map((gap) => `Gap: ${gap.question} (${gap.answerLabel})`),
    ];

    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_0.96fr]">
        <div className="space-y-6">
          <div className="rounded-[2.2rem] border border-line bg-surface p-6 shadow-[var(--shadow)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ember">
                  Jeres resultat
                </p>
                <h2 className="mt-3 text-balance font-display text-5xl leading-none text-ink md:text-6xl">
                  {result.percentage}% klar til NIS2
                </h2>
              </div>
              <div
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${result.band.className}`}
              >
                {result.band.status}
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-soft">{result.riskSummary}</p>

            <div className="mt-6 h-4 overflow-hidden rounded-full bg-[#e5d9c8]">
              <div
                className={`h-full rounded-full ${result.band.barClassName}`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-line bg-page p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember">Ja</p>
                <p className="mt-2 text-3xl font-bold text-ink">{result.breakdown.yes}</p>
                <p className="mt-2 text-sm leading-6 text-soft">Områder der ser rimeligt dækket ud.</p>
              </div>
              <div className="rounded-[1.5rem] border border-line bg-page p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember">
                  Delvist
                </p>
                <p className="mt-2 text-3xl font-bold text-ink">{result.breakdown.partial}</p>
                <p className="mt-2 text-sm leading-6 text-soft">Områder hvor modenheden stadig er ujævn.</p>
              </div>
              <div className="rounded-[1.5rem] border border-line bg-page p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember">Nej</p>
                <p className="mt-2 text-3xl font-bold text-ink">{result.breakdown.no}</p>
                <p className="mt-2 text-sm leading-6 text-soft">Klare gaps der bør ind i den første plan.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-line bg-surface p-6 shadow-[var(--shadow)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ember">
              Profilkontekst
            </p>
            <div className="mt-5 grid gap-3">
              {result.profileSummary.map((item) => (
                <div key={item} className="rounded-[1.3rem] border border-line bg-page px-4 py-4 text-sm leading-6 text-soft">
                  {item}
                </div>
              ))}
              {result.profileInsights.map((item) => (
                <div key={item} className="rounded-[1.3rem] border border-line bg-white px-4 py-4 text-sm leading-6 text-soft">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-line bg-surface p-6 shadow-[var(--shadow)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ember">
              Største gaps
            </p>
            <div className="mt-6 grid gap-4">
              {result.gaps.map((gap) => (
                <article key={gap.id} className="rounded-[1.6rem] border border-line bg-page p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember">
                        {gap.category}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-ink">{gap.question}</h3>
                    </div>
                    <div className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                      {gap.answerLabel}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-soft">{gap.recommendation}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-line bg-sage p-6 text-white shadow-[0_30px_80px_rgba(8,16,13,0.16)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#e8d7b4]">
              Næste skridt
            </p>
            <div className="mt-6 grid gap-3">
              {result.nextSteps.map((step) => (
                <div
                  key={step}
                  className="rounded-[1.4rem] border border-white/10 bg-white/7 px-4 py-4 text-sm leading-6 text-white/80"
                >
                  {step}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#scan-help"
                className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-sage transition hover:bg-[#f1eadf]"
              >
                Få hjælp til at lukke gaps
              </a>
              <button
                type="button"
                onClick={restart}
                className="inline-flex rounded-full border border-white/14 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Tag scanen igen
              </button>
            </div>
          </div>
        </div>

        <div id="scan-help" className="space-y-6">
          <Nis2LeadForm
            eyebrow="Efter resultatet"
            title="Vil I have hjælp til at lukke de største gaps?"
            description="Send resultatet videre sammen med jeres kontaktoplysninger, så kan næste samtale tage udgangspunkt i de konkrete svagheder scanen har peget på."
            messageLabel="Hvad vil I gerne have hjælp til først?"
            messagePlaceholder="Fx incident response, MFA, risikovurdering eller et samlet roadmap for de næste 90 dage."
            submitLabel="Bliv kontaktet om resultatet"
            successMessage="Tak. Vi har modtaget jeres resultat og vender hurtigt tilbage."
            helperText="Vi tager udgangspunkt i score, profil og gaps, så næste samtale bliver mere konkret fra start."
            sourceTag="NIS2 scan result lead"
            contextLines={contextLines}
          />

          <div className="rounded-[2rem] border border-line bg-white/70 p-6 shadow-[var(--shadow)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
              Godt at vide
            </p>
            <div className="mt-4 grid gap-3">
              <p className="text-sm leading-6 text-soft">
                Scanen er et hurtigt modenhedsbillede og ikke en juridisk afgørelse af om I er
                omfattet.
              </p>
              <p className="text-sm leading-6 text-soft">
                Resultatet bliver mere nyttigt, når det læses sammen med jeres virksomhedstype,
                branche og rolle.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.84fr]">
      <div className="rounded-[2.2rem] border border-line bg-surface p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ember">
              {isProfileStep
                ? "Profil 1 / 1"
                : `Spørgsmål ${currentIndex + 1} / ${SCAN_QUESTIONS.length}`}
            </p>
            <p className="mt-2 text-sm text-soft">
              {answeredCount} af {SCAN_QUESTIONS.length} spørgsmål er besvaret
            </p>
          </div>
          {!isProfileStep && currentQuestion && currentQuestion.weight > 1 ? (
            <div className="rounded-full border border-[#dfc58e] bg-[#f4ead2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4e1d]">
              Vægtes ekstra
            </div>
          ) : null}
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#e5d9c8]">
          <div className="h-full rounded-full bg-ember transition-all" style={{ width: `${progress}%` }} />
        </div>

        {isProfileStep ? (
          <div className="mt-8 space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
                Profilér resultatet
              </p>
              <h2 className="mt-4 max-w-3xl text-balance font-display text-5xl leading-none text-ink md:text-6xl">
                Før vi scorer jer, skal vi kende lidt kontekst.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-soft">
                Det gør resultatet mere brugbart, fordi anbefalinger og fortolkning kan læses i lyset af jeres segment.
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <p className="text-sm font-semibold text-ink">Virksomhedsstørrelse</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {COMPANY_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setProfileValue("companySize", option.value)}
                      className={classNames(
                        "rounded-[1.4rem] border px-4 py-4 text-left text-sm font-semibold transition",
                        profile.companySize === option.value
                          ? "border-ember bg-[#f8e2da] text-ink"
                          : "border-line bg-page text-soft hover:bg-white",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-ink">Branche</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {INDUSTRY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setProfileValue("industry", option.value)}
                      className={classNames(
                        "rounded-[1.4rem] border px-4 py-4 text-left text-sm font-semibold transition",
                        profile.industry === option.value
                          ? "border-ember bg-[#f8e2da] text-ink"
                          : "border-line bg-page text-soft hover:bg-white",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-ink">Din rolle</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ROLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setProfileValue("role", option.value)}
                      className={classNames(
                        "rounded-[1.4rem] border px-4 py-4 text-left text-sm font-semibold transition",
                        profile.role === option.value
                          ? "border-ember bg-[#f8e2da] text-ink"
                          : "border-line bg-page text-soft hover:bg-white",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
                {currentQuestion?.category}
              </p>
              <h2 className="mt-4 max-w-3xl text-balance font-display text-5xl leading-none text-ink md:text-6xl">
                {currentQuestion?.question}
              </h2>
            </div>

            <div className="mt-8 grid gap-3">
              {ANSWER_OPTIONS.map((option) => {
                const selected = currentAnswer === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAnswer(option.value)}
                    className={classNames(
                      "rounded-[1.6rem] border p-5 text-left transition",
                      selected
                        ? "border-ember bg-[#f8e2da] shadow-[0_12px_30px_rgba(197,93,60,0.12)]"
                        : "border-line bg-page hover:bg-white",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-bold text-ink">{option.label}</p>
                      <div className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                        {option.pointsLabel}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-soft">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={isProfileStep}
            className="inline-flex rounded-full border border-line bg-white/70 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            Forrige
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={isProfileStep ? !profileComplete : !currentAnswer}
            className="inline-flex rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a94f34] disabled:cursor-not-allowed disabled:bg-[#c0a79d]"
          >
            {isProfileStep
              ? "Start spørgsmålene"
              : currentIndex === SCAN_QUESTIONS.length - 1
                ? "Se mit resultat"
                : "Næste spørgsmål"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2rem] border border-line bg-white/72 p-6 shadow-[var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">Oversigt</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.3rem] border border-line bg-page px-4 py-4">
              <p className="text-sm font-bold text-ink">Profil</p>
              <p className="mt-2 text-sm leading-6 text-soft">
                Vælg størrelse, branche og rolle før selve spørgsmålene starter.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {SCAN_QUESTIONS.map((question, index) => {
                const answer = answers[question.id];

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => jumpTo(index)}
                    disabled={!profileComplete}
                    className={classNames(
                      "flex h-11 items-center justify-center rounded-full border text-sm font-semibold transition",
                      index === currentIndex && "border-ember bg-[#f8e2da] text-ink",
                      index !== currentIndex && answer && "border-[#b6cfb6] bg-[#dce8dc] text-sage",
                      index !== currentIndex && !answer && "border-line bg-page text-soft hover:bg-white",
                      !profileComplete && "cursor-not-allowed opacity-45 hover:bg-page",
                    )}
                  >
                    {question.id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-white/72 p-6 shadow-[var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
            Sådan scorer vi
          </p>
          <div className="mt-5 grid gap-3">
            {ANSWER_OPTIONS.map((option) => (
              <div key={option.value} className="rounded-[1.3rem] border border-line bg-page px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-ink">{option.label}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">
                    {option.pointsLabel}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-soft">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-sage p-6 text-white shadow-[0_30px_80px_rgba(8,16,13,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e8d7b4]">
            Hint
          </p>
          <p className="mt-4 text-base leading-7 text-white/80">
            Risikovurdering, incident response og MFA tæller ekstra i scoren, fordi de ofte er de
            tydeligste indikatorer på reel modenhed i en tidlig screening.
          </p>
        </div>
      </div>
    </div>
  );
}
