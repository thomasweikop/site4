import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import AdminSessionsClient from "./AdminSessionsClient";

export const metadata: Metadata = {
  title: "Admin Sessions | ComplyCheck",
  description:
    "Lokal browseroversigt over screeningssessioner i ComplyCheck MVP'en.",
};

export default function AdminSessionsPage() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader />

      <section className="px-6 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Admin / sessions
            </p>
            <h1 className="mt-4 font-display text-4xl leading-none text-ink">
              Lokale browser-sessioner
            </h1>
            <p className="mt-4 text-sm leading-6 text-soft">
              Denne side viser kun lokale sessioner i den browser hvor testen er
              taget. Live leads sendes stadig til email via API-routen.
            </p>
          </div>

          <AdminSessionsClient />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
