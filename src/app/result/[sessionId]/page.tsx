import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import ResultExperience from "./ResultExperience";

export const metadata: Metadata = {
  title: "NIS2 Anbefalinger | ComplyCheck",
  description:
    "Se teaser eller fulde anbefalinger for virksomhedens NIS2-screening med score, dimensioner og anbefalede specialister.",
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <main className="bg-page text-ink">
      <SiteHeader current="scan" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <ResultExperience sessionId={sessionId} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
