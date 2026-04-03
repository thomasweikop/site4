"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  clearScanDraft,
  createReportSession,
  parseDraftStorageValue,
  readDraftStorageValue,
  saveScanDraft,
} from "@/lib/nis2Session";
import {
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  ROLE_OPTIONS,
  SCAN_QUESTIONS,
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

type ScanExperienceProps = {
  startWithRandomTest?: boolean;
};

const NOOP_SUBSCRIBE = () => () => {};
const EMPTY_PROFILE: ProfileState = {};
const EMPTY_ANSWERS: ScanAnswers = {};
const RANDOM_ANSWER_VALUES: ScanAnswerValue[] = ["yes", "partial", "no"];

function pickRandomValue<T>(values: readonly T[]) {
  return values[Math.floor(Math.random() * values.length)];
}

function createRandomTestInput() {
  const profile = {
    companySize: pickRandomValue(COMPANY_SIZE_OPTIONS).value,
    industry: pickRandomValue(INDUSTRY_OPTIONS).value,
    role: pickRandomValue(ROLE_OPTIONS).value,
  } satisfies {
    companySize: CompanySizeValue;
    industry: IndustryValue;
    role: RoleValue;
  };

  const answers = Object.fromEntries(
    SCAN_QUESTIONS.map((question) => [
      question.id,
      pickRandomValue(RANDOM_ANSWER_VALUES),
    ]),
  ) as ScanAnswers;

  return { profile, answers };
}

export default function ScanExperience({
  startWithRandomTest = false,
}: ScanExperienceProps) {
  const router = useRouter();
  const autoStartHandledRef = useRef(false);
  const clientReady = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false,
  );
  const draftStorageValue = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    readDraftStorageValue,
    () => "",
  );
  const storedDraft = parseDraftStorageValue(draftStorageValue);
  const [profileState, setProfileState] = useState<ProfileState | null>(null);
  const [answersState, setAnswersState] = useState<ScanAnswers | null>(null);
  const [currentIndexState, setCurrentIndexState] = useState<number | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profile = profileState ?? storedDraft?.profile ?? EMPTY_PROFILE;
  const answers = answersState ?? storedDraft?.answers ?? EMPTY_ANSWERS;
  const currentIndex = currentIndexState ?? storedDraft?.currentIndex ?? -1;
  const draftRestored = clientReady && Boolean(storedDraft);
  const profileComplete = Boolean(
    profile.companySize && profile.industry && profile.role,
  );
  const isProfileStep = currentIndex < 0;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = isProfileStep
    ? null
    : SCAN_QUESTIONS[Math.min(currentIndex, SCAN_QUESTIONS.length - 1)];
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const totalSteps = SCAN_QUESTIONS.length + 1;
  const progress = Math.max(
    8,
    Math.round(((Math.max(currentIndex, 0) + 1) / totalSteps) * 100),
  );

  useEffect(() => {
    if (!clientReady || isSubmitting) {
      return;
    }

    if (Object.keys(answers).length === 0 && Object.keys(profile).length === 0) {
      clearScanDraft();
      return;
    }

    saveScanDraft({
      profile,
      answers,
      currentIndex,
    });
  }, [answers, clientReady, currentIndex, isSubmitting, profile]);

  useEffect(() => {
    if (
      !clientReady ||
      !startWithRandomTest ||
      isSubmitting ||
      autoStartHandledRef.current
    ) {
      return;
    }

    autoStartHandledRef.current = true;

    const { profile: randomProfile, answers: randomAnswers } =
      createRandomTestInput();
    const session = createReportSession({
      profile: randomProfile,
      answers: randomAnswers,
      source: "random-test",
    });

    clearScanDraft();
    router.push(`/result/${session.id}`);
  }, [clientReady, isSubmitting, router, startWithRandomTest]);

  function setAnswer(value: ScanAnswerValue) {
    if (!currentQuestion) {
      return;
    }

    setAnswersState((current) => ({
      ...(current ?? answers),
      [currentQuestion.id]: value,
    }));
  }

  function setProfileValue<K extends keyof ProfileState>(
    key: K,
    value: NonNullable<ProfileState[K]>,
  ) {
    setProfileState((current) => ({
      ...(current ?? profile),
      [key]: value,
    }));
  }

  function goNext() {
    if (isProfileStep) {
      if (!profileComplete) {
        return;
      }

      setCurrentIndexState(0);
      return;
    }

    if (!currentQuestion || !currentAnswer || !profileComplete) {
      return;
    }

    if (currentIndex === SCAN_QUESTIONS.length - 1) {
      setIsSubmitting(true);
      const session = createReportSession({
        profile: {
          companySize: profile.companySize!,
          industry: profile.industry!,
          role: profile.role!,
        },
        answers,
        source: "scan",
      });

      clearScanDraft();
      router.push(`/result/${session.id}`);
      return;
    }

    setCurrentIndexState((index) => Math.max(index ?? currentIndex, 0) + 1);
  }

  function goBack() {
    if (isProfileStep) {
      return;
    }

    if (currentIndex === 0) {
      setCurrentIndexState(-1);
      return;
    }

    setCurrentIndexState((index) => Math.max(0, (index ?? currentIndex) - 1));
  }

  function restart() {
    setProfileState({});
    setAnswersState({});
    setCurrentIndexState(-1);
    clearScanDraft();
  }

  if (!clientReady || startWithRandomTest) {
    return (
      <div className="mx-auto max-w-4xl border border-line bg-white p-6 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">
          {startWithRandomTest
            ? "Genererer et testresultat..."
            : "Indlæser testen..."}
        </p>
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
          <div className="flex flex-wrap items-center gap-2">
            {draftRestored ? (
              <span className="border border-line bg-paper px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#50635c]">
                Kladde gendannet
              </span>
            ) : null}
            <span className="border border-line bg-paper px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#50635c]">
              Gemmes lokalt
            </span>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden bg-[#dde5df]">
          <div
            className="h-full bg-ember transition-all"
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
                Det gør rapporten mere brugbar, fordi anbefalinger og match kan
                læses i lyset af virksomhedens segment.
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
              {[
                { value: "yes", label: "Ja" },
                { value: "partial", label: "Delvist" },
                { value: "no", label: "Nej" },
              ].map((option) => {
                const selected = currentAnswer === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAnswer(option.value as ScanAnswerValue)}
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
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={isProfileStep || isSubmitting}
              className="inline-flex border border-line bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-45"
            >
              Forrige
            </button>

            <button
              type="button"
              onClick={restart}
              disabled={isSubmitting}
              className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-soft transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              Start forfra
            </button>
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={
              isSubmitting ||
              (isProfileStep ? !profileComplete : !currentAnswer)
            }
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43] disabled:cursor-not-allowed disabled:bg-[#8a95a8]"
          >
            {isSubmitting
              ? "Opretter rapport..."
              : isProfileStep
                ? "Start spørgsmål"
                : currentIndex === SCAN_QUESTIONS.length - 1
                  ? "Se rapport"
                  : "Næste spørgsmål"}
          </button>
        </div>
      </div>
    </div>
  );
}
