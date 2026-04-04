"use client";

import Link from "next/link";
import {
  VENDOR_TYPE_META,
  type VendorType,
} from "@/lib/nis2BuildPack";
import type { ReportSnapshot } from "@/lib/reportLinks";
import { buildComplianceRecommendationsPath } from "@/lib/reportLinks";
import type { StoredReportSession } from "@/lib/nis2Session";
import { useStoredReportSession } from "@/lib/useStoredReportSession";
import SpecialistHelpRequestForm from "./SpecialistHelpRequestForm";

type FullRecommendationExperienceProps = {
  sessionId: string;
  initialSession?: StoredReportSession | null;
  snapshot?: ReportSnapshot | null;
};

export default function FullRecommendationExperience({
  sessionId,
  initialSession = null,
  snapshot = null,
}: FullRecommendationExperienceProps) {
  const { clientReady, session, result } = useStoredReportSession(
    sessionId,
    initialSession,
  );

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm text-soft">Indlæser de detaljerede anbefalinger...</p>
      </div>
    );
  }

  const areaOptions = result
    ? result.topAnalysisAreas.map((area) => ({
        key: area.key,
        label: area.label,
      }))
    : (snapshot?.topAnalysisAreas ?? []).map((area, index) => ({
        key: `${area.label}-${index}`,
        label: area.label,
      }));
  const initialTrackTypes = result
    ? Array.from(
        new Set(
          result.partnerRecommendations.map((recommendation) => recommendation.type),
        ),
      )
    : [];
  const complianceRecommendationsHref =
    buildComplianceRecommendationsPath(sessionId);

  if (!result && !snapshot) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Detaljerede anbefalinger
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Anbefalingen kunne ikke indlæses
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-soft">
          Start testen igen eller gå tilbage til resultatet for at åbne
          initiativerne på ny.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/scan"
            className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
          >
            Start testen igen
          </Link>
          <Link
            href={`/result/${sessionId}`}
            className="inline-flex border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Til resultatet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          Specialist-hjælp
        </p>
        <h1 className="mt-4 max-w-5xl text-balance font-display text-4xl leading-none text-ink md:text-[3.2rem]">
          Vælg hvilke specialistspor der skal prioriteres
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
          Nedenfor vælges de områder og typer af specialist-hjælp som bør indgå
          i næste søgning. Når virksomheden har valgt fokus, sender ComplyCheck
          næste specialistoverblik på email.
        </p>
      </section>

      <SpecialistHelpRequestForm
        sessionId={sessionId}
        initialCompany={session?.unlockLead?.company ?? snapshot?.company}
        initialName={session?.unlockLead?.name}
        initialTitle={session?.unlockLead?.title}
        initialEmail={session?.unlockLead?.email}
        areaOptions={areaOptions}
        initialTrackTypes={
          initialTrackTypes.length > 0
            ? (initialTrackTypes as VendorType[])
            : (Object.keys(VENDOR_TYPE_META).slice(0, 3) as VendorType[])
        }
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/result/${sessionId}`}
          className="inline-flex border border-line bg-paper px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
        >
          Tilbage til resultatet
        </Link>
        <Link
          href={complianceRecommendationsHref}
          className="inline-flex bg-sage px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43]"
        >
          Fortsæt til compliance anbefalinger
        </Link>
      </div>
    </div>
  );
}
