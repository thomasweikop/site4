"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  deleteStoredReportSession,
  getSessionReport,
  parseSessionsStorageValue,
  readSessionsStorageValue,
} from "@/lib/nis2Session";

const NOOP_SUBSCRIBE = () => () => {};

export default function AdminSessionsClient() {
  const clientReady = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false,
  );
  const [, forceRefresh] = useState(0);
  const sessionsStorageValue = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    readSessionsStorageValue,
    () => "[]",
  );
  const sessions = parseSessionsStorageValue(sessionsStorageValue).sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );

  if (!clientReady) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm leading-6 text-soft">Indlæser lokale sessioner...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-sm leading-6 text-soft">
          Ingen lokale sessions fundet i denne browser endnu.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sessions.map((session) => {
        const result = getSessionReport(session);

        return (
          <article
            key={session.id}
            className="border border-line bg-white p-5 shadow-[var(--shadow)]"
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
                <span className="border border-line bg-paper px-3 py-1 text-xs font-semibold text-soft">
                  {result.percentage}%
                </span>
                <span className="border border-line bg-paper px-3 py-1 text-xs font-semibold text-soft">
                  {session.unlockedAt ? "Unlocked" : "Locked"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm leading-6 text-soft">
              <p>Opdateret: {new Date(session.updatedAt).toLocaleString("da-DK")}</p>
              <p>Status: {result.band.status}</p>
              {session.unlockLead ? (
                <p>
                  Kontakt: {session.unlockLead.name} / {session.unlockLead.email}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/result/${session.id}`}
                className="inline-flex border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Åbn rapport
              </Link>
              <button
                type="button"
                onClick={() => {
                  deleteStoredReportSession(session.id);
                  forceRefresh((value) => value + 1);
                }}
                className="inline-flex border border-line bg-white px-4 py-2 text-sm font-semibold text-soft transition hover:bg-paper"
              >
                Slet
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
