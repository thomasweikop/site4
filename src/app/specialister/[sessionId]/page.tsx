import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SpecialistsMatrixExperience from "./SpecialistsMatrixExperience";

export const metadata: Metadata = {
  title: "Specialistoverblik | ComplyCheck",
  description:
    "Se specialistmatrixen med alle 125 leverandører og de områder de matcher bedst for virksomhedens NIS2-behov.",
};

export default async function SessionSpecialistsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <main className="bg-page text-ink">
      <SiteHeader current="scan" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <SpecialistsMatrixExperience sessionId={sessionId} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
