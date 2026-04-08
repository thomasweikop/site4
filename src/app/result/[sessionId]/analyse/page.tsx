import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getDbReportSession } from "@/lib/reportSessionStore";
import GenerateAnalysisExperience from "./GenerateAnalysisExperience";

export const metadata: Metadata = {
  title: "Generer Analyse | ComplyCheck",
  description:
    "Udfyld virksomhedens kontaktoplysninger og generer den fulde NIS2-analyse.",
};

export default async function GenerateAnalysisPage({
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
        <div className="mx-auto max-w-7xl">
          <GenerateAnalysisExperience
            sessionId={sessionId}
            initialSession={initialSession}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
