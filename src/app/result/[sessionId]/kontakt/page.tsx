import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getDbReportSession } from "@/lib/reportSessionStore";
import { getSessionReport, type StoredReportSession } from "@/lib/nis2Session";
import ActionRequestForm from "./ActionRequestForm";

export const metadata: Metadata = {
  title: "Målrettede Initiativer | ComplyCheck",
  description:
    "Send en henvendelse om målrettede initiativer og hjælp til at finde de rette rådgivere.",
};

function getFallbackSession(initialSession: StoredReportSession | null) {
  return initialSession;
}

export default async function ActionRequestPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const initialSession = getFallbackSession(await getDbReportSession(sessionId));
  const result = initialSession ? getSessionReport(initialSession) : null;
  const areas = result?.topAnalysisAreas.map((area) => area.label) ?? [];

  return (
    <main className="bg-page text-ink">
      <SiteHeader current="scan" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Målrettede initiativer
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.1rem]">
              Få hjælp til næste niveau af analyse og prioritering
            </h1>
            <p className="mt-4 text-sm leading-7 text-soft md:text-base">
              Målrettede initiativer kræver mere information om virksomheden end
              den indledende screening kan indsamle. ComplyCheck kan hjælpe med
              at skabe overblik over de næste arbejdsspor, kvalificere hvor der
              mangler mest indsigt, og pege på de rådgivere der bedst kan hjælpe
              med at løfte arbejdet videre. Det giver et bedre grundlag for både
              scope, actionliste og næste dialog med markedet.
            </p>
          </section>

          <ActionRequestForm
            sessionId={sessionId}
            initialCompany={initialSession?.unlockLead?.company}
            initialName={initialSession?.unlockLead?.name}
            initialTitle={initialSession?.unlockLead?.title}
            initialEmail={initialSession?.unlockLead?.email}
            areas={areas}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
