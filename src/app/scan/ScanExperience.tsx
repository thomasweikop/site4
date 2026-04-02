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

  const profileComplete = Boolean(
    profile.companySize && profile.industry && profile.role,
  );
  const isProfileStep = currentIndex < 0;
  const isShowingResults = currentIndex >= SCAN_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = isProfileStep
    ? null
    : SCAN_QUESTIONS[Math.min(currentIndex, SCAN_QUESTIONS.length - 1)];
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const totalSteps = SCAN_QUESTIONS.length + 1;
  const progress = isShowingResults
    ? 100
    : Math.max(
        8,
        Math.round(((Math.max(currentIndex, 0) + 1) / totalSteps) * 100),
      );
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

  function setProfileValue<K extends keyof ProfileState>(
    key: K,
    value: NonNullable<ProfileState[K]>,
  ) {
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
          <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                  Virksomhedens resultat
                </p>
                <h2 className="mt-4 font-display text-4xl leading-none text-ink md:text-[3.35rem]">
                  {result.percentage}% klar til NIS2
                </h2>
              </div>
              <div
                className={`border px-4 py-2 text-sm font-semibold ${result.band.className}`}
              >
                {result.band.status}
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-soft">
              {result.riskSummary}
            </p>

            <div className="mt-6 h-2 overflow-hidden bg-[#dde5df]">
              <div
                className={`h-full rounded-full ${result.band.barClassName}`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="border border-line bg-paper p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                  Ja
                </p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {result.breakdown.yes}
                </p>
                <p className="mt-2 text-sm leading-6 text-soft">
                  Områder der ser rimeligt dækket ud.
                </p>
              </div>
              <div className="border border-line bg-paper p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                  Delvist
                </p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {result.breakdown.partial}
                </p>
                <p className="mt-2 text-sm leading-6 text-soft">
                  Områder hvor modenheden stadig er ujævn.
                </p>
              </div>
              <div className="border border-line bg-paper p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                  Nej
                </p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {result.breakdown.no}
                </p>
                <p className="mt-2 text-sm leading-6 text-soft">
                  Klare gaps der bør ind i den første plan.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Profilkontekst
            </p>
            <div className="mt-5 grid gap-3">
              {result.profileSummary.map((item) => (
                <div
                  key={item}
                  className="border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft"
                >
                  {item}
                </div>
              ))}
              {result.profileInsights.map((item) => (
                <div
                  key={item}
                  className="border border-line bg-white px-4 py-4 text-sm leading-6 text-soft"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Største gaps
            </p>
            <div className="mt-6 grid gap-4">
              {result.gaps.map((gap) => (
                <article
                  key={gap.id}
                  className="border border-line bg-paper p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                        {gap.category}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold text-ink">
                        {gap.question}
                      </h3>
                    </div>
                    <div className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                      {gap.answerLabel}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-soft">
                    {gap.recommendation}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="border border-line bg-sage p-6 text-white shadow-[var(--shadow)] md:p-8">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#b9d0c2]">
              Næste skridt
            </p>
            <div className="mt-6 grid gap-3">
              {result.nextSteps.map((step) => (
                <div
                  key={step}
                  className="border border-white/10 px-4 py-4 text-sm leading-6 text-white/80"
                >
                  {step}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#scan-help"
                className="inline-flex bg-white px-6 py-3 text-sm font-semibold text-sage transition hover:bg-[#f1ece3]"
              >
                Få hjælp til at lukke gaps
              </a>
              <button
                type="button"
                onClick={restart}
                className="inline-flex border border-white/14 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
              >
                Tag scanen igen
              </button>
            </div>
          </div>
        </div>

        <div id="scan-help" className="space-y-6">
          <Nis2LeadForm
            eyebrow="Efter resultatet"
            title="Skal virksomheden have hjælp til at lukke de største gaps?"
            description="Send resultatet videre sammen med virksomhedens kontaktoplysninger, så kan næste samtale tage udgangspunkt i de konkrete svagheder screeningen har peget på."
            messageLabel="Hvad skal virksomheden have hjælp til først?"
            messagePlaceholder="Fx incident response, MFA, risikovurdering eller et samlet roadmap for de næste 90 dage."
            submitLabel="Bliv kontaktet om resultatet"
            successMessage="Tak. Resultatet er modtaget, og der vendes hurtigt tilbage."
            helperText="Vi tager udgangspunkt i score, profil og gaps, så næste samtale bliver mere konkret fra start."
            sourceTag="NIS2 scan result lead"
            contextLines={contextLines}
          />

          <div className="border border-line bg-white p-6 shadow-[var(--shadow)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#4c655d]">
              Godt at vide
            </p>
            <div className="mt-4 grid gap-3">
              <p className="text-sm leading-6 text-soft">
                Scanen er et hurtigt modenhedsbillede og ikke en juridisk
                afgørelse af om virksomheden er omfattet.
              </p>
              <p className="text-sm leading-6 text-soft">
                Resultatet bliver mere nyttigt, når det læses sammen med
                virksomhedens størrelse, branche og rolle.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="border border-line bg-white p-5 shadow-[var(--shadow)] md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              {isProfileStep
                ? "Profil 1 / 1"
                : `Spørgsmål ${currentIndex + 1} / ${SCAN_QUESTIONS.length}`}
            </p>
            <p className="mt-2 text-sm text-soft">
              {answeredCount} af {SCAN_QUESTIONS.length} spørgsmål er besvaret
            </p>
          </div>
          {!isProfileStep && currentQuestion && currentQuestion.weight > 1 ? (
            <div className="border border-[#d8ddd2] bg-[#f0f2ec] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#50635c]">
              Vægtes ekstra
            </div>
          ) : null}
        </div>

        <div className="mt-5 h-2 overflow-hidden bg-[#dde5df]">
          <div
            className="h-full rounded-full bg-ember transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {isProfileStep ? (
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#4c655d]">
                Profilér resultatet
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl leading-none text-ink md:text-[2.7rem]">
                Før virksomheden scores, skal der bruges lidt kontekst.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-soft">
                Det gør resultatet mere brugbart, fordi anbefalinger og
                fortolkning kan læses i lyset af virksomhedens segment.
              </p>
            </div>

            <div className="grid gap-5">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Virksomhedsstørrelse
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {COMPANY_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setProfileValue("companySize", option.value)
                      }
                      className={classNames(
                        "border px-4 py-3 text-left text-sm font-semibold transition",
                        profile.companySize === option.value
                          ? "border-[#2a5a4f] bg-[#eff3ec] text-ink"
                          : "border-line bg-paper text-soft hover:bg-white",
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
                        "border px-4 py-3 text-left text-sm font-semibold transition",
                        profile.industry === option.value
                          ? "border-[#2a5a4f] bg-[#eff3ec] text-ink"
                          : "border-line bg-paper text-soft hover:bg-white",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-ink">
                  Rolle i virksomheden
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ROLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setProfileValue("role", option.value)}
                      className={classNames(
                        "border px-4 py-3 text-left text-sm font-semibold transition",
                        profile.role === option.value
                          ? "border-[#2a5a4f] bg-[#eff3ec] text-ink"
                          : "border-line bg-paper text-soft hover:bg-white",
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
            <div className="mt-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#4c655d]">
                {currentQuestion?.category}
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl leading-none text-ink md:text-[2.7rem]">
                {currentQuestion?.question}
              </h2>
            </div>

            <div className="mt-6 grid gap-2.5">
              {ANSWER_OPTIONS.map((option) => {
                const selected = currentAnswer === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAnswer(option.value)}
                    className={classNames(
                      "border px-4 py-4 text-left transition",
                      selected
                        ? "border-[#2a5a4f] bg-[#eff3ec]"
                        : "border-line bg-paper hover:bg-white",
                    )}
                  >
                    <p className="text-base font-semibold tracking-[-0.02em] text-ink">
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={isProfileStep}
            className="inline-flex border border-line bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-45"
          >
            Forrige
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={isProfileStep ? !profileComplete : !currentAnswer}
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43] disabled:cursor-not-allowed disabled:bg-[#8a95a8]"
          >
            {isProfileStep
              ? "Start spørgsmålene"
              : currentIndex === SCAN_QUESTIONS.length - 1
                ? "Se mit resultat"
                : "Næste spørgsmål"}
          </button>
        </div>
      </div>
    </div>
  );
}
