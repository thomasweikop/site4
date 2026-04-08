import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getDbReportSession } from "@/lib/reportSessionStore";
import SpecialistsMatrixExperience from "./SpecialistsMatrixExperience";

export const metadata: Metadata = {
  title: "Specialistoverblik | ComplyCheck",
  description:
    "Se specialistmatrixen og de områder leverandørerne matcher bedst for virksomhedens NIS2-behov.",
};

export default async function SessionSpecialistsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ area?: string | string[] | undefined }>;
}) {
  const { sessionId } = await params;
  const resolvedSearchParams = await searchParams;
  const areaParam = Array.isArray(resolvedSearchParams.area)
    ? resolvedSearchParams.area[0]
    : resolvedSearchParams.area;
  const initialSession = await getDbReportSession(sessionId);

  return (
    <main className="bg-page text-ink">
      <SiteHeader current="scan" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <SpecialistsMatrixExperience
            sessionId={sessionId}
            initialSession={initialSession}
            initialAreaKey={areaParam}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
