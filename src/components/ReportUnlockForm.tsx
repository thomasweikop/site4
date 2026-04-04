"use client";

import { useState } from "react";
import type { ScanResult } from "@/lib/nis2Scan";
import type { UnlockLead } from "@/lib/nis2Session";
import {
  buildReportSnapshot,
  encodeReportSnapshot,
} from "@/lib/reportLinks";

type ReportUnlockFormProps = {
  sessionId: string;
  result: ScanResult;
  onUnlocked: (lead: UnlockLead) => void;
};

const EMPTY_LEAD: UnlockLead = {
  company: "",
  name: "",
  title: "",
  email: "",
  phone: "",
  message: "",
};

export default function ReportUnlockForm({
  sessionId,
  result,
  onUnlocked,
}: ReportUnlockFormProps) {
  const [lead, setLead] = useState<UnlockLead>(EMPTY_LEAD);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof UnlockLead>(key: K, value: UnlockLead[K]) {
    setLead((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const reportSnapshot = encodeReportSnapshot(
        buildReportSnapshot({
          sessionId,
          company: lead.company,
          result,
        }),
      );

      const response = await fetch("/api/public/report-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...lead,
          score: result.percentage,
          status: result.band.status,
          profileSummary: result.profileSummary,
          weakestDimensions: result.weakestDimensions.map(
            (dimension) => `${dimension.label}: ${dimension.percentage}%`,
          ),
          blockers: result.blockers.map((blocker) => blocker.question),
          executiveSummary: result.executiveSummary,
          nextSteps: result.nextSteps,
          partnerRecommendations: result.partnerRecommendations.map(
            (partner) =>
              `${partner.label}: ${partner.primaryVendor?.name ?? partner.summary}`,
          ),
          reportSnapshot,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Kunne ikke sende anbefalingerne.");
        return;
      }

      onUnlocked(lead);
    } catch {
      setError("Netværksfejl under afsendelse.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8"
    >
      <h2 className="text-balance font-display text-[2rem] leading-none text-ink md:text-[2.35rem]">
        Se konkrete anbefalinger
      </h2>
      <p className="mt-4 text-sm leading-6 text-soft">
        Resultatet sendes til email, og derefter kan virksomheden fortsætte til
        analysens resultat og de næste anbefalede skridt.
      </p>

      <div className="mt-6 grid gap-4">
        <div>
          <label
            htmlFor="unlock-company"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Virksomhed
          </label>
          <input
            id="unlock-company"
            required
            value={lead.company}
            onChange={(event) => update("company", event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Virksomhedens navn"
          />
        </div>

        <div>
          <label
            htmlFor="unlock-name"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Navn
          </label>
          <input
            id="unlock-name"
            required
            value={lead.name}
            onChange={(event) => update("name", event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Kontaktperson"
          />
        </div>

        <div>
          <label
            htmlFor="unlock-title"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Titel
          </label>
          <input
            id="unlock-title"
            value={lead.title ?? ""}
            onChange={(event) => update("title", event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Fx IT-chef eller CISO"
            autoComplete="organization-title"
          />
        </div>

        <div>
          <label
            htmlFor="unlock-email"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Email
          </label>
          <input
            id="unlock-email"
            required
            type="email"
            value={lead.email}
            onChange={(event) => update("email", event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="navn@virksomhed.dk"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43] disabled:cursor-not-allowed disabled:bg-[#8a95a8] disabled:!text-white"
      >
        {pending ? "Sender..." : "Send"}
      </button>

      {error ? <p className="mt-4 text-sm text-[#b64848]">{error}</p> : null}
    </form>
  );
}
