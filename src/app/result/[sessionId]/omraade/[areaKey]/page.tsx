import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getDbReportSession } from "@/lib/reportSessionStore";
import AreaDetailExperience from "./AreaDetailExperience";

export const metadata: Metadata = {
  title: "Områdeanalyse | ComplyCheck",
  description:
    "Læs mere om et udvalgt NIS2-område, typiske mangler og hvorfor kvalificeret rådgivning ofte er relevant.",
};

type AreaDetailPageProps = {
  params: Promise<{ sessionId: string; areaKey: string }>;
};

export default async function AreaDetailPage({
  params,
}: AreaDetailPageProps) {
  const { sessionId, areaKey } = await params;
  const initialSession = await getDbReportSession(sessionId);

  return (
    <main className="bg-page text-ink">
      <SiteHeader current="scan" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <AreaDetailExperience
            sessionId={sessionId}
            areaKey={areaKey}
            initialSession={initialSession}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
