import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getDbReportSession } from "@/lib/reportSessionStore";
import ComplianceRecommendationsExperience from "./ComplianceRecommendationsExperience";

export const metadata: Metadata = {
  title: "Anbefalinger | ComplyCheck",
  description:
    "Se de første anbefalinger til rådgivere og specialistspor baseret på virksomhedens initiale NIS2-test.",
};

export default async function ComplianceRecommendationsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const initialSession = await getDbReportSession(sessionId);

  return (
    <main className="bg-page text-ink">
      <SiteHeader current="scan" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <ComplianceRecommendationsExperience
            sessionId={sessionId}
            initialSession={initialSession}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
