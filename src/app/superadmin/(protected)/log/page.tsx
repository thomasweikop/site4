import { calculateScanResult, SCAN_QUESTIONS } from "@/lib/nis2Scan";
import { listDbReportSessions } from "@/lib/reportSessionStore";
import { listSuperadminLogs } from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

export default async function SuperadminLogPage() {
  const [sessions, adminLogs] = await Promise.all([
    listDbReportSessions(25),
    listSuperadminLogs(60),
  ]);

  return (
    <div className="space-y-8">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
          Log
        </p>
        <h1 className="mt-4 font-display text-[3rem] leading-[0.94] text-ink">
          Sessions og historik
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-soft">
          Her logges alle sessions og admin-hændelser. Fold hver række ud for
          at se besvarelser, profil og øvrig metadata.
        </p>
      </section>

      <section className="space-y-4">
        <div className="border border-line bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold text-ink">Brugersessions</h2>
          <p className="mt-2 text-sm leading-6 text-soft">
            Viser de {sessions.length} seneste sessions fra det offentlige flow
            for at holde siden hurtig og stabil.
          </p>
        </div>

        {sessions.map((session, index) => {
          const result = calculateScanResult(session.answers, session.profile);

          return (
            <details
              key={session.id}
              className="border border-line bg-white shadow-[var(--shadow)]"
            >
              <summary className="cursor-pointer list-none px-6 py-5 [&::-webkit-details-marker]:hidden">
                <div className="grid gap-3 md:grid-cols-[120px_1fr_220px] md:items-start">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
                      Nummer
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-ink">
                      {index + 1}
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
                      Session
                    </p>
                    <p className="mt-2 text-lg font-semibold text-ink">
                      {session.id}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-soft">
                      {session.unlockLead?.email || "Ingen bruger-email endnu"}
                    </p>
                  </div>

                  <div className="text-sm leading-6 text-soft md:text-right">
                    <p>{new Date(session.updatedAt).toLocaleString("da-DK")}</p>
                    <p className="mt-1">Score: {result.percentage}%</p>
                    <p className="mt-1">Status: {result.band.status}</p>
                  </div>
                </div>
              </summary>

              <div className="border-t border-line px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="space-y-3">
                    <h3 className="text-base font-semibold text-ink">Profil</h3>
                    <div className="border border-line bg-paper p-4 text-sm leading-6 text-soft">
                      <p>
                        <strong className="text-ink">Virksomhedsstørrelse:</strong>{" "}
                        {session.profile.companySize}
                      </p>
                      <p>
                        <strong className="text-ink">Branche:</strong>{" "}
                        {session.profile.industry}
                      </p>
                      <p>
                        <strong className="text-ink">Rolle:</strong>{" "}
                        {session.profile.role}
                      </p>
                      <p>
                        <strong className="text-ink">Kilde:</strong>{" "}
                        {session.source}
                      </p>
                    </div>

                    <h3 className="text-base font-semibold text-ink">
                      Kontaktoplysninger
                    </h3>
                    <div className="border border-line bg-paper p-4 text-sm leading-6 text-soft">
                      <p>
                        <strong className="text-ink">Virksomhed:</strong>{" "}
                        {session.unlockLead?.company || "Ikke angivet"}
                      </p>
                      <p>
                        <strong className="text-ink">Navn:</strong>{" "}
                        {session.unlockLead?.name || "Ikke angivet"}
                      </p>
                      <p>
                        <strong className="text-ink">Titel:</strong>{" "}
                        {session.unlockLead?.title || "Ikke angivet"}
                      </p>
                      <p>
                        <strong className="text-ink">Email:</strong>{" "}
                        {session.unlockLead?.email || "Ikke angivet"}
                      </p>
                      <p>
                        <strong className="text-ink">Telefon:</strong>{" "}
                        {session.unlockLead?.phone || "Ikke angivet"}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-base font-semibold text-ink">
                      Alle besvarelser
                    </h3>
                    <div className="space-y-3">
                      {SCAN_QUESTIONS.map((question) => (
                        <article
                          key={question.id}
                          className="border border-line bg-paper p-4"
                        >
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
                            {question.id} · {question.category}
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-ink">
                            {question.question}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-soft">
                            Svar: {session.answers[question.id] || "Ikke besvaret"}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </details>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="border border-line bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold text-ink">Admin-hændelser</h2>
          <p className="mt-2 text-sm leading-6 text-soft">
            Viser de {adminLogs.length} seneste login-, logout- og
            redigeringshændelser i superadmin.
          </p>
        </div>

        {adminLogs.map((log) => (
          <details
            key={log.id}
            className="border border-line bg-white shadow-[var(--shadow)]"
          >
            <summary className="cursor-pointer list-none px-6 py-5 [&::-webkit-details-marker]:hidden">
              <div className="grid gap-3 md:grid-cols-[120px_1fr_220px] md:items-start">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
                    Nummer
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {log.id}
                  </p>
                </div>

                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
                    Handling
                  </p>
                  <p className="mt-2 text-lg font-semibold text-ink">
                    {log.action}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-soft">
                    {log.actorEmail || "Ingen email"}
                  </p>
                </div>

                <div className="text-sm leading-6 text-soft md:text-right">
                  <p>{new Date(log.createdAt).toLocaleString("da-DK")}</p>
                  <p className="mt-1">Type: {log.actorType}</p>
                </div>
              </div>
            </summary>

            <div className="border-t border-line px-6 py-6">
              <pre className="overflow-x-auto whitespace-pre-wrap bg-paper p-4 text-xs leading-6 text-soft">
                {JSON.stringify(log.payload ?? {}, null, 2)}
              </pre>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
