import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { decodeReportSnapshot } from "@/lib/reportLinks";
import { getDbReportSession } from "@/lib/reportSessionStore";
import FullRecommendationExperience from "./FullRecommendationExperience";

export const metadata: Metadata = {
  title: "Specialist-hjælp | ComplyCheck",
  description:
    "Vælg områder og specialistspor, og få næste specialistoverblik sendt til email.",
};

type FullRecommendationPageProps = {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ report?: string | string[] | undefined }>;
};

export default async function FullRecommendationPage({
  params,
  searchParams,
}: FullRecommendationPageProps) {
  const { sessionId } = await params;
  const resolvedSearchParams = await searchParams;
  const reportParam = Array.isArray(resolvedSearchParams.report)
    ? resolvedSearchParams.report[0]
    : resolvedSearchParams.report;
  const decodedSnapshot = decodeReportSnapshot(reportParam);
  const snapshot =
    decodedSnapshot && decodedSnapshot.sessionId === sessionId
      ? decodedSnapshot
      : null;
  const initialSession = await getDbReportSession(sessionId);

  return (
    <main className="bg-page text-ink">
      <SiteHeader current="scan" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <FullRecommendationExperience
            sessionId={sessionId}
            initialSession={initialSession}
            snapshot={snapshot}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
