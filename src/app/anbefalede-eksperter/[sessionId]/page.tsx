import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getDbReportSession } from "@/lib/reportSessionStore";
import RecommendedExpertsExperience from "./RecommendedExpertsExperience";

export const metadata: Metadata = {
  title: "Anbefalede Eksperter | ComplyCheck",
  description:
    "Se de højest rangerede eksperter baseret på virksomhedens topområder, blockers og samlede fit score.",
};

export default async function RecommendedExpertsPage({
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
          <RecommendedExpertsExperience
            sessionId={sessionId}
            initialSession={initialSession}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
