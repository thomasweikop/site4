import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSessionReport } from "@/lib/nis2Session";
import {
  isReportDatabaseConfigured,
  listDbReportSessions,
} from "@/lib/reportSessionStore";
import AdminSessionsClient from "./AdminSessionsClient";

export const metadata: Metadata = {
  title: "Admin Sessions | ComplyCheck",
  description:
    "Oversigt over screeningssessioner i ComplyCheck med database og lokal browserfallback.",
};

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const databaseConfigured = isReportDatabaseConfigured();
  const dbSessions = databaseConfigured ? await listDbReportSessions(50) : [];

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
              Sessions
            </h1>
            <p className="mt-4 text-sm leading-6 text-soft">
              Denne side viser database-sessioner når `DATABASE_URL` er sat og
              derudover lokale browser-sessioner som fallback.
            </p>
          </div>

          <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Database
            </p>
            {!databaseConfigured ? (
              <p className="mt-4 text-sm leading-6 text-soft">
                `DATABASE_URL` er ikke sat, så database-sessioner er ikke
                aktive endnu.
              </p>
            ) : dbSessions.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-soft">
                Ingen database-sessioner fundet endnu.
              </p>
            ) : (
              <div className="mt-6 grid gap-4">
                {dbSessions.map((session) => {
                  const result = getSessionReport(session);

                  return (
                    <article
                      key={session.id}
                      className="border border-line bg-paper p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                            {session.profile.industry} / {session.profile.companySize}
                          </p>
                          <h2 className="mt-2 text-lg font-semibold text-ink">
                            Session {session.id.slice(0, 8)}
                          </h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                            {result.percentage}%
                          </span>
                          <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                            {session.unlockedAt ? "Bestilt" : "Ikke bestilt"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm leading-6 text-soft">
                        <p>
                          Opdateret:{" "}
                          {new Date(session.updatedAt).toLocaleString("da-DK")}
                        </p>
                        <p>Status: {result.band.status}</p>
                        {session.unlockLead ? (
                          <p>
                            Kontakt: {session.unlockLead.name} /{" "}
                            {session.unlockLead.email}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <AdminSessionsClient />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
