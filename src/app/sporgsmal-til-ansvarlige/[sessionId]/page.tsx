import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getDbReportSession } from "@/lib/reportSessionStore";
import FollowupQuestionsExperience from "./FollowupQuestionsExperience";

export const metadata: Metadata = {
  title: "Spørgsmål Til De Ansvarlige | ComplyCheck",
  description:
    "Se opfølgende spørgsmål til de områder hvor virksomhedens screening kræver mere indsigt.",
};

export default async function FollowupQuestionsPage({
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
          <FollowupQuestionsExperience
            sessionId={sessionId}
            initialSession={initialSession}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
