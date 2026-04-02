import type { Metadata } from "next";
import Nis2ReportView from "@/components/Nis2ReportView";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { calculateScanResult } from "@/lib/nis2Scan";

export const metadata: Metadata = {
  title: "Admin Report Preview | ComplyCheck",
  description: "Internt preview af den fulde NIS2-rapport.",
};

const previewResult = calculateScanResult(
  {
    "01": "partial",
    "02": "no",
    "03": "no",
    "04": "partial",
    "05": "no",
    "06": "partial",
    "07": "no",
    "08": "partial",
    "09": "yes",
    "10": "partial",
  },
  {
    companySize: "100-249",
    industry: "finance",
    role: "management",
  },
);

export default function AdminReportPreviewPage() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader />

      <section className="px-6 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Admin / report preview
            </p>
            <h1 className="mt-4 font-display text-4xl leading-none text-ink">
              Preview af fuld rapport
            </h1>
          </div>

          <Nis2ReportView result={previewResult} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
